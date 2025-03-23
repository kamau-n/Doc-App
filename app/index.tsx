"use client"

import { useEffect } from "react"
import { useRouter, Redirect } from "expo-router"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useAuth } from "../context/auth-context"

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/home")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return <Redirect href="/login" />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

