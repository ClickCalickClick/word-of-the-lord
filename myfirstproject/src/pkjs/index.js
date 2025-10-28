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

// Fetch weather from Gemini API
function fetchWeather() {
  if (!settings.geminiApiKey || !settings.zipCode) {
    console.log('Cannot fetch weather: missing API key or zip code');
    console.log('API Key present:', !!settings.geminiApiKey);
    console.log('Zip Code:', settings.zipCode);
    sendWeatherToWatch('N/A');
    return;
  }
  
  console.log('Fetching weather for zip code:', settings.zipCode);
  
  var prompt = 'What is the current temperature in Fahrenheit for zip code ' + 
               settings.zipCode + '? Respond with ONLY the temperature number followed by F, ' +
               'nothing else. Example: 65F';
  
  console.log('Gemini prompt:', prompt);
  
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + 
            settings.geminiApiKey;
  
  console.log('API URL (without key):', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent');
  
  var body = JSON.stringify({
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  });
  
  console.log('Making API request...');
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
  .then(function(response) {
    console.log('API response status:', response.status);
    if (!response.ok) {
      throw new Error('API request failed: ' + response.status);
    }
    return response.json();
  })
  .then(function(data) {
    console.log('Gemini API response received:', JSON.stringify(data));
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      
      var temperature = data.candidates[0].content.parts[0].text.trim();
      console.log('Temperature extracted:', temperature);
      sendWeatherToWatch(temperature);
    } else {
      console.log('Unexpected API response format');
      sendWeatherToWatch('N/A');
    }
  })
  .catch(function(error) {
    console.log('Weather fetch error:', error.message || error.toString());
    sendWeatherToWatch('N/A');
  });
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
  
  // Fetch weather on startup if settings are available
  if (settings.geminiApiKey && settings.zipCode) {
    fetchWeather();
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
  }
});

// Fetch weather every hour
setInterval(function() {
  fetchWeather();
}, 60 * 60 * 1000); // 60 minutes