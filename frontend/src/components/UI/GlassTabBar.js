import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import theme from '../../theme/moodWorldTheme';

function TabIcon({ kind, focused }) {
  const color = focused ? '#FFFFFF' : 'rgba(255,255,255,0.66)';

  switch (kind) {
    case 'checkin':
      return (
        <Svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <Path d="M12 2.75L14.3 8.1L20 8.1L15.5 11.7L17.5 17.2L12 13.8L6.5 17.2L8.5 11.7L4 8.1L9.7 8.1L12 2.75Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        </Svg>
      );
    case 'world':
      return (
        <Svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.6" />
          <Path d="M4 12H20M12 4C14.6 6.8 16 9.3 16 12C16 14.7 14.6 17.2 12 20C9.4 17.2 8 14.7 8 12C8 9.3 9.4 6.8 12 4Z" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'breathing':
      return (
        <Svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <Path d="M5 15C6.5 12.5 9 11 12 11C15 11 17.5 12.5 19 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <Path d="M7.5 18.5C8.8 17 10.1 16.2 12 16.2C13.9 16.2 15.2 17 16.5 18.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <Path d="M12 5C13.8 5 15.2 6.5 15.2 8.2C15.2 9.9 13.8 11.4 12 11.4C10.2 11.4 8.8 9.9 8.8 8.2C8.8 6.5 10.2 5 12 5Z" stroke={color} strokeWidth="1.4" />
        </Svg>
      );
    case 'profile':
      return (
        <Svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.6" />
          <Path d="M5 18.5C6.8 15.9 9.2 14.5 12 14.5C14.8 14.5 17.2 15.9 19 18.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
}

export default function GlassTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <BlurView intensity={70} tint="dark" style={styles.blur} />
      <View style={styles.innerRow}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabButton, focused && styles.tabButtonFocused]}
              android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            >
              <TabIcon kind={route.name.toLowerCase().includes('check') ? 'checkin' : route.name.toLowerCase().includes('world') ? 'world' : route.name.toLowerCase().includes('breathe') ? 'breathing' : 'profile'} focused={focused} />
              <View style={styles.labelWrap}>
                <View style={[styles.labelDot, focused && styles.labelDotFocused]} />
                <Text style={[styles.labelText, focused && styles.labelTextFocused]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 76,
    borderRadius: theme.radius.sheet,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginHorizontal: 4,
  },
  tabButtonFocused: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  labelWrap: {
    marginTop: 4,
    alignItems: 'center',
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  labelDotFocused: {
    backgroundColor: '#7DD3FC',
    shadowColor: '#7DD3FC',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  labelText: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    letterSpacing: 0.2,
  },
  labelTextFocused: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
