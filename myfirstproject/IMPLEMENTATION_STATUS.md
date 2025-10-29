# Catholic Daily Gospel Watchface - Implementation Status

**Last Updated:** October 29, 2025

---

## 🎯 Project Overview
Comprehensive Catholic Daily Gospel watchface for Pebble with weather integration, customizable gospel display, and custom scripture selection.

---

## ✅ COMPLETED FEATURES

### Phase 1-5: Core Functionality (Previously Completed)
- ✅ Basic UI layout with time, date, weather, and scripture display
- ✅ Gospel API integration using Universalis (direct JSON parsing, no AI)
- ✅ Weather API integration using Kids Weather Report + Gemini parsing
- ✅ Loading animation implementation with APNG resource
- ✅ HTML entity cleaning for gospel text
- ✅ Weather caching (persists across app reloads, updates hourly)

### Phase 6: Feature 1 - Shake Toggle + AI Summarization (COMPLETED)
- ✅ **Settings UI:** Added "Enable Shake to Advance" toggle with description
- ✅ **Settings Storage:** `enableShake` persisted in localStorage (default: true)
- ✅ **Gemini Summarization:** Gospel summarized to max 128 chars using Catholic anthropology
  - Optimized prompt to use smallest words while preserving full meaning
- ✅ **Summary Caching:** Cached with date, refreshes at 2 AM with daily gospel
- ✅ **Gospel Fetch Logic:** Checks shake setting → chunks if ON, summarizes if OFF
  - Added `forceRefresh` parameter to `fetchGospel()` to re-process on setting change
- ✅ **C Code Update:** Silently ignores shake events when disabled
  - Added `s_shake_enabled` variable
  - Added `ENABLE_SHAKE` message key
  - Modified `prv_tap_handler()` to check setting before advancing
- ✅ **Build Success:** All platforms compiled without errors

**How Shake Toggle Works:**
- **Shake ON (default):** Gospel split into ~120 char chunks, shake to advance through parts
- **Shake OFF:** Gemini summarizes entire gospel to fit in 128 chars (single screen, no parts)
- **Cache:** Summary saved to localStorage, persists across reloads
- **2 AM Refresh:** Auto-fetches new gospel and re-summarizes if shake is OFF
- **Settings Change:** Toggling shake immediately re-fetches gospel in new format

### Phase 7: Feature 2 - Custom Scripture Selection (IN PROGRESS)
- ✅ **Settings UI Added:** Radio group and input fields in Clay config
  - Radio: "Daily Catholic Gospel" vs "Custom Scripture"
  - Book dropdown: All 73 Catholic Bible books
  - Chapter input: Number field (1-150)
  - Starting verse input: Number field (1-176)
  - Ending verse input: Optional number field (1-176)
  - Fields marked with `"group": "custom_scripture"` for conditional display

---

## 🚧 REMAINING TODO ITEMS

### 1. Complete Custom Scripture UI (90% done)
**Status:** Settings UI created, needs message keys added to package.json

**What's Left:**
- Add message keys to `package.json`:
  - `SCRIPTURE_SOURCE`
  - `CUSTOM_BOOK`
  - `CUSTOM_CHAPTER`
  - `CUSTOM_VERSE_START`
  - `CUSTOM_VERSE_END`
- Consider adding JavaScript to hide/show custom fields based on radio selection (optional - Clay may handle this)

### 2. Implement Bible API Integration
**Status:** Not started

**What to Do:**
- Add custom scripture settings to `settings` object in `index.js`
- Update `loadSettings()` to load custom scripture preferences
- Update `saveSettings()` to save custom scripture preferences
- Create `fetchCustomScripture(book, chapter, verseStart, verseEnd)` function
  - API: `https://bible-api.com/{book}+{chapter}:{verseStart}-{verseEnd}?translation=dra`
  - Example: `https://bible-api.com/john+3:16-17?translation=dra`
  - Parse JSON response and extract text
  - Handle single verse (no end verse specified)
  - Error handling for invalid book/chapter/verse combos

### 3. Add Custom Scripture Caching
**Status:** Not started

**What to Do:**
- Create `customScripture` cache object:
  ```javascript
  var customScripture = {
    enabled: false,
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 17,
    text: '',
    reference: '',
    lastChanged: null  // Cache until settings change
  };
  ```
- Save/load from localStorage
- Invalidate cache when user changes book/chapter/verses
- Apply same chunking or summarization logic based on shake setting

### 4. Integrate Custom Scripture with Existing Flow
**Status:** Not started

**What to Do:**
- Modify `Pebble.addEventListener('ready')` to check scripture source
- If custom scripture enabled:
  - Skip daily gospel fetch
  - Fetch custom scripture instead
- If daily gospel enabled:
  - Use existing Universalis API flow
- Update `webviewclosed` event to detect scripture source changes
- Skip 2 AM daily gospel refresh when custom scripture is active
- Apply shake toggle logic to custom scripture (chunk vs summarize)

