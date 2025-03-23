import type React from "react"
import { Pressable, type PressableProps } from "react-native"

// This is a simplified version that doesn't use haptics
export const HapticTab: React.FC<PressableProps> = ({ onPress, children, ...props }) => {
  return (
    <Pressable onPress={onPress} {...props}>
      {children}
    </Pressable>
  )
}

