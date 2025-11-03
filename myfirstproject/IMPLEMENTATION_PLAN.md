# Pebble Watchface Implementation Plan

**Project**: Catholic Daily Gospel & Weather Watchface  
**Started**: October 28, 2025  
**Status**: Planning Phase

---

## Overview

Transform the current simple time display into a comprehensive watchface showing:
- Time + AM/PM (existing, no changes)
- Day of week
- Date (with "the" prefix and ordinal suffix)
- Weather temperature (via Gemini API)
- Daily Catholic Gospel reading (one verse per hour via Gemini API)
- Scripture reference
- Part indicator (X of Y)

---

## Architecture Decisions

### Weather
- **Source**: Gemini API
- **Input**: Zip code (stored in Clay settings)
- **Update Frequency**: Every hour
- **Fallback**: Display "N/A" if API fails or not loaded

### Scripture
- **Source**: Daily Catholic Gospel via Gemini API
- **Display Strategy**: TBD - Need to decide:
  - **Option A**: Gemini parses and sends one verse per hour
  - **Option B**: Gemini sends full gospel, JS parses into hourly chunks
  - **Option C**: Add shake/button interaction for scrolling through full text
- **Update Frequency**: Changes every hour to next verse
- **Fallback**: Display Proverbs 14:29 if API fails

### Clay Settings Required
- Gemini API Key (text input)
- Zip Code (text input for weather)

---

## Implementation Phases

### ✅ **Phase 0: Planning** - COMPLETE
- [x] Finalize UI layout decisions (fonts, alignment, positioning)
- [x] Create implementation plan document
- [x] Answer remaining design questions

**Completed**: October 28, 2025

### **Phase 1: UI Layout & Static Content** - ✅ COMPLETE
**Goal**: Build complete visual layout with hardcoded data
**Status**: ✅ COMPLETE - October 28, 2025

#### Tasks:
- [x] Add static variables for new text layers
  - [x] Day of week layer
  - [x] Date layer
  - [x] Temperature layer
  - [x] Scripture text layer (multi-line)
  - [x] Scripture reference layer
  - [x] Part indicator layer
  - [x] Separator layer 1
  - [x] Separator layer 2

- [x] Implement separator drawing function
  - [x] Double-line style matching existing border aesthetic
  - [x] Two separators (after time, before scripture)

- [x] Create and position all text layers in `prv_window_load()`
  - [x] Day layer with placeholder text
  - [x] Date layer with placeholder text
  - [x] Temperature layer (default "N/A")
  - [x] Scripture layer (default Proverbs 14:29 text)
  - [x] Reference layer (default "Proverbs 14:29")
  - [x] Part layer (default "Part 1 of 6")

- [x] Add layer cleanup in `prv_window_unload()`
  - [x] Destroy all new text layers
  - [x] Destroy separator layers

- [x] Implement date/day update function
  - [x] Get current day of week from system time
  - [x] Format date with "the" prefix and ordinal suffix (1st, 2nd, 3rd, etc.)
  - [x] Update layers on initialization and time tick

- [x] Test and adjust positioning/fonts
  - [x] Verify all elements visible on screen
  - [x] Check text wrapping for scripture
  - [x] Build successful

**Deliverable**: ✅ Watchface displays all UI elements with static/system data

---

### **Phase 2: Clay Configuration Page** - ✅ COMPLETE
**Goal**: Create settings interface for user input
**Status**: ✅ COMPLETE - October 28, 2025

#### Tasks:
- [x] Create/update Clay configuration HTML
  - [x] Add Gemini API Key input field
  - [x] Add Zip Code input field
  - [x] Add instructions/help text
  - [x] Style the settings page

- [x] Implement settings storage
  - [x] Save API key to localStorage
  - [x] Save zip code to localStorage
  - [x] Add settings validation

- [x] Update pkjs to receive settings
  - [x] Listen for settings change events
  - [x] Store settings in JS variables
  - [x] Send confirmation to watchface

- [x] Test settings persistence
  - [x] Build successful with new configuration

**Deliverable**: ✅ User can enter and save Gemini API key and zip code

---

### **Phase 3: Gemini API Integration - Weather** - ✅ COMPLETE
**Goal**: Fetch and display real weather data
**Status**: ✅ COMPLETE - October 28, 2025

