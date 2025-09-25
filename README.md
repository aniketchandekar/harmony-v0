<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Harmony - AI-Powered UI Analysis with Web Platform Features

Harmony is an AI-powered dashboard that analyzes uploaded UI designs and provides detailed implementation plans with web platform baseline badges and browser compatibility information.

## ✨ Features

- **🤖 AI-Powered Analysis**: Upload UI designs and get detailed implementation plans using Google's Gemini AI
- **🏷️ Baseline Badges**: See which web features are "Baseline" (widely supported) vs "Not Baseline"
- **🌐 Browser Support**: Visual indicators showing Chrome, Firefox, Safari, and Edge compatibility
- **📱 Rolling Tabs**: Horizontal scrolling tabs for easy navigation through multiple analysis sections
- **📝 User Notes**: Add custom requirements and preferences that get incorporated into the AI analysis
- **📊 Sidebar Status**: Green checkmarks for sections where all features are Baseline, warning triangles for attention areas
- **🔍 Smart Filters & Sort**: Filter by feature groups, tags, security requirements, and experimental status; sort by relevance, support breadth, Baseline status, or gaps
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎯 Web Platform Features

Each analysis section displays detected web platform features with comprehensive metadata:

- **Baseline Status Badges**: Green (Baseline), Yellow (Not Baseline), Gray (Unknown)
- **Browser Support Pills**: Individual browser compatibility indicators with version numbers
- **Rich Metadata**: Experimental flags, deprecated warnings, security requirements, permissions
- **Interactive Filters**: Group by CSS/HTML/JS/PWA categories, filter by tags, security context, experimental status
- **Sorting Options**: Relevance, support breadth, Baseline-first, Baseline year, or most browser gaps first
- **External Links**: Direct links to MDN docs, specifications, explainers, and Web Platform Tests
- **Baseline Timeline**: Shows the year features entered Baseline and current browser gaps

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up your Gemini API key:**
   Create a `.env.local` file in the project root:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🎨 How to Use

1. **Upload a Design**: Click the upload area or drag & drop an image file (PNG, JPG, WEBP under 4MB)
2. **Add Context (Optional)**: Use the "Any additional details?" text box to specify requirements, constraints, or preferences
3. **Analyze**: Click "Analyze Design" to get AI-powered implementation suggestions
4. **Explore Results**:
   - Navigate through analysis sections using the rolling tabs
   - Look for green checkmarks (all features Baseline) or warning triangles (needs attention) in the sidebar
   - Use filters to focus on specific feature groups, tags, or requirements
   - Sort features by relevance, support breadth, Baseline status, or browser gaps
5. **Check Web Features**: View baseline badges, browser support, and access external documentation links

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash API
- **Build Tool**: Vite
- **Web Features**: Custom baseline status detection
- **Styling**: Responsive design with dark mode support

## 📋 Project Structure

```
├── components/
│   ├── AnalysisDisplay.tsx    # Main analysis results with filters, sorting, and sidebar indicators
│   ├── BaselineBadges.tsx     # Web platform feature badges with rich metadata
│   ├── FileUpload.tsx         # Image upload interface with user notes input
│   ├── Header.tsx             # App header with theme toggle
│   └── Icons.tsx              # SVG icon components
├── services/
│   ├── geminiService.ts       # Google Gemini AI integration with user notes support
│   ├── webFeaturesService.ts  # Web platform baseline detection and metadata
│   └── webFeaturesData.ts     # Curated web features dataset
├── App.tsx                    # Main application component with notes persistence
└── index.tsx                  # Application entry point
```

## 🌐 Demo Features

The app includes comprehensive web platform features with rich metadata:

- **CSS Features**: Grid Layout, Flexbox, Container Queries, Custom Properties, Aspect Ratio
- **JavaScript APIs**: Fetch, WebSocket, Service Workers, AbortController, Clipboard API
- **PWA Features**: Web App Manifest, Web Share API, Cache Storage
- **Security**: Content Security Policy, Permissions API, WebAuthn, Cross-Origin Headers
- **Media & Graphics**: WebCodecs, WebGPU, OffscreenCanvas, Web Components
- **Modern APIs**: View Transitions, Navigation API, Element Internals, ResizeObserver

Each feature includes:

- Baseline status and year (if applicable)
- Browser support matrix with version numbers
- Metadata flags (experimental, deprecated, behind flags, secure context, permissions)
- Links to MDN docs, specifications, explainers, and Web Platform Tests
- Feature grouping and tagging for easy discovery

## 🔧 API Configuration

The app uses Vite to inject environment variables and persists user preferences:

- `GEMINI_API_KEY` → `process.env.API_KEY` in the browser
- Configured in `vite.config.ts` for secure client-side access
- User notes are automatically saved to localStorage for convenience
- Theme preference is persisted across sessions

## 📱 Browser Support

Harmony itself supports all modern browsers. The baseline badges show compatibility for individual web platform features being analyzed.

---

**View in AI Studio**: https://ai.studio/apps/drive/1AwOW6wFAmuplXUCesrWf_M4DHySWvuk5
