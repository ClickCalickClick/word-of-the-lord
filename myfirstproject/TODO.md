# TODO: Spiritual Leader Quote Feature

**Feature**: Add spiritual leader quote mode as alternative to daily gospel  
**Started**: November 2, 2025  
**Status**: In Progress

---

## Implementation Checklist

### Phase 7: Spiritual Leader Quotes Feature

#### 1. Documentation & Planning
- [x] Create TODO.md tracking file
- [ ] Update IMPLEMENTATION_PLAN.md with Phase 7 details

#### 2. Configuration & Message Keys
- [ ] Add new message keys to package.json:
  - `QUOTE_MODE_ENABLED` (boolean)
  - `SPIRITUAL_LEADER_NAME` (string)

#### 3. Clay Settings UI (src/pkjs/config.js)
- [ ] Add radio button group for content source selection
  - Option 1: "Daily Catholic Gospel"
  - Option 2: "Spiritual Leader Quote"
- [ ] Add conditional text input for "Spiritual Leader Name"
  - Only visible when "Spiritual Leader Quote" is selected
- [ ] Update settings structure and validation

#### 4. Quote History Tracking (src/pkjs/index.js)
- [ ] Create `getUsedQuotes()` function
  - Retrieve array from localStorage
  - Return parsed array or empty array
- [ ] Create `saveUsedQuote()` function
  - Add new quote snippet to array
  - Limit to last 2 years (~730 quotes)
  - Remove oldest if exceeding limit
  - Save back to localStorage
- [ ] Create `getQuoteHistory()` helper
  - Format used quotes for Gemini prompt exclusion

#### 5. Gemini API Integration (src/pkjs/index.js)
- [ ] Create `fetchSpiritualLeaderQuote()` function
  - Build prompt requesting recent (within 1 year) Christian/theological quote
  - Include spiritual leader name from settings
  - Pass used quotes history to avoid duplicates
  - Request verification of Christian/theological relevance
  - Request proper attribution with year
  - Handle 5-line character limit (~120-150 chars)
- [ ] Parse Gemini response for:
  - Quote text
  - Attribution (Name + Year)
  - Validation status
- [ ] Error handling:
  - Invalid spiritual leader name → "Quote error - Check settings..."
  - API failure → fallback to Proverbs 14:29
  - No new quotes available → fallback or retry

#### 6. Settings Handler Updates (src/pkjs/index.js)
- [ ] Update settings save handler:
  - Check if quote mode is enabled
  - Validate spiritual leader name is not empty
  - If empty + quote mode enabled → default to gospel mode
  - If valid → save both settings
- [ ] Update daily fetch scheduler (2AM):
  - Check quote mode setting
  - If quote mode → call `fetchSpiritualLeaderQuote()`
  - If gospel mode → call existing `fetchDailyGospel()`
- [ ] Send appropriate data to watchface via AppMessage

#### 7. C Code Updates (src/c/myfirstproject.c)
- [ ] Update message handler to receive:
  - QUOTE_MODE_ENABLED status
  - SPIRITUAL_LEADER_NAME
- [ ] Update scripture reference display:
  - For quotes: show "- [Name] ([Year])"
  - For gospel: keep existing format "Book Chapter:Verse"
- [ ] Handle "Quote error - Check settings..." message display

#### 8. Testing & Validation
- [ ] Test radio button UI functionality
- [ ] Test conditional text input visibility
- [ ] Test settings persistence across app restarts
- [ ] Test quote mode with valid spiritual leader:
  - Pope Francis
  - C.S. Lewis
  - St. Augustine
- [ ] Test quote mode with invalid name
- [ ] Test quote mode with empty name (should fallback to gospel)
- [ ] Test quote uniqueness over multiple days
- [ ] Test localStorage quote history:
  - Verify storage works
  - Verify old quotes are pruned after 2 years
- [ ] Test gospel mode still works correctly
- [ ] Test switching between modes
- [ ] Verify attribution format displays correctly
- [ ] Test API error handling and fallbacks

---

## Design Decisions

### Storage Strategy
- **Method**: Store array of used quote snippets in localStorage (phone-side)
- **Retention**: Last 2 years of quotes (~730 quotes, ~110KB)
- **Cleanup**: Auto-remove quotes older than 2 years
- **Rationale**: Sufficient space on phone, provides good uniqueness guarantee

### Quote Refresh Timing
- **Frequency**: Once per day at 2AM (matching gospel behavior)
- **Cache**: Quote stored locally for the day, no repeated API calls

### Fallback Behavior
- **Empty leader name + quote mode ON**: Default to gospel mode
- **Invalid leader name**: Display "Quote error - Check settings..."
- **API failure**: Display default Proverbs 14:29 fallback

### Attribution Format
- **Gospel**: "Prov 14:29 - 1/5" (existing)
- **Quote**: "- Pope Francis (2025)" (new)

---

## Notes
- Quote history tracking runs on phone (localStorage in Pebble JS)
- Gemini prompt should emphasize recent (last year) and verified Christian/theological content
- Quote text must fit in ~120-150 character limit for 5-line display
- Settings UI should make mode selection clear and prominent
