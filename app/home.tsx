"use client"

import { useEffect } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import { Text, FAB, Appbar, Card, IconButton } from "react-native-paper"
import { useRouter } from "expo-router"
import { useAuth } from "../context/auth-context"
import { useDocuments } from "../context/document-context"
import { formatDate } from "../utils/date-utils"

export default function Home() {
  const { user, logout } = useAuth()
  const { documents, loadDocuments } = useDocuments()
  const router = useRouter()

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleAddDocument = () => {
    router.push("/document/add")
  }

  const handleViewDocument = (id: string) => {
    router.push(`/document/${id}`)
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge">No documents yet</Text>
      <Text variant="bodyMedium">Tap the + button to add your first document</Text>
    </View>
  )

  const renderDocumentItem = ({ item }) => (
    <Card style={styles.documentCard} onPress={() => handleViewDocument(item.id)}>
      <Card.Title
        title={item.name}
        subtitle={`Added: ${formatDate(item.createdAt)}`}
        right={(props) => <IconButton {...props} icon="chevron-right" onPress={() => handleViewDocument(item.id)} />}
      />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={2}>
          {item.description || "No description"}
        </Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Document Center" subtitle={user?.name} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <FlatList
        data={documents}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />

      <FAB icon="plus" style={styles.fab} onPress={handleAddDocument} label="Add Document" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  documentCard: {
    marginBottom: 16,
  },
  tagContainer: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  tagText: {
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
})

