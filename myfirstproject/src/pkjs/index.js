// Clay configuration for Pebble settings
var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

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
  if (newSettings.GEMINI_API_KEY !== undefined) {
    settings.geminiApiKey = newSettings.GEMINI_API_KEY;
    localStorage.setItem('geminiApiKey', settings.geminiApiKey);
    console.log('Gemini API Key saved');
  }
  if (newSettings.ZIP_CODE !== undefined) {
    settings.zipCode = newSettings.ZIP_CODE;
    localStorage.setItem('zipCode', settings.zipCode);
    console.log('Zip Code saved:', settings.zipCode);
  }
}

Pebble.addEventListener('ready', function() {
  console.log('Pebble app ready');
  loadSettings();
});

// Listen for settings changes from Clay
Pebble.addEventListener('webviewclosed', function(e) {
  if (e && e.response) {
    var newSettings = JSON.parse(decodeURIComponent(e.response));
    console.log('Settings received:', newSettings);
    saveSettings(newSettings);
    
    // TODO: Trigger weather and scripture updates when settings are saved
    // This will be implemented in Phase 3 and Phase 4
  }
});