// Clay configuration for Pebble settings
var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);
var messageKeys = require('message_keys');

// Store settings globally
var settings = {
  geminiApiKey: '',
  zipCode: ''
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

// Load settings from localStorage
function loadSettings() {
  if (localStorage.getItem('geminiApiKey')) {
    settings.geminiApiKey = localStorage.getItem('geminiApiKey');
  }
  if (localStorage.getItem('zipCode')) {
    settings.zipCode = localStorage.getItem('zipCode');
  }
  console.log('Settings loaded:', {
    hasApiKey: settings.geminiApiKey ? 'yes' : 'no',
    zipCode: settings.zipCode || 'not set'
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
}

// Fetch daily gospel reading from Universalis API
function fetchGospel() {
  console.log('Fetching daily gospel...');
  
  // Check if we already fetched today's gospel
  var today = new Date();
  var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  
  if (gospelData.lastFetchDate === todayStr && gospelData.verses.length > 0) {
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
    
    // Split into chunks
    var chunks = [];
    var maxChunkSize = 120;
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
  
  // Split into chunks of approximately 120 characters (to fit 3 lines of GOTHIC_14)
  var chunks = [];
  var maxChunkSize = 120;
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
function fetchWeather() {
  if (!settings.geminiApiKey || !settings.zipCode) {
    console.log('Cannot fetch weather: missing API key or zip code');
    console.log('API Key present:', !!settings.geminiApiKey);
    console.log('Zip Code:', settings.zipCode);
    sendWeatherToWatch('N/A');
    return;
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

Pebble.addEventListener('ready', function() {
  console.log('Pebble app ready');
  loadSettings();
  
  // Fetch weather and gospel on startup if settings are available
  if (settings.geminiApiKey && settings.zipCode) {
    fetchWeather();
  }
  
  if (settings.geminiApiKey) {
    fetchGospel();
  }
});

// Listen for settings changes from Clay
Pebble.addEventListener('webviewclosed', function(e) {
  if (e && e.response) {
    var newSettings = JSON.parse(decodeURIComponent(e.response));
    console.log('Settings received:', newSettings);
    saveSettings(newSettings);
    
    // Fetch weather immediately after settings are saved
    fetchWeather();
    
    // Only fetch gospel if we don't have today's yet (in case user just added API key)
    var today = new Date();
    var todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    if (gospelData.lastFetchDate !== todayStr) {
      fetchGospel();
    }
  }
});

// Fetch weather every hour
setInterval(function() {
  fetchWeather();
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