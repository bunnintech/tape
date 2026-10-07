import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { stickerLabel } from '@/data/stickers';
import type { StickerId } from '@/data/types';
import { illustration } from '@/theme';

/**
 * Original Tape stickers, drawn as vector art on a 120×120 canvas.
 *
 * Each sticker is a `base` (silhouette shapes) plus `detail`. The base is drawn three times: a soft shadow, a thick
 * white die-cut outline, then the art itself, which gives the peeled-sticker look in both themes.
 */

type Ink = { [K in keyof typeof illustration]: string } & { w: number };
type Art = { tilt: number; base: (p: Ink) => ReactNode; detail: (p: Ink) => ReactNode };

const solid = (color: string, w: number): Ink =>
  Object.fromEntries([...Object.keys(illustration).map((k) => [k, color]), ['w', w]]) as Ink;

// Web falls back to a serif for SVG text; native uses the system font when no family is given.
const FONT = Platform.select({ web: 'system-ui, -apple-system, Helvetica, Arial, sans-serif', default: undefined });

const NORMAL: Ink = { ...illustration, w: 2.5 };
const CUT = solid(illustration.cut, 12);
const SHADOW = solid(illustration.cutShadow, 12);

function Caption({ p, text, size = 14 }: { p: Ink; text: string; size?: number }) {
  return (
    <SvgText
      x={60}
      y={103.5}
      fontSize={size}
      fontWeight="900"
      fontFamily={FONT}
      textAnchor="middle"
      fill={p.white}
      letterSpacing={0.5}
    >
      {text}
    </SvgText>
  );
}

const banner = (p: Ink) => (
  <Rect x={8} y={87} width={104} height={24} rx={8} fill={p.ink} stroke={p.ink} strokeWidth={p.w} />
);

