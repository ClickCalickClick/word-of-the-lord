# Word Of The Lord -  Daily Gospel Watchface for Pebble

A comprehensive Christian Daily Gospel watchface for Pebble smartwatches that displays the time, date, weather, and daily scripture readings. Stay connected to your faith throughout the day with hourly gospel verses or inspirational quotes from spiritual leaders.

## 📖 Features

### Core Display
- **Time & Date**: Current time with AM/PM indicator, day of week, and formatted date
- **Weather**: Real-time temperature for your location (updates hourly)
- **Scripture Display**: Multi-line text area optimized for readability

### Scripture Modes

#### 1. Daily Gospel (Default)
- Automatically fetches the daily Gospel reading from the Catholic liturgical calendar
- **Shake to Advance Mode** (Default ON):
  - Gospel text is divided into manageable chunks (~120 characters each)
  - Shake your Pebble to advance through the verses
  - Part indicator shows your progress (e.g., "Part 2 of 5")
- **AI Summary Mode** (When Shake is OFF):
  - Gemini AI summarizes the entire Gospel into 128 characters
  - Uses Christian anthropology to preserve theological meaning
  - Perfect for quick daily reflection

#### 2. Custom Scripture Selection
- Choose any passage from the 73 Bible books (Douay-Rheims translation)
- Select specific book, chapter, and verse range
- Works with both Shake and AI Summary modes

#### 3. Spiritual Leader Quotes
- Display daily inspirational quotes from your favorite spiritual leaders
- Examples: Pope Francis, St. Teresa of Calcutta, C.S. Lewis, St. Augustine
- **Smart Name Matching**: AI automatically corrects spelling
  - "Pope Leo 14th" → "Pope Leo XIV"
  - "Saint Teressa" → "Saint Teresa"
  - "CS Lewis" → "C.S. Lewis"
- **Quote History**: Prevents repeat quotes for up to 2 years
- **Attribution**: Each quote shows the speaker's name and year

### Additional Features
- **Hourly Updates**: Scripture rotates every hour (in chunk mode)
- **Daily Refresh**: New content automatically loads at 2:00 AM
- **Elegant UI**: Book-like border design with professional typography
- **Multi-Platform**: Compatible with all Pebble models (Aplite, Basalt, Diorite, Emery)

## 🚀 Installation

### 1. Prerequisites
- A Pebble smartwatch (any model)
- Pebble app installed on your smartphone (iOS or Android)
- Internet connection for downloading the watchface and fetching data

### 2. Installation Steps

#### Option A: Install from Rebble/Pebble App Store
1. Open the Pebble app on your smartphone
2. Navigate to the Watchfaces section
3. Search for "Word Of The Lord"
4. Tap to install directly to your watch
5. Tap on the watchface in the Pebble app to access Settings

#### Option B: Manual Installation from .pbw File
1. Download the latest `.pbw` file from the [Releases](../../releases) page
2. Open the file with your Pebble app
3. The watchface will automatically install to your watch
4. Tap on the watchface in the Pebble app to access Settings

## ⚙️ Configuration

### Required Setup

#### 1. Get Your Google Gemini API Key

The watchface uses Google's Gemini AI for weather parsing, gospel summarization, and spiritual leader quotes. Here's how to get your free API key:

