import { Text, View } from 'react-native'
import React from 'react'

export default function Index() {
  return (
    // The style prop must be inside these brackets < >
    <View 
      style={{ 
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center'
      }} 
    >
      <Text>index</Text>
    </View>
  )
}