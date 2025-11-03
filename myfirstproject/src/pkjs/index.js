// Clay configuration for Pebble settings
console.log('[INIT] Loading Clay...');
var Clay = require('pebble-clay');
console.log('[INIT] Clay loaded');
var clayConfig = require('./config');
console.log('[INIT] Config loaded, items:', clayConfig.length);
var clay = new Clay(clayConfig, function(minified) {
  var clayConfig = this;
  
  console.log('[Clay Custom Function] Initializing...');
  console.log('[Clay Custom Function] clayConfig available:', !!clayConfig);
  console.log('[Clay Custom Function] EVENTS:', clayConfig.EVENTS);
  
  // Function to update visibility based on quote mode
  function updateQuoteModeVisibility() {
    console.log('[Clay] updateQuoteModeVisibility called');
    var quoteModeItem = clayConfig.getItemByMessageKey('QUOTE_MODE_ENABLED');
    console.log('[Clay] quoteModeItem:', quoteModeItem);
    
    if (!quoteModeItem) {
      console.log('[Clay] ERROR: quoteModeItem not found!');
      return;
    }
    
    var quoteEnabled = quoteModeItem.get();
    console.log('[Clay] Quote mode enabled:', quoteEnabled);
    
    // Show/hide spiritual leader name based on quote mode
    var leaderNameItem = clayConfig.getItemByMessageKey('SPIRITUAL_LEADER_NAME');
    console.log('[Clay] leaderNameItem:', leaderNameItem);
    
    if (leaderNameItem) {
      if (quoteEnabled) {
        console.log('[Clay] Showing leader name field');
        leaderNameItem.show();
      } else {
        console.log('[Clay] Hiding leader name field');
        leaderNameItem.hide();
      }
    }
    
    // Show/hide gospel-specific items when quote mode is off
    var shakeItem = clayConfig.getItemByMessageKey('ENABLE_SHAKE');
    var scriptureSourceItem = clayConfig.getItemByMessageKey('SCRIPTURE_SOURCE');
    var customBookItem = clayConfig.getItemByMessageKey('CUSTOM_BOOK');
    var customChapterItem = clayConfig.getItemByMessageKey('CUSTOM_CHAPTER');
    var customVerseStartItem = clayConfig.getItemByMessageKey('CUSTOM_VERSE_START');
    var customVerseEndItem = clayConfig.getItemByMessageKey('CUSTOM_VERSE_END');
    
    console.log('[Clay] Gospel items found:', {
      shake: !!shakeItem,
      scriptureSource: !!scriptureSourceItem,
      customBook: !!customBookItem,
      customChapter: !!customChapterItem,
      customVerseStart: !!customVerseStartItem,
      customVerseEnd: !!customVerseEndItem
    });
    
    if (quoteEnabled) {
      // Hide all gospel-related items
      console.log('[Clay] Hiding all gospel items');
      if (shakeItem) shakeItem.hide();
      if (scriptureSourceItem) scriptureSourceItem.hide();
      if (customBookItem) customBookItem.hide();
      if (customChapterItem) customChapterItem.hide();
      if (customVerseStartItem) customVerseStartItem.hide();
      if (customVerseEndItem) customVerseEndItem.hide();
    } else {
      // Show gospel items
      console.log('[Clay] Showing gospel items');
      if (shakeItem) shakeItem.show();
      if (scriptureSourceItem) scriptureSourceItem.show();
      updateCustomScriptureVisibility();
    }
  }
  
  // Function to update visibility of custom scripture fields
  function updateCustomScriptureVisibility() {
    console.log('[Clay] updateCustomScriptureVisibility called');
    var scriptureSourceItem = clayConfig.getItemByMessageKey('SCRIPTURE_SOURCE');
    
    if (!scriptureSourceItem) {
      console.log('[Clay] ERROR: scriptureSourceItem not found!');
      return;
    }
    
    var customSelected = scriptureSourceItem.get() === 'custom';
    console.log('[Clay] Custom scripture selected:', customSelected);
    
    var customBookItem = clayConfig.getItemByMessageKey('CUSTOM_BOOK');
    var customChapterItem = clayConfig.getItemByMessageKey('CUSTOM_CHAPTER');
    var customVerseStartItem = clayConfig.getItemByMessageKey('CUSTOM_VERSE_START');
    var customVerseEndItem = clayConfig.getItemByMessageKey('CUSTOM_VERSE_END');
    
    if (customSelected) {
      console.log('[Clay] Showing custom scripture fields');
      if (customBookItem) customBookItem.show();
      if (customChapterItem) customChapterItem.show();
      if (customVerseStartItem) customVerseStartItem.show();
      if (customVerseEndItem) customVerseEndItem.show();
    } else {
      console.log('[Clay] Hiding custom scripture fields');
      if (customBookItem) customBookItem.hide();
      if (customChapterItem) customChapterItem.hide();
      if (customVerseStartItem) customVerseStartItem.hide();
      if (customVerseEndItem) customVerseEndItem.hide();
    }
  }
  
  // Listen for changes after the config is built
  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function() {
    console.log('[Clay] AFTER_BUILD event fired');
    
    var quoteModeItem = clayConfig.getItemByMessageKey('QUOTE_MODE_ENABLED');
    var scriptureSourceItem = clayConfig.getItemByMessageKey('SCRIPTURE_SOURCE');
    
    console.log('[Clay] Items found after build:', {
      quoteMode: !!quoteModeItem,
      scriptureSource: !!scriptureSourceItem
    });
    
    // Set initial visibility
    console.log('[Clay] Setting initial visibility...');
    updateQuoteModeVisibility();
    
    // Listen for quote mode changes
    if (quoteModeItem) {
      console.log('[Clay] Attaching change listener to QUOTE_MODE_ENABLED');
      quoteModeItem.on('change', function() {
        console.log('[Clay] QUOTE_MODE_ENABLED changed');
        updateQuoteModeVisibility();
      });
    }
    
    // Listen for scripture source changes
    if (scriptureSourceItem) {
      console.log('[Clay] Attaching change listener to SCRIPTURE_SOURCE');
      scriptureSourceItem.on('change', function() {
        console.log('[Clay] SCRIPTURE_SOURCE changed');
        updateCustomScriptureVisibility();
      });
    }
    
    console.log('[Clay] Custom function initialization complete');
  });
});

var messageKeys = require('message_keys');

// Store settings globally
var settings = {
  geminiApiKey: '',
  zipCode: '',
  enableShake: true,  // Default: shake to advance is enabled
  scriptureSource: 'daily',  // 'daily' or 'custom'
  customBook: 'John',
  customChapter: 3,
  customVerseStart: 16,
  customVerseEnd: null,  // null means single verse
  quoteModeEnabled: false,  // false = daily gospel, true = spiritual leader quote
  spiritualLeaderName: ''  // Name of spiritual leader for quotes
};

// Store gospel data
var gospelData = {
  verses: [],
  reference: '',
  currentIndex: 0,
  totalParts: 0,
  hasStarted: false,  // Track if we've started reading today's gospel
  lastFetchDate: null  // Track when we last fetched the gospel
};

