const LEVEL_TAUNTS = [
  "Won't get easier",
  "If this misses, stretch first",
  "Now it wanders",
  "Camouflage class begins",
  "Blink and miss",
  "This one laughs at precision",
  "You wanted hard mode",
  "Tiny target, giant ego",
  "Nerves are now required",
  "Legendary nonsense mode",
] as const;

const MIN_WINDOW_CYCLE_MS = 1_600;
const FAIR_MAX_CLOSED_GAP_MS = 900;
const FAIR_MIN_WINDOW_OPEN_MS = 420;
const FAIR_MAX_SLIDE_DISTANCE_PX = 96;
const FAIR_MIN_SLIDE_DURATION_MS = 620;
const FAIR_MIN_TELEPORT_INTERVAL_MS = 850;
const FAIR_MIN_PULSE_SCALE = 0.44;
const FAIR_MIN_PULSE_DURATION_MS = 760;

function normalizeLevel(level: number): number {
  return Math.max(1, Math.floor(level));
}

function roundToInt(value: number): number {
  return Math.max(1, Math.round(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Difficulty profile generated per level; computed instead of selected from a fixed list.
 */
export type LevelDifficulty = {
  title: string;
  slide: boolean;
  teleport: boolean;
  camouflage: boolean;
  pulse: boolean;
  slideDistancePx: number;
  slideDurationMs: number;
  teleportIntervalMs: number;
  windowOpenMs: number;
  windowCycleMs: number;
  pulseMinScale: number;
  pulseDurationMs: number;
};

function getLevelTitle(level: number): string {
  const normalized = normalizeLevel(level);
  const titleIndex = (normalized - 1) % LEVEL_TAUNTS.length;
  const cycle = Math.floor((normalized - 1) / LEVEL_TAUNTS.length) + 1;
  const baseTitle = LEVEL_TAUNTS[titleIndex] ?? LEVEL_TAUNTS[0];

  if (cycle === 1) {
    return baseTitle;
  }

  return `${baseTitle} (Tier ${cycle})`;
}

/**
 * Returns a profile that keeps scaling with level instead of capping at a final preset.
 */
export function getLevelDifficulty(level: number): LevelDifficulty {
  const normalizedLevel = normalizeLevel(level);
  const intensity = normalizedLevel - 1;
  const slide = intensity >= 1;
  const teleport = intensity >= 2;
  const camouflage = intensity >= 3;
  const pulse = intensity >= 1;
  const windowCycleMs = clamp(
    roundToInt(8_000 / (1 + intensity * 0.04)),
    MIN_WINDOW_CYCLE_MS,
    60_000,
  );
  const windowDutyCycle = intensity < 3 ? 1 : Math.max(0.18, 0.72 / Math.sqrt(intensity));
  const rawWindowOpenMs = roundToInt(windowCycleMs * windowDutyCycle);
  const minimumOpenForClosedGap = Math.max(1, windowCycleMs - FAIR_MAX_CLOSED_GAP_MS);
  const windowOpenMs =
    intensity < 3
      ? windowCycleMs
      : clamp(
          Math.max(rawWindowOpenMs, minimumOpenForClosedGap),
          FAIR_MIN_WINDOW_OPEN_MS,
          windowCycleMs,
        );

  return {
    title: getLevelTitle(normalizedLevel),
    slide,
    teleport,
    camouflage,
    pulse,
    slideDistancePx: slide
      ? clamp(Math.round(20 + intensity * 2.2), 20, FAIR_MAX_SLIDE_DISTANCE_PX)
      : 0,
    slideDurationMs: slide
      ? Math.max(FAIR_MIN_SLIDE_DURATION_MS, roundToInt(1_700 / (1 + intensity * 0.18)))
      : 0,
    teleportIntervalMs: teleport
      ? Math.max(
          FAIR_MIN_TELEPORT_INTERVAL_MS,
          roundToInt(5_000 / (1 + intensity * 0.24)),
        )
      : 0,
    windowOpenMs,
    windowCycleMs,
    pulseMinScale: pulse ? Math.max(FAIR_MIN_PULSE_SCALE, 1 / Math.pow(normalizedLevel, 0.32)) : 1,
    pulseDurationMs: pulse
      ? Math.max(FAIR_MIN_PULSE_DURATION_MS, roundToInt(1_800 / (1 + intensity * 0.14)))
      : 0,
  };
}
