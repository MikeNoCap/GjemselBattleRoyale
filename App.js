// Import React
import React, { useEffect, useState, useRef } from 'react';
// Import required components
import { SafeAreaView, StyleSheet, View, Text, Image, Animated, Platform } from 'react-native';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import Main from './screens/Main';
import Welcome from './screens/Welcome';
import ProfilePicture from './screens/ProfilePicture';

const Stack = createNativeStackNavigator();



function AppStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Main" component={Main}></Stack.Screen>
      <Stack.Screen name="Welcome" component={Welcome}></Stack.Screen>
      <Stack.Screen name="ProfilePicture" component={ProfilePicture}></Stack.Screen>
    </Stack.Navigator>
  )
}



const App = () => {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
export default App;


