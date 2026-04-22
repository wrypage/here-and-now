# HERE & NOW — Principles
Version 1.0 — April 2026
Last updated: 2026-04-22

These are the non-negotiable philosophical commitments of this project.
If a decision feels right technically but wrong here, trust this document.

---

## What this project is trying to be

A live atmospheric channel on the phone. Not a weather app. Not a map with data
pasted on top. A window into the sky above the user's location — where weather data
drives mood, motion, and visual behavior rather than appearing as lists and numbers.

The screen should feel like the broadcast equivalent of stepping outside and looking up.
Immediate. Real. Alive. The atmosphere is the product. Everything else serves it.

---

## Core principles

### 1. Atmosphere first, geography second, data third, interface last

This is the visual hierarchy and it is non-negotiable. Every design decision gets
evaluated in this order. If a map element, data readout, or UI component competes
with the atmospheric feel, the atmosphere wins.

The failure mode: the screen starts looking like a map app with weather pasted on top.
The moment it drifts there, everything has to be reconsidered.

### 2. The screen must always feel alive

Static is failure. The sky moves. Clouds drift. Rain falls. Stars turn.
Even in clear, calm conditions, something must be in motion — slow, atmospheric motion,
not flashy animation. The broadcast never stops.

Motion should feel cinematic, not gimmicky. Slow is almost always right for this product.

### 3. Radar supports the scene — it does not replace it

Radar is proof that the weather is real, not the dominant aesthetic layer.
If the radar becomes the whole screen, the product has failed.
Radar opacity, size, and prominence should always be evaluated against one question:
is the atmosphere still the star?

### 4. Real data over simulation

The overnight star field uses real astronomical data — actual star positions for the
user's location and time. The satellite layer uses real GOES-East imagery. The radar
uses live RainViewer data. This specificity is what separates HERE & NOW from a
screensaver. Never replace real data with a simulation when real data is available.

### 5. Clear skies must always read as blue

Warmth only appears at the horizon during dawn and dusk transitions.
It is never the dominant screen color. This rule exists because the failure mode
(muddy amber-brown at dusk/clear) looked like an overcast stormy evening —
the opposite of what the scene should communicate.
Reference: Google Earth aerial of Rochester, pale ice blue (~#c8dff0).

### 6. The mood should feel programmed, not random

The app has a daily broadcast rhythm — morning, afternoon, evening, overnight.
Each daypart has its own altitude, emotional tone, and pacing.
Weather overrides mood when conditions are dominant, but the rhythm persists.
It should feel like a channel with a schedule, not a single template with color swaps.

### 7. Premium restraint over feature density

The screen should feel expensive before premium features exist.
This means: no card UI, no tab bar, no dashboard widgets, restrained HUD,
quiet typography hierarchy, slow motion, controlled palette.
When in doubt, remove rather than add.

---

## Cross-project principles

### Observation before interpretation

The weather data is the truth. sceneMapping.ts converts it — faithfully.
A scene that lies about the weather (sunny palette on a stormy day) breaks trust.
The system observes conditions first, then interprets them visually.

### No invented facts

Real tile URLs. Real API data. Real star positions. Real satellite imagery.
When a data source fails, the fallback must be honest — a gradient palette, not
a fake satellite image. Label fallbacks as fallbacks.

### Pipelines must tell the truth about themselves

Silent failures are the most dangerous failures. If GeoColor tiles fail to load,
the screen should not quietly show nothing — it should fall back visibly and log clearly.
The console prefixes ([satellite], [HERE & NOW], [VERIFY]) exist for this reason.

### Document the failure, not just the fix

MapView was abandoned. The Astrospheric API is dead. The Milky Way band was removed.
The cityscape SVG was rejected. These are not embarrassments — they are the most
valuable entries in decisions.md. Future sessions depend on them.

### Slow is almost always right

For motion, for tuning, for decision-making. The instinct to add more, move faster,
brighten more is almost always wrong for this product. Restraint is the aesthetic.

---

## Principles in tension

| Principle A | Principle B | How to navigate |
|------------|------------|----------------|
| Real data | Reliability | Real data with honest fallback — never fake data |
| Atmosphere first | Weather authority | Weather overrides mood but never kills the atmosphere |
| Restraint | Aliveness | Motion must be present but slow — the minimum that reads as alive |
| Phase 1 focus | Phase 2 temptation | No AI characters until Phase 1 acceptance criteria are met |
