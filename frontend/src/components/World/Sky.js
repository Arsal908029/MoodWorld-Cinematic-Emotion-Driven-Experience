// src/components/World/Sky.js
import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import theme from '../../theme/moodWorldTheme';

export default function Sky({ moodConfig, timeOfDayKey = 'day' }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const tod = theme.timeOfDay[timeOfDayKey] || theme.timeOfDay.day;

  // Sun / Moon vertical float motion: 9s per spec
  const sunY = useSharedValue(0);
  useEffect(() => {
    sunY.value = withRepeat(
      withSequence(
        withTiming(-16, { duration: theme.motion.sunBob / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: theme.motion.sunBob / 2, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  // Cloud drift horizontally: 60s linear per spec
  const cloudX = useSharedValue(0);
  useEffect(() => {
    cloudX.value = withRepeat(
      withSequence(
        withTiming(screenWidth * 0.4, { duration: theme.motion.cloudDrift / 2, easing: Easing.linear }),
        withTiming(-screenWidth * 0.1, { duration: theme.motion.cloudDrift / 2, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, [screenWidth]);

  // Star twinkle: 3s per spec
  const starOpacity = useSharedValue(0.7);
  useEffect(() => {
    starOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: theme.motion.starTwinkle / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: theme.motion.starTwinkle / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const sunAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sunY.value }],
  }));

  const cloudAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudX.value }],
  }));

  const starAnimStyle = useAnimatedStyle(() => ({
    opacity: starOpacity.value,
  }));

  const skyColors = moodConfig.sky || theme.moods.Okay.sky;
  const isSpace = moodConfig.env === 'Space';
  const isMountains = moodConfig.env === 'Mountains';

  // Sun/Moon position: lower for Angry, slightly higher for Tired
  const baseSunTop = screenHeight * 0.22;
  const sunTop = baseSunTop + (moodConfig.sunOffset || 0);
  const sunLeft = screenWidth * 0.68;

  // Base star count: 60 small dots in top half
  const starCount = 60;
  const baseStarsOpacity = isSpace ? 1 : (moodConfig.stars + (tod.starsBoost || 0));

  // Rainbow arc colors (6 concentric arcs)
  const rainbowColors = [
    'rgba(255, 99, 132, 0.45)',
    'rgba(255, 159, 64, 0.45)',
    'rgba(255, 205, 86, 0.45)',
    'rgba(75, 192, 192, 0.45)',
    'rgba(54, 162, 235, 0.45)',
    'rgba(153, 102, 255, 0.45)',
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height={screenHeight} width={screenWidth}>
        <Defs>
          {/* Spec: sky1 at 0%, sky2 at 30%, sky3 at 56% */}
          <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={skyColors[0]} />
            <Stop offset="30%" stopColor={skyColors[1]} />
            <Stop offset="56%" stopColor={skyColors[2]} />
            <Stop offset="100%" stopColor={skyColors[2]} />
          </LinearGradient>
        </Defs>

        {/* 1. Base Sky Gradient */}
        <Rect x="0" y="0" width={screenWidth} height={screenHeight} fill="url(#skyGrad)" />

        {/* 2. Far Mountains (Skipped in Space and Mountains) - spec: horizon 60% + ground 40% */}
        {!isSpace && !isMountains && (
          <Path
            d={`M -20 ${screenHeight * 0.68} L ${screenWidth * 0.2} ${screenHeight * 0.52} L ${screenWidth * 0.45} ${screenHeight * 0.62} L ${screenWidth * 0.72} ${screenHeight * 0.5} L ${screenWidth * 0.95} ${screenHeight * 0.63} L ${screenWidth + 20} ${screenHeight * 0.58} L ${screenWidth + 20} ${screenHeight} L -20 ${screenHeight} Z`}
            fill={skyColors[2]}
            opacity={0.7}
          />
        )}

        {/* 3. Rainbow (6 concentric arcs behind mountains, Calm mood only) */}
        {moodConfig.rainbow > 0 &&
          rainbowColors.map((color, idx) => {
            const r = screenWidth * 0.68 + idx * 8;
            return (
              <Path
                key={`rainbow-arc-${idx}`}
                d={`M -40 ${screenHeight * 0.65} A ${r} ${r} 0 0 1 ${screenWidth + 40} ${screenHeight * 0.65}`}
                fill="none"
                stroke={color}
                strokeWidth={7}
                opacity={moodConfig.rainbow}
              />
            );
          })}
      </Svg>

      {/* 4. Twinkling Stars (Top half) */}
      {(baseStarsOpacity > 0 || isSpace) && (
        <Animated.View style={[StyleSheet.absoluteFill, starAnimStyle]} pointerEvents="none">
          <Svg height={screenHeight * 0.52} width={screenWidth}>
            {Array.from({ length: starCount }).map((_, i) => {
              const cx = (i * 47 + 17) % screenWidth;
              const cy = (i * 29 + 11) % (screenHeight * 0.48);
              const opacity = Math.min(1, baseStarsOpacity * ((i % 4) / 4 + 0.35));
              const r = i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.4 : 1.0;
              return (
                <Circle
                  key={`star-${i}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#FFFFFF"
                  opacity={opacity}
                />
              );
            })}
          </Svg>
        </Animated.View>
      )}

      {/* 5. Sun or Moon (r 40 circle + r 180 glow, 9s slow drift) */}
      <Animated.View
        style={[
          styles.sunContainer,
          { top: sunTop, left: sunLeft },
          sunAnimStyle,
        ]}
        pointerEvents="none"
      >
        <Svg width={360} height={360} viewBox="0 0 360 360">
          <Defs>
            <RadialGradient id="sunGlowGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={moodConfig.sun} stopOpacity="0.85" />
              <Stop offset="40%" stopColor={moodConfig.sun} stopOpacity="0.35" />
              <Stop offset="80%" stopColor={moodConfig.sun} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={moodConfig.sun} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Radial soft glow: r 180 */}
          <Circle cx="180" cy="180" r="175" fill="url(#sunGlowGrad)" />
          {/* Solid orb: r 40 */}
          <Circle cx="180" cy="180" r="40" fill={moodConfig.sun} />
        </Svg>
      </Animated.View>

      {/* 6. Drifting Clouds (Soft blobs drifting sideways 60s, color = sky mid mixed with white) */}
      {moodConfig.clouds > 0 && (
        <Animated.View
          style={[styles.cloudsContainer, cloudAnimStyle]}
          pointerEvents="none"
        >
          <Svg width={screenWidth * 1.6} height={140} viewBox={`0 0 ${screenWidth * 1.6} 140`}>
            <Path
              d={`M -40 85 Q 60 25 160 75 Q 260 30 360 75 Q 460 35 560 80 Q 660 40 760 80 L 760 140 L -40 140 Z`}
              fill="#FFFFFF"
              opacity={moodConfig.clouds * 0.28}
            />
            <Path
              d={`M -20 95 Q 80 45 180 90 Q 280 40 380 90 Q 480 50 580 95 L 580 140 L -20 140 Z`}
              fill={skyColors[1]}
              opacity={moodConfig.clouds * 0.35}
            />
          </Svg>
        </Animated.View>
      )}

      {/* Time of Day Tint Overlay */}
      {tod.tint && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tod.tint, opacity: tod.tintOpacity },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sunContainer: {
    position: 'absolute',
    width: 360,
    height: 360,
    marginLeft: -180,
    marginTop: -180,
  },
  cloudsContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
  },
});