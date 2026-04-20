# HERE & NOW — Storyboards
Version 1.0 — April 2026

These storyboards define the visual and emotional target for the Phase 1 prototype. They sit alongside the design doc and tech spec.

Their job is to answer one question:

What should the screen feel like at different times of day, under different atmospheric conditions?

These are not final visual designs. They are cinematic direction for the build.

The reference mood is Rochester, New York, but the visuals should not depend on a literal Rochester skyline or exact local landmarks. The goal is atmospheric identity, not city-specific illustration.

Live weather always has authority. Time-of-day sets the base scene, but actual conditions can override mood, color, visibility, cloud density, precipitation, and radar prominence.

Typography references in these storyboards follow the updated system:
- BC Barell = channel identity
- Address Sans Pro = display / temperature / labels
- DM Sans Light = narrative copy
- DM Mono = technical readouts / timestamps / live indicators

...

## MORNING — 5am to Noon
**Altitude:** 2,000 feet

The app opens to a sky view from altitude. The user is looking slightly downward through a cloud layer, with the city below visible but soft.

In early morning, roughly 5am–7am, the gradient runs from deep indigo at the top into a warm amber band near the horizon. The city reads as a dark silhouette against the glow. Clouds are present but broken, drifting slowly from left to right. The sun has not fully cleared the horizon.

By 9am the gradient has shifted to a clearer, brighter blue. The scene feels more open and optimistic. Cloud wisps drift. The atmosphere is lighter, warmer, and less dramatic.

If conditions are overcast or lake-effect weather is active, cloud density increases, the palette cools toward gray-white, and rain or snow enters the atmosphere layer.

**Camera language**
- Height: elevated, looking slightly downward
- Horizon placement: low
- Motion speed: slow
- Radar visibility: minimal unless precipitation is active
- HUD density: light

**HUD**
- HERE & NOW in BC Barell, small, white, top left
- LIVE bug in DM Mono, red, pulsing, top right
- Temperature in Address Sans Pro, large, lower third
- Data strip in DM Mono at bottom: wind, humidity, pressure, update time

**Mood**
A news anchor who got up early and is fully awake. Composed. The day is beginning.

...

## AFTERNOON — Noon to 6pm
**Altitude:** Ground level

The perspective drops to earth. The user is now standing in it, not above it. A treeline or low horizon occupies the lower portion of the frame. The sky fills the upper two-thirds.

In clear afternoon conditions, the sky is saturated blue, high and bright. The gradient is shallower than morning: less drama, more clarity. Clouds, if present, are distinct and sunlit. The scene feels immediate and physical.

In overcast conditions, the palette flattens. A gray-white cloud deck presses down toward the treeline. The atmosphere feels compressed. Rain, if present, streaks diagonally, with wind direction implied by angle and speed.

In late afternoon, especially 4pm–6pm, the scene begins to anticipate evening. The top of the sky pulls toward deeper blue while the horizon warms.

**Camera language**
- Height: human ground level
- Horizon placement: lower third
- Motion speed: moderate
- Radar visibility: low to medium, rising during active weather
- HUD density: moderate

**HUD**
- Channel identity remains restrained
- Temperature feels more immediate and personal at ground level
- Wind and precipitation feel more important because the user would physically feel them here

**Mood**
Clark is somewhere in this. Ground level is his domain. If weather is happening, he is in it.

...

## EVENING — 6pm to Midnight
**Altitude:** Ground level, city lights

The treeline or city edge is now backlit. The sky deepens from navy into near-black from the top down. The horizon holds the last warmth: amber, rose, or a thin line of fading color.

Below the horizon is city light. Not a literal map. Not a detailed skyline. An impressionistic field of warm light points: amber, orange-white, occasional neon. The city feels present without being diagrammed.

As the evening advances, the warmth recedes and the city lights become the dominant source of light. If skies are clear, stars may be faintly visible. The tint layer deepens. The whole scene becomes more intimate and cinematic.

If storms are present, this is the most dramatic slot. Lightning flashes in the atmosphere layer. Radar cells become more legible. Contrast increases. The scene leans noir.

**Camera language**
- Height: ground level
- Horizon placement: low to mid-low
- Motion speed: slow to moderate
- Radar visibility: medium in active weather
- HUD density: moderate, slightly quieter than afternoon

**HUD**
- HERE & NOW remains restrained
- Temperature still visible, but the night setting changes its emotional feel
- LIVE bug may pulse more slowly to suggest a later broadcast cadence
- Technical strip remains present but unobtrusive

**Mood**
Lois at the late desk. The city behind her. She has been here all day and is not going anywhere.

...

## OVERNIGHT — Midnight to 5am
**Altitude:** Orbital

The perspective lifts out of the atmosphere entirely. The Earth’s curve is visible at the bottom of the frame as a thin arc. Above it is space: dark, still, and vast.

This is the quietest mode in the app. No talent. No chatter. The channel identity remains, but barely. The screen is mostly the planet.

If cloud systems are visible from orbit, they move slowly over the surface below. If skies are clear, city light clusters glow faintly along the land arc. The atmosphere is still alive, but at a planetary scale.

In clear conditions the view is sparse and contemplative. In active weather the user should still be able to feel that this is a weather product, not a generic space screensaver. Weather presence can come through cloud bands, storm formations, and restrained technical data.

Approaching 5am, a thin amber line begins to appear along the curve of the Earth. The broadcast is preparing to descend back into morning.

**Camera language**
- Height: orbital
- Horizon placement: very low
- Motion speed: very slow
- Radar visibility: none or minimal, depending on build choice
- HUD density: minimal

**HUD**
- HERE & NOW in BC Barell, very small, top left
- A low-opacity technical strip in DM Mono at the very bottom
- Temperature, pressure, and current time only
- No large display elements

**Mood**
Elias, off-camera, watching the planet breathe. This is what he sees when nobody is looking.

...

## Global rules

### 1. Time-of-day sets the base scene
Each time block defines the default camera position, palette direction, motion tempo, and emotional tone.

### 2. Weather can override the base scene
If live conditions are severe, unusual, or visually dominant, the weather takes precedence over the default mood.

Examples:
- A bright afternoon can darken under heavy storms
- A clear morning can become low-contrast and gray under fog
- Evening can become high-drama if lightning is present
- Overnight can show strong cloud systems if they are meteorologically important

### 3. Radar supports the scene, not the other way around
Radar is proof that the atmosphere is live. It should not dominate the screen so heavily that the product turns into a map app.

### 4. The screen stays immersive
No card UI. No tab bar. No dashboard widget layout. Inputs and controls should feel secondary to the broadcast image.

### 5. The mood should feel programmed
The app should feel like it has a daily broadcast rhythm, not just one static weather template with different colors.

...

## Relationship to the build

These storyboards are the visual target.

- The design doc defines the product identity
- The tech spec defines the architecture
- This storyboard file defines the target feeling on screen

All three should be used together when building the Phase 1 prototype.