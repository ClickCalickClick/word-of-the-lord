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

### **Phase 4: Gemini API Integration - Daily Gospel**
**Goal**: Fetch and display Catholic daily Gospel reading

#### Decision Point: Scripture Parsing Strategy
**NEEDS DECISION** - Choose one approach:

#### **Option A: Gemini Parses & Sends One Verse**
- Gemini identifies daily gospel reading
- Gemini splits into individual verses
- JS requests specific verse based on current hour
- Gemini responds with single verse + reference
- **Pros**: Simple watchface logic, less data transfer
- **Cons**: More API calls (one per hour)

#### **Option B: Gemini Sends Full Gospel, JS Parses**
- Gemini sends complete daily gospel once per day
- JS stores full text in array
- JS splits into displayable chunks
- JS sends appropriate chunk each hour
- **Pros**: Fewer API calls, faster hourly updates
- **Cons**: More complex JS logic, larger data transfer

#### **Option C: Interactive Scrolling**
- Implement shake or button press detection
- Show full gospel with scrollable text layer
- User can read at their own pace
- **Pros**: User control, complete reading available
- **Cons**: Requires interaction, more complex UI

**RECOMMENDED**: Hybrid approach - Option B for hourly display + Option C for user-initiated full reading

#### Tasks (will depend on chosen option):
- [ ] Design Gemini prompt for daily gospel
  - [ ] Request Catholic daily Gospel reading for current date
  - [ ] Specify liturgical calendar (e.g., USCCB)
  - [ ] **IMPORTANT**: Request abbreviated book names (max 4-5 characters)
    - Examples: Proverbs→Prov, Matthew→Matt, John→John, Ecclesiastes→Eccl
  - [ ] Define response format with verse divisions

- [ ] Implement gospel fetch function
  - [ ] Fetch on app initialization (or first hour of day)
  - [ ] Parse response based on chosen strategy
  - [ ] Store verses/chunks appropriately

- [ ] Implement hourly verse rotation
  - [ ] Calculate which verse to display based on hour
  - [ ] Update scripture text layer
  - [ ] Update reference layer
  - [ ] Update part indicator (X of Y)

- [ ] Add AppMessage communication
  - [ ] Define message keys for scripture data
  - [ ] Send verse text to watchface
  - [ ] Send reference to watchface
  - [ ] Send part numbers to watchface

- [ ] Update C code to receive scripture
  - [ ] Handle AppMessage for scripture updates
  - [ ] Update text layers with new data
  - [ ] Handle multi-line text wrapping

- [ ] Implement error handling
  - [ ] Fallback to Proverbs 14:29 on failure
  - [ ] Display default reference
  - [ ] Log errors for debugging

**Deliverable**: Daily Gospel reading displays and rotates hourly

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
- [ ] All tasks completed
- [ ] Scripture rotates hourly
- [ ] Error handling works
- [ ] Ready for Phase 5 (if desired)

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

---

**Last Updated**: October 28, 2025