// Store weather cache
var weatherCache = {
  temperature: null,
  timestamp: null
};

// Store summarized gospel cache
var summarizedGospel = {
  summary: '',
  reference: '',
  fetchDate: null
};

// Store spiritual leader quote cache
var quoteCache = {
  quote: '',
  attribution: '',
  year: '',
  fetchDate: null
};

// Store quote history (to avoid repeats)
var quoteHistory = {
  quotes: [],  // Array of quote snippets (first 50 chars)
  maxAge: 730  // Keep quotes for 2 years (730 days)
};

// Load settings from localStorage
function loadSettings() {
  if (localStorage.getItem('geminiApiKey')) {
    settings.geminiApiKey = localStorage.getItem('geminiApiKey');
  }
  if (localStorage.getItem('zipCode')) {
    settings.zipCode = localStorage.getItem('zipCode');
  }
  if (localStorage.getItem('enableShake') !== null) {
    settings.enableShake = localStorage.getItem('enableShake') === 'true';
  }
  if (localStorage.getItem('scriptureSource')) {
    settings.scriptureSource = localStorage.getItem('scriptureSource');
  }
  if (localStorage.getItem('customBook')) {
    settings.customBook = localStorage.getItem('customBook');
  }
  if (localStorage.getItem('customChapter')) {
    settings.customChapter = parseInt(localStorage.getItem('customChapter'));
  }
  if (localStorage.getItem('customVerseStart')) {
    settings.customVerseStart = parseInt(localStorage.getItem('customVerseStart'));
  }
  if (localStorage.getItem('customVerseEnd')) {
    var endVerse = localStorage.getItem('customVerseEnd');
    settings.customVerseEnd = endVerse ? parseInt(endVerse) : null;
  }
  
  // Load quote mode settings
  if (localStorage.getItem('quoteModeEnabled') !== null) {
    settings.quoteModeEnabled = localStorage.getItem('quoteModeEnabled') === 'true';
  }
  if (localStorage.getItem('spiritualLeaderName')) {
    settings.spiritualLeaderName = localStorage.getItem('spiritualLeaderName');
  }
  
  // Load weather cache
  if (localStorage.getItem('weatherTemp')) {
    weatherCache.temperature = localStorage.getItem('weatherTemp');
  }
  if (localStorage.getItem('weatherTime')) {
    weatherCache.timestamp = parseInt(localStorage.getItem('weatherTime'));
  }
  
  // Load summarized gospel cache
  if (localStorage.getItem('summarizedGospelText')) {
    summarizedGospel.summary = localStorage.getItem('summarizedGospelText');
  }
  if (localStorage.getItem('summarizedGospelRef')) {
    summarizedGospel.reference = localStorage.getItem('summarizedGospelRef');
  }
  if (localStorage.getItem('summarizedGospelDate')) {
    summarizedGospel.fetchDate = localStorage.getItem('summarizedGospelDate');
  }
  
  // Load quote cache
  if (localStorage.getItem('quoteText')) {
    quoteCache.quote = localStorage.getItem('quoteText');
  }
  if (localStorage.getItem('quoteAttribution')) {
    quoteCache.attribution = localStorage.getItem('quoteAttribution');
  }
  if (localStorage.getItem('quoteYear')) {
    quoteCache.year = localStorage.getItem('quoteYear');
  }
  if (localStorage.getItem('quoteDate')) {
    quoteCache.fetchDate = localStorage.getItem('quoteDate');
  }
  
  // Load quote history
  if (localStorage.getItem('quoteHistory')) {
    try {
      quoteHistory.quotes = JSON.parse(localStorage.getItem('quoteHistory'));
    } catch(e) {
      console.log('Error loading quote history:', e);
      quoteHistory.quotes = [];
    }
  }
  
  console.log('Settings loaded:', {
    hasApiKey: settings.geminiApiKey ? 'yes' : 'no',
    zipCode: settings.zipCode || 'not set',
    enableShake: settings.enableShake,
    scriptureSource: settings.scriptureSource,
    quoteModeEnabled: settings.quoteModeEnabled,
    spiritualLeaderName: settings.spiritualLeaderName || 'not set',
    customScripture: settings.scriptureSource === 'custom' ? 
      settings.customBook + ' ' + settings.customChapter + ':' + settings.customVerseStart + 
      (settings.customVerseEnd ? '-' + settings.customVerseEnd : '') : 'n/a',
    cachedWeather: weatherCache.temperature ? weatherCache.temperature + ' (cached)' : 'none',
    cachedSummary: summarizedGospel.summary ? 'yes' : 'no',
    cachedQuote: quoteCache.quote ? 'yes' : 'no',
    quoteHistorySize: quoteHistory.quotes.length
  });
}

// Save settings to localStorage
function saveSettings(newSettings) {
  console.log('Saving settings:', JSON.stringify(newSettings));
  
  if (newSettings.GEMINI_API_KEY !== undefined) {
    // Clay returns {value: "..."} objects, extract the value
    settings.geminiApiKey = newSettings.GEMINI_API_KEY.value || newSettings.GEMINI_API_KEY;
    localStorage.setItem('geminiApiKey', settings.geminiApiKey);
    console.log('Gemini API Key saved');
  }
  if (newSettings.ZIP_CODE !== undefined) {
    // Clay returns {value: "..."} objects, extract the value
    settings.zipCode = newSettings.ZIP_CODE.value || newSettings.ZIP_CODE;
    localStorage.setItem('zipCode', settings.zipCode);
    console.log('Zip Code saved:', settings.zipCode);
  }
  if (newSettings.ENABLE_SHAKE !== undefined) {
    // Clay returns {value: true/false} for toggles
    settings.enableShake = newSettings.ENABLE_SHAKE.value !== undefined ? newSettings.ENABLE_SHAKE.value : newSettings.ENABLE_SHAKE;
    localStorage.setItem('enableShake', settings.enableShake.toString());
    console.log('Enable Shake saved:', settings.enableShake);
  }
  if (newSettings.SCRIPTURE_SOURCE !== undefined) {
    settings.scriptureSource = newSettings.SCRIPTURE_SOURCE.value || newSettings.SCRIPTURE_SOURCE;
    localStorage.setItem('scriptureSource', settings.scriptureSource);
    console.log('Scripture Source saved:', settings.scriptureSource);
  }
  if (newSettings.CUSTOM_BOOK !== undefined) {
    settings.customBook = newSettings.CUSTOM_BOOK.value || newSettings.CUSTOM_BOOK;
    localStorage.setItem('customBook', settings.customBook);
    console.log('Custom Book saved:', settings.customBook);
  }
  if (newSettings.CUSTOM_CHAPTER !== undefined) {
    var chapter = newSettings.CUSTOM_CHAPTER.value || newSettings.CUSTOM_CHAPTER;
    settings.customChapter = parseInt(chapter);
    localStorage.setItem('customChapter', settings.customChapter.toString());
    console.log('Custom Chapter saved:', settings.customChapter);
  }
  if (newSettings.CUSTOM_VERSE_START !== undefined) {
    var verseStart = newSettings.CUSTOM_VERSE_START.value || newSettings.CUSTOM_VERSE_START;
    settings.customVerseStart = parseInt(verseStart);
    localStorage.setItem('customVerseStart', settings.customVerseStart.toString());
    console.log('Custom Verse Start saved:', settings.customVerseStart);
  }
  if (newSettings.CUSTOM_VERSE_END !== undefined) {
    var verseEnd = newSettings.CUSTOM_VERSE_END.value || newSettings.CUSTOM_VERSE_END;
    if (verseEnd && verseEnd !== '') {
      settings.customVerseEnd = parseInt(verseEnd);
      localStorage.setItem('customVerseEnd', settings.customVerseEnd.toString());
      console.log('Custom Verse End saved:', settings.customVerseEnd);
    } else {
      settings.customVerseEnd = null;
      localStorage.removeItem('customVerseEnd');
      console.log('Custom Verse End cleared (single verse)');
    }
  }
  
  // Handle quote mode settings
  if (newSettings.QUOTE_MODE_ENABLED !== undefined) {
    settings.quoteModeEnabled = newSettings.QUOTE_MODE_ENABLED.value !== undefined ? 
      newSettings.QUOTE_MODE_ENABLED.value : newSettings.QUOTE_MODE_ENABLED;
    localStorage.setItem('quoteModeEnabled', settings.quoteModeEnabled.toString());
    console.log('Quote Mode Enabled saved:', settings.quoteModeEnabled);
  }
  
  if (newSettings.SPIRITUAL_LEADER_NAME !== undefined) {
    settings.spiritualLeaderName = newSettings.SPIRITUAL_LEADER_NAME.value || newSettings.SPIRITUAL_LEADER_NAME;
    localStorage.setItem('spiritualLeaderName', settings.spiritualLeaderName);
    console.log('Spiritual Leader Name saved:', settings.spiritualLeaderName);
  }
}