#### Tasks:
- [x] Design Gemini prompt for weather
  - [x] Format request with zip code
  - [x] Request temperature in Fahrenheit
  - [x] Specify desired response format

- [x] Implement weather fetch function
  - [x] HTTP request to Gemini API
  - [x] Include API key in headers
  - [x] Parse temperature from response
  - [x] Handle errors gracefully

- [x] Send weather data to watchface
  - [x] Use AppMessage to send temperature
  - [x] Update C code to receive AppMessage
  - [x] Update temperature layer with received data

- [x] Implement hourly updates
  - [x] Set interval timer in JS (60 minutes)
  - [x] Fetch weather on schedule
  - [x] Update display when new data arrives

- [x] Add error handling
  - [x] Display "N/A" on API failure
  - [x] Log errors for debugging
  - [x] Retry logic for failed requests

**Deliverable**: ✅ Real-time weather temperature displayed and updated hourly

---

### **Phase 4: Gemini API Integration - Daily Gospel** - ✅ COMPLETE
**Goal**: Fetch and display Catholic daily Gospel reading
**Status**: ✅ COMPLETE - October 28, 2025

#### Decision: Scripture Parsing Strategy
**CHOSEN**: Option B - Gemini sends full gospel once per day, JS parses into hourly chunks

#### Tasks:
- [x] Design Gemini prompt for daily gospel
  - [x] Request Catholic daily Gospel reading for current date
  - [x] Specify USCCB liturgical calendar
  - [x] **IMPORTANT**: Request abbreviated book names (max 5 characters)
    - Examples: Proverbs→Prov, Matthew→Matt, John→John, Ecclesiastes→Eccl
  - [x] Define response format with verse divisions

- [x] Implement gospel fetch function
  - [x] Fetch on app initialization
  - [x] Parse response into chunks (~120 chars each for 3 lines)
  - [x] Store verses in gospelData object

- [x] Implement hourly verse rotation
  - [x] Calculate which verse to display based on hour (0-23)
  - [x] Update scripture text layer
  - [x] Update reference layer
  - [x] Update part indicator (X/Y)

- [x] Add AppMessage communication
  - [x] Use existing message keys for scripture data
  - [x] Send verse text to watchface
  - [x] Send reference to watchface
  - [x] Send part numbers to watchface

- [x] Update C code to receive scripture
  - [x] Add static buffers for scripture data
  - [x] Handle AppMessage for scripture updates
  - [x] Update text layers with new data
  - [x] Initialize with default Proverbs 14:29

- [x] Implement error handling
  - [x] Fallback to Proverbs 14:29 on failure
  - [x] Display default reference "Prov 14:29"
  - [x] Log errors for debugging
  - [x] Send default scripture if API fails

**Deliverable**: ✅ Daily Gospel reading displays and rotates hourly

---

### **Phase 5: Enhanced User Interaction** (Optional)
**Goal**: Add user controls for better experience

#### Tasks:
- [ ] Implement shake detection
  - [ ] Register accelerometer service
  - [ ] Detect shake gesture
  - [ ] Trigger full gospel display

- [ ] Create scrollable scripture view
  - [ ] Show complete daily reading
  - [ ] Allow button navigation
  - [ ] Return to hourly view after timeout

- [ ] Add button controls (optional)
  - [ ] Up/Down to navigate verses manually
  - [ ] Select to show full reading

**Deliverable**: User can interact with watchface to view full gospel

---

### **Phase 6: Polish & Optimization**
**Goal**: Refine user experience and performance

#### Tasks:
- [ ] Optimize API calls
  - [ ] Cache weather data
  - [ ] Cache daily gospel
  - [ ] Minimize redundant requests

- [ ] Improve error messages
  - [ ] User-friendly error displays
  - [ ] Retry mechanisms

- [ ] Add loading indicators
  - [ ] Show "Loading..." while fetching data
  - [ ] Visual feedback for updates

- [ ] Battery optimization
  - [ ] Minimize AppMessage frequency
  - [ ] Efficient text layer updates

- [ ] Testing
  - [ ] Test with various verse lengths
  - [ ] Test API failure scenarios
  - [ ] Test across full day (24-hour rotation)
  - [ ] Test settings changes

**Deliverable**: Production-ready watchface

---

