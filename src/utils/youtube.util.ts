export const youtubeVideoFormats: {
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

export const youtubeThumbnailFormats: {
  [key: string]: { extension: string; mimeType: string };
} = {
  jpg: { extension: "jpg", mimeType: "image/jpeg" },
  png: { extension: "png", mimeType: "image/png" },
  bmp: { extension: "bmp", mimeType: "image/bmp" },
};

export const isSupportedVideoContentType = (contentType: string) => {
  return Object.values(youtubeVideoFormats).some(
    (format) => format.mimeType === contentType
  );
};

export const isSupportedThumbnailContentType = (contentType: string) => {
  console.log("contentType", contentType);
  return Object.values(youtubeThumbnailFormats).some(
    (format) => format.mimeType === contentType
  );
};

export const getExtensionFromContentType = ({
  contentType,
  type = "video",
}: {
  contentType?: string;
  type: "video" | "thumbnail";
}) => {
  if (!contentType) return null;
  const format = Object.values(
    type === "video" ? youtubeVideoFormats : youtubeThumbnailFormats
  ).find((format) => format.mimeType === contentType);
  return format?.extension;
};
