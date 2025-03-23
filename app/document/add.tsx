"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Appbar, TextInput, Button, SegmentedButtons, Text, List } from "react-native-paper"
import { useRouter } from "expo-router"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { useDocuments } from "../../context/document-context"

const DOCUMENT_TYPES = [
  { value: "ID", label: "ID Document" },
  { value: "Receipt", label: "Receipt" },
  { value: "Bill", label: "Bill" },
  { value: "Certificate", label: "Certificate" },
  { value: "Other", label: "Other" },
]

export default function AddDocument() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("Other")
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { addDocument } = useDocuments()
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      })

      if (result.canceled) return

      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: result.assets[0].mimeType,
        size: result.assets[0].size,
      })
    } catch (err) {
      console.error("Error picking document:", err)
      setError("Failed to pick document")
    }
  }

  const handleScanDocument = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        setError("Camera permission is required to scan documents")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      })

      if (result.canceled) return

      setFile({
        uri: result.assets[0].uri,
        name: "scanned_document.jpg",
        type: "image/jpeg",
        size: null,
      })
    } catch (err) {
      console.error("Error scanning document:", err)
      setError("Failed to scan document")
    }
  }

  const handleSave = async () => {
    if (!name) {
      setError("Please enter a document name")
      return
    }

    if (!file) {
      setError("Please upload or scan a document")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await addDocument({
        name,
        description,
        type,
        file,
      })
      router.replace("/home")
    } catch (err) {
      console.error("Error saving document:", err)
      setError("Failed to save document")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title="Add Document" />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TextInput label="Document Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Text variant="bodyMedium" style={styles.label}>
            Document Type
          </Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={DOCUMENT_TYPES}
            style={styles.segmentedButtons}
          />

          <Text variant="bodyMedium" style={styles.label}>
            Document File
          </Text>
          <View style={styles.fileActions}>
            <Button mode="outlined" icon="file-upload" onPress={handlePickDocument} style={styles.fileButton}>
              Upload
            </Button>
            <Button mode="outlined" icon="camera" onPress={handleScanDocument} style={styles.fileButton}>
              Scan
            </Button>
          </View>

          {file && (
            <List.Item
              title={file.name}
              description={`${file.type} ${file.size ? `• ${(file.size / 1024).toFixed(1)} KB` : ""}`}
              left={(props) => <List.Icon {...props} icon="file-document" />}
              style={styles.fileItem}
            />
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          >
            Save Document
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  fileActions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  fileButton: {
    flex: 1,
    marginRight: 8,
  },
  fileItem: {
    backgroundColor: "#fff",
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
})

