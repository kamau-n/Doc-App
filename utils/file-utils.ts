/**
 * Returns the appropriate icon name for a file based on its MIME type and name
 */
export function getFileIcon(mimeType: string, fileName: string): string {
  if (mimeType.startsWith("image/")) {
    return "file-image"
  }

  if (mimeType === "application/pdf") {
    return "file-pdf-box"
  }

  // Check file extension for common document types
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "doc":
    case "docx":
      return "file-word"
    case "xls":
    case "xlsx":
      return "file-excel"
    case "ppt":
    case "pptx":
      return "file-powerpoint"
    case "txt":
      return "file-document-outline"
    case "zip":
    case "rar":
    case "7z":
      return "zip-box"
    default:
      return "file-document"
  }
}

/**
 * Returns a human-readable label for a file type based on MIME type and name
 */
export function getFileTypeLabel(mimeType: string, fileName: string): string {
  if (mimeType.startsWith("image/")) {
    return "Image"
  }

  if (mimeType === "application/pdf") {
    return "PDF"
  }

  // Check file extension for common document types
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "doc":
    case "docx":
      return "Word"
    case "xls":
    case "xlsx":
      return "Excel"
    case "ppt":
    case "pptx":
      return "PowerPoint"
    case "txt":
      return "Text"
    case "zip":
    case "rar":
    case "7z":
      return "Archive"
    default:
      return "Document"
  }
}