// Quote history management functions
function addQuoteToHistory(quote) {
  // Store first 50 characters as identifier + timestamp
  var snippet = quote.substring(0, 50);
  var entry = {
    snippet: snippet,
    timestamp: Date.now()
  };
  
  quoteHistory.quotes.push(entry);
  
  // Clean up old quotes (older than 2 years)
  var twoYearsAgo = Date.now() - (quoteHistory.maxAge * 24 * 60 * 60 * 1000);
  quoteHistory.quotes = quoteHistory.quotes.filter(function(q) {
    return q.timestamp > twoYearsAgo;
  });
  
  // Save to localStorage
  localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory.quotes));
  console.log('Quote added to history. Total quotes:', quoteHistory.quotes.length);
}

function getQuoteHistorySnippets() {
  // Return array of quote snippets for Gemini to avoid
  return quoteHistory.quotes.map(function(q) { return q.snippet; });
}

function isQuoteInHistory(quote) {
  var snippet = quote.substring(0, 50);
  return quoteHistory.quotes.some(function(q) {
    return q.snippet === snippet;
  });
}

// Parse Gemini response into quote components with verbose logging to aid debugging
function parseGeminiQuoteResponse(rawText) {
  console.log('[Gemini Parser] Starting parse');

  if (!rawText || rawText.trim() === '') {
    console.log('[Gemini Parser] Empty response payload');
    return null;
  }

  var sanitized = rawText
    .replace(/```/g, '')  // strip fenced code blocks
    .replace(/\*\*/g, '')  // drop bold markers
    .replace(/^>\s*/gm, '');  // drop blockquote markers

  var lines = sanitized
    .split(/\r?\n/)
    .map(function(line) { return line.trim(); })
    .filter(function(line) { return line.length > 0; });

  console.log('[Gemini Parser] Normalized lines:', JSON.stringify(lines));

  function extractValue(label) {
    var matchingLine = lines.find(function(line) {
      return new RegExp('^[-*\\s]*' + label + '\\s*:', 'i').test(line);
    });

    if (!matchingLine) {
      console.log('[Gemini Parser] Missing line for', label);
      return null;
    }

    var cleaned = matchingLine
      .replace(/^[-*\s]+/, '')
      .replace(new RegExp('^' + label + '\\s*:', 'i'), '')
      .trim();

    // Remove surrounding quotes if present
    cleaned = cleaned.replace(/^["'`]/, '').replace(/["'`]$/, '');

    return cleaned.trim();
  }

  var quote = extractValue('quote');
  var attribution = extractValue('attribution');
  var year = extractValue('year');

  if (!quote || !attribution || !year) {
    console.log('[Gemini Parser] Parse failure. quote:', quote, 'attribution:', attribution, 'year:', year);
    return null;
  }

  // Normalize year to digits
  var yearDigits = year.match(/\d{4}/);
  if (!yearDigits) {
    console.log('[Gemini Parser] Year missing 4-digit pattern. Raw year:', year);
    return null;
  }

  return {
    quote: quote,
    attribution: attribution,
    year: yearDigits[0]
  };
}

