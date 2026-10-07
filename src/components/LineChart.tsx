import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import type { PricePoint } from '@/data/types';
import { directionColor, directionOf, useTheme } from '@/theme';

/**
 * Deliberately simple: one line, colored by direction over the range, with a
 * dotted reference at the starting value. No axes, no candles (blueprint §6).
 */
export function LineChart({ points, height = 180 }: { points: PricePoint[]; height?: number }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const geo = useMemo(() => {
    if (points.length < 2 || width === 0) return null;
    const vs = points.map((p) => p.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const pad = (max - min) * 0.08 || 1;
    const lo = min - pad;
    const hi = max + pad;
    const x = (i: number) => (i / (points.length - 1)) * width;
    const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area, baseY: y(points[0].v), change: points[points.length - 1].v - points[0].v };
  }, [points, width, height]);

  const color = geo ? directionColor(theme, directionOf(geo.change)) : theme.colors.flat;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, width: '100%' }}
      accessibilityRole="image"
      accessibilityLabel={geo ? `Price chart, ${geo.change >= 0 ? 'up' : 'down'} over this range` : 'Price chart'}
    >
      {geo ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.18} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Line
            x1={0}
            x2={width}
            y1={geo.baseY}
            y2={geo.baseY}
            stroke={theme.colors.textTertiary}
            strokeWidth={1}
            strokeDasharray="2,4"
          />
          <Path d={geo.area} fill="url(#fill)" />
          <Path
            d={geo.line}
            stroke={color}
            strokeWidth={2.25}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
