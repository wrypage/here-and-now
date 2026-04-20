# HERE & NOW — Design Review Checklist
Version 1.1 — April 2026

This document is used to review builds of HERE & NOW during design and development.

Its purpose is not to define architecture. Its purpose is to help the team judge whether
the app feels right.

The central question is:

Does this still feel like a live atmospheric channel, or has it drifted into being an
ordinary weather app?

...

## 1. Atmosphere

- Does the sky feel believable for the current weather and time of day?
- Does the scene feel atmospheric rather than decorative?
- Are the clouds convincing in density, scale, and placement?
- Does fog or haze feel natural?
- Does precipitation feel integrated into the scene rather than pasted on top?
- If radar is present, does the atmosphere still remain the star?

Notes:

...

## 2. Motion

- Does the screen feel alive?
- Is there too much movement?
- Is there too little movement?
- Do cloud drift, precipitation, and transitions feel smooth?
- Does the motion feel cinematic rather than gimmicky?
- Are any animations distracting?
- Does the scene feel calm when it should feel calm?
- Does active weather feel active enough?

Notes:

...

## 3. Broadcast Identity

- Does the screen feel like a channel rather than an app dashboard?
- Is the HUD restrained enough?
- Does the typography hierarchy feel correct?
- Does the HERE & NOW wordmark feel like channel identity?
- Is the temperature display strong without overpowering the scene?
- Do technical readouts feel useful and credible?
- Does the LIVE bug help the experience or distract from it?
- Are there any UI elements that feel too app-like or too generic?

Notes:

...

## 4. Emotional Tone by Time of Day

### Morning
- Does morning feel elevated, open, and quietly energetic?
- Does it feel like the day is beginning?

### Afternoon
- Does afternoon feel grounded, physical, and immediate?
- Does it feel like the user is in the weather rather than above it?

### Evening
- Does evening feel urban, dramatic, and settled?
- Do the city lights feel impressionistic rather than literal?
- Does it feel more intimate than daytime?

### Overnight
- Does overnight feel still, sparse, and planetary?
- Does it remain recognizably weather-related and not drift into a generic space screensaver?
- Does it feel like the broadcast has entered a distinct overnight mode?

Notes:

...

## 5. Weather Authority

- When live weather is active, does it take precedence over the default mood in the right way?
- Do storms feel meaningfully different from ordinary rain?
- Does fog flatten and soften the scene appropriately?
- Does snow change the emotional tone as well as the visual one?
- Does the app respond clearly enough to changing conditions?

Notes:

...

## 6. Restraint

- Is the screen too busy?
- Is the radar too strong?
- Is the HUD too loud?
- Are the colors too saturated?
- Are the city lights too bright?
- Is the scene trying too hard?
- Does the product feel premium and controlled?

Notes:

...

## 7. Final Judgment

- Does this build feel like HERE & NOW?
- What is working best?
- What feels off?
- What should be tuned next?
- If only three changes could be made before the next build, what should they be?

Notes:

...

## Token adjustment reference

When something needs to change, translate the reaction into a specific token adjustment.

| Reaction | Token to adjust |
|----------|----------------|
| Sky too bright | palette.top color stop |
| Sky too dark | palette.mid lightness |
| Horizon too warm | palette.bottom color |
| Clouds too many | cloudDensity threshold |
| Clouds too fast | cloudMotionSpeed |
| Rain too heavy | precipIntensity multiplier |
| Rain too subtle | precipIntensity floor |
| Radar too prominent | radarOpacity |
| Radar too faint | radarOpacity |
| HUD too cluttered | HUD element visibility thresholds |
| Temperature too large | displayXXL token size |
| City lights too bright | cityLightOpacity |
| City lights too literal | cityLightDensity |
| Overnight too busy | orbital HUD element count |
| Tint too dark | tintOpacity |
| Tint too light | tintOpacity |
| Transition too fast | altitudeTransitionDuration |
| Transition too slow | altitudeTransitionDuration |
| LIVE bug too fast | liveBugPulseInterval |
| Motion too flashy | animation easing curves |
| Motion too static | animation trigger thresholds |
| Scene tries too hard | reduce intensity multiplier, slow motion |
| Looks like Apple Weather | check palette saturation and HUD density |