// Fetch spiritual leader quote from Gemini API
function fetchSpiritualLeaderQuote(forceRefresh) {
  console.log('Fetching spiritual leader quote...', forceRefresh ? '(forced)' : '');
  
  // Validate settings
  if (!settings.geminiApiKey) {
    console.log('No Gemini API key configured');
    sendDefaultScripture();
    return;
  }
  
  if (!settings.spiritualLeaderName || settings.spiritualLeaderName.trim() === '') {
    console.log('No spiritual leader name provided, falling back to daily gospel');
    settings.quoteModeEnabled = false;
    localStorage.setItem('quoteModeEnabled', 'false');
    fetchGospel();
    return;
  }
  
  // Check if we already fetched today's quote (unless forced)
  var today = new Date();
  var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  
  if (!forceRefresh && quoteCache.fetchDate === todayStr && quoteCache.quote) {
    console.log('Quote already fetched for today, using cached version');
    sendQuoteToWatch(quoteCache.quote, quoteCache.attribution, quoteCache.year);
    return;
  }
  
  console.log('Fetching quote from Gemini API for:', settings.spiritualLeaderName);
  
  // Build prompt
  var historySnippets = getQuoteHistorySnippets();
  var avoidQuotesText = historySnippets.length > 0 ? 
    '\n\nCRITICAL: You MUST avoid these previously used quotes (first 50 characters shown):\n' + 
    historySnippets.map(function(s, i) { return (i + 1) + '. ' + s; }).join('\n') : '';
  
  var prompt = 'Find a quote from "' + settings.spiritualLeaderName + '" that meets these criteria:\n\n' +
    'IMPORTANT: First identify the person even if the name has spelling errors, alternative spellings, or uses informal naming (e.g., "Pope Leo 14th" = "Pope Leo XIV", "Saint Teressa" = "Saint Teresa", "CS Lewis" = "C.S. Lewis"). Use your knowledge to match the intended person.\n\n' +
    '1. Related to Christian theology, spirituality, faith, or Catholic teaching\n' +
    '2. Maximum 120 characters in length (including punctuation)\n' +
    '3. Properly attributed with CORRECT/CANONICAL name and year\n' +
    '4. Verified to be an authentic quote from this person\n' +
    '5. If this person is living, prefer quotes from the last 12 months when possible\n' +
    '6. If this person is deceased, select any appropriate quote from their lifetime\n' +
    avoidQuotesText + '\n\n' +
    'If the name cannot be matched to ANY recognized Christian spiritual leader, theologian, pope, saint, pastor, or Catholic influencer, ' +
    'respond with: ERROR: Not a recognized spiritual leader\n\n' +
    'If no suitable quotes can be found that haven\'t been used before, respond with: ERROR: No quotes found\n\n' +
    'Format your response EXACTLY as:\n' +
    'QUOTE: [the quote text]\n' +
    'ATTRIBUTION: [Correct canonical name]\n' +
    'YEAR: [year]\n\n' +
    'Example:\n' +
    'QUOTE: Let us never forget that authentic power is service\n' +
    'ATTRIBUTION: Pope Francis\n' +
    'YEAR: 2024';
  
  var requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + 
            settings.geminiApiKey;
  console.log('Gemini API: requesting gemini-flash-latest');

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function() {
    console.log('Gemini API response status:', xhr.status);

    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        console.log('Gemini API response received');

        if (response.candidates && response.candidates[0] && 
            response.candidates[0].content && response.candidates[0].content.parts) {
          var parts = response.candidates[0].content.parts;
          var text = parts.map(function(part, index) {
            var partText = part.text || '';
            console.log('Gemini response part', index, ':', partText);
            return partText;
          }).join('\n');

          console.log('Gemini response text (combined):', text);

          // Check for errors
          if (text.indexOf('ERROR:') === 0) {
            console.log('Gemini returned error:', text);
            sendQuoteError();
            return;
          }

          var parsedQuote = parseGeminiQuoteResponse(text);

          if (parsedQuote) {
            var quote = parsedQuote.quote;
            var attribution = parsedQuote.attribution;
            var year = parsedQuote.year;

            // Validate quote length
            if (quote.length > 120) {
              console.log('Quote too long, truncating:', quote.length);
              quote = quote.substring(0, 117) + '...';
            }

            // Check if this quote is already in history
            if (!forceRefresh && isQuoteInHistory(quote)) {
              console.log('Quote already used, requesting fresh quote');
              // Try again with force refresh
              setTimeout(function() { fetchSpiritualLeaderQuote(true); }, 1000);
              return;
            }

            // Cache the quote
            quoteCache.quote = quote;
            quoteCache.attribution = attribution;
            quoteCache.year = year;
            quoteCache.fetchDate = todayStr;

            localStorage.setItem('quoteText', quote);
            localStorage.setItem('quoteAttribution', attribution);
            localStorage.setItem('quoteYear', year);
            localStorage.setItem('quoteDate', todayStr);

            // Add to history
            addQuoteToHistory(quote);

            // Send to watch
            sendQuoteToWatch(quote, attribution, year);
          } else {
            console.log('Could not parse quote from Gemini response. Raw payload logged above.');
            sendQuoteError();
          }
        } else {
          console.log('Unexpected Gemini response structure');
          sendQuoteError();
        }
      } catch(e) {
        console.log('Error parsing Gemini API response:', e);
        sendQuoteError();
      }
    } else {
      console.log('Gemini API request failed:', xhr.status, 'response:', xhr.responseText || '(empty)');
      sendQuoteError();
    }
  };

  xhr.onerror = function() {
    console.log('Network error calling Gemini API');
    sendQuoteError();
  };

  xhr.send(JSON.stringify(requestBody));
}

// Send quote to watch
function sendQuoteToWatch(quote, attribution, year) {
  console.log('Sending quote to watch:', quote);
  
  var reference = attribution + ' (' + year + ')';
  
  Pebble.sendAppMessage(
    {
      SCRIPTURE_TEXT: quote,
      SCRIPTURE_REF: reference,
      SCRIPTURE_PART_CURRENT: 1,
      SCRIPTURE_PART_TOTAL: 1
    },
    function() {
      console.log('Quote sent successfully');
    },
    function(e) {
      console.log('Failed to send quote:', JSON.stringify(e));
    }
  );
}

// Send quote error to watch
function sendQuoteError() {
  console.log('Sending quote error to watch');
  
  Pebble.sendAppMessage(
    {
      SCRIPTURE_TEXT: 'Quote error - Check settings',
      SCRIPTURE_REF: 'Settings',
      SCRIPTURE_PART_CURRENT: 1,
      SCRIPTURE_PART_TOTAL: 1
    },
    function() {
      console.log('Quote error sent successfully');
    },
    function(e) {
      console.log('Failed to send quote error:', JSON.stringify(e));
    }
  );
}

// Fetch daily gospel reading from Universalis API
function fetchGospel(forceRefresh) {
  console.log('Fetching daily gospel...', forceRefresh ? '(forced)' : '');
  
  // Check if we already fetched today's gospel (unless forced)
  var today = new Date();
  var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  
  if (!forceRefresh && gospelData.lastFetchDate === todayStr && gospelData.verses.length > 0) {
    console.log('Gospel already fetched for today, using cached version');
    return;
  }
  
  console.log('Fetching from Universalis API for:', todayStr);
  
  // Universalis API endpoint for today's mass readings
  // Format: https://universalis.com/YYYYMMDD/jsonpmass.js
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0');
  var day = String(today.getDate()).padStart(2, '0');
  var dateParam = year + month + day;
  
  var universalisUrl = 'https://universalis.com/' + dateParam + '/jsonpmass.js';
  
  console.log('Universalis URL:', universalisUrl);
  
  // Fetch the Universalis API
  var xhr = new XMLHttpRequest();
  xhr.open('GET', universalisUrl, true);
  
  xhr.onload = function() {
    console.log('Universalis API response status:', xhr.status);
    if (xhr.status === 200) {
      var responseText = xhr.responseText;
      console.log('Universalis response received, length:', responseText.length);
      
      // Parse the JSONP response (it's wrapped in a callback function)
      parseUniversalisResponse(responseText, todayStr);
    } else {
      console.log('Failed to fetch Universalis API, status:', xhr.status);
      sendDefaultScripture();
    }
  };
  
  xhr.onerror = function() {
    console.log('Universalis API network error');
    sendDefaultScripture();
  };
  
  xhr.send();
}

