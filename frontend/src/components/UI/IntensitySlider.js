// src/components/UI/IntensitySlider.js
import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, PanResponder } from 'react-native';
import theme from '../../theme/moodWorldTheme';

export default function IntensitySlider({ value = 5, onChange }) {
  const [trackWidth, setTrackWidth] = useState(220);
  const trackRef = useRef(null);

  const calculateValueFromPageX = (pageX) => {
    if (!trackRef.current) return;
    trackRef.current.measure((x, y, width, height, pageXOffset) => {
      const relativeX = pageX - pageXOffset;
      const clamped = Math.max(0, Math.min(width, relativeX));
      const newValue = Math.max(1, Math.min(10, Math.round((clamped / width) * 9 + 1)));
      if (onChange) {
        onChange(newValue);
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        calculateValueFromPageX(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        calculateValueFromPageX(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: (evt) => {
        calculateValueFromPageX(evt.nativeEvent.pageX);
      },
    })
  ).current;

  // Percentage for thumb position: value 1 = 0%, 10 = 100%
  const percent = Math.max(0, Math.min(1, (value - 1) / 9));

  return (
    <View style={styles.container}>
      {/* Slider Interactive Row */}
      <View style={styles.sliderRow}>
        {/* Track Container with PanResponder */}
        <View
          ref={trackRef}
          style={styles.trackArea}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          {/* Background Inactive Track */}
          <View style={styles.inactiveTrack} />

          {/* Foreground Active White Track */}
          <View style={[styles.activeTrack, { width: `${percent * 100}%` }]} />

          {/* Large White Thumb with Soft Halo */}
          <View
            style={[
              styles.thumbWrapper,
              { left: Math.max(0, Math.min(trackWidth - 28, percent * (trackWidth - 28))) },
            ]}
          >
            {/* Soft Outer Halo */}
            <View style={styles.thumbHalo} />
            {/* Solid White Thumb */}
            <View style={styles.thumbCore} />
          </View>
        </View>

        {/* Number Display on the Right */}
        <View style={styles.numberBox}>
          <Text style={styles.numberText}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trackArea: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.ui.slider.trackOff,
    width: '100%',
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.ui.slider.trackOn,
  },
  thumbWrapper: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbHalo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.ui.slider.thumbHalo,
  },
  thumbCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.ui.slider.thumb,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  numberBox: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    ...theme.type.heading,
    fontSize: 20,
    color: theme.ui.text,
  },
});