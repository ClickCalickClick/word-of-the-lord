module.exports = [
  {
    "type": "heading",
    "defaultValue": "Catholic Daily Gospel Settings"
  },
  {
    "type": "text",
    "defaultValue": "Configure your Gemini API integration and location settings."
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Gemini API Configuration"
      },
      {
        "type": "input",
        "messageKey": "GEMINI_API_KEY",
        "label": "Gemini API Key",
        "description": "Enter your Google Gemini API key. Get one at https://makersuite.google.com/app/apikey",
        "defaultValue": "",
        "attributes": {
          "placeholder": "Enter your API key",
          "type": "text",
          "required": false
        }
      },
      {
        "type": "heading",
        "defaultValue": "Location Settings"
      },
      {
        "type": "input",
        "messageKey": "ZIP_CODE",
        "label": "Zip Code",
        "description": "Enter your zip code for weather information",
        "defaultValue": "",
        "attributes": {
          "placeholder": "e.g., 90210",
          "type": "text",
          "maxlength": "10",
          "required": false
        }
      },
      {
        "type": "heading",
        "defaultValue": "Gospel Display Options"
      },
      {
        "type": "toggle",
        "messageKey": "ENABLE_SHAKE",
        "label": "Enable Shake to Advance",
        "description": "When OFF: Gospel will be summarized by Gemini using Catholic anthropology to fit on screen (max 128 characters). Summary refreshes daily at 2 AM.",
        "defaultValue": true
      },
      {
        "type": "heading",
        "defaultValue": "Scripture Source"
      },
      {
        "type": "radiogroup",
        "messageKey": "SCRIPTURE_SOURCE",
        "label": "Choose Scripture Source",
        "defaultValue": "daily",
        "options": [
          {
            "label": "Daily Catholic Gospel",
            "value": "daily"
          },
          {
            "label": "Custom Scripture",
            "value": "custom"
          }
        ]
      },
      {
        "type": "select",
        "messageKey": "CUSTOM_BOOK",
        "label": "Book",
        "defaultValue": "John",
        "options": [
          {"label": "Genesis", "value": "Genesis"},
          {"label": "Exodus", "value": "Exodus"},
          {"label": "Leviticus", "value": "Leviticus"},
          {"label": "Numbers", "value": "Numbers"},
          {"label": "Deuteronomy", "value": "Deuteronomy"},
          {"label": "Joshua", "value": "Joshua"},
          {"label": "Judges", "value": "Judges"},
          {"label": "Ruth", "value": "Ruth"},
          {"label": "1 Samuel", "value": "1 Samuel"},
          {"label": "2 Samuel", "value": "2 Samuel"},
          {"label": "1 Kings", "value": "1 Kings"},
          {"label": "2 Kings", "value": "2 Kings"},
          {"label": "1 Chronicles", "value": "1 Chronicles"},
          {"label": "2 Chronicles", "value": "2 Chronicles"},
          {"label": "Ezra", "value": "Ezra"},
          {"label": "Nehemiah", "value": "Nehemiah"},
          {"label": "Tobit", "value": "Tobit"},
          {"label": "Judith", "value": "Judith"},
          {"label": "Esther", "value": "Esther"},
          {"label": "1 Maccabees", "value": "1 Maccabees"},
          {"label": "2 Maccabees", "value": "2 Maccabees"},
          {"label": "Job", "value": "Job"},
          {"label": "Psalms", "value": "Psalms"},
          {"label": "Proverbs", "value": "Proverbs"},
          {"label": "Ecclesiastes", "value": "Ecclesiastes"},
          {"label": "Song of Songs", "value": "Song of Songs"},
          {"label": "Wisdom", "value": "Wisdom"},
          {"label": "Sirach", "value": "Sirach"},
          {"label": "Isaiah", "value": "Isaiah"},
          {"label": "Jeremiah", "value": "Jeremiah"},
          {"label": "Lamentations", "value": "Lamentations"},
          {"label": "Baruch", "value": "Baruch"},
          {"label": "Ezekiel", "value": "Ezekiel"},
          {"label": "Daniel", "value": "Daniel"},
          {"label": "Hosea", "value": "Hosea"},
          {"label": "Joel", "value": "Joel"},
          {"label": "Amos", "value": "Amos"},
          {"label": "Obadiah", "value": "Obadiah"},
          {"label": "Jonah", "value": "Jonah"},
          {"label": "Micah", "value": "Micah"},
          {"label": "Nahum", "value": "Nahum"},
          {"label": "Habakkuk", "value": "Habakkuk"},
          {"label": "Zephaniah", "value": "Zephaniah"},
          {"label": "Haggai", "value": "Haggai"},
          {"label": "Zechariah", "value": "Zechariah"},
          {"label": "Malachi", "value": "Malachi"},
          {"label": "Matthew", "value": "Matthew"},
          {"label": "Mark", "value": "Mark"},
          {"label": "Luke", "value": "Luke"},
          {"label": "John", "value": "John"},
          {"label": "Acts", "value": "Acts"},
          {"label": "Romans", "value": "Romans"},
          {"label": "1 Corinthians", "value": "1 Corinthians"},
          {"label": "2 Corinthians", "value": "2 Corinthians"},
          {"label": "Galatians", "value": "Galatians"},
          {"label": "Ephesians", "value": "Ephesians"},
          {"label": "Philippians", "value": "Philippians"},
          {"label": "Colossians", "value": "Colossians"},
          {"label": "1 Thessalonians", "value": "1 Thessalonians"},
          {"label": "2 Thessalonians", "value": "2 Thessalonians"},
          {"label": "1 Timothy", "value": "1 Timothy"},
          {"label": "2 Timothy", "value": "2 Timothy"},
          {"label": "Titus", "value": "Titus"},
          {"label": "Philemon", "value": "Philemon"},
          {"label": "Hebrews", "value": "Hebrews"},
          {"label": "James", "value": "James"},
          {"label": "1 Peter", "value": "1 Peter"},
          {"label": "2 Peter", "value": "2 Peter"},
          {"label": "1 John", "value": "1 John"},
          {"label": "2 John", "value": "2 John"},
          {"label": "3 John", "value": "3 John"},
          {"label": "Jude", "value": "Jude"},
          {"label": "Revelation", "value": "Revelation"}
        ],
        "group": "custom_scripture"
      },
      {
        "type": "input",
        "messageKey": "CUSTOM_CHAPTER",
        "label": "Chapter",
        "defaultValue": "3",
        "attributes": {
          "placeholder": "e.g., 3",
          "type": "number",
          "min": "1",
          "max": "150"
        },
        "group": "custom_scripture"
      },
      {
        "type": "input",
        "messageKey": "CUSTOM_VERSE_START",
        "label": "Starting Verse",
        "defaultValue": "16",
        "attributes": {
          "placeholder": "e.g., 16",
          "type": "number",
          "min": "1",
          "max": "176"
        },
        "group": "custom_scripture"
      },
      {
        "type": "input",
        "messageKey": "CUSTOM_VERSE_END",
        "label": "Ending Verse (optional)",
        "defaultValue": "",
        "description": "Leave blank to select only the starting verse",
        "attributes": {
          "placeholder": "e.g., 17",
          "type": "number",
          "min": "1",
          "max": "176"
        },
        "group": "custom_scripture"
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];