// Parse Universalis JSONP response and extract gospel
function parseUniversalisResponse(responseText, dateStr) {
  console.log('Parsing Universalis response...');
  
  try {
    // Remove JSONP callback wrapper to get pure JSON
    // The response is wrapped like: universalisCallback({...})
    var jsonStart = responseText.indexOf('{');
    var jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.log('Failed to find JSON in response');
      sendDefaultScripture();
      return;
    }
    
    var jsonText = responseText.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON, length:', jsonText.length);
    
    var data = JSON.parse(jsonText);
    console.log('JSON parsed successfully');
    
    // Extract gospel reading from the JSON structure
    // Universalis API uses Mass_G for the Gospel reading
    var gospel = data.Mass_G;
    
    if (!gospel) {
      console.log('Gospel not found in response structure');
      sendDefaultScripture();
      return;
    }
    
    console.log('Gospel found in response');
    
    // Extract reference and text
    var reference = gospel.source || 'Gospel';
    var fullText = gospel.text || '';
    
    // Clean up the reference (remove HTML entities and special characters)
    reference = reference.replace(/&#x?[0-9a-fA-F]+;/g, '-')  // Replace all HTML entities with dash
                        .replace(/&[a-z]+;/gi, '')             // Remove named entities like &nbsp;
                        .replace(/\u00a0/g, ' ')               // Replace non-breaking space
                        .replace(/--+/g, '-')                  // Collapse multiple dashes
                        .trim();
    
    // Clean up the text (remove HTML tags and entities)
    fullText = fullText.replace(/<[^>]*>/g, '')                // Remove HTML tags
                       .replace(/&#x?[0-9a-fA-F]+;/g, '')      // Remove ALL HTML entities (numeric and hex)
                       .replace(/&[a-z]+;/gi, ' ')             // Replace named entities with space
                       .replace(/\u00a0/g, ' ')                // Replace non-breaking space
                       .replace(/\s+/g, ' ')                   // Collapse multiple spaces
                       .trim();
    
    console.log('Gospel reference:', reference);
    console.log('Gospel text length:', fullText.length);
    
    if (!fullText || fullText.length === 0) {
      console.log('Gospel text is empty');
      sendDefaultScripture();
      return;
    }
    
    // Abbreviate book names if needed
    reference = abbreviateBookName(reference);
    
    // Check if shake is enabled - determines if we chunk or summarize
    if (!settings.enableShake) {
      // Shake disabled: Summarize gospel with Gemini
      console.log('Shake disabled - summarizing gospel');
      summarizeGospelWithGemini(fullText, reference);
      return;
    }
    
    // Shake enabled: Split into chunks for manual advancement
    console.log('Shake enabled - chunking gospel');
    var chunks = [];
    var maxChunkSize = 160;  // Increased from 120 to fit 5 lines (72px height)
    var words = fullText.split(' ');
    var currentChunk = '';
    
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      var testChunk = currentChunk ? currentChunk + ' ' + word : word;
      
      if (testChunk.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = word;
      } else {
        currentChunk = testChunk;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    console.log('Split into ' + chunks.length + ' chunks');
    
    // Store gospel data
    gospelData.verses = chunks;
    gospelData.reference = reference;
    gospelData.totalParts = chunks.length;
    gospelData.lastFetchDate = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear();
    
    // Always start at chunk 0 (first chunk) when new gospel is loaded
    gospelData.currentIndex = 0;
    gospelData.hasStarted = true;
    
    console.log('Starting at chunk: 1 (index 0)');
    console.log('Gospel cached for date: ' + gospelData.lastFetchDate);
    
    // Send current chunk to watch
    sendCurrentScripture();
    
  } catch (e) {
    console.log('Error parsing Universalis response: ' + e);
    sendDefaultScripture();
  }
}

// Abbreviate book names to fit on watch display
function abbreviateBookName(reference) {
  if (!reference) return reference;
  
  var abbreviations = {
    'Matthew': 'Matt',
    'Mark': 'Mark',
    'Luke': 'Luke',
    'John': 'John',
    'Acts': 'Acts',
    'Romans': 'Rom',
    'Corinthians': 'Cor',
    'Galatians': 'Gal',
    'Ephesians': 'Eph',
    'Philippians': 'Phil',
    'Colossians': 'Col',
    'Thessalonians': 'Thess',
    'Timothy': 'Tim',
    'Titus': 'Tit',
    'Philemon': 'Phlm',
    'Hebrews': 'Heb',
    'James': 'Jas',
    'Peter': 'Pet',
    'Jude': 'Jude',
    'Revelation': 'Rev'
  };
  
  for (var full in abbreviations) {
    if (reference.indexOf(full) !== -1) {
      reference = reference.replace(full, abbreviations[full]);
    }
  }
  
  return reference;
}

// Fetch custom scripture from Bible API (Douay-Rheims Catholic translation)
function fetchCustomScripture() {
  console.log('Fetching custom scripture:', 
    settings.customBook, settings.customChapter + ':' + settings.customVerseStart + 
    (settings.customVerseEnd ? '-' + settings.customVerseEnd : ''));
  
  // Build Bible API URL
  // Format: https://bible-api.com/john+3:16-17?translation=dra
  var passage = encodeURIComponent(settings.customBook) + '+' + 
                settings.customChapter + ':' + settings.customVerseStart;
  
  if (settings.customVerseEnd && settings.customVerseEnd > settings.customVerseStart) {
    passage += '-' + settings.customVerseEnd;
  }
  
  var bibleUrl = 'https://bible-api.com/' + passage + '?translation=dra';
  console.log('Bible API URL:', bibleUrl);
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', bibleUrl, true);
  
  xhr.onload = function() {
    console.log('Bible API response status:', xhr.status);
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        console.log('Bible API response received');
        
        var scriptureText = response.text || '';
        var reference = response.reference || '';
        
        // Clean up the text (remove verse numbers and extra whitespace)
        scriptureText = scriptureText.replace(/\[\d+\]/g, '')  // Remove [1] style verse numbers
                                    .replace(/\d+:/g, '')       // Remove 16: style verse numbers  
                                    .replace(/\s+/g, ' ')       // Collapse multiple spaces
                                    .trim();
        
        // Abbreviate book name in reference
        reference = abbreviateBookName(reference);
        
        console.log('Custom scripture loaded:', reference);
        console.log('Text length:', scriptureText.length);
        
        if (!scriptureText || scriptureText.length === 0) {
          console.log('Custom scripture text is empty');
          sendDefaultScripture();
          return;
        }
        
        // Check if shake is enabled - determines if we chunk or summarize
        if (!settings.enableShake) {
          // Shake disabled: Summarize scripture with Gemini
          console.log('Shake disabled - summarizing custom scripture');
          summarizeGospelWithGemini(scriptureText, reference);
          return;
        }
        
        // Shake enabled: Split into chunks for manual advancement
        console.log('Shake enabled - chunking custom scripture');
        var chunks = [];
        var maxChunkSize = 160;  // Increased from 120 to fit 5 lines (72px height)
        var words = scriptureText.split(' ');
        var currentChunk = '';
        
        for (var i = 0; i < words.length; i++) {
          var word = words[i];
          var testChunk = currentChunk ? currentChunk + ' ' + word : word;
          
          if (testChunk.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = word;
          } else {
            currentChunk = testChunk;
          }
        }
        
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        
        console.log('Split into ' + chunks.length + ' chunks');
        
        // Store in gospelData (reuse existing structure)
        gospelData.verses = chunks;
        gospelData.reference = reference;
        gospelData.totalParts = chunks.length;
        gospelData.currentIndex = 0;
        gospelData.hasStarted = true;
        gospelData.lastFetchDate = 'custom';  // Mark as custom scripture
        
        console.log('Custom scripture loaded, starting at chunk 1');
        
        // Send current chunk to watch
        sendCurrentScripture();
        
      } catch (e) {
        console.log('Error parsing Bible API response: ' + e);
        sendDefaultScripture();
      }
    } else {
      console.log('Bible API error, status:', xhr.status);
      sendDefaultScripture();
    }
  };
  
  xhr.onerror = function() {
    console.log('Bible API network error');
    sendDefaultScripture();
  };
  
  xhr.send();
}

