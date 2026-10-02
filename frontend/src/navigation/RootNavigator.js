// src/navigation/RootNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AccountSetupScreen from '../screens/AccountSetupScreen';
import PolicyInstructionScreen from '../screens/PolicyInstructionScreen';
import MainTabNavigator from './MainTabNavigator';
import JournalScreen from '../screens/JournalScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        colors: {
          background: 'transparent',
          card: 'transparent',
          border: 'transparent',
          primary: '#FFFFFF',
          text: '#FFFFFF',
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {user ? (
          // Authenticated Protected Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
            <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
            <Stack.Screen name="PolicyInstruction" component={PolicyInstructionScreen} />
          </>
        ) : (
          // Guest / Authentication Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              initialParams={{ isLogin: false }}
            />
            <Stack.Screen
              name="Login"
              component={SignUpScreen}
              initialParams={{ isLogin: true }}
            />
            <Stack.Screen name="PolicyInstruction" component={PolicyInstructionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

