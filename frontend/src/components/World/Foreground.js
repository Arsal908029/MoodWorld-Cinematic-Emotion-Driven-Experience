// src/components/World/Foreground.js
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function Foreground({ env, groundColor, skyHorizonColor, timeOfDayKey = 'day' }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const baseGround = groundColor || '#3f6553';
  const isEvening = timeOfDayKey === 'dusk' || timeOfDayKey === 'night';
  const glowOpacity = isEvening ? 0.7 : 0.35;
  const w = screenWidth;
  const h = screenHeight;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height={h} width={w}>
        {env === 'Forest' && (
          <>
            <Path
              d={`M 0 ${h} L 0 ${h * 0.64} L ${w * 0.12} ${h * 0.56} L ${w * 0.24} ${h * 0.66} L ${w * 0.36} ${h * 0.52} L ${w * 0.5} ${h * 0.68} L ${w * 0.64} ${h * 0.55} L ${w * 0.8} ${h * 0.67} L ${w} ${h * 0.6} L ${w} ${h} Z`}
              fill={skyHorizonColor || baseGround}
              opacity={0.68}
            />
            <Path
              d={`M ${-w * 0.06} ${h} L ${w * 0.08} ${h * 0.7} L ${w * 0.2} ${h} M ${w * 0.14} ${h} L ${w * 0.3} ${h * 0.58} L ${w * 0.45} ${h} M ${w * 0.46} ${h} L ${w * 0.62} ${h * 0.62} L ${w * 0.79} ${h} M ${w * 0.72} ${h} L ${w * 0.89} ${h * 0.66} L ${w * 1.08} ${h}`}
              fill={baseGround}
            />
            <Path
              d={`M 0 ${h * 0.78} Q ${w * 0.28} ${h * 0.74} ${w * 0.52} ${h * 0.79} Q ${w * 0.75} ${h * 0.74} ${w} ${h * 0.8} L ${w} ${h} L 0 ${h} Z`}
              fill="rgba(255,255,255,0.08)"
            />
          </>
        )}

        {env === 'Garden' && (
          <>
            <Path
              d={`M -20 ${h} Q ${w * 0.18} ${h * 0.7} ${w * 0.38} ${h * 0.82} Q ${w * 0.6} ${h * 0.75} ${w * 0.82} ${h * 0.85} Q ${w * 0.92} ${h * 0.82} ${w + 20} ${h * 0.72} L ${w + 20} ${h} Z`}
              fill={skyHorizonColor || baseGround}
              opacity={0.62}
            />
            <Path
              d={`M -20 ${h} Q ${w * 0.26} ${h * 0.76} ${w * 0.56} ${h * 0.8} Q ${w * 0.8} ${h * 0.84} ${w + 20} ${h * 0.76} L ${w + 20} ${h} Z`}
              fill={baseGround}
            />
            <Path
              d={`M ${w * 0.1} ${h * 0.8} Q ${w * 0.24} ${h * 0.72} ${w * 0.38} ${h * 0.8} Q ${w * 0.5} ${h * 0.76} ${w * 0.62} ${h * 0.8} Q ${w * 0.75} ${h * 0.72} ${w * 0.88} ${h * 0.8}`}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
              fill="none"
            />
            <Circle cx={w * 0.18} cy={h * 0.73} r={w * 0.12} fill={baseGround} />
            <Circle cx={w * 0.82} cy={h * 0.76} r={w * 0.14} fill={baseGround} />
            <Circle cx={w * 0.32} cy={h * 0.82} r={3} fill="#FFE066" />
            <Circle cx={w * 0.42} cy={h * 0.84} r={3} fill="#FFB4D6" />
            <Circle cx={w * 0.52} cy={h * 0.83} r={2.5} fill="#FFE066" />
            <Circle cx={w * 0.65} cy={h * 0.85} r={3} fill="#FFB4D6" />
            <Circle cx={w * 0.74} cy={h * 0.82} r={2.5} fill="#FFE066" />
          </>
        )}

        {env === 'Beach' && (
          <>
            <Rect x="0" y={h * 0.68} width={w} height={h * 0.32} fill={baseGround} />
            <Path
              d={`M ${w * 0.1} ${h * 0.72} Q ${w * 0.24} ${h * 0.71} ${w * 0.38} ${h * 0.73} Q ${w * 0.54} ${h * 0.75} ${w * 0.7} ${h * 0.72} Q ${w * 0.82} ${h * 0.71} ${w * 0.95} ${h * 0.73}`}
              stroke="rgba(255,255,255,0.26)"
              strokeWidth="2.5"
              fill="none"
            />
            <Path
              d={`M ${w * 0.6} ${h * 0.72} Q ${w * 0.72} ${h * 0.68} ${w * 0.84} ${h * 0.72} Z`}
              fill="rgba(255,255,255,0.25)"
            />
            <Path
              d={`M ${w * 0.48} ${h * 0.71} L ${w * 0.54} ${h * 0.71} M ${w * 0.45} ${h * 0.73} L ${w * 0.57} ${h * 0.73} M ${w * 0.42} ${h * 0.75} L ${w * 0.6} ${h * 0.75}`}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2"
            />
            <Path
              d={`M 0 ${h * 0.78} Q ${w * 0.5} ${h * 0.74} ${w} ${h * 0.8} L ${w} ${h} L 0 ${h} Z`}
              fill="rgba(255, 255, 255, 0.18)"
            />
          </>
        )}

        {env === 'City' && (
          <>
            <Path
              d={`M 0 ${h} L 0 ${h * 0.55} L ${w * 0.12} ${h * 0.55} L ${w * 0.12} ${h * 0.48} L ${w * 0.22} ${h * 0.48} L ${w * 0.22} ${h * 0.6} L ${w * 0.38} ${h * 0.6} L ${w * 0.38} ${h * 0.42} L ${w * 0.5} ${h * 0.42} L ${w * 0.5} ${h * 0.56} L ${w * 0.66} ${h * 0.56} L ${w * 0.66} ${h * 0.46} L ${w * 0.82} ${h * 0.46} L ${w * 0.82} ${h * 0.54} L ${w} ${h * 0.54} L ${w} ${h} Z`}
              fill={skyHorizonColor || baseGround}
              opacity={0.45}
            />
            <Path
              d={`M 0 ${h} L 0 ${h * 0.64} L ${w * 0.16} ${h * 0.64} L ${w * 0.16} ${h * 0.54} L ${w * 0.3} ${h * 0.54} L ${w * 0.3} ${h * 0.7} L ${w * 0.44} ${h * 0.7} L ${w * 0.44} ${h * 0.48} L ${w * 0.6} ${h * 0.48} L ${w * 0.6} ${h * 0.65} L ${w * 0.76} ${h * 0.65} L ${w * 0.76} ${h * 0.55} L ${w * 0.9} ${h * 0.55} L ${w * 0.9} ${h * 0.6} L ${w} ${h * 0.6} L ${w} ${h} Z`}
              fill={baseGround}
            />
            <Rect x={w * 0.18} y={h * 0.58} width={4} height={4} fill="#FFD580" opacity={glowOpacity} />
            <Rect x={w * 0.24} y={h * 0.62} width={4} height={4} fill="#FFD580" opacity={glowOpacity} />
            <Rect x={w * 0.48} y={h * 0.52} width={5} height={5} fill="#FFD580" opacity={glowOpacity + 0.2} />
            <Rect x={w * 0.54} y={h * 0.56} width={5} height={5} fill="#FFD580" opacity={glowOpacity} />
            <Rect x={w * 0.78} y={h * 0.59} width={4} height={4} fill="#FFD580" opacity={glowOpacity} />
            <Rect x={w * 0.84} y={h * 0.64} width={4} height={4} fill="#FFD580" opacity={glowOpacity} />
          </>
        )}

        {env === 'Mountains' && (
          <>
            <Path
              d={`M 0 ${h} L 0 ${h * 0.62} L ${w * 0.28} ${h * 0.44} L ${w * 0.55} ${h * 0.66} L ${w * 0.82} ${h * 0.38} L ${w} ${h * 0.58} L ${w} ${h} Z`}
              fill={baseGround}
            />
            <Path
              d={`M ${w * 0.23} ${h * 0.47} L ${w * 0.28} ${h * 0.44} L ${w * 0.33} ${h * 0.47} Z`}
              fill="#FFFFFF"
              opacity={0.9}
            />
            <Path
              d={`M ${w * 0.77} ${h * 0.41} L ${w * 0.82} ${h * 0.38} L ${w * 0.87} ${h * 0.41} Z`}
              fill="#FFFFFF"
              opacity={0.9}
            />
            <Path
              d={`M 0 ${h} L 0 ${h * 0.72} Q ${w * 0.4} ${h * 0.65} ${w} ${h * 0.75} L ${w} ${h} Z`}
              fill="rgba(0,0,0,0.25)"
            />
          </>
        )}

        {env === 'Space' && (
          <>
            <Circle cx={w * 0.25} cy={h * 0.42} r={w * 0.08} fill="rgba(255,255,255,0.25)" />
            <Path
              d={`M ${w * 0.12} ${h * 0.42} Q ${w * 0.25} ${h * 0.36} ${w * 0.38} ${h * 0.42}`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="3"
              fill="none"
            />
            <Path
              d={`M -20 ${h} Q ${w * 0.5} ${h * 0.75} ${w + 20} ${h} Z`}
              fill={baseGround}
            />
            <Circle cx={w * 0.35} cy={h * 0.88} r={w * 0.07} fill="rgba(0,0,0,0.3)" />
            <Circle cx={w * 0.72} cy={h * 0.85} r={w * 0.04} fill="rgba(0,0,0,0.25)" />
          </>
        )}
      </Svg>
    </View>
  );
}