// Abbreviate book names to fit on watch display
function summarizeGospelWithGemini(fullText, reference) {
  console.log('Summarizing gospel with Gemini...');
  console.log('Original text length:', fullText.length);
  
  if (!settings.geminiApiKey) {
    console.log('No Gemini API key, cannot summarize');
    sendDefaultScripture();
    return;
  }
  
  var prompt = `Condense this Gospel to max 128 characters. Use shortest words possible while keeping full meaning. Catholic theology. Sacred text.

Gospel: ${fullText}
Ref: ${reference}

Rules:
- Max 128 chars
- Smallest length of words possible
- Keep theological implications
- Reverent
- Accurate

Return summary only.`;

  var requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + settings.geminiApiKey;
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
    console.log('Gemini summarization response status:', xhr.status);
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        console.log('Gemini summarization response received');
        
        if (response.candidates && response.candidates[0] && 
            response.candidates[0].content && response.candidates[0].content.parts) {
          var summary = response.candidates[0].content.parts[0].text.trim();
          
          // Ensure summary doesn't exceed 128 characters
          if (summary.length > 128) {
            console.log('Summary too long (' + summary.length + ' chars), truncating...');
            summary = summary.substring(0, 125) + '...';
          }
          
          console.log('Gospel summarized to ' + summary.length + ' characters');
          console.log('Summary:', summary);
          
          // Cache the summary
          var today = new Date();
          var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
          
          summarizedGospel.summary = summary;
          summarizedGospel.reference = reference;
          summarizedGospel.fetchDate = todayStr;
          
          // Save to localStorage
          localStorage.setItem('summarizedGospelText', summary);
          localStorage.setItem('summarizedGospelRef', reference);
          localStorage.setItem('summarizedGospelDate', todayStr);
          
          console.log('Summary cached for date:', todayStr);
          
          // Send to watch
          sendSummarizedGospel(summary, reference);
          
        } else {
          console.log('Unexpected Gemini summarization response format');
          sendDefaultScripture();
        }
      } catch (e) {
        console.log('Error parsing Gemini summarization response: ' + e);
        sendDefaultScripture();
      }
    } else {
      console.log('Gemini summarization API error: ' + xhr.status);
      sendDefaultScripture();
    }
  };
  
  xhr.onerror = function() {
    console.log('Gemini summarization network error');
    sendDefaultScripture();
  };
  
  xhr.send(JSON.stringify(requestBody));
}

// Send summarized gospel to watch (single part, no chunks)
function sendSummarizedGospel(summary, reference) {
  console.log('Sending summarized gospel to watch');
  console.log('Summary:', summary);
  console.log('Reference:', reference);
  
  var dict = {};
  dict[messageKeys.SCRIPTURE_TEXT] = summary;
  dict[messageKeys.SCRIPTURE_REF] = reference;
  dict[messageKeys.SCRIPTURE_PART_CURRENT] = 1;
  dict[messageKeys.SCRIPTURE_PART_TOTAL] = 1;  // Only 1 part when summarized
  
  Pebble.sendAppMessage(dict, 
    function() {
      console.log('Summarized gospel sent successfully');
    },
    function(e) {
      console.log('Failed to send summarized gospel: ' + JSON.stringify(e));
    }
  );
}

