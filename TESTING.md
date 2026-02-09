# 2048 Puzzle Game - Testing Checklist

## Pre-Deployment Validation

### 1. Code Quality
- [ ] No HTML syntax errors (run through validator)
- [ ] No CSS syntax errors
- [ ] No JavaScript console errors
- [ ] All file paths correct (case-sensitive)
- [ ] All locales load correctly

### 2. Gameplay Mechanics

#### Tile Movement
- [ ] Left arrow/swipe moves tiles left
- [ ] Right arrow/swipe moves tiles right
- [ ] Up arrow/swipe moves tiles up
- [ ] Down arrow/swipe moves tiles down
- [ ] Cannot move when no valid moves available
- [ ] New tile spawns after valid move

#### Tile Merging
- [ ] Equal adjacent tiles merge correctly
- [ ] Merged tiles double in value
- [ ] Merge sound plays
- [ ] Score increases by merged tile value
- [ ] Only one merge per line per move

#### Scoring
- [ ] Score updates correctly after merge
- [ ] Best score updates when beaten
- [ ] Score persists on page refresh
- [ ] Best score persists on page refresh
- [ ] Scores display with proper formatting

#### Win Condition
- [ ] Victory modal appears when 2048 reached
- [ ] "Continue Playing" button works
- [ ] Game continues after victory
- [ ] Can exceed 2048
- [ ] Victory event tracked in GA4

#### Loss Condition
- [ ] Game Over modal appears when no moves left
- [ ] Game Over occurs only when truly stuck
- [ ] Final score displayed correctly
- [ ] Best score displayed correctly
- [ ] Cannot move after game over

### 3. Controls

#### Keyboard (Desktop)
- [ ] Arrow Up works
- [ ] Arrow Down works
- [ ] Arrow Left works
- [ ] Arrow Right works
- [ ] Page doesn't scroll with arrow keys

#### Touch/Swipe (Mobile)
- [ ] Horizontal swipe (50px threshold) registers
- [ ] Vertical swipe (50px threshold) registers
- [ ] Diagonal swipes work appropriately
- [ ] Touch feedback is smooth

#### Buttons
- [ ] "New Game" button resets game
- [ ] "Undo" button restores previous state
- [ ] "Undo (Ad)" button works
- [ ] "Play Again" button works
- [ ] "Continue Playing" button works
- [ ] All buttons are 44px+ height

### 4. User Interface

#### Responsiveness
- [ ] Desktop view (1200px+) displays correctly
- [ ] Tablet view (768px) displays correctly
- [ ] Mobile view (480px) displays correctly
- [ ] Small mobile (320px) displays correctly
- [ ] Grid is always square
- [ ] Text is readable at all sizes

