// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CheckInScreen from '../screens/CheckInScreen';
import WorldScreen from '../screens/WorldScreen';
import BreathingScreen from '../screens/BreathingScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CheckIn"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="World" component={WorldScreen} />
        <Stack.Screen name="Breathing" component={BreathingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}