// Parse Gemini gospel response and split into chunks
function parseGospelResponse(text) {
  console.log('Parsing gospel response...');
  
  // Extract reference and full text
  var refMatch = text.match(/REFERENCE:\s*([^\n]+)/i);
  var textMatch = text.match(/FULL_TEXT:\s*([\s\S]+)/i);
  
  if (!refMatch || !textMatch) {
    console.log('Failed to parse gospel format, using default');
    sendDefaultScripture();
    return;
  }
  
  var reference = refMatch[1].trim();
  var fullText = textMatch[1].trim();
  
  console.log('Reference: ' + reference);
  console.log('Full text length: ' + fullText.length);
  
  // Split into chunks of approximately 160 characters (to fit 5 lines of GOTHIC_14)
  var chunks = [];
  var maxChunkSize = 160;  // Increased from 120 to fit 5 lines (72px height)
  var words = fullText.split(' ');
  var currentChunk = '';
  
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var testChunk = currentChunk ? currentChunk + ' ' + word : word;
    
    if (testChunk.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  console.log('Split into ' + chunks.length + ' chunks');
  
  // Store gospel data
  gospelData.verses = chunks;
  gospelData.reference = reference;
  gospelData.totalParts = chunks.length;
  gospelData.lastFetchDate = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear();
  
  // Always start at chunk 0 (first chunk) when new gospel is loaded
  gospelData.currentIndex = 0;
  gospelData.hasStarted = true;
  
  console.log('Starting at chunk: 1 (index 0)');
  console.log('Gospel cached for date: ' + gospelData.lastFetchDate);
  
  // Send current chunk to watch
  sendCurrentScripture();
}

// Send the current hour's scripture chunk to watch
function sendCurrentScripture() {
  console.log('=== sendCurrentScripture called ===');
  console.log('Verses available:', gospelData.verses.length);
  console.log('Current index:', gospelData.currentIndex);
  
  if (gospelData.verses.length === 0) {
    console.log('No gospel verses available, using default');
    sendDefaultScripture();
    return;
  }
  
  var currentVerse = gospelData.verses[gospelData.currentIndex];
  var partNum = gospelData.currentIndex + 1;
  
  console.log('Sending scripture chunk ' + partNum + '/' + gospelData.totalParts);
  console.log('Text: ' + currentVerse);
  
  var dict = {};
  dict[messageKeys.SCRIPTURE_TEXT] = currentVerse;
  dict[messageKeys.SCRIPTURE_REF] = gospelData.reference;
  dict[messageKeys.SCRIPTURE_PART_CURRENT] = partNum;
  dict[messageKeys.SCRIPTURE_PART_TOTAL] = gospelData.totalParts;
  
  Pebble.sendAppMessage(dict, 
    function() {
      console.log('Scripture sent successfully');
    },
    function(e) {
      console.log('Failed to send scripture: ' + JSON.stringify(e));
    }
  );
}

// Send default fallback scripture
function sendDefaultScripture() {
  console.log('Sending default scripture');
  
  var dict = {};
  dict[messageKeys.SCRIPTURE_TEXT] = "Whoever is patient has great understanding, but one who is quick-tempered displays folly.";
  dict[messageKeys.SCRIPTURE_REF] = "Prov 14:29";
  dict[messageKeys.SCRIPTURE_PART_CURRENT] = 1;
  dict[messageKeys.SCRIPTURE_PART_TOTAL] = 1;
  
  Pebble.sendAppMessage(dict,
    function() {
      console.log('Default scripture sent successfully');
    },
    function(e) {
      console.log('Failed to send default scripture: ' + JSON.stringify(e));
    }
  );
}

// Fetch weather from Weather.com via Gemini parsing
function fetchWeather(forceRefresh) {
  if (!settings.geminiApiKey || !settings.zipCode) {
    console.log('Cannot fetch weather: missing API key or zip code');
    console.log('API Key present:', !!settings.geminiApiKey);
    console.log('Zip Code:', settings.zipCode);
    sendWeatherToWatch('N/A');
    return;
  }
  
  // Check if we have valid cached weather (< 1 hour old) unless forced refresh
  if (!forceRefresh) {
    var now = Date.now();
    var oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (weatherCache.temperature && weatherCache.timestamp && (now - weatherCache.timestamp) < oneHour) {
      console.log('Using cached weather:', weatherCache.temperature, '(age:', Math.round((now - weatherCache.timestamp) / 1000 / 60), 'minutes)');
      sendWeatherToWatch(weatherCache.temperature);
      return;
    }
  }
  
  console.log('Fetching weather for zip code:', settings.zipCode);
  
  // Kids Weather Report URL with zip code
  var weatherUrl = 'https://kidsweatherreport.com/report/' + settings.zipCode;
  
  console.log('Kids Weather Report URL:', weatherUrl);
  
  // Fetch the weather page first
  var xhr = new XMLHttpRequest();
  xhr.open('GET', weatherUrl, true);
  
  xhr.onload = function() {
    console.log('Kids Weather Report page response status:', xhr.status);
    if (xhr.status === 200) {
      var htmlContent = xhr.responseText;
      console.log('Kids Weather Report page loaded, length:', htmlContent.length);
      
      // Now use Gemini to parse the HTML and extract temperature
      parseWeatherWithGemini(htmlContent);
    } else {
      console.log('Failed to fetch Kids Weather Report page, status:', xhr.status);
      sendWeatherToWatch('N/A');
    }
  };
  
  xhr.onerror = function() {
    console.log('Kids Weather Report fetch network error');
    sendWeatherToWatch('N/A');
  };
  
  xhr.send();
}

// Use Gemini to parse Kids Weather Report HTML and extract temperature
function parseWeatherWithGemini(htmlContent) {
  console.log('Parsing weather content with Gemini...');
  
  var prompt = `Here is the HTML content from a Kids Weather Report page:

${htmlContent}

Extract the current temperature in Fahrenheit. This is a simple weather page designed for kids.

Respond with ONLY the temperature number followed by F, nothing else. Example: 65F`;

  var requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + settings.geminiApiKey;
  
  var xhr2 = new XMLHttpRequest();
  xhr2.open('POST', url, true);
  xhr2.setRequestHeader('Content-Type', 'application/json');
  
  xhr2.onload = function() {
    console.log('Gemini weather parsing response status:', xhr2.status);
    if (xhr2.status === 200) {
      try {
        var response = JSON.parse(xhr2.responseText);
        console.log('Gemini weather parsing response received');
        
        if (response.candidates && response.candidates[0] && 
            response.candidates[0].content && response.candidates[0].content.parts) {
          var temperature = response.candidates[0].content.parts[0].text.trim();
          console.log('Temperature extracted:', temperature);
          sendWeatherToWatch(temperature);
        } else {
          console.log('Unexpected Gemini weather parsing response format');
          sendWeatherToWatch('N/A');
        }
      } catch (e) {
        console.log('Error parsing Gemini weather response: ' + e);
        sendWeatherToWatch('N/A');
      }
    } else {
      console.log('Gemini weather parsing API error: ' + xhr2.status);
      sendWeatherToWatch('N/A');
    }
  };
  
  xhr2.onerror = function() {
    console.log('Gemini weather parsing network error');
    sendWeatherToWatch('N/A');
  };
  
  xhr2.send(JSON.stringify(requestBody));
}

// Send weather temperature to the watch
function sendWeatherToWatch(temperature) {
  // Update cache with new temperature
  weatherCache.temperature = temperature;
  weatherCache.timestamp = Date.now();
  
  // Save to localStorage
  localStorage.setItem('weatherTemp', temperature);
  localStorage.setItem('weatherTime', weatherCache.timestamp.toString());
  
  console.log('Weather cached and sent to watch:', temperature);
  
  var message = {};
  message[messageKeys.WEATHER_TEMP] = temperature;
  
  Pebble.sendAppMessage(message, 
    function() {
      console.log('Weather sent to watch:', temperature);
    },
    function(error) {
      console.log('Failed to send weather:', JSON.stringify(error));
    }
  );
}

// Send shake enabled setting to watch
function sendShakeSettingToWatch() {
  console.log('Sending shake setting to watch:', settings.enableShake);
  
  var dict = {};
  dict[messageKeys.ENABLE_SHAKE] = settings.enableShake ? 1 : 0;
  
  Pebble.sendAppMessage(dict, 
    function() {
      console.log('Shake setting sent to watch:', settings.enableShake);
    },
    function(e) {
      console.log('Failed to send shake setting: ' + JSON.stringify(e));
    }
  );
}

Pebble.addEventListener('ready', function() {
  console.log('Pebble app ready');
  loadSettings();
  
  // Send shake setting to watch
  sendShakeSettingToWatch();
  
  // Fetch weather on startup if settings are available
  if (settings.geminiApiKey && settings.zipCode) {
    // Check if we have valid cached weather, otherwise fetch new
    var now = Date.now();
    var oneHour = 60 * 60 * 1000;
    
    if (weatherCache.temperature && weatherCache.timestamp && (now - weatherCache.timestamp) < oneHour) {
      console.log('Using cached weather on startup:', weatherCache.temperature);
      sendWeatherToWatch(weatherCache.temperature);
    } else {
      console.log('No valid cached weather, fetching new...');
      fetchWeather();
    }
  }

  // Decide what to fetch on startup based on quote mode vs scripture
  if (settings.quoteModeEnabled) {
    console.log('Quote mode active on startup');
    if (settings.geminiApiKey && settings.spiritualLeaderName && settings.spiritualLeaderName.trim() !== '') {
      fetchSpiritualLeaderQuote();
    } else {
      console.log('Quote mode enabled but missing API key or leader name, falling back to gospel');
      // Persist fallback
      settings.quoteModeEnabled = false;
      localStorage.setItem('quoteModeEnabled', 'false');
      if (settings.scriptureSource === 'custom') {
        fetchCustomScripture();
      } else if (settings.geminiApiKey) {
        fetchGospel();
      }
    }
  } else {
    // Not in quote mode: existing scripture behavior
    if (settings.scriptureSource === 'custom') {
      console.log('Scripture source: Custom');
      fetchCustomScripture();
    } else {
      console.log('Scripture source: Daily Gospel');
      if (settings.geminiApiKey) {
        fetchGospel();
      }
    }
  }
});

// Listen for settings changes from Clay
Pebble.addEventListener('webviewclosed', function(e) {
  if (e && e.response) {
    var newSettings = JSON.parse(decodeURIComponent(e.response));
    console.log('=== SETTINGS RECEIVED ===');
    console.log('Raw settings:', JSON.stringify(newSettings));
    
    // Track changes
    var scriptureSourceChanged = newSettings.SCRIPTURE_SOURCE !== undefined;
    var customScriptureChanged = newSettings.CUSTOM_BOOK !== undefined || 
                                 newSettings.CUSTOM_CHAPTER !== undefined ||
                                 newSettings.CUSTOM_VERSE_START !== undefined ||
                                 newSettings.CUSTOM_VERSE_END !== undefined;
    var quoteModeChanged = newSettings.QUOTE_MODE_ENABLED !== undefined;
    var leaderChanged = newSettings.SPIRITUAL_LEADER_NAME !== undefined;
    
    console.log('Scripture source changed?', scriptureSourceChanged);
    console.log('Custom scripture fields changed?', customScriptureChanged);
    console.log('Quote mode changed?', quoteModeChanged);
    console.log('Leader name changed?', leaderChanged);
    
    saveSettings(newSettings);
    
    console.log('After save - settings.scriptureSource:', settings.scriptureSource);
    console.log('After save - settings.customBook:', settings.customBook);
    console.log('After save - settings.customChapter:', settings.customChapter);
    console.log('After save - settings.customVerseStart:', settings.customVerseStart);
    console.log('After save - settings.customVerseEnd:', settings.customVerseEnd);
    console.log('After save - settings.quoteModeEnabled:', settings.quoteModeEnabled);
    console.log('After save - settings.spiritualLeaderName:', settings.spiritualLeaderName);
    
    // Send updated shake setting to watch
    sendShakeSettingToWatch();
    
    // Fetch weather immediately after settings are saved (force refresh)
    fetchWeather(true);

    // If shake setting changed, re-fetch appropriate content
    if (newSettings.ENABLE_SHAKE !== undefined) {
      console.log('Shake setting changed, re-fetching content');
      if (settings.quoteModeEnabled) {
        // In quote mode, refresh quote
        fetchSpiritualLeaderQuote(true);
      } else if (settings.scriptureSource === 'custom') {
        console.log('Fetching custom scripture due to shake change');
        fetchCustomScripture();
      } else {
        console.log('Fetching daily gospel due to shake change');
        fetchGospel(true);  // Force refresh to re-process gospel
      }
    }
    // If quote mode or leader changed, handle switching/fetching
    else if (quoteModeChanged || leaderChanged) {
      if (settings.quoteModeEnabled) {
        // If enabled but no leader name provided, revert to gospel
        if (!settings.spiritualLeaderName || settings.spiritualLeaderName.trim() === '') {
          console.log('Quote mode enabled but leader name empty - reverting to gospel');
          settings.quoteModeEnabled = false;
          localStorage.setItem('quoteModeEnabled', 'false');
          if (settings.scriptureSource === 'custom') {
            fetchCustomScripture();
          } else {
            fetchGospel();
          }
        } else {
          // Valid leader provided - fetch quote
          console.log('Fetching spiritual leader quote due to settings change');
          fetchSpiritualLeaderQuote(true);
        }
      } else {
        // Quote mode turned off - switch back to scripture
        if (settings.scriptureSource === 'custom') {
          fetchCustomScripture();
        } else {
          fetchGospel();
        }
      }
    }
    // If scripture source changed or custom scripture details changed
    else if (scriptureSourceChanged || customScriptureChanged) {
      console.log('Scripture settings changed, current source is:', settings.scriptureSource);
      if (settings.scriptureSource === 'custom') {
        console.log('Fetching custom scripture');
        fetchCustomScripture();
      } else {
        console.log('Fetching daily gospel');
        // Switched to daily gospel - fetch it
        var today = new Date();
        var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
        if (gospelData.lastFetchDate !== todayStr) {
          fetchGospel();
        }
      }
    }
    // Otherwise only fetch what's needed if we don't have today's content
    else {
      console.log('No major content changes detected, checking cached content...');
      var today = new Date();
      var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
      if (settings.quoteModeEnabled) {
        if (quoteCache.fetchDate !== todayStr) {
          console.log('Fetching daily quote (no cache for today)');
          fetchSpiritualLeaderQuote();
        }
      } else if (settings.scriptureSource === 'daily') {
        if (gospelData.lastFetchDate !== todayStr) {
          console.log('Fetching daily gospel (no cache for today)');
          fetchGospel();
        }
      }
    }
    console.log('=== SETTINGS PROCESSING COMPLETE ===');
  }
});

// Fetch weather every hour
setInterval(function() {
  fetchWeather(true); // Force refresh to ignore cache
}, 60 * 60 * 1000); // 60 minutes

// Update scripture every hour (rotate to next chunk)
setInterval(function() {
  if (gospelData.verses.length > 0 && gospelData.hasStarted) {
    // Move to next chunk
    gospelData.currentIndex = (gospelData.currentIndex + 1) % gospelData.verses.length;
    console.log('Hourly rotation to chunk: ' + (gospelData.currentIndex + 1) + '/' + gospelData.totalParts);
    sendCurrentScripture();
  }
}, 60 * 60 * 1000); // 60 minutes

// Fetch new daily scripture at 2AM
setInterval(function() {
  var now = new Date();
  if (now.getHours() === 2 && now.getMinutes() === 0) {
    console.log('2AM - Refreshing daily content');
    
    // Check what mode we're in
    if (settings.quoteModeEnabled) {
      console.log('2AM - Fetching new spiritual leader quote');
      fetchSpiritualLeaderQuote(true);
    } else if (settings.scriptureSource === 'daily') {
      console.log('2AM - Fetching new daily gospel');
      fetchGospel(true);
    } else {
      console.log('2AM - Skipping refresh (custom scripture active)');
    }
  }
}, 60 * 1000); // Check every minute

// Listen for messages from the watch (e.g., shake to advance)
Pebble.addEventListener('appmessage', function(e) {
  console.log('AppMessage received from watch');
  
  // Check if this is a request for next chunk
  if (e.payload.REQUEST_NEXT_CHUNK) {
    console.log('Shake detected - advancing to next chunk');
    
    if (gospelData.verses.length > 0) {
      // Move to next chunk
      gospelData.currentIndex = (gospelData.currentIndex + 1) % gospelData.verses.length;
      console.log('Manual advance to chunk: ' + (gospelData.currentIndex + 1) + '/' + gospelData.totalParts);
      sendCurrentScripture();
    } else {
      console.log('No gospel loaded yet');
    }
  }
});