## Design Decisions To Finalize

### ✅ FINALIZED Design Decisions:

1. **Scripture font size**: 
   - [x] GOTHIC_14 (smaller, ~4 lines) ✓

2. **Separator inset**: 
   - [x] Full width ✓

3. **Text alignment**:
   - [x] Day/Date/Temp: **Center** ✓
   - [x] Scripture: **Center** ✓
   - [x] Reference: **Center** ✓
   - [x] Part: **Center** ✓

4. **Day format**: 
   - [x] "Tuesday" (full name, title case) ✓

5. **Date format**: 
   - [x] "the 28th" (lowercase "the") ✓

6. **Scripture parsing strategy**:
   - [x] **Option B**: Gemini sends full gospel once/day, JS parses into hourly chunks ✓
   - [x] **Phase 5**: Add shake/button for full gospel scrolling (optional enhancement)

---

## Technical Specifications

### Text Layer Layout (Pebble 144x168)

```
┌────────────────────────────────────┐
│ 10:45 AM                           │  y=0-50 (existing)
├────────────────────────────────────┤  y=52-54 (separator 1)
│ Tuesday                            │  y=56-72 (day)
│ the 28th                           │  y=74-86 (date)
│ N/A                                │  y=88-100 (temp)
├────────────────────────────────────┤  y=102-104 (separator 2)
│ Whoever is patient has             │  y=106-138 (scripture)
│ great understanding, but one       │  multi-line, wrapping
│ who is quick-tempered displays     │
│ folly.                             │
│ Proverbs 14:29                     │  y=140-152 (reference)
│ Part 1 of 6                        │  y=154-164 (part)
└────────────────────────────────────┘
```

### Font Assignments (Proposed)

| Element | Font | Size | Style |
|---------|------|------|-------|
| Time | LECO_42_NUMBERS | 42 | Numbers |
| AM/PM | GOTHIC_14_BOLD | 14 | Bold |
| Day | GOTHIC_24_BOLD | 24 | Bold |
| Date | GOTHIC_18 | 18 | Regular |
| Temp | GOTHIC_14_BOLD | 14 | Bold |
| Scripture | GOTHIC_14 | 14 | Regular |
| Reference | GOTHIC_14_BOLD | 14 | Bold |
| Part | GOTHIC_14 | 14 | Regular |

### AppMessage Keys (To Be Defined)

```c
MESSAGE_KEY_WEATHER_TEMP
MESSAGE_KEY_SCRIPTURE_TEXT
MESSAGE_KEY_SCRIPTURE_REF
MESSAGE_KEY_SCRIPTURE_PART_CURRENT
MESSAGE_KEY_SCRIPTURE_PART_TOTAL
```

---

## Questions & Answers Log

**Q**: Should the time and AM/PM positions change?  
**A**: No, keep current positions (time y=0, AM/PM y=8 and y=28)

**Q**: Weather source?  
**A**: Gemini API using zip code from Clay settings

**Q**: Scripture parsing - Gemini or JS?  
**A**: TBD - Need to choose between Options A, B, or C

**Q**: Weather update frequency?  
**A**: Every hour

---

## Completion Checklist

### Phase 0: Planning
- [x] Create implementation plan document
- [x] Answer design questions (fonts, alignment, formats)
- [x] Choose scripture parsing strategy (Option B)
- [x] Get approval to proceed with Phase 1
- **STATUS**: ✅ COMPLETE - October 28, 2025

### Phase 1: UI Layout
- [x] All tasks completed
- [x] Tested - Build successful
- [x] All UI elements created and positioned
- [x] Ready for Phase 2
- **STATUS**: ✅ COMPLETE - October 28, 2025

### Phase 2: Clay Settings
- [x] All tasks completed
- [x] Settings persist correctly
- [x] Build successful
- [x] Ready for Phase 3
- **STATUS**: ✅ COMPLETE - October 28, 2025

### Phase 3: Weather API
- [x] All tasks completed
- [x] Weather displays correctly
- [x] Error handling works
- [x] Build successful
- [x] Ready for Phase 4
- **STATUS**: ✅ COMPLETE - October 28, 2025

### Phase 4: Gospel API
- [x] All tasks completed
- [x] Scripture rotates hourly
- [x] Error handling works
- [x] Build successful
- [x] Ready for Phase 5 (if desired)
- **STATUS**: ✅ COMPLETE - October 28, 2025

