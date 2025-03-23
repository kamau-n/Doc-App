"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as FileSystem from "expo-file-system"
import { useAuth } from "./auth-context"

type DocumentFile = {
  uri: string
  name: string
  type: string
  size: number | null
}

type Document = {
  id: string
  name: string
  description: string
  type: string
  file: DocumentFile
  createdAt: string
  userId: string
}

type NewDocument = {
  name: string
  description: string
  type: string
  file: DocumentFile
}

type DocumentContextType = {
  documents: Document[]
  loadDocuments: () => Promise<void>
  getDocument: (id: string) => Promise<Document>
  addDocument: (document: NewDocument) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const { user } = useAuth()

  const loadDocuments = useCallback(async () => {
    if (!user) return

    try {
      const documentsJson = await AsyncStorage.getItem(`documents_${user.id}`)
      if (documentsJson) {
        setDocuments(JSON.parse(documentsJson))
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
      setDocuments([])
    }
  }, [user])

  const getDocument = useCallback(
    async (id: string): Promise<Document> => {
      if (!user) throw new Error("User not authenticated")

      const documentsJson = await AsyncStorage.getItem(`documents_${user.id}`)
      const docs = documentsJson ? JSON.parse(documentsJson) : []

      const document = docs.find((doc: Document) => doc.id === id)

      if (!document) {
        throw new Error("Document not found")
      }

      return document
    },
    [user],
  )

  const addDocument = useCallback(
    async (newDoc: NewDocument) => {
      if (!user) throw new Error("User not authenticated")

      try {
        // Create documents directory if it doesn't exist
        const documentsDir = `${FileSystem.documentDirectory}documents/${user.id}`
        const dirInfo = await FileSystem.getInfoAsync(documentsDir)

        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true })
        }

        // Generate unique filename
        const fileExt = newDoc.file.name.split(".").pop() || "file"
        const fileName = `${Date.now()}.${fileExt}`
        const fileUri = `${documentsDir}/${fileName}`

        // Copy file to app's document directory
        await FileSystem.copyAsync({
          from: newDoc.file.uri,
          to: fileUri,
        })

        // Create document object
        const document: Document = {
          id: Date.now().toString(),
          name: newDoc.name,
          description: newDoc.description,
          type: newDoc.type,
          file: {
            ...newDoc.file,
            uri: fileUri,
          },
          createdAt: new Date().toISOString(),
          userId: user.id,
        }

        // Get existing documents
        const documentsJson = await AsyncStorage.getItem(`documents_${user.id}`)
        const existingDocuments = documentsJson ? JSON.parse(documentsJson) : []

        // Add new document
        const updatedDocuments = [...existingDocuments, document]

        // Save to AsyncStorage
        await AsyncStorage.setItem(`documents_${user.id}`, JSON.stringify(updatedDocuments))

        // Update state
        setDocuments(updatedDocuments)
      } catch (error) {
        console.error("Failed to add document:", error)
        throw new Error("Failed to add document")
      }
    },
    [user],
  )

  const deleteDocument = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated")

      try {
        // Get existing documents
        const documentsJson = await AsyncStorage.getItem(`documents_${user.id}`)
        const existingDocuments = documentsJson ? JSON.parse(documentsJson) : []

        // Find document to delete
        const documentToDelete = existingDocuments.find((doc: Document) => doc.id === id)

        if (!documentToDelete) {
          throw new Error("Document not found")
        }

        // Delete file
        try {
          await FileSystem.deleteAsync(documentToDelete.file.uri)
        } catch (fileError) {
          console.warn("Failed to delete file:", fileError)
          // Continue even if file deletion fails
        }

        // Remove document from array
        const updatedDocuments = existingDocuments.filter((doc: Document) => doc.id !== id)

        // Save to AsyncStorage
        await AsyncStorage.setItem(`documents_${user.id}`, JSON.stringify(updatedDocuments))

        // Update state
        setDocuments(updatedDocuments)
      } catch (error) {
        console.error("Failed to delete document:", error)
        throw new Error("Failed to delete document")
      }
    },
    [user],
  )

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loadDocuments,
        getDocument,
        addDocument,
        deleteDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider")
  }
  return context
}

