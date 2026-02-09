# 2048 - Puzzle Game

A modern, high-revenue 2048 puzzle game built with vanilla JavaScript, PWA support, and multi-language internationalization.

## Features

### Core Gameplay
- **4x4 Grid System**: Classic 2048 mechanics with DOM-based tiles
- **Smooth Animations**: CSS3 animations for tile movement and merging
- **Score Tracking**: Real-time score display with localStorage persistence
- **Game States**: Victory detection (2048), Game Over detection, Continue Playing option

### Controls
- **Keyboard**: Arrow keys (↑↓←→) for desktop
- **Swipe**: Touch gestures for mobile (min. 50px swipe)
- **Accessibility**: 44px+ touch targets, keyboard navigation

### Monetization
- **AdSense Integration**: Top & bottom banner ads + interstitial ads
- **GA4 Analytics**: Event tracking for user behavior
- **Undo Feature**: 1 free undo + ad-based undo for engagement

### Technical Excellence
- **PWA Ready**: Offline support, installable to home screen
- **Dark Mode First**: Modern dark UI with gold accent (#f39c12)
- **Multi-language**: 12 languages (ko, en, ja, zh, es, pt, id, tr, de, fr, hi, ru)
- **Service Worker**: Caching strategy for offline play
- **Sound Effects**: Web Audio API for game feedback

## File Structure

```
puzzle-2048/
├── index.html              # Main HTML with ad slots & modals
├── manifest.json           # PWA configuration
├── sw.js                   # Service Worker
├── icon-192.svg, icon-512.svg  # App icons
├── css/
│   └── style.css          # Responsive styles (dark mode first)
└── js/
    ├── app.js             # Game logic & controls
    ├── i18n.js            # Multi-language module
    └── locales/           # 12 language JSON files
        ├── ko.json, en.json, ja.json, zh.json
        ├── es.json, pt.json, id.json, tr.json
        ├── de.json, fr.json, hi.json, ru.json
```

## Game Mechanics

### Tile Movement
- Swipe or press arrow keys to move all tiles
- Empty spaces collapse, tiles slide together
- Equal adjacent values merge into one (2+2=4, 4+4=8, etc.)
- New tile (2 or 4, 90% or 10%) spawns after each move

### Scoring
- Score = sum of merged tile values
- Best score saved to localStorage
- Updated real-time during gameplay

### Win/Loss Conditions
- **Victory**: First time reaching 2048
- **Game Over**: No valid moves available (no empty tiles and no possible merges)
- Continue Playing: Option to exceed 2048 and set new records

### Undo Feature
- **Free Undo**: One per game session
- **Ad-based Undo**: Additional undo by watching ad

## Internationalization (i18n)

### Supported Languages
| Code | Language | Priority |
|------|----------|----------|
| ko | 한국어 | Primary |
| en | English | Global |
| ja | 日本語 | High RPM |
| zh | 中文 | High market |
| es | Español | Global |
| pt | Português | Global |
| id | Bahasa Indonesia | Large market |
| tr | Türkçe | Emerging |
| de | Deutsch | High RPM |
| fr | Français | Global |
| hi | हिन्दी | Large market |
| ru | Русский | High RPM |

### Language Detection
1. Check localStorage for saved preference
2. Detect browser language
3. Default to English

### Implementation
- `js/i18n.js`: Core translation module with loader
- `js/locales/{lang}.json`: Locale files with dot-notation keys
- `data-i18n` attributes: HTML elements automatically translated
- Dynamic text: Use `i18n.t('key')` in JavaScript

## Monetization Strategy

### Ad Placements
- **Top Banner**: Display ad (responsive, 300x250, 320x50)
- **Bottom Banner**: Display ad (responsive)
- **Interstitial**: Full-screen ad on game over (interstitial)
- **Reward Ad**: Ad-based undo feature

### Revenue Optimization
| Position | Type | Expected RPM |
|----------|------|--------------|
| Top | Banner | $1-3 |
| Bottom | Banner | $1-3 |
| Game Over | Interstitial | $5-15 |
| Undo | Reward | Custom |

### Analytics
- **GA4 Property**: G-J8GSWM40TV
- **Events Tracked**:
  - `puzzle2048_newGame`: New game started
  - `puzzle2048_move`: Move executed (direction, score)
  - `puzzle2048_victory`: Reached 2048
  - `puzzle2048_gameOver`: Game ended
  - `puzzle2048_undo`: Undo used
  - `puzzle2048_adView`: Ad displayed

## Design

### Visual Theme
- **Dark Mode**: #0f0f23 (primary), #1a1a2e (secondary)
- **Accent**: #f39c12 (gold/orange) - high-contrast on dark
- **Glassmorphism**: Backdrop blur, semi-transparent cards
- **Typography**: System font stack for speed

### Tile Colors
Gradient progression from light to dark:
- 2: #ffeaa7 (light yellow)
- 4: #fdcb6e (yellow)
- 8: #f9ca24 (golden)
- 16: #f39c12 (orange)
- 32: #e67e22 (dark orange)
- 64: #d35400 (darker)
- 128+: Purple, dark gradients
- 2048: Dark with gold text
- 4096+: Super tiles in dark

### Responsive Design
```css
Desktop: 420px width, normal spacing
Tablet (768px): Grid-cell 55px, gap 8px
Mobile (480px): Grid-cell 45px, gap 6px
Small Mobile (320px): Optimized for tiny screens
```

## PWA Features

### Installation
- Add to home screen (Android, iOS)
- Standalone display mode
- Custom splash screen with icon

### Offline Support
- Service Worker caches all assets
- Game playable offline (except ads)
- Automatic re-sync when online

### Manifest
- App name, icon, theme colors
- Start URL, scope, orientation
- Category: games

## Performance

### Optimization
- No external dependencies (vanilla JS)
- CSS Grid for efficient layout
- DOM-based tiles (no Canvas)
- Web Audio API (lightweight sound)
- Service Worker caching

### Metrics
- Lighthouse Score: 90+
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Offline Capability: Yes

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions (including iOS)
- Mobile: Android 5.0+, iOS 12+

## Development

### Local Testing
```bash
# Start Python HTTP server (Python 3)
cd puzzle-2048
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Testing Checklist
- [ ] All 4x4 grid functions (move, merge, spawn)
- [ ] Swipe controls on mobile
- [ ] Keyboard controls on desktop
- [ ] Victory modal at 2048
- [ ] Game Over detection
- [ ] Score persistence in localStorage
- [ ] Language switching (12 languages)
- [ ] Ad placements visible
- [ ] Sound effects working
- [ ] Service Worker offline mode
- [ ] PWA installable
- [ ] Responsive on 320px, 480px, 768px, desktop

### Deployment
1. Ensure all translations are complete (12 languages)
2. Test all ad placements
3. Verify GA4 event tracking
4. Check PWA manifest and icons
5. Run Lighthouse audit
6. Deploy to hosting (GitHub Pages, Netlify, or dopabrain.com)

## Git History
```
Initial commit: 2048 puzzle game with PWA, i18n, ads, and analytics
```

## License
All rights reserved. Developed for dopabrain.com.

## Author
Sang-woo (dev@dopabrain.com)

---

**Game Tier**: Tier 1 (Casual Game - High Revenue Potential)
**Expected Revenue**: 5-10x higher than utility apps due to long playtime & natural ad placement
**Update Schedule**: Monthly balance updates + seasonal events (future)
