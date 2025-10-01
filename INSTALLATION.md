# Installation and Testing Guide

## How to Install the Extension

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/shivasai7775/ai-content-detector-extension.git
   cd ai-content-detector-extension
   ```

2. **Load Extension in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the repository folder

3. **Verify Installation**
   - You should see the AI Content Detector extension icon in your browser toolbar
   - The extension icon shows a shield with "AI" text

## How to Use the Extension

### Opening the Dashboard
- Click the extension icon in your browser toolbar
- The popup dashboard will appear

### Scanning a Webpage
1. Navigate to any webpage with text content
2. Click the extension icon
3. Click the "🔍 Scan Page" button
4. Wait 2-3 seconds for analysis to complete
5. View the detection results in the dashboard

### Understanding the Results

#### Detection Summary
- **AI Content %**: Percentage of content detected as AI-generated
- **Human Content %**: Percentage of content detected as human-written
- **Confidence**: Detection confidence level (Low/Medium/High)
- **Words Analyzed**: Total number of words analyzed

#### Security Alerts
- **Green (Success)**: Low AI content, likely human-written
- **Yellow (Warning)**: Moderate AI content detected
- **Red (Danger)**: High AI content detected

#### Risk Assessment
- **Low Risk**: 0-39% AI content
- **Medium Risk**: 40-69% AI content
- **High Risk**: 70-100% AI content

### Blockchain Verification
1. After scanning, click "🔐 Verify Content"
2. Wait for verification to complete
3. View the blockchain hash and timestamp

### Exporting Logs
1. Click "📥 Export Logs"
2. A JSON file will be downloaded with all detection data
3. File includes timestamps, statistics, and alerts

### Clearing Data
1. Click "🗑️ Clear Data"
2. Confirm the action
3. All stored data will be reset

## Testing the Extension

### Test with Different Webpages
Try the extension on various types of content:

1. **News Articles**: Test on CNN, BBC, or local news sites
2. **Blog Posts**: Personal blogs, Medium articles
3. **Wikipedia Pages**: Educational content
4. **Product Descriptions**: E-commerce sites
5. **AI-Generated Content**: Test on known AI-generated text

### Expected Behavior

#### For Human-Written Content
- Low AI percentage (0-30%)
- High human percentage (70-100%)
- Risk level: Low
- Alert: "Content appears to be primarily human-written"

#### For AI-Generated Content
- High AI percentage (70-100%)
- Low human percentage (0-30%)
- Risk level: High
- Alert: "High AI Content Detected"

## Troubleshooting

### Extension Not Loading
- Make sure you selected the correct folder (containing manifest.json)
- Check that Developer mode is enabled
- Try reloading the extension

### Scan Button Not Working
- Refresh the webpage you want to analyze
- Make sure the page has loaded completely
- Check browser console for errors (F12 → Console tab)

### No Data Displayed
- Click the Scan Page button to analyze content
- Make sure you're on a page with text content
- The extension won't work on blank tabs or browser internal pages

## Development and Testing

### Testing Outside Extension Context
The popup can be tested in a regular browser tab:
```bash
cd ai-content-detector-extension
python3 -m http.server 8080
```
Then open: `http://localhost:8080/popup.html`

Note: Some features (like actual page scanning) require the full extension context.

## Browser Compatibility

- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (v88+)
- ✅ Brave Browser
- ✅ Opera (v74+)
- ⚠️ Firefox (requires manifest.json adjustments)

## Privacy & Security

- No data is sent to external servers
- All analysis happens locally in your browser
- No personal information is collected
- Storage is local to your browser only

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: shivasai7775@example.com