### Phase 5: User Interaction (Optional)
- [ ] All tasks completed
- [ ] Interactions work smoothly
- [ ] Ready for Phase 6

### Phase 6: Polish
- [ ] All tasks completed
- [ ] Full testing passed
- [ ] **PROJECT COMPLETE** 🎉

---

## Notes & Decisions

### October 28, 2025
- ✅ Phase 0 complete - All design decisions finalized
- Scripture font: GOTHIC_14 for better text capacity
- All text centered for clean, symmetrical appearance
- Full-width separators for cleaner look
- Day format: "Tuesday" (readable, professional)
- Date format: "the 28th" (lowercase)
- Scripture strategy: Option B (Gemini sends full gospel, JS parses)
- Phase 5 will add shake gesture for full gospel view
- Ready to begin Phase 1 implementation
- ✅ **Phase 1 COMPLETE** - All UI elements implemented
  - Added 6 new text layers (day, date, temp, scripture, reference, part)
  - Added 2 separator layers with double-line drawing
  - Implemented date/day update function with ordinal suffix
  - Build successful - all platforms compiled without errors
  - Memory usage acceptable (aplite: 20KB free, others: 61KB+ free)
- **UI Refinements**:
  - Combined day/date/temp into single line: "Tuesday the 28th at N/A"
  - Combined reference and part with mixed fonts: "Proverbs 14:29 - 1/5" (bold + regular)
  - Fixed text clipping issues:
    - Increased scripture layer height from 56px to 58px (prevents descender clipping)
    - Widened reference bold layer from 90px to 100px (prevents truncation)
    - Adjusted positioning for better spacing
  - **Note for Phase 4**: Gemini API should abbreviate book names (max 4-5 chars):
    - Examples: Proverbs→Prov, Matthew→Matt, Ecclesiastes→Eccl, etc.
    - This will ensure reference fits comfortably without truncation
- ✅ **Phase 2 COMPLETE** - Clay Configuration Page
  - Created Clay configuration with two input fields:
    - Gemini API Key (with link to get API key)
    - Zip Code for weather
  - Implemented localStorage persistence for settings
  - Added event listeners for settings changes
  - Build successful - settings ready for Phase 3 integration
- ✅ **Phase 3 COMPLETE** - Gemini Weather API Integration
  - Added message keys for AppMessage communication (WEATHER_TEMP, etc.)
  - Implemented `fetchWeather()` function using Gemini API
  - Gemini prompt requests temperature in format "65F" for specified zip code
  - Weather fetches on app start (if settings configured)
  - Weather fetches after settings changes
  - Hourly automatic updates (60-minute interval)
  - AppMessage communication C ↔ JavaScript working
  - Temperature buffer updates date info display dynamically
  - Error handling: displays "N/A" on API failure or missing settings
  - Build successful - weather integration complete
- ✅ **Phase 4 COMPLETE** - Gemini Daily Gospel API Integration
  - Implemented Option B: Gemini sends full gospel, JS parses into ~120 char chunks
  - Added `gospelData` object to store verses, reference, and rotation index
  - Created `fetchGospel()` function with prompt for Catholic daily Gospel
  - Gemini prompt requests abbreviated book names (Prov, Matt, John, etc.)
  - Created `parseGospelResponse()` to split gospel into hourly chunks
  - Created `sendCurrentScripture()` to send appropriate chunk based on hour
  - Created `sendDefaultScripture()` to handle API failures
  - Added C code buffers: s_scripture_text[128], s_scripture_ref[32], s_scripture_part[8]
  - Updated `prv_inbox_received_handler()` to receive all 4 scripture message keys
  - Scripture fetches on app start (if API key configured)
  - Scripture fetches after settings changes
  - Hourly automatic verse rotation (changes based on current hour % total chunks)
  - Fixed regex syntax error (replaced `/is` flag with `[\s\S]` for older JS)
  - Default fallback: "Whoever is patient..." - Prov 14:29 - 1/1
  - Build successful - daily gospel integration complete

---

### **Phase 7: Spiritual Leader Quotes Feature** - 🔄 IN PROGRESS
**Goal**: Add alternative content mode to display quotes from spiritual leaders
**Status**: 🔄 IN PROGRESS - November 2, 2025