const ART: Record<StickerId, Art> = {
  'bull-lets-go': {
    tilt: -6,
    base: (p) => (
      <>
        <Path d="M38 34 C20 32 12 16 18 6 C22 18 30 24 44 26 Z" fill={p.horn} stroke={p.ink} strokeWidth={p.w} />
        <Path d="M82 34 C100 32 108 16 102 6 C98 18 90 24 76 26 Z" fill={p.horn} stroke={p.ink} strokeWidth={p.w} />
        <Path d="M36 38 L14 42 L32 52 Z" fill={p.bullDark} stroke={p.ink} strokeWidth={p.w} />
        <Path d="M84 38 L106 42 L88 52 Z" fill={p.bullDark} stroke={p.ink} strokeWidth={p.w} />
        <Ellipse cx={60} cy={50} rx={28} ry={27} fill={p.bull} stroke={p.ink} strokeWidth={p.w} />
        <Ellipse cx={60} cy={68} rx={21} ry={13} fill={p.snout} stroke={p.ink} strokeWidth={p.w} />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <Ellipse cx={52} cy={68} rx={3} ry={4.5} fill={p.ink} />
        <Ellipse cx={68} cy={68} rx={3} ry={4.5} fill={p.ink} />
        <Circle cx={48} cy={47} r={5.5} fill={p.white} />
        <Circle cx={72} cy={47} r={5.5} fill={p.white} />
        <Circle cx={49.5} cy={48} r={2.8} fill={p.ink} />
        <Circle cx={70.5} cy={48} r={2.8} fill={p.ink} />
        <Path d="M40 37 L55 43 M80 37 L65 43" stroke={p.ink} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={30} cy={74} r={4} fill={p.hull} />
        <Circle cx={23} cy={79} r={3} fill={p.hull} />
        <Circle cx={90} cy={74} r={4} fill={p.hull} />
        <Circle cx={97} cy={79} r={3} fill={p.hull} />
        <Caption p={p} text="LET’S GO" />
      </>
    ),
  },
  'bear-pain': {
    tilt: 4,
    base: (p) => (
      <>
        <Circle cx={36} cy={28} r={11} fill={p.bear} stroke={p.ink} strokeWidth={p.w} />
        <Circle cx={84} cy={28} r={11} fill={p.bear} stroke={p.ink} strokeWidth={p.w} />
        <Ellipse cx={60} cy={52} rx={29} ry={27} fill={p.bear} stroke={p.ink} strokeWidth={p.w} />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <Circle cx={36} cy={28} r={5} fill={p.bearLight} />
        <Circle cx={84} cy={28} r={5} fill={p.bearLight} />
        <Ellipse cx={60} cy={63} rx={14} ry={10.5} fill={p.bearLight} />
        <Ellipse cx={60} cy={58} rx={5.5} ry={3.8} fill={p.ink} />
        <Path d="M52 71 Q60 64 68 71" stroke={p.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path
          d="M42 46 Q48 41 54 46 M66 46 Q72 41 78 46"
          stroke={p.ink}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M45 48 Q39 64 44 82 Q51 64 50 48 Z" fill={p.tear} />
        <Path d="M75 48 Q81 64 76 82 Q69 64 70 48 Z" fill={p.tear} />
        <Caption p={p} text="PAIN" />
      </>
    ),
  },
  'to-the-moon': {
    tilt: -3,
    base: (p) => (
      <>
        <Path d="M98 6 A16 16 0 1 0 114 30 A13 13 0 1 1 98 6 Z" fill={p.moon} stroke={p.ink} strokeWidth={p.w} />
        <G transform="rotate(40 54 50)">
          <Path d="M44 64 Q54 92 64 64 Z" fill={p.flame} stroke={p.ink} strokeWidth={p.w} />
          <Path d="M44 54 L32 70 L44 66 Z" fill={p.violet} stroke={p.ink} strokeWidth={p.w} />
          <Path d="M64 54 L76 70 L64 66 Z" fill={p.violet} stroke={p.ink} strokeWidth={p.w} />
          <Path
            d="M54 10 C68 24 70 46 65 66 L43 66 C38 46 40 24 54 10 Z"
            fill={p.hull}
            stroke={p.ink}
            strokeWidth={p.w}
          />
        </G>
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <G transform="rotate(40 54 50)">
          <Path d="M48 66 Q54 80 60 66 Z" fill={p.flameCore} />
          <Circle cx={54} cy={36} r={7} fill={p.violet} stroke={p.ink} strokeWidth={2.5} />
          <Circle cx={52} cy={34} r={2} fill={p.white} />
        </G>
        <Circle cx={20} cy={18} r={2} fill={p.gold} />
        <Circle cx={30} cy={8} r={1.5} fill={p.gold} />
        <Circle cx={84} cy={60} r={2} fill={p.gold} />
        <Caption p={p} text="TO THE MOON" size={12.5} />
      </>
    ),
  },
  'diamond-hands': {
    tilt: 5,
    base: (p) => (
      <>
        <Polygon
          points="34,26 86,26 102,42 60,82 18,42"
          fill={p.diamond}
          stroke={p.ink}
          strokeWidth={p.w}
          strokeLinejoin="round"
        />
        <Path
          d="M104 6 L107 14 L115 17 L107 20 L104 28 L101 20 L93 17 L101 14 Z"
          fill={p.gold}
          stroke={p.ink}
          strokeWidth={p.w}
          strokeLinejoin="round"
        />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <Polygon points="34,26 60,26 46,42 18,42" fill={p.diamondLight} />
        <Polygon points="74,42 102,42 60,82" fill={p.diamondDeep} />
        <Path
          d="M18 42 L102 42 M34 26 L46 42 L60 82 L74 42 L86 26 M46 42 L60 26 L74 42"
          stroke={p.diamondDeep}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
        />
        <Path d="M16 8 L18 13 L23 15 L18 17 L16 22 L14 17 L9 15 L14 13 Z" fill={p.gold} />
        <Caption p={p} text="DIAMOND HANDS" size={10.5} />
      </>
    ),
  },
  'called-it': {
    tilt: -5,
    base: (p) => (
      <>
        <G transform="rotate(22 60 56)">
          <Rect x={54} y={6} width={12} height={10} rx={2} fill={p.gold} stroke={p.ink} strokeWidth={p.w} />
          <Rect x={55} y={14} width={10} height={20} fill={p.bottle} stroke={p.ink} strokeWidth={p.w} />
          <Rect x={46} y={32} width={28} height={50} rx={9} fill={p.bottle} stroke={p.ink} strokeWidth={p.w} />
        </G>
        <Rect x={22} y={4} width={12} height={9} rx={2.5} fill={p.cork} stroke={p.ink} strokeWidth={p.w} />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <G transform="rotate(22 60 56)">
          <Rect x={48} y={50} width={24} height={15} rx={2} fill={p.gold} />
          <Rect x={52} y={55} width={16} height={2.5} rx={1} fill={p.bottle} />
        </G>
        <Circle cx={38} cy={20} r={4} fill={p.popcorn} />
        <Circle cx={30} cy={26} r={3} fill={p.gold} />
        <Circle cx={44} cy={12} r={2.5} fill={p.gold} />
        <Circle cx={24} cy={36} r={2.5} fill={p.popcorn} />
        <Circle cx={36} cy={32} r={2} fill={p.popcorn} />
        <Caption p={p} text="CALLED IT" />
      </>
    ),
  },
  'priced-in': {
    tilt: -12,
    base: (p) => (
      <Rect x={8} y={30} width={104} height={60} rx={10} fill={p.paper} stroke={p.violet} strokeWidth={p.w + 2.5} />
    ),
    detail: (p) => (
      <>
        <Rect x={15} y={37} width={90} height={46} rx={6} fill="none" stroke={p.violet} strokeWidth={2} />
        <SvgText
          x={60}
          y={58}
          fontSize={19}
          fontWeight="900"
          fontFamily={FONT}
          textAnchor="middle"
          fill={p.violet}
          letterSpacing={1}
        >
          PRICED
        </SvgText>
        <SvgText
          x={60}
          y={77}
          fontSize={19}
          fontWeight="900"
          fontFamily={FONT}
          textAnchor="middle"
          fill={p.violet}
          letterSpacing={1}
        >
          IN
        </SvgText>
      </>
    ),
  },
  popcorn: {
    tilt: 3,
    base: (p) => (
      <>
        {[
          [40, 36, 9],
          [52, 30, 10],
          [65, 28, 10],
          [78, 34, 9],
          [86, 42, 7],
          [34, 44, 7],
          [58, 20, 8],
          [72, 20, 7],
        ].map(([cx, cy, r]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.popcorn} stroke={p.ink} strokeWidth={p.w} />
        ))}
        <Path
          d="M30 44 L90 44 L82 86 L38 86 Z"
          fill={p.white}
          stroke={p.ink}
          strokeWidth={p.w}
          strokeLinejoin="round"
        />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <Path d="M42 44 L47 86 L55 86 L53 44 Z M67 44 L65 86 L73 86 L78 44 Z" fill={p.violet} />
        <Circle cx={50} cy={60} r={6.5} fill={p.white} stroke={p.ink} strokeWidth={2} />
        <Circle cx={70} cy={60} r={6.5} fill={p.white} stroke={p.ink} strokeWidth={2} />
        <Circle cx={53} cy={59} r={3} fill={p.ink} />
        <Circle cx={73} cy={59} r={3} fill={p.ink} />
        <Caption p={p} text="WATCHING" />
      </>
    ),
  },
  'not-like-this': {
    tilt: -4,
    base: (p) => (
      <>
        <Circle cx={60} cy={46} r={32} fill={p.face} stroke={p.ink} strokeWidth={p.w} />
        <Ellipse cx={28} cy={62} rx={9} ry={14} fill={p.faceDark} stroke={p.ink} strokeWidth={p.w} />
        <Ellipse cx={92} cy={62} rx={9} ry={14} fill={p.faceDark} stroke={p.ink} strokeWidth={p.w} />
        <Path d="M96 8 Q88 20 96 25 Q104 20 96 8 Z" fill={p.tear} stroke={p.ink} strokeWidth={p.w} />
        {banner(p)}
      </>
    ),
    detail: (p) => (
      <>
        <Path
          d="M41 32 Q47 25 54 30 M66 30 Q73 25 79 32"
          stroke={p.ink}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
        <Ellipse cx={48} cy={42} rx={4.5} ry={6.5} fill={p.ink} />
        <Ellipse cx={72} cy={42} rx={4.5} ry={6.5} fill={p.ink} />
        <Ellipse cx={60} cy={62} rx={8} ry={10} fill={p.ink} />
        <Caption p={p} text="NOT LIKE THIS" size={11.5} />
      </>
    ),
  },
};

export function Sticker({ id, size = 96 }: { id: StickerId; size?: number }) {
  const art = ART[id];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`${stickerLabel(id)} sticker`}>
      <Svg width={size} height={size} viewBox="-8 -8 136 136">
        <G transform={`rotate(${art.tilt} 60 60)`}>
          <G transform="translate(0 3)">{art.base(SHADOW)}</G>
          {art.base(CUT)}
          {art.base(NORMAL)}
          {art.detail(NORMAL)}
        </G>
      </Svg>
    </View>
  );
}