1. **Visit Google AI Studio**: Go to [https://ai.google.dev/aistudio](https://ai.google.dev/aistudio)

2. **Sign In**: Use your Google account to sign in

3. **Get API Key**:
   - Click on "Get API key" in the left sidebar
   - Click "Create API key in new project" (or select an existing project)
   - Copy your API key

4. **Enter in Settings**:
   - Open the Pebble app on your phone
   - Go to Watchfaces → Word Of The Lord → Settings
   - Paste your API key into the "Gemini API Key" field
   - Tap "Save"

> **Note**: Gemini API offers a generous free tier. For typical usage with this watchface (a few API calls per day), you should stay well within the free limits.

#### 2. Set Your Location

Enter your zip code in the settings to get accurate weather information for your area.

### Optional Configuration

#### Gospel Display Options

**Enable Shake to Advance** (Default: ON)
- **ON**: Gospel text is divided into chunks. Shake your watch to read the next part.
- **OFF**: Gemini AI creates a concise summary that fits on one screen (max 128 characters).

#### Scripture Source

**Daily Gospel** (Default)
- Automatically fetches today's Gospel from the USCCB liturgical calendar
- Updates daily at 2:00 AM

**Custom Scripture**
- Choose your own Bible passage:
  - **Book**: Select from all 73 Catholic Bible books
  - **Chapter**: Enter chapter number (1-150)
  - **Starting Verse**: Enter verse number
  - **Ending Verse**: Optional - leave blank for single verse
- Example: John 3:16-17

#### Spiritual Leader Quote Mode

**Show Spiritual Leader Quotes** (Default: OFF)
- **ON**: Replaces daily Gospel with quotes from your specified spiritual leader
- **OFF**: Shows daily Gospel or custom scripture

**Spiritual Leader Name**
- Enter the name of your preferred spiritual leader
- Examples: "Pope Francis", "St. Teresa of Calcutta", "C.S. Lewis", "St. Augustine"
- The AI will auto-correct common spelling variations
- Leave blank to use Gospel mode

## 📱 Usage

### Basic Operation

1. **View Time & Weather**: The current time, date, and temperature are always visible at the top
2. **Read Scripture**: The main text area displays the scripture or quote
3. **Check Progress**: The bottom shows the reference and part number (if applicable)

### Shake to Advance (When Enabled)

1. Shake your Pebble watch
2. The next scripture chunk will appear
3. The part indicator updates (e.g., "2/5" → "3/5")
4. When you reach the end, it cycles back to the beginning

### Automatic Updates

- **Weather**: Updates every hour
- **Scripture Chunks**: Rotate hourly (when shake is enabled)
- **Daily Content**: New Gospel/quote loads at 2:00 AM
- **Settings Changes**: Content refreshes immediately when you change settings

## 🛠️ Technical Details

### APIs Used

1. **Universalis API**: Daily Gospel readings
   - Direct JSON parsing (no AI required)
   - Source: [universalis.com](https://universalis.com)

2. **Bible API**: Custom scripture passages
   - Translation: Douay-Rheims (Bible)
   - Source: [bible-api.com](https://bible-api.com)

3. **Gemini AI API**: Intelligent processing
   - Gospel summarization (when shake is off)
   - Weather data parsing
   - Spiritual leader quote retrieval with smart name matching

4. **Kids Weather Report**: Weather data source
   - Parsed by Gemini AI for temperature extraction

### Data Caching

- **Weather**: Cached for 1 hour on your phone
- **Gospel/Quotes**: Cached for the day, refreshes at 2 AM
- **Custom Scripture**: Cached until you change settings
- **Quote History**: Up to 2 years of quotes stored to prevent duplicates

### Character Limits

- **Scripture Text Buffer**: 128 characters (watchface memory)
- **Chunk Size** (Shake ON): ~120 characters per chunk
- **Summary Size** (Shake OFF): Max 128 characters
- **Quote Size**: Max 120 characters

### Supported Pebble Models

- ✅ Pebble (Aplite)
- ✅ Pebble Steel
- ✅ Pebble Time (Basalt)
- ✅ Pebble Time Steel (Diorite)
- ✅ Pebble Time 2 (Emery)

## 🎨 Display Layout

```
┌────────────────────────────────────┐
│ 10:45 AM                           │  Time
├────────────────────────────────────┤
│ Tuesday the 28th at 72°F           │  Date & Weather
├────────────────────────────────────┤
│ Whoever is patient has             │  Scripture/Quote
│ great understanding, but one       │  (Multi-line,
│ who is quick-tempered displays     │   wrapping text)
│ folly.                             │
│ Prov 14:29 - 1/6                   │  Reference & Part
└────────────────────────────────────┘
```

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/jwuerz/words-of-the-lord.git
cd words-of-the-lord/myfirstproject

# Install dependencies
npm install

# Build for all platforms
pebble build
```

### Project Structure

```
myfirstproject/
├── src/
│   ├── c/                    # C code for watchface
│   │   └── myfirstproject.c  # Main watchface logic
│   └── pkjs/                 # JavaScript code (PebbleKit JS)
│       ├── index.js          # API calls, data fetching
│       └── config.js         # Settings UI (Clay)
├── resources/                # Images, fonts, etc.
├── package.json              # App metadata & message keys
└── wscript                   # Build configuration
```

## 📝 Message Keys (AppMessage Communication)

The watchface uses the following message keys for phone ↔ watch communication:

- `WEATHER_TEMP`: Temperature string
- `SCRIPTURE_TEXT`: Scripture/quote text
- `SCRIPTURE_REF`: Book reference or attribution
- `SCRIPTURE_PART_CURRENT`: Current chunk number
- `SCRIPTURE_PART_TOTAL`: Total number of chunks
- `REQUEST_NEXT_CHUNK`: Manual navigation trigger
- `ENABLE_SHAKE`: Shake toggle setting
- `SCRIPTURE_SOURCE`: Daily gospel vs custom
- `CUSTOM_BOOK`: Custom scripture book
- `CUSTOM_CHAPTER`: Custom scripture chapter
- `CUSTOM_VERSE_START`: Custom scripture starting verse
- `CUSTOM_VERSE_END`: Custom scripture ending verse
- `QUOTE_MODE_ENABLED`: Spiritual leader quote mode
- `SPIRITUAL_LEADER_NAME`: Name of spiritual leader

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source. Please check the repository for license details.

## 🙏 Acknowledgments

- **Universalis**: For providing free Catholic liturgical calendar API
- **Bible API**: For making scripture accessible via API
- **Google Gemini**: For AI-powered summarization and intelligent parsing
- **Pebble Community**: For keeping the Pebble ecosystem alive

## ❓ Troubleshooting

### Weather Shows "N/A"
- Verify your Gemini API key is entered correctly
- Check that your zip code is valid
- Ensure your phone has internet connection

### Scripture Shows Default Proverbs 14:29
- Verify your Gemini API key is entered correctly
- Check your phone's internet connection
- Try refreshing by changing and saving settings

### Quote Mode Shows "Quote error - Check settings"
- Verify the spiritual leader name is spelled correctly
- Ensure the person is a recognized Christian/Catholic figure
- Try a different leader name
- Check that your Gemini API key is valid

### Shake Doesn't Advance Scripture
- Check that "Enable Shake to Advance" is turned ON in settings
- Ensure you're shaking the watch with enough force

### Custom Scripture Not Loading
- Verify book name, chapter, and verse numbers are valid
- Check that the verse range exists in the selected book
- Try a different passage to isolate the issue

---

**Enjoy staying connected to your faith throughout the day! 🙏**
