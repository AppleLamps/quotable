# Quote Scribe Reflect

A vanilla HTML/CSS/JS implementation of a quote generation and reflection app, inspired by the original React/TypeScript version. This version uses only plain HTML, CSS, and JavaScript with no frameworks or build tools.

## Features

- **AI-Powered Quote Generation**: Generate insightful quotes using OpenRouter's Google Gemini 2.5 Pro model
- **Quote Management**: Save, favorite, and delete quotes
- **Reflection System**: Write and store reflections on your favorite quotes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatically adapts to system preferences
- **Local Storage**: All data is stored locally in your browser
- **API Key Management**: Securely store and manage your OpenRouter API key

## Quick Start

1. **Get an API Key**:
   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Sign up for a free account
   - Generate an API key (starts with `sk-or-`)

2. **Open the App**:
   - Simply open `index.html` in your web browser
   - No server setup or installation required

3. **Configure API Key**:
   - Go to the **Settings** section
   - Enter your OpenRouter API key
   - Click **Save Key**
   - Click **Test Key** to verify it works

## Usage

### Adding Quotes
- **Generate**: Click "Generate Quote" to create AI-powered quotes
- **Manual Entry**: Type or paste your own quotes in the text area
- **Save**: Click "Save Quote" to store quotes locally

### Managing Quotes
- **Copy**: Click the 📋 icon to copy a quote to clipboard
- **Favorite**: Click the ⭐/☆ icon to add/remove from favorites
- **Delete**: Click the 🗑️ icon to permanently remove a quote

### Reflections
- Select a quote from the dropdown
- Write your thoughts and reflections
- Save to link your reflection to the quote

### Settings
- Update your API key anytime
- Test your API key connection
- Delete your API key if needed

## File Structure

```
quote-new/
├── index.html          # Main HTML structure
├── css/
│   ├── style.css       # Main styles (inspired by shadcn-ui)
│   └── responsive.css  # Responsive design and dark mode
├── js/
│   ├── main.js         # Main application logic
│   ├── api.js          # OpenRouter API integration
│   ├── storage.js      # LocalStorage management
│   └── utils.js        # Utility functions
└── README.md           # This file
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Configuration

The app uses OpenRouter API with Google Gemini 2.5 Pro model. You can customize:

- **Model**: Edit `js/api.js` to change the model
- **Prompts**: Modify the system prompts in `js/api.js`
- **Temperature**: Adjust creativity level (0.0-1.0)

## Local Storage

Data is stored in your browser's localStorage with these keys:
- `quote_scribe_api_key`: Your OpenRouter API key
- `quote_scribe_quotes`: All saved quotes
- `quote_scribe_favorites`: Favorite quote IDs
- `quote_scribe_reflections`: All reflections

## Privacy & Security

- **Local Storage Only**: All data stays on your device
- **API Key Security**: API key is stored locally and never transmitted elsewhere
- **No Tracking**: No analytics or external requests except to OpenRouter

## Troubleshooting

### API Key Issues
- Ensure your key starts with `sk-or-`
- Check that you have credits in your OpenRouter account
- Verify your internet connection

### Local Storage Issues
- Check browser settings allow localStorage
- Try clearing browser data and re-entering API key
- Use browser dev tools to inspect localStorage

### Display Issues
- Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for JavaScript errors
- Ensure all files are in the same directory

## Development

To modify or extend the app:

1. **Styling**: Edit CSS variables in `css/style.css`
2. **API**: Modify prompts and settings in `js/api.js`
3. **Storage**: Add new data types in `js/storage.js`
4. **UI**: Update layouts in `index.html`

## License

This is a recreation of the original Quote Scribe Reflect app for educational purposes. All original code is vanilla HTML/CSS/JS and is provided as-is.

## Support

For issues with:
- **API Key**: Contact [OpenRouter Support](https://openrouter.ai/support)
- **App Bugs**: Check browser console for errors
- **Feature Requests**: Modify the code as needed