#### Dark Mode
- [ ] Background is dark (#0f0f23)
- [ ] Text is visible on dark background
- [ ] Accent color (#f39c12) stands out
- [ ] Tiles are visible with proper contrast
- [ ] No bright flashes

#### Animations
- [ ] Tile spawn animation smooth (popIn)
- [ ] Tile merge animation smooth (merge)
- [ ] Button hover effects work
- [ ] Modal fade-in smooth
- [ ] No lag or stuttering

#### Tile Colors
- [ ] 2: Light yellow gradient
- [ ] 4: Yellow gradient
- [ ] 8: Golden gradient
- [ ] 16: Orange gradient
- [ ] 32: Dark orange gradient
- [ ] 64-1024: Purple gradients
- [ ] 2048: Dark with gold text
- [ ] 4096+: Super tiles proper styling
- [ ] Text contrast sufficient for readability

### 5. Internationalization (i18n)

#### Language Loading
- [ ] Korean (ko) loads correctly
- [ ] English (en) loads correctly
- [ ] Japanese (ja) loads correctly
- [ ] Chinese (zh) loads correctly
- [ ] Spanish (es) loads correctly
- [ ] Portuguese (pt) loads correctly
- [ ] Indonesian (id) loads correctly
- [ ] Turkish (tr) loads correctly
- [ ] German (de) loads correctly
- [ ] French (fr) loads correctly
- [ ] Hindi (hi) loads correctly
- [ ] Russian (ru) loads correctly

#### Language Switching
- [ ] Language menu opens on globe icon click
- [ ] Language menu closes on click outside
- [ ] Each language option clickable
- [ ] Language changes instantly
- [ ] All UI text updates on language change
- [ ] Language preference saved to localStorage
- [ ] Saved language loads on refresh

#### Translation Quality
- [ ] No untranslated keys showing
- [ ] All buttons have translated text
- [ ] Score labels translated
- [ ] Modal text translated
- [ ] No placeholder text visible
- [ ] Text fits within UI boundaries

### 6. Ads & Monetization

#### Banner Ads
- [ ] Top ad visible
- [ ] Bottom ad visible
- [ ] Ads don't overlap game
- [ ] Responsive ad sizing
- [ ] AdSense code correct (ca-pub-3600813755953882)

#### Interstitial Ads
- [ ] Ad shows on game over
- [ ] Ad dismisses after timeout
- [ ] Game resumes after ad
- [ ] Ad doesn't break game state

#### Reward Ads
- [ ] "Undo (Ad)" button visible
- [ ] Ad displays on click
- [ ] Undo executes after ad
- [ ] Can't skip ad prematurely

### 7. Analytics (GA4)

#### Event Tracking
- [ ] GA4 property connected (G-J8GSWM40TV)
- [ ] New game event fires
- [ ] Move event fires with direction
- [ ] Victory event fires with score
- [ ] Game over event fires with score
- [ ] Undo event fires
- [ ] Ad view event fires
- [ ] Events visible in GA4 dashboard

### 8. PWA Features

#### Manifest
- [ ] manifest.json loads without errors
- [ ] App name: "2048"
- [ ] Display: standalone
- [ ] Theme color: #0f0f23
- [ ] Icons valid (192x192, 512x512 SVG)

#### Installation
- [ ] "Add to Home Screen" prompt appears (Android Chrome)
- [ ] App installs successfully
- [ ] App launches in standalone mode
- [ ] App icon displays correctly
- [ ] Splash screen shows

#### Service Worker
- [ ] Service worker registers
- [ ] Assets cached
- [ ] Game works offline
- [ ] Reload offline - page loads
- [ ] Network returns - app updates

### 9. Sound Effects

#### Audio Playback
- [ ] Slide sound plays (800Hz, 100ms)
- [ ] Merge sound plays (1200Hz, 150ms)
- [ ] Game Over sound plays (400Hz, 500ms)
- [ ] Undo sound plays (600Hz, 200ms)
- [ ] Error sound plays (300Hz, 300ms)
- [ ] Volume appropriate (not too loud)
- [ ] No console errors from audio

### 10. Accessibility

#### Keyboard Navigation
- [ ] Tab key navigates through buttons
- [ ] Enter/Space triggers buttons
- [ ] Game controls without mouse

#### Visual Accessibility
- [ ] Text contrast WCAG AA compliant
- [ ] Font sizes readable (14px+ for body)
- [ ] Color not sole indicator (shapes/text used)
- [ ] Focus indicators visible on buttons

#### Screen Readers
- [ ] Buttons have aria-label where needed
- [ ] Images have alt text (icons)
- [ ] Semantic HTML used

### 11. Performance

#### Loading
- [ ] Page loads within 3 seconds
- [ ] No layout shift after load
- [ ] No broken asset links

#### Runtime
- [ ] Game runs at 60 FPS
- [ ] No memory leaks after 30+ moves
- [ ] Battery drain acceptable
- [ ] CPU usage low during idle

#### Network
- [ ] Works on 4G connection
- [ ] Works on WiFi
- [ ] Offline mode works

### 12. Cross-Browser Testing

#### Chrome/Edge
- [ ] All features work
- [ ] Responsive on all sizes
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] Responsive on all sizes
- [ ] No console errors

#### Safari (macOS)
- [ ] All features work
- [ ] Responsive on all sizes
- [ ] No console errors

#### Safari (iOS)
- [ ] All features work
- [ ] Touch controls work
- [ ] Responsive layout
- [ ] Can add to home screen

#### Android Chrome
- [ ] All features work
- [ ] Touch controls work
- [ ] PWA installable
- [ ] Service worker works

---

## Testing Notes

### How to Test Swipe Controls
1. Open on mobile device (or use DevTools device emulation)
2. Press and hold on grid
3. Drag horizontally 50px+ for left/right
4. Drag vertically 50px+ for up/down
5. Release - tile should move

### How to Test Offline
1. Open DevTools (F12)
2. Network tab → Throttling → Offline
3. Refresh page
4. Game should load from cache
5. Should be fully playable

### How to Test GA4
1. Open DevTools → Network
2. Search for "gtag"
3. Check requests include event data
4. Open GA4 dashboard (with property G-J8GSWM40TV)
5. Check Real Time events

### How to Test Service Worker
1. Open DevTools → Application
2. Service Workers tab
3. Should show "puzzle2048-v1" registered
4. Check status: "activated and running"
5. Switch offline and reload

---

## Final Approval

- [ ] All 12 language translations verified
- [ ] All monetization working
- [ ] Lighthouse score 90+
- [ ] All tests passed
- [ ] Ready for production deployment

**Tested by**: [Your Name]
**Date**: [YYYY-MM-DD]
**Build Version**: 1.0.0
**GA4 Verified**: Yes
**AdSense Verified**: Yes
