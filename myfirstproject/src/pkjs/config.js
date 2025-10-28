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
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];