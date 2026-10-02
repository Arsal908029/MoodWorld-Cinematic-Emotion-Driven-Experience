// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CheckInScreen from '../screens/CheckInScreen';
import WorldScreen from '../screens/WorldScreen';
import BreathingScreen from '../screens/BreathingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GlassTabBar from '../components/UI/GlassTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneContainerStyle: { backgroundColor: 'transparent' },
        contentStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ tabBarLabel: 'Check-in' }}
      />
      <Tab.Screen
        name="World"
        component={WorldScreen}
        options={{ tabBarLabel: 'World' }}
      />
      <Tab.Screen
        name="Breathing"
        component={BreathingScreen}
        options={{ tabBarLabel: 'Breathe' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
