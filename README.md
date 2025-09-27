<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Harmony - AI-Powered UI Analysis with Web Platform Features

Harmony is an AI-powered dashboard that analyzes uploaded UI designs and provides detailed implementation plans with web platform baseline badges and browser compatibility information.

## ✨ Features

- **🤖 AI-Powered Analysis**: Upload UI designs and get detailed implementation plans using Google's Gemini AI
- **💬 AI Assistant Chat**: Interactive chat sidebar with feature-specific context for detailed discussions
- **🏷️ Enhanced Baseline Badges**: Complete web features metadata with timeline information and discouraged feature warnings
- **🌐 Comprehensive Browser Support**: Visual indicators showing desktop (Chrome, Firefox, Safari, Edge) and mobile (Chrome Android, Firefox Android, Safari iOS) compatibility with version numbers
- **📅 Feature Timeline**: Shows when features became "newly available" and "widely available" in Web Baseline
- **⚠️ Discouraged Features**: Clear warnings for deprecated features with recommended alternatives
- **📚 Rich Documentation Links**: Direct integration with MDN, specifications, explainers, Can I Use, and Web Platform Tests
- **🎯 Smart Feature Cards**: Click "Ask AI" on any feature for contextual assistance
- **📱 Rolling Tabs**: Horizontal scrolling tabs for easy navigation through multiple analysis sections
- **📝 User Notes**: Add custom requirements and preferences that get incorporated into the AI analysis
- **📊 Enhanced Sidebar Status**: Green checkmarks for sections where all features are Baseline, warning triangles for attention areas
- **🔍 Advanced Filters & Sort**: Filter by feature groups, tags, security requirements, experimental status, and more; sort by relevance, support breadth, Baseline status, timeline, or gaps
- **🚫 Duplicate Prevention**: Intelligent deduplication ensures each web feature appears only once
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎯 Web Platform Features

Each analysis section displays detected web platform features with comprehensive metadata:

- **Enhanced Baseline Status**: Green (Baseline), Yellow (Not Baseline), Gray (Unknown) with detailed timeline information
- **Feature Timeline**: Shows exact dates when features became "newly available" and "widely available"
- **Discouraged Feature Warnings**: Red alerts for deprecated features with recommended alternatives and official sources
- **Browser Support Matrix**: Individual browser compatibility indicators with version numbers and support gaps
- **Rich Metadata Badges**: Experimental flags, deprecated warnings, security requirements, permissions, isolation needs
- **Interactive Feature Cards**: "Ask AI" buttons for contextual assistance about specific features
- **Advanced Filtering**: Group by CSS/HTML/JS/PWA categories, filter by security context, experimental status, baseline year
- **Multiple Sorting Options**: Relevance, support breadth, Baseline-first, Baseline year, or most browser gaps first
- **External Documentation**: Direct links to MDN docs, specifications, explainers, Can I Use, and Web Platform Tests
- **Feature Relationships**: Navigate between related features and dependencies
- **Duplicate Prevention**: Smart deduplication ensures clean, organized feature lists

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
   - Use advanced filters to focus on specific feature groups, tags, or requirements
   - Sort features by relevance, support breadth, Baseline status, timeline, or browser gaps
5. **Interact with Features**:
   - Click "Ask AI" on any feature card for detailed, contextual assistance
   - Review timeline information showing when features became baseline
   - Check for discouraged feature warnings and recommended alternatives
   - Access comprehensive documentation via integrated links
6. **Chat with AI**: Use the chat sidebar for ongoing discussions about implementation details and best practices

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash API
- **Build Tool**: Vite
- **Web Features**: Custom baseline status detection
- **Styling**: Responsive design with dark mode support

## 📋 Project Structure

```
├── components/
│   ├── AnalysisDisplay.tsx    # Main analysis results with advanced filters, sorting, and enhanced sidebar indicators
│   ├── BaselineBadges.tsx     # Enhanced web platform feature cards with timeline, warnings, and AI integration
│   ├── ChatSidebar.tsx        # Interactive AI assistant with feature-specific context support
│   ├── FileUpload.tsx         # Image upload interface with user notes input
│   ├── Header.tsx             # App header with theme toggle and chat controls
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

- **Enhanced Baseline Information**: Baseline status, timeline dates (newly available/widely available), and progression year
- **Comprehensive Browser Support**: Support matrix with version numbers and gap identification
- **Advanced Metadata**: Experimental flags, deprecated warnings, behind flags, secure context, permissions, isolation requirements
- **Safety Warnings**: Clear alerts for discouraged features with recommended alternatives and official sources
- **Rich Documentation**: Integrated links to MDN docs, specifications, explainers, Can I Use, and Web Platform Tests
- **AI Integration**: "Ask AI" buttons for contextual feature discussions and implementation guidance
- **Feature Relationships**: Navigation between related features and dependencies
- **Smart Organization**: Grouping, tagging, and deduplication for clean feature discovery

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
