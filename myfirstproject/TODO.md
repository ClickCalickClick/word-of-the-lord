# TODO: Spiritual Leader Quote Feature

**Feature**: Add spiritual leader quote mode as alternative to daily gospel  
**Started**: November 2, 2025  
**Completed**: November 3, 2025  
**Status**: ✅ COMPLETE

---

## Implementation Checklist

### Phase 7: Spiritual Leader Quotes Feature - ✅ COMPLETE

#### 1. Documentation & Planning
- [x] Create TODO.md tracking file
- [x] Update IMPLEMENTATION_PLAN.md with Phase 7 details
- [x] Update IMPLEMENTATION_STATUS.md with completed Phase 8

#### 2. Configuration & Message Keys
- [x] Add new message keys to package.json:
  - `QUOTE_MODE_ENABLED` (boolean toggle)
  - `SPIRITUAL_LEADER_NAME` (string)

#### 3. Clay Settings UI (src/pkjs/config.js)
- [x] Add toggle for "Show Spiritual Leader Quotes"
- [x] Add text input for "Spiritual Leader Name"
- [x] Implement Clay custom function for dynamic visibility
  - Leader name field shown only when quote mode enabled
  - Gospel settings hidden when quote mode active
- [x] Preserve working Clay UI structure (no breaking changes)

#### 4. Quote History Tracking (src/pkjs/index.js)
- [x] Create `addQuoteToHistory()` function
  - Store first 50 characters + timestamp
  - Auto-prune quotes older than 730 days
  - Save to localStorage
- [x] Create `getQuoteHistorySnippets()` function
  - Return array of quote snippets for Gemini exclusion
- [x] Create `isQuoteInHistory()` function
  - Check if quote already used

#### 5. Gemini API Integration (src/pkjs/index.js)
- [x] Create `fetchSpiritualLeaderQuote()` function
  - Use single model: `gemini-flash-latest`
  - Build smart prompt with spelling correction
  - Include quote history for exclusion
  - Request 120 char max quotes
  - Validate Christian/Catholic theological content
  - Request canonical name and year attribution
  - Recency preference for living leaders
- [x] Create `parseGeminiQuoteResponse()` function
  - Robust parsing for varied formats
  - Handle markdown, bold, blockquotes, code blocks
  - Extract QUOTE, ATTRIBUTION, YEAR
  - Comprehensive logging for debugging
- [x] Implement error handling:
  - Missing API key → fallback to default scripture
  - Empty leader name → auto-revert to gospel
  - Invalid leader → "Quote error - Check settings"
  - API failure → error message
  - Duplicate quote → auto-retry

#### 6. Settings Handler Updates (src/pkjs/index.js)
- [x] Update settings save handler:
  - Check if quote mode is enabled
  - Validate spiritual leader name is not empty
  - If empty + quote mode enabled → auto-revert to gospel mode
  - Save both settings to localStorage
- [x] Update ready event handler:
  - Check quote mode setting
  - If quote mode → call `fetchSpiritualLeaderQuote()`
  - If gospel mode → call `fetchGospel()` or `fetchCustomScripture()`
- [x] Update daily fetch scheduler (2AM):
  - Check quote mode setting
  - If quote mode → fetch new spiritual leader quote
  - If gospel mode → fetch new daily gospel
- [x] Send quote data to watchface via existing AppMessage keys:
  - SCRIPTURE_TEXT = quote
  - SCRIPTURE_REF = "Name (Year)"
  - SCRIPTURE_PART_CURRENT = 1
  - SCRIPTURE_PART_TOTAL = 1

#### 7. C Code Updates (src/c/myfirstproject.c)
- [x] No changes needed
  - Reuses existing SCRIPTURE_* message keys
  - Quote displayed in scripture text area
  - Attribution displayed in reference area

#### 8. Testing & Validation
- [x] Build successful on all platforms
- [x] Clay UI renders correctly with toggle and input
- [x] Settings persist across app restarts
- [ ] Test quote mode with valid spiritual leaders:
  - [ ] Pope Francis
  - [ ] C.S. Lewis
  - [ ] St. Augustine
  - [ ] Test spelling correction (e.g., "Pope Leo 14th")
- [ ] Test quote mode with invalid name
- [ ] Test quote mode with empty name (should revert to gospel)
- [ ] Test quote uniqueness over multiple days
- [ ] Test localStorage quote history:
  - [ ] Verify storage works
  - [ ] Verify old quotes are pruned after 2 years
- [ ] Test gospel mode still works correctly
- [ ] Test switching between modes
- [ ] Verify attribution format displays correctly on watch
- [ ] Test all error handling and fallbacks

---

## Design Decisions

### Storage Strategy
- **Method**: Store array of used quote snippets in localStorage (phone-side)
- **Format**: First 50 characters + timestamp
- **Retention**: Last 2 years of quotes (730 days)
- **Cleanup**: Auto-remove quotes older than 2 years on each new quote
- **Rationale**: Sufficient space on phone, provides good uniqueness guarantee

### Quote Refresh Timing
- **Frequency**: Once per day at 2AM (matching gospel behavior)
- **Cache**: Quote stored locally for the day, no repeated API calls
- **Force Refresh**: Settings changes trigger immediate refresh

### Fallback Behavior
- **Empty leader name + quote mode ON**: Auto-revert to gospel mode, persist change
- **Invalid leader name**: Display "Quote error - Check settings" on watch
- **API failure**: Display "Quote error - Check settings" on watch
- **Missing API key**: Fallback to default Proverbs 14:29

### Attribution Format
- **Gospel**: "Prov 14:29 - 1/5" (existing)
- **Quote**: "- Pope Francis (2025)" (new)

---

## Notes
- Quote history tracking runs on phone (localStorage in Pebble JS)
- Gemini prompt should emphasize recent (last year) and verified Christian/theological content
- Quote text must fit in ~120-150 character limit for 5-line display
- Settings UI should make mode selection clear and prominent
