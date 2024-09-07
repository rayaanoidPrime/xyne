import weaviate, { dataType, Filters, type WeaviateReturn } from 'weaviate-client'
import { env, pipeline } from '@xenova/transformers';
import fs from "node:fs/promises";
import { JWT } from "google-auth-library";
import { drive_v3, google } from "googleapis";
import { extractFootnotes, extractHeadersAndFooters, extractText, postProcessText } from './doc';
import { chunkDocument } from './chunks';
import { weaviateSchema } from './schema';

env.backends.onnx.wasm.numThreads = 1;

function progress_callback(args) {
    if (args.status != 'progress') return;
    let n = Math.floor(args.progress / 5);
    let str = '\r[' + '#'.repeat(n) + '.'.repeat(20 - n) + '] ' + args.file + (n == 20 ? '\n' : '');
    process.stdout.write(str);
}

const extractor = await pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5', { progress_callback, cache_dir: env.cacheDir });

const serviceAccountKey = JSON.parse(
    await fs.readFile('./service-account.json', "utf-8"),
);
const scopes = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/admin.directory.user.readonly",
    "https://www.googleapis.com/auth/documents.readonly",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/presentations.readonly",
    // "https://www.googleapis.com/auth/calendar.readonly",
    // "https://www.googleapis.com/auth/contacts.readonly",
    // "https://www.googleapis.com/auth/contacts.other.readonly",
    // "https://www.googleapis.com/auth/gmail.readonly"
];

const userEmail = 'saheb@xynehq.com'
const jwtClient = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes,
    subject: userEmail,
});


async function listFiles(email: string, onlyDocs: boolean = false): Promise<drive_v3.Schema$File[]> {
    const drive = google.drive({ version: "v3", auth: jwtClient });
    let nextPageToken = null;
    let files = [];
    do {
        const res = await drive.files.list({
            pageSize: 100,
            ...(onlyDocs ? { q: "mimeType='application/vnd.google-apps.document'" } : {}),
            fields:
                "nextPageToken, files(id, webViewLink, createdTime, modifiedTime, name, owners, fileExtension, mimeType, permissions(id, type, emailAddress))",
            ...(nextPageToken ? { pageToken: nextPageToken } : {}),
        });

        files = files.concat(res.data.files);
        nextPageToken = res.data.nextPageToken;
    } while (nextPageToken);
    return files;
}

const toPermissionsList = (drivePermissions: drive_v3.Schema$Permission[]): string[] => {
    let permissions = []
    if (drivePermissions && drivePermissions.length) {
        permissions = drivePermissions
            .filter(
                (p) =>
                    p.type === "user" || p.type === "group" || p.type === "domain",
            )
            .map((p) => {
                if (p.type === "domain") {
                    return "domain";
                }
                return p.emailAddress;
            });
    } else {
        // permissions don't exist for you
        // but the user who is able to fetch
        // the metadata, can read it
        permissions = [userEmail];
    }
    return permissions
}

interface File {
    docId: string,
    title: string,
    chunk: string,
    chunkIndex: number,
    url: string,
    app: string,
    entity: string,
    permissions: string[],
    mimeType: string
}

const googleDocs = async (docsMetadata: drive_v3.Schema$File[]): Promise<any[]> => {
    const docsList: File[] = []
    const docs = google.docs({ version: "v1", auth: jwtClient });
    const total = docsMetadata.length
    let count = 0
    for (const doc of docsMetadata) {
        const documentContent = await docs.documents.get({
            documentId: doc.id,
        });
        const rawTextContent = documentContent?.data?.body?.content
            .map((e) => extractText(e))
            .join("");
        const footnotes = extractFootnotes(documentContent.data);
        const headerFooter = extractHeadersAndFooters(documentContent.data);
        const cleanedTextContent = postProcessText(
            rawTextContent + "\n\n" + footnotes + "\n\n" + headerFooter,
        );

        const chunks = chunkDocument(cleanedTextContent)
        for (const { chunk, chunkIndex } of chunks) {
            docsList.push({
                title: doc.name,
                url: doc.webViewLink,
                app: 'google',
                docId: doc.id,
                owner: doc?.owners[0]?.displayName,
                photoLink: doc?.owners[0]?.photoLink,
                ownerEmail: doc?.owners[0]?.emailAddress,
                entity: 'docs',
                chunk,
                chunkIndex,
                permissions: doc.permissions,
                mimeType: doc.mimeType
            })
        }

        count += 1

        console.clear()
        process.stdout.write(`${Math.floor((count / total) * 100)}`)
    }
    process.stdout.write('\n')
    return docsList

}

