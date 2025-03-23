import { Stack } from "expo-router"
import { PaperProvider } from "react-native-paper"
import { AuthProvider } from "../context/auth-context"
import { DocumentProvider } from "../context/document-context"

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <DocumentProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </DocumentProvider>
      </AuthProvider>
    </PaperProvider>
  )
}

