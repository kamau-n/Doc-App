"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Image, Dimensions } from "react-native"
import { Appbar, Text, Button, Divider, Menu, ActivityIndicator, IconButton } from "react-native-paper"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system"
import Pdf from "react-native-pdf"
import { useDocuments } from "../../context/document-context"
import { formatDate } from "../../utils/date-utils"
import { getFileIcon, getFileTypeLabel } from "../../utils/file-utils"

export default function DocumentDetails() {
  const { id } = useLocalSearchParams()
  const { getDocument, deleteDocument } = useDocuments()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuVisible, setMenuVisible] = useState(false)
  const [sharingLoading, setSharingLoading] = useState(false)
  const [pdfPage, setPdfPage] = useState(1)
  const [totalPdfPages, setTotalPdfPages] = useState(0)
  const router = useRouter()
  const screenWidth = Dimensions.get("window").width

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocument(id as string)
        setDocument(doc)
      } catch (err) {
        console.error("Error loading document:", err)
        setError("Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [id, getDocument])

  const handleGoBack = () => {
    router.back()
  }

  const handleShare = async () => {
    if (!document) return

    try {
      setSharingLoading(true)

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync()
      if (!isSharingAvailable) {
        setError("Sharing is not available on this device")
        return
      }

      // For PDFs and other non-image files, we need to ensure the file has the correct extension
      let fileUri = document.file.uri

      // If the file is in the app's cache or document directory, it should be shareable directly
      // Otherwise, we might need to copy it to a temporary location
      if (!fileUri.startsWith(FileSystem.documentDirectory) && !fileUri.startsWith(FileSystem.cacheDirectory)) {
        const fileExtension = document.file.name.split(".").pop() || "file"
        const tempUri = `${FileSystem.cacheDirectory}temp_share_file.${fileExtension}`

        await FileSystem.copyAsync({
          from: fileUri,
          to: tempUri,
        })

        fileUri = tempUri
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Share ${document.name}`,
        mimeType: document.file.type,
        UTI: document.file.type === "application/pdf" ? "com.adobe.pdf" : undefined,
      })
    } catch (err) {
      console.error("Error sharing document:", err)
      setError("Failed to share document: " + (err.message || err))
    } finally {
      setSharingLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDocument(id as string)
      router.replace("/home")
    } catch (err) {
      console.error("Error deleting document:", err)
      setError("Failed to delete document")
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error || !document) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error || "Document not found"}</Text>
        <Button mode="contained" onPress={handleGoBack} style={styles.button}>
          Go Back
        </Button>
      </View>
    )
  }

  const isImage = document.file.type.startsWith("image/")
  const isPdf = document.file.type === "application/pdf"

  const renderDocumentPreview = () => {
    if (isImage) {
      return <Image source={{ uri: document.file.uri }} style={styles.documentImage} resizeMode="contain" />
    } else if (isPdf) {
      return (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: document.file.uri }}
            onLoadComplete={(numberOfPages) => {
              setTotalPdfPages(numberOfPages)
            }}
            onPageChanged={(page) => {
              setPdfPage(page)
            }}
            onError={(error) => {
              console.error("PDF Error:", error)
              setError("Failed to load PDF")
            }}
            style={styles.pdf}
          />
          {totalPdfPages > 0 && (
            <View style={styles.pdfPageControls}>
              <IconButton
                icon="chevron-left"
                disabled={pdfPage <= 1}
                onPress={() => setPdfPage(Math.max(1, pdfPage - 1))}
              />
              <Text>{`Page ${pdfPage} of ${totalPdfPages}`}</Text>
              <IconButton
                icon="chevron-right"
                disabled={pdfPage >= totalPdfPages}
                onPress={() => setPdfPage(Math.min(totalPdfPages, pdfPage + 1))}
              />
            </View>
          )}
        </View>
      )
    } else {
      // For other document types
      const fileIcon = getFileIcon(document.file.type, document.file.name)
      const fileTypeLabel = getFileTypeLabel(document.file.type, document.file.name)

      return (
        <View style={styles.otherDocumentContainer}>
          <IconButton icon={fileIcon} size={80} />
          <Text variant="titleMedium">{fileTypeLabel} Document</Text>
          <Text variant="bodyMedium">{document.file.name}</Text>
          <Text variant="bodySmall" style={styles.previewNotAvailable}>
            (Preview not available)
          </Text>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title={document.name} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
        >
          <Menu.Item onPress={handleShare} title="Share" leadingIcon="share" />
          <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
        </Menu>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.metadataContainer}>
          <Text variant="titleMedium">Document Details</Text>
          <Divider style={styles.divider} />

          <View style={styles.metadataRow}>
            <Text variant="bodyMedium" style={styles.metadataLabel}>
              Type:
            </Text>
            <Text variant="bodyMedium">{document.type}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Text variant="bodyMedium" style={styles.metadataLabel}>
              Added:
            </Text>
            <Text variant="bodyMedium">{formatDate(document.createdAt)}</Text>
          </View>

          {document.description ? (
            <View style={styles.descriptionContainer}>
              <Text variant="bodyMedium" style={styles.metadataLabel}>
                Description:
              </Text>
              <Text variant="bodyMedium">{document.description}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.documentContainer}>{renderDocumentPreview()}</View>

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            icon="share"
            onPress={handleShare}
            style={styles.button}
            loading={sharingLoading}
            disabled={sharingLoading}
          >
            Share Document
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  scrollContent: {
    padding: 16,
  },
  metadataContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  metadataRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metadataLabel: {
    fontWeight: "bold",
    marginRight: 8,
    minWidth: 80,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  documentContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  documentImage: {
    width: "100%",
    height: 400,
  },
  pdfContainer: {
    width: "100%",
    height: 500,
    alignItems: "center",
  },
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  pdfPageControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
  },
  otherDocumentContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
  },
  previewNotAvailable: {
    color: "#888",
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
})