// const client = await weaviate.connectToLocal(
//     {
//         host: "127.0.0.1",   // URL only, no http prefix
//         port: 8080,
//         grpcPort: 50051,     // Default is 50051, WCD uses 443
//     })


// const collection = client.collections.get('DriveFiles');

export const searchGroupByCount = async (query: string, permissions: string[], app?: string, entity?: string): Promise<any> => {
    const qEmbedding = await extractor(query, { pooling: 'mean', normalize: true });

    let filters
    if (app && entity) {
        filters = Filters.and(
            collection.filter.byProperty('app').equal(app),
            collection.filter.byProperty('entity').equal(entity),
            collection.filter.byProperty('permissions').containsAny(permissions)
        )
    } else {
        filters = collection.filter.byProperty('permissions').containsAny(permissions)
    }

    const result = await collection.query.hybrid(query, {
        fusionType: 'Ranked',
        vector: qEmbedding.tolist()[0],
        // 1 is pure vector search, 0 is pure keyword search
        alpha: 0.25,
        limit: 500,
        returnProperties: ['app', 'entity'],
        returnMetadata: ['score'],
        filters,
    })

    result.objects = result.objects.filter(o => {
        return o?.metadata?.score > 0.01
    })
    let newRes = {}

    for (const obj of result.objects) {

        if (newRes[obj.properties.app] == null) {
            newRes[obj.properties.app] = {
                [obj.properties.entity]: 0
            }
        }
        if (newRes[obj.properties.app][obj.properties.entity] == null) {
            newRes[obj.properties.app][obj.properties.entity] = 0
        }
        newRes[obj.properties.app][obj.properties.entity] += 1
    }
    return newRes
}

export const search = async (query: string, limit: number, offset: number = 0, permissions: string[], app?: string, entity?: string): Promise<WeaviateReturn<undefined>> => {
    const qEmbedding = await extractor(query, { pooling: 'mean', normalize: true });
    let filters
    if (app && entity) {
        filters = Filters.and(
            collection.filter.byProperty('app').equal(app),
            collection.filter.byProperty('entity').equal(entity),
            collection.filter.byProperty('permissions').containsAny(permissions)
        )
    } else {
        filters = collection.filter.byProperty('permissions').containsAny(permissions)
    }
    const result = await collection.query.hybrid(query, {
        fusionType: 'Ranked',
        vector: qEmbedding.tolist()[0],
        // 1 is pure vector search, 0 is pure keyword search
        alpha: 0.25,
        limit,
        offset,
        returnMetadata: ['score', 'explainScore', 'certainty', 'distance'],
        filters,
    })
    return result
}

enum DriveMime {
    Docs = "application/vnd.google-apps.document",
    Sheets = "application/vnd.google-apps.spreadsheet",
    Slides = "application/vnd.google-apps.presentation",
}

const fileWithoutContent = () => {

}

const getVectorStr = (name: string, body: string) => {
    if (body) {
        return `${name}\n${body}`
    } else {
        return `${name}`
    }
}

const driveFilesToDoc = (rest: drive_v3.Schema$File[]): File[] => {
    const mimeTypeMap = {
        // "application/vnd.google-apps.document": "docs",
        "application/vnd.google-apps.spreadsheet": "sheets",
        "application/vnd.google-apps.presentation": "slides",
        "application/vnd.google-apps.folder": "folder"
    };
    return rest.map(doc => {

        let entity
        if (mimeTypeMap[doc.mimeType]) {
            entity = mimeTypeMap[doc.mimeType]
        } else {
            entity = 'driveFile'
        }

        return {
            title: doc.name,
            url: doc.webViewLink,
            app: 'google',
            docId: doc.id,
            entity,
            chunk: '',
            owner: doc?.owners[0]?.displayName,
            photoLink: doc?.owners[0]?.photoLink,
            ownerEmail: doc?.owners[0]?.emailAddress,
            chunkIndex: 0,
            permissions: doc.permissions,
            mimeType: doc.mimeType
        }
    })
}


