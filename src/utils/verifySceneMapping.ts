/**
 * verifySceneMapping — DEV-only sanity check.
 * Runs the four worked examples from tech-spec-v0.3.md §12 and logs
 * each output alongside the spec's expected values.
 * Called once on bootstrap in __DEV__ builds only.
 */

import { mapWeatherToScene } from './sceneMapping';
import {
  mockClearMorning,
  mockRainyAfternoon,
  mockClearNight,
  mockEveningStorm,
} from '../fixtures/mockWeather';

type Check = {
  label: string;
  got: string | number;
  expected: string | number;
  exact?: boolean; // false = approximate (log within ±0.15)
};

function check(label: string, got: string | number, expected: string | number, exact = true): Check {
  return { label, got, expected, exact };
}

function report(exLabel: string, checks: Check[]): void {
  const lines: string[] = [`[VERIFY] ${exLabel}`];
  let allPass = true;
  for (const c of checks) {
    let pass: boolean;
    if (c.exact) {
      pass = c.got === c.expected;
    } else {
      pass = Math.abs(Number(c.got) - Number(c.expected)) <= 0.15;
    }
    if (!pass) allPass = false;
    const sym = pass ? '✓' : '✗';
    lines.push(`  ${sym}  ${c.label}: ${String(c.got)}  (expected ${String(c.expected)})`);
  }
  console.log(lines.join('\n'));
  if (!allPass) {
    console.warn(`[VERIFY] ${exLabel} — some values outside expected range`);
  }
}

export function verifySceneMapping(): void {
  // ── Example 1: Clear morning ──────────────────────────────────────────────
  const ex1 = mapWeatherToScene(
    mockClearMorning.current,
    mockClearMorning.daily[0],
    new Date('2026-04-19T08:15:00'),
  );
  report('Ex1 clear morning', [
    check('altitudeMode',    ex1.altitudeMode,            'sky'),
    check('lightMode',       ex1.lightMode,               'day'),
    check('skyMode',         ex1.skyMode,                 'clear'),
    check('cloudDensity',    ex1.cloudDensity.toFixed(2), '0.12', false),
    check('precipType',      ex1.precipType,              'none'),
    check('precipIntensity', ex1.precipIntensity.toFixed(2), '0.00', false),
    check('fogOpacity',      ex1.fogOpacity.toFixed(2),   '0.00', false),
    check('intensity',       ex1.intensity.toFixed(2),    '0.10', false),
  ]);

  // ── Example 2: Overcast rainy afternoon ──────────────────────────────────
  const ex2 = mapWeatherToScene(
    mockRainyAfternoon.current,
    mockRainyAfternoon.daily[0],
    new Date('2026-04-19T15:20:00'),
  );
  report('Ex2 overcast rainy afternoon', [
    check('altitudeMode',    ex2.altitudeMode,            'ground-day'),
    check('lightMode',       ex2.lightMode,               'day'),
    check('skyMode',         ex2.skyMode,                 'rain'),
    check('cloudDensity',    ex2.cloudDensity.toFixed(2), '0.95', false),
    check('precipType',      ex2.precipType,              'rain'),
    check('precipIntensity', ex2.precipIntensity.toFixed(2), '0.50', false),
    check('fogOpacity',      ex2.fogOpacity.toFixed(2),   '0.20', false),
    check('intensity',       ex2.intensity.toFixed(2),    '0.65', false),
  ]);

  // ── Example 3: Clear night ────────────────────────────────────────────────
  const ex3 = mapWeatherToScene(
    mockClearNight.current,
    mockClearNight.daily[0],
    new Date('2026-04-20T01:10:00'),
  );
  report('Ex3 clear night after midnight', [
    check('altitudeMode',    ex3.altitudeMode,            'orbital'),
    check('lightMode',       ex3.lightMode,               'deep-night'),
    check('skyMode',         ex3.skyMode,                 'clear'),
    check('cloudDensity',    ex3.cloudDensity.toFixed(2), '0.05', false),
    check('precipType',      ex3.precipType,              'none'),
    check('precipIntensity', ex3.precipIntensity.toFixed(2), '0.00', false),
    check('fogOpacity',      ex3.fogOpacity.toFixed(2),   '0.00', false),
    check('intensity',       ex3.intensity.toFixed(2),    '0.05', false),
  ]);

  // ── Example 4: Evening storm ──────────────────────────────────────────────
  const ex4 = mapWeatherToScene(
    mockEveningStorm.current,
    mockEveningStorm.daily[0],
    new Date('2026-04-19T21:45:00'),
  );
  report('Ex4 evening storm', [
    check('altitudeMode',    ex4.altitudeMode,            'ground-night'),
    check('lightMode',       ex4.lightMode,               'night'),
    check('skyMode',         ex4.skyMode,                 'storm'),
    check('cloudDensity',    ex4.cloudDensity.toFixed(2), '1.00', false),
    check('precipType',      ex4.precipType,              'rain'),
    check('precipIntensity', ex4.precipIntensity.toFixed(2), '0.90', false),
    check('lightningChance', ex4.lightningChance.toFixed(2), '0.85', false),
    check('fogOpacity',      ex4.fogOpacity.toFixed(2),   '0.10', false),
    check('intensity',       ex4.intensity.toFixed(2),    '0.95', false),
  ]);
}
