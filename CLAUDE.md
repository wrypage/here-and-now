# HERE AND NOW — Project Context

## Working style
Proceed autonomously through the full task without stopping to ask for confirmation
on individual file creation, edits, or terminal commands. Complete the full milestone,
then stop and report what was built. Only pause if you encounter an ambiguity that
genuinely requires a decision before proceeding.

## What this is
A full-screen AI-native weather broadcast app. Not a weather app. A channel.
The phone screen is a window into the atmosphere above the user's location.
The broadcast never stops. There is always something on.

sceneMapping.ts is the interpreter. It converts raw weather data into visual instructions.
AtmosphereCanvas is the painter. It draws what sceneMapping tells it to draw.
RadarOverlay is the proof. It confirms the atmosphere is live, not simulated.
BroadcastHUD is what makes it feel like a channel, not a screensaver.

## Font stack

Custom fonts (loaded via expo-font from assets/fonts/):
- BCBarellTEST-Regular.otf     — primary display, HERE & NOW wordmark, channel identity
- BCBarellTEST-1973.otf        — alternate display variant
- BCBarellTEST-CondensedThin.otf — narrow display variant
- BCBarellTEST-ExtendedBlack.otf — heavy display variant
- BCBarellTEST-Inline.otf      — decorative display variant
- address-sans-pro.otf         — temperature, city label, location labels only

Google Fonts (installed via @expo-google-fonts/dm-sans and @expo-google-fonts/dm-mono):
- DM Sans Light (weight 300)   — condition line, short narrative copy
- DM Mono                      — data strip, timestamps, live indicators, technical readouts

Typography roles — use exactly as specified:
- BC Barell        = channel identity and primary display only
- Address Sans Pro = temperature, city label, location labels
- DM Sans Light    = condition line and narrative copy
- DM Mono          = all technical readouts, data, timestamps

Do not use BC Barell or Address Sans Pro for the condition line.
The condition line is always DM Sans Light.

## Brand colors
- nearBlack: #08090b
- fireRed:   #cf1f1f
- amber:     #e8a020
- white:     #ffffff

## Core architecture rule
Every external data provider must be normalized into internal app types before reaching
any UI component. Never expose raw API responses to components. Weather services give
raw data. sceneMapping converts it. Components only ever see SceneState.

## Phase 1 scope
Location → weather fetch → atmospheric scene → radar overlay → broadcast HUD.
No AI presenters, no voice, no premium tier, no push alerts yet.
One gesture only: swipe up to reveal detail, swipe down to hide.

## Project documents
All four files live in the project root. Read all of them before starting any build task.

- CLAUDE.md (this file) — project identity, font stack, core rules
- tech-spec-v0.3.md     — full architecture, types, worked examples, milestones
- storyboards.md        — visual and emotional target for each time-of-day slot
- design-review.md      — checklist for evaluating builds (for human review, not build tasks)

The tech spec is the primary build reference.
The storyboards define what correct visual output feels like.
When in doubt about how something should look, consult storyboards.md.