const cache = true


async function checkAndReadFile(path: string) {
    try {
        // Check if the file exists
        await fs.access(path);
        console.log(`File exists: ${path}`);

        // Read the file
        const data = JSON.parse(await fs.readFile(path, 'utf8'));
        return data
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null
        } else {
            throw err
        }
    }
}

import ollama from 'ollama'
import { getPrompt } from './prompts';
const kgCache = './fullDocs.json'
export const initKG = async () => {
    let fullDocs = await checkAndReadFile(kgCache)
    if (!fullDocs) {
        fullDocs = []
        const fileMetadata = (await listFiles(userEmail, true)).map(v => {
            v.permissions = toPermissionsList(v.permissions)
            return v
        })
        const googleDocsMetadata = fileMetadata.filter(v => v.mimeType === DriveMime.Docs)
        const docs = google.docs({ version: "v1", auth: jwtClient });
        let count = 0

        for (const doc of googleDocsMetadata) {
            const documentContent = await docs.documents.get({
                documentId: doc.id,
            });
            const rawTextContent = documentContent?.data?.body?.content
                .map((e) => extractText(e))
                .join("");
            const footnotes = extractFootnotes(documentContent.data);
            const headerFooter = extractHeadersAndFooters(documentContent.data);
            const cleanedTextContent = postProcessText(
                rawTextContent + "\n\n" + footnotes + "\n\n" + headerFooter,
            );
            fullDocs.push(cleanedTextContent)
        }

        await fs.writeFile('./fullDocs.json', JSON.stringify(fullDocs))
    }
    console.log('doc\n', fullDocs[5])
    const response = await ollama.chat({
        model: 'phi3.5',
        messages: [{ role: 'user', content: getPrompt(fullDocs[5]) }],
        stream: true,
        format: 'json'
    })
    for await (const part of response) {
        process.stdout.write(part.message.content)
    }
}


export const initI = async () => {

    await client.isReady()
    console.log('client ready')
    await client.collections.deleteAll()
    console.log('deleting all')

    await client.collections.create(weaviateSchema)

    const cachePath = './cache-data.json'

    let data = await checkAndReadFile(cachePath)
    if (!data) {
        const fileMetadata = (await listFiles(userEmail)).map(v => {
            v.permissions = toPermissionsList(v.permissions)
            return v
        })
        const googleDocsMetadata = fileMetadata.filter(v => v.mimeType === DriveMime.Docs)
        const googleSheetsMetadata = fileMetadata.filter(v => v.mimeType === DriveMime.Sheets)
        const googleSlidesMetadata = fileMetadata.filter(v => v.mimeType === DriveMime.Slides)
        const rest = fileMetadata.filter(v => v.mimeType !== DriveMime.Docs)

        const documents: File[] = await googleDocs(googleDocsMetadata)
        const driveFiles: File[] = driveFilesToDoc(rest)
        console.log(documents.length, driveFiles.length)

        data = await Promise.all([...driveFiles, ...documents].map(async (doc, i) => ({
            properties: {
                ...doc
            },
            vectors: (await extractor(getVectorStr(doc.title, doc.chunk), { pooling: 'mean', normalize: true })).tolist()[0],  // Add the generated vector
        })));
        await fs.writeFile(cachePath, JSON.stringify(data))
    }

    let processed = 0
    const batchSize = 30
    for (var i = 0; i < data.length; i += batchSize) {
        const part = data.slice(i, i + batchSize)
        const inserted = await collection.data.insertMany(part);
        processed += part.length
        console.log('inserting chunks: ', processed)
    }

}