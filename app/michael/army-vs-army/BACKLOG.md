# Army vs Army — Backlog

Game for Michael (7yo). Hidden + password-protected under `/michael`. Built 2026-05-17.

## Done in MVP (v2)
- Start screen matching drawing 1 (3 color bands, crossed swords, "Army vs Army")
- 2-player local mode + 1-player vs CPU (Easy / Medium / Hard)
- 3 plane types (Scout / Fighter / Bomber) loosely tracing drawing 2
- Plane HP + mutual damage combat
- Warship defensive cannons (auto-fire at incoming planes)
- Web Audio sound effects (launch, hit, explosion, cannon, coin, victory/defeat)
- Plane wobble, particle explosions, HP flash, coin pop
- Mobile/tablet landscape detection + rotate-device hint
- Mute toggle, in-game menu button
- Reference drawings copied to `public/michael/army-vs-army/`

---

## 🎨 Visual fidelity (highest gap)
- [ ] Hand-drawn aesthetic via SVG `feTurbulence` displacement filter — pencil/crayon look instead of clean vector
- [ ] Embed Michael's actual drawings in the game (loading splash, upgrade preview, game-over background)
- [ ] 4th plane type from drawing 2 — the gear/wheel-front plane
- [ ] Warships in stick-figure / hand-drawn style to match drawing 1

## ⚔️ Gameplay depth
- [ ] Separate shop items (Cannon +damage, Armor +planeHP, Engine +speed, Warship Shield) instead of one "Upgrade" button
- [ ] Mid-field power-ups — random coin/health drops to fly through
- [ ] Boss warship phase — second bigger ship appears after first sinks
- [ ] Combo/streak bonus — 3 plane kills in a row = bonus coins

## 📱 UX
- [ ] Hold-to-spam launch (press-and-hold continuously launches, cost-gated)
- [ ] Haptic feedback (`navigator.vibrate(20)`) on launch / hit / win
- [ ] Pause button mid-game (currently ☰ exits to menu)
- [ ] First-time tutorial overlay explaining 3 plane types + warship cannons

## ✨ Game feel
- [ ] Screen shake on warship hit
- [ ] Slow-motion brief pause on win/lose
- [ ] Volume slider instead of binary mute
- [ ] Background music (looping retro track)

## 📊 Stats / replay value
- [ ] localStorage win counter per difficulty
- [ ] Best time for fastest win
- [ ] Replay-last-game (record + playback)

## 🎮 Variety
- [ ] Multiple maps (desert / arctic / jungle / space)
- [ ] Custom plane unlocks after X wins
- [ ] Asymmetric matchups (fewer/stronger vs more/weaker)

## 🐛 To verify on real hardware
- Touch responsiveness on iPad / phone
- Balance: is Hard actually hard? Is Easy beatable for a 7yo?
- Match length feels like 60–90s?
- Audio quality on mobile speakers

## Top 3 picks for next session
1. Hand-drawn aesthetic + show actual drawings → feels like Michael's game
2. Separate shop items → real economic decisions
3. Tutorial overlay → 7yo can grok the 3 plane types without reading