### 5. Test All Feature Combinations
**Status:** Not started

**Test Matrix:**
1. **Daily Gospel + Shake ON** → Multi-part gospel, shake to advance
2. **Daily Gospel + Shake OFF** → Single summarized gospel
3. **Custom Scripture + Shake ON** → Multi-part scripture, shake to advance
4. **Custom Scripture + Shake OFF** → Single summarized scripture
5. **Cache Persistence** → Reload app, verify gospel/scripture persists
6. **2 AM Refresh** → Verify daily gospel refreshes, custom scripture doesn't
7. **Settings Changes** → Toggle between modes, verify immediate updates

---

## 📁 Key Files Modified

### JavaScript (PebbleKit JS)
- **`src/pkjs/config.js`** - Clay configuration with all settings UI
- **`src/pkjs/index.js`** - Main JavaScript logic (API calls, caching, settings)

### C (Watchface)
- **`src/c/myfirstproject.c`** - C watchface code (display, shake handling)

### Configuration
- **`package.json`** - Message keys definition (needs CUSTOM_* keys added)

---

## 🔑 Important Implementation Details

### Message Keys (package.json)
**Current:**
- `WEATHER_TEMP`
- `SCRIPTURE_TEXT`
- `SCRIPTURE_REF`
- `SCRIPTURE_PART_CURRENT`
- `SCRIPTURE_PART_TOTAL`
- `REQUEST_NEXT_CHUNK`
- `ENABLE_SHAKE`

**Need to Add:**
- `SCRIPTURE_SOURCE`
- `CUSTOM_BOOK`
- `CUSTOM_CHAPTER`
- `CUSTOM_VERSE_START`
- `CUSTOM_VERSE_END`

### API Details
**Universalis API (Daily Gospel):**
- URL: `https://universalis.com/YYYYMMDD/jsonpmass.js`
- Format: JSONP (wrapped in callback)
- Data: `Mass_G` object contains gospel text and source
- No AI used - direct JSON parsing

**Bible API (Custom Scripture):**
- URL: `https://bible-api.com/{passage}?translation=dra`
- Translation: `dra` = Douay-Rheims (Catholic Bible)
- Format: Clean JSON
- Free, no API key required
- Example: `https://bible-api.com/john+3:16-17?translation=dra`

**Gemini API (Summarization & Weather Parsing):**
- Used ONLY for:
  - Gospel summarization when shake is OFF
  - Weather HTML parsing from Kids Weather Report
- NOT used for gospel text retrieval (Universalis is direct)

### Caching Strategy
**Weather Cache:**
- Keys: `weatherTemp`, `weatherTime`
- Valid: < 1 hour old
- Updates: Every hour via setInterval

**Gospel Cache:**
- Keys: `gospelData` (chunked) or `summarizedGospel` (summary)
- Valid: Current day only
- Updates: Daily at 2 AM

**Custom Scripture Cache:**
- Keys: TBD (need to implement)
- Valid: Until user changes selection
- Updates: Only when settings change

### Character Limits
- **Scripture text buffer (C):** 128 characters
- **Chunk size (shake ON):** ~120 characters per chunk
- **Summary size (shake OFF):** Max 128 characters (Gemini enforced)

---

## 🐛 Known Issues & Fixes Applied

### Issue: Gospel Not Re-Processing on Shake Toggle
**Problem:** When toggling shake OFF, gospel wasn't being re-summarized
**Cause:** `fetchGospel()` had early exit for cached gospel
**Fix:** Added `forceRefresh` parameter to bypass cache check when shake setting changes

### Issue: Trailing Backticks in config.js
**Problem:** Build failed with syntax error on line 206
**Cause:** Three backticks (` ``` `) at end of config.js file
**Fix:** Removed with `sed -i '$ s/```$//' config.js`

---

## 🚀 Next Steps (Priority Order)

1. **Add message keys to package.json** for custom scripture settings
2. **Implement `fetchCustomScripture()` function** with Bible API integration
3. **Add custom scripture caching logic** in settings save/load
4. **Update startup logic** to check scripture source and fetch accordingly
5. **Test all 7 combinations** in the test matrix
6. **Build and deploy** final version

---

## 💡 Notes for Future Development

- Consider limiting custom scripture verse range to prevent memory issues (max 10 verses?)
- Bible API may have rate limits - consider adding exponential backoff
- Could add more Bible translations in the future (NABRE, RSV-CE via API.Bible)
- May want to add settings validation (e.g., verse end >= verse start)
- Consider caching Bible API responses to reduce network calls

---

## 📊 Project Completion Status

**Overall Progress:** ~85% complete

- ✅ Core functionality: 100%
- ✅ Shake toggle: 100%
- 🟡 Custom scripture: 20%
- ⬜ Final testing: 0%

**Estimated Remaining Work:** 2-3 hours