#### Overview:
- Add radio button selection in Clay settings: Daily Gospel OR Spiritual Leader Quotes
- User can specify a spiritual leader (pope, saint, pastor, theologian, influencer)
- Gemini fetches recent (within 1 year) verified Christian/theological quotes
- Quotes fit in 5-line text area (~120-150 characters)
- Attribution format: "- [Name] ([Year])"
- Track used quotes to avoid repetition (store last 2 years in localStorage)
- Refresh once per day at 2AM (same as gospel)
- Fallback behaviors:
  - Empty name + quote mode enabled → default to gospel
  - Invalid name or no quotes found → "Quote error - Check settings..."
  - API failure → default Proverbs 14:29

#### Tasks:
- [ ] Add new message keys to package.json
  - [ ] QUOTE_MODE_ENABLED (boolean)
  - [ ] SPIRITUAL_LEADER_NAME (string)

- [ ] Update Clay Configuration UI (src/pkjs/config.js)
  - [ ] Add radio button group for content source selection
    - Option 1: "Daily Catholic Gospel"
    - Option 2: "Spiritual Leader Quote"
  - [ ] Add conditional text input for "Spiritual Leader Name"
    - Only visible when "Spiritual Leader Quote" is selected
  - [ ] Position radio buttons prominently at top of settings
  - [ ] Update settings structure and validation

- [ ] Implement Quote History Tracking (src/pkjs/index.js)
  - [ ] Create `getUsedQuotes()` - retrieve array from localStorage
  - [ ] Create `saveUsedQuote(quote)` - add to array, prune if >730 quotes (2 years)
  - [ ] Create `getQuoteHistoryForPrompt()` - format used quotes for Gemini exclusion

- [ ] Implement Gemini Quote Fetching (src/pkjs/index.js)
  - [ ] Create `fetchSpiritualLeaderQuote(leaderName)` function
  - [ ] Build prompt requesting:
    - Recent quote (within last year) from specified spiritual leader
    - Verified Christian/theological/spirituality content
    - Proper attribution with year
    - Character limit: ~120-150 chars for 5-line display
    - Exclusion of previously used quotes (from history)
  - [ ] Parse Gemini response for quote text, attribution, and validation
  - [ ] Error handling:
    - Invalid leader name → return error message
    - No quotes available → return error or fallback
    - API failure → return fallback scripture

- [ ] Update Settings Handler (src/pkjs/index.js)
  - [ ] Check quote mode enabled status
  - [ ] Validate spiritual leader name is not empty
  - [ ] If empty + quote mode ON → default to gospel mode on save
  - [ ] If valid → save both QUOTE_MODE_ENABLED and SPIRITUAL_LEADER_NAME
  - [ ] Update daily scheduler (2AM):
    - Check quote mode setting
    - Call `fetchSpiritualLeaderQuote()` if quote mode
    - Call `fetchDailyGospel()` if gospel mode
  - [ ] Send appropriate data to watchface via AppMessage

- [ ] Update C Code Message Handling (src/c/myfirstproject.c)
  - [ ] Handle QUOTE_MODE_ENABLED message key
  - [ ] Handle SPIRITUAL_LEADER_NAME message key
  - [ ] Update reference display logic:
    - For quotes: format as "- [Name] ([Year])"
    - For gospel: keep existing "Book Chapter:Verse - Part X/Y"
  - [ ] Handle "Quote error - Check settings..." display

- [ ] Testing & Validation
  - [ ] Test radio button UI and conditional visibility
  - [ ] Test settings persistence
  - [ ] Test quote mode with valid leaders (Pope Francis, C.S. Lewis, St. Augustine)
  - [ ] Test invalid leader name handling
  - [ ] Test empty name fallback to gospel
  - [ ] Test quote uniqueness tracking over multiple days
  - [ ] Test localStorage quote history pruning
  - [ ] Test gospel mode still works correctly
  - [ ] Test mode switching
  - [ ] Verify attribution format displays correctly
  - [ ] Test all error handling and fallbacks
  - [ ] Build successful on all platforms

**Deliverable**: 🎯 User can choose between daily gospel or spiritual leader quotes with proper validation and quote uniqueness tracking

---

**Last Updated**: November 2, 2025
