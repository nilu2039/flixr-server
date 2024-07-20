export const youtubeFormats: {
  [key: string]: { extension: string; mimeType: string };
} = {
  mp4: { extension: "mp4", mimeType: "video/mp4" },
  mov: { extension: "mov", mimeType: "video/quicktime" },
  avi: { extension: "avi", mimeType: "video/x-msvideo" },
  wmv: { extension: "wmv", mimeType: "video/x-ms-wmv" },
  flv: { extension: "flv", mimeType: "video/x-flv" },
  webm: { extension: "webm", mimeType: "video/webm" },
  mpg: { extension: "mpg", mimeType: "video/mpeg" },
  "3gpp": { extension: "3gp", mimeType: "video/3gpp" },
};

export const isSupportedContentType = (contentType: string) => {
  return Object.values(youtubeFormats).some(
    (format) => format.mimeType === contentType
  );
};

export const getExtensionFromContentType = (contentType: string) => {
  const format = Object.values(youtubeFormats).find(
    (format) => format.mimeType === contentType
  );
  return format?.extension;
};
