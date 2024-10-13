export const mimeTypeToSearchKeyword: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "application/pdf": "pdf",
  "application/vnd.google-apps.audio": "audio",
  "application/vnd.google-apps.document": "docs",
  //   'application/vnd.google-apps.drive-sdk': 'shortcut', // Removed due to ambiguity
  "application/vnd.google-apps.drawing": "drawing",
  "application/vnd.google-apps.file": "file",
  "application/vnd.google-apps.folder": "folder",
  "application/vnd.google-apps.form": "forms",
  "application/vnd.google-apps.fusiontable": "fusion", // Could also be 'tables'
  "application/vnd.google-apps.jam": "jamboard",
  "application/vnd.google-apps.map": "maps",
  "application/vnd.google-apps.photo": "photos",
  "application/vnd.google-apps.presentation": "slides",
  "application/vnd.google-apps.script": "script",
  "application/vnd.google-apps.shortcut": "shortcut",
  "application/vnd.google-apps.site": "sites",
  "application/vnd.google-apps.spreadsheet": "sheets",
  //   'application/vnd.google-apps.unknown': 'unknown', // Removed as it's not helpful
  "application/vnd.google-apps.video": "video",
  "application/octet-stream": "octet",
  "image/x-xpixmap": "xpm",
  "application/x-7z-compressed": "7z",
  "application/zip": "zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx", // Could also be 'powerpoint'
  "application/epub+zip": "epub",
  "application/jar": "jar",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.oasis.opendocument.text-template": "ott",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.spreadsheet-template": "ots",
  "application/vnd.oasis.opendocument.presentation": "odp",
  "application/vnd.oasis.opendocument.presentation-template": "otp",
  "application/vnd.oasis.opendocument.graphics": "odg",
  "application/vnd.oasis.opendocument.graphics-template": "otg",
  "application/vnd.oasis.opendocument.formula": "odf",
  "application/vnd.oasis.opendocument.chart": "odc",
  "application/vnd.sun.xml.calc": "sxc",
  "application/vnd.fdf": "fdf",
  "application/x-ole-storage": "ole-storage",
  "application/x-ms-installer": "msi",
  "application/vnd.ms-outlook": "msg",
  "application/vnd.ms-excel": "xls",
  "application/vnd.ms-publisher": "pub",
  "application/vnd.ms-powerpoint": "ppt", // Could also be 'powerpoint'
  "application/msword": "doc", // Could also be 'word'
  "application/postscript": "ps",
  "image/vnd.adobe.photoshop": "psd",
  "application/pkcs7-signature": "p7s",
  "application/ogg": "ogg",
  "audio/ogg": "oga",
  "video/ogg": "ogv",
  "image/vnd.mozilla.apng": "png",
  "image/jxl": "jxl",
  "image/jp2": "jp2",
  "image/jpx": "jpf",
  "image/jpm": "jpm",
  "image/jxs": "jxs",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/vnd.microsoft.portable-executable": "exe",
  "application/x-elf": "elf",
  "application/x-object": "object",
  "application/x-executable": "executable",
  "application/x-sharedlib": "so",
  "application/x-coredump": "coredump",
  "application/x-archive": "archive",
  "application/vnd.debian.binary-package": "deb",
  "application/x-tar": "tar",
  "application/x-xar": "xar",
  "application/x-bzip2": "bz2",
  "application/fits": "fits",
  "image/tiff": "tiff",
  "image/bmp": "bmp",
  "image/x-icon": "ico",
  "audio/mpeg": "mp3",
  "audio/flac": "flac",
  "audio/midi": "midi",
  "audio/ape": "ape",
  "audio/amr": "amr",
  "audio/wav": "wav",
  "audio/aiff": "aiff",
  "audio/basic": "au",
  "video/mpeg": "mpeg",
  "video/quicktime": "mov",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
  "video/x-msvideo": "avi",
  "video/x-flv": "flv",
  "video/x-matroska": "mkv",
  "video/x-ms-asf": "asf",
  "audio/aac": "aac",
  "audio/x-unknown": "voc",
  "audio/mp4": "mp4",
  "audio/x-m4a": "m4a",
  "application/vnd.apple.mpegurl": "m3u",
  "video/x-m4v": "m4v",
  "application/vnd.rn-realmedia-vbr": "rmvb",
  "application/gzip": "gz",
  "application/x-java-applet": "applet",
  "application/x-shockwave-flash": "swf",
  "application/x-chrome-extension": "crx",
  "font/ttf": "ttf",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "font/otf": "otf",
  "font/collection": "ttc",
  "application/vnd.ms-fontobject": "eot",
  "application/wasm": "wasm",
  "application/vnd.shx": "shx",
  "application/vnd.shp": "shp",
  "application/x-dbf": "dbf",
  "application/dicom": "dcm",
  "application/x-rar-compressed": "rar",
  "image/vnd.djvu": "djvu",
  "application/x-mobipocket-ebook": "mobi",
  "application/x-ms-reader": "lit",
  "image/bpg": "bpg",
  "application/vnd.sqlite3": "sqlite",
  "image/vnd.dwg": "dwg",
  "application/vnd.nintendo.snes.rom": "nes",
  "application/x-ms-shortcut": "lnk",
  "application/x-mach-binary": "macho",
  "audio/qcelp": "qcp",
  "image/x-icns": "icns",
  "image/heic": "heic",
  "image/heic-sequence": "heic",
  "image/heif": "heif",
  "image/heif-sequence": "heif",
  "image/vnd.radiance": "hdr",
  "application/marc": "mrc",
  "application/x-msaccess": "mdb",
  "application/zstd": "zst",
  "application/vnd.ms-cab-compressed": "cab",
  "application/x-rpm": "rpm",
  "application/x-xz": "xz",
  "application/lzip": "lz",
  //   'application/x-bittorrent': 'torrent', // Removed due to ambiguity
  "application/x-cpio": "cpio",
  "application/tzif": "tzif",
  "image/x-xcf": "xcf",
  "image/x-gimp-pat": "pat",
  "image/x-gimp-gbr": "gbr",
  "model/gltf-binary": "glb",
  "image/avif": "avif",
  "application/x-installshield": "cab",
  "image/jxr": "jxr",
  "text/plain": "txt",
  "text/html": "html",
  "image/svg+xml": "svg",
  "text/xml": "xml",
  "application/rss+xml": "rss",
  "application/atom+xml": "atom",
  "model/x3d+xml": "x3d",
  "application/vnd.google-earth.kml+xml": "kml",
  "application/x-xliff+xml": "xlf",
  "model/vnd.collada+xml": "dae",
  "application/gml+xml": "gml",
  "application/gpx+xml": "gpx",
  "application/vnd.garmin.tcx+xml": "tcx",
  "application/x-amf": "amf",
  "application/vnd.ms-package.3dmanufacturing-3dmodel+xml": "3mf",
  "application/vnd.adobe.xfdf": "xfdf",
  "application/owl+xml": "owl",
  "text/x-php": "php",
  "application/javascript": "js",
  "text/x-lua": "lua",
  "text/x-perl": "pl",
  "text/x-python": "py",
  "application/json": "json",
  "application/geo+json": "geojson",
  "application/x-ndjson": "ndjson",
  "text/rtf": "rtf",
  "application/x-subrip": "srt",
  "text/x-tcl": "tcl",
  "text/csv": "csv",
  "text/tab-separated-values": "tsv",
  "text/vcard": "vcf",
  "text/calendar": "ics",
  "application/warc": "warc",
  "text/vtt": "vtt",
}

export const getSingleMimetypeKeyword = (mimeType: string): string => {
  return mimeTypeToSearchKeyword[mimeType] || ""
}
