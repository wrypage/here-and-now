# HERE & NOW — Session Playbook
Version 1.0 — April 2026
Last updated: 2026-04-22

---

## Orienting Claude at the start of a session

Paste these two URLs into Claude.ai at the start of any session:

https://raw.githubusercontent.com/wrypage/here-and-now/main/state-of-the-project.md
https://raw.githubusercontent.com/wrypage/here-and-now/main/decisions.md

Claude will fetch both and be fully oriented without you needing to upload anything.

---

## The rule

One session, one goal. Name it before touching anything.

---

## How sessions actually work

Most sessions follow a three-part pattern:

**Brain trust** (Claude.ai) → orientation, planning, decisions
**Claude Code** (terminal) → execution, building, debugging
**Brain trust again** → review, decisions.md update, next goal

The brain trust session is where the playbook starts.
Claude Code gets a brief, not the full docs.

---

## Start of session (brain trust)

1. Paste the orientation URLs above into Claude.ai
2. State the session goal — one sentence
3. Check decisions.md Active Unresolved Issues — anything blocking?
4. Write the session brief — 5-10 lines for Claude Code

**Session brief format:**
```
Session goal: [one sentence]

Read decisions.md before touching anything.
Do NOT touch: [list what's off-limits]
Success condition: [how will you know it's done?]

Context: [1-2 sentences of relevant state]
```

---

## Start of session (Claude Code)

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/here-and-now
git pull
claude
```

Note: ~/.claude/settings.json has skipDangerousModePermissionPrompt: true.
Just type claude — no --dangerously-skip-permissions flag needed.

Only run Expo on ONE machine at a time.

---

## During session

- Make one change at a time — evaluate before moving on
- Test on a real iPhone, not just simulator
- Log anything that fails or surprises you immediately
- Use design-review.md when evaluating visual output — not intuition alone
- If the goal shifts, stop and name the new goal explicitly

**The central question during any build session:**
Does this still feel like a live atmospheric channel, or has it drifted into being
an ordinary weather app?

---

## Signs the session is drifting

- Fixing something that wasn't the session goal
- The screen is getting busier instead of more restrained
- Rebuilding something that was already working
- You've lost track of what the original goal was

When you notice drift: stop, re-read decisions.md, decide to continue or close.

---

## End of session

1. Test on real iPhone — not just simulator
2. Come back to Claude.ai — tell Claude what happened
3. Claude helps write decisions.md entries
4. Update state-of-the-project.md — what changed, what was learned
5. Define the next session goal
6. Commit and push:
```bash
git add -A && git commit -m "session: [goal]" && git push
```

---

## Session types

**Build session** — adding new visual components or features
- Read decisions.md first — especially rejected approaches
- Test on device at each milestone
- Done when: it feels right on iPhone, not just when code compiles

**Debug session** — fixing something broken
- Name the failure mode before touching code
- Done when: root cause understood and documented in decisions.md

**Tuning session** — adjusting visual parameters
- Use design-review.md checklist
- Use tuning mode (long press wordmark)
- Done when: design-review.md passes for the target scenario

**Documentation session** — updating project docs
- Done when: docs reflect current reality
- Always commit docs separately from code changes

**Phase transition** — moving from one phase to the next
- Phase is done when acceptance criteria in tech-spec are met
- Review on real device before declaring phase complete
- Update state-of-the-project.md phase section

---

## Two-machine notes

- MacBook laptop — primary, confirmed working
- Mac Studio — secondary, had Expo connection issues
- Only run Expo on ONE machine at a time
- Run this once per machine to prevent iCloud/node_modules corruption:
```bash
xattr -w com.apple.fileprovider.ignore#P 1 node_modules
rm -rf node_modules && mkdir node_modules && xattr -w com.apple.fileprovider.ignore#P 1 node_modules && npm install
```

---

## The question that ends every session

> Does the screen feel more like a live atmospheric channel now than it did at the start?

If yes: succeeded, even if nothing shipped.
If no: figure out why before closing.
