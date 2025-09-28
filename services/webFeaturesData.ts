// Curated subset of Web Platform features with baseline + support info
// This is a browser-friendly static dataset used to avoid importing Node-only packages at runtime.

export type FeatureSupport = {
  chrome?: string | number | boolean;
  firefox?: string | number | boolean;
  safari?: string | number | boolean;
  edge?: string | number | boolean;
  chrome_android?: string | number | boolean;
  firefox_android?: string | number | boolean;
  safari_ios?: string | number | boolean;
};

export type WebFeatureRecord = {
  id: string;
  title: string;
  description?: string;
  status: {
    baseline: boolean | "low" | "unknown";
    support: FeatureSupport;
  };
  // Optional list of common aliases/synonyms for smarter matching
  aliases?: string[];
  // Optional metadata for richer UI
  group?:
    | "css"
    | "html"
    | "javascript"
    | "web-apis"
    | "pwa"
    | "media"
    | "graphics"
    | "security"
    | "storage"
    | "network"
    | "performance"
    | "i18n"
    | "sensors";
  tags?: string[];
  experimental?: boolean;
  deprecated?: boolean;
  secureContext?: boolean;
  permissions?: string[]; // e.g. ["clipboard-read"]
  mdn?: string;
  spec?: string;
  requiresIsolation?: boolean; // COOP/COEP or cross-origin isolation
  permissionsPolicy?: string[]; // Feature-Policy/Permissions-Policy tokens
  nonStandard?: boolean;
  hasWPT?: boolean;
  baselineYear?: number; // if known
  dependsOn?: string[]; // ids of prerequisite features
  related?: string[]; // ids of suggested/adjacent features
  // Newer nuance metadata
  behindFlag?: { [browser: string]: boolean | string }; // e.g., { chrome: true } or { firefox: "about:config" }
  partialSupport?: boolean;
  partialNotes?: string;
  links?: {
    explainer?: string;
  };
  // Timeline data
  baselineLowDate?: string; // ISO date when became "newly available"
  baselineHighDate?: string; // ISO date when became "widely available"
  // Suggestions for non-baseline features
  suggestions?: string[]; // ids of alternative baseline features
};

export const WEB_FEATURES_DATA: Record<string, WebFeatureRecord> = {
  // Core layout
  "css.properties.display": {
    id: "css.properties.display",
    title: "CSS Display Property",
    status: {
      baseline: true,
      support: { chrome: "1", firefox: "1", safari: "1", edge: "12" },
    },
    aliases: ["display", "css display"],
    group: "css",
  },
  "css.properties.grid": {
    id: "css.properties.grid",
    title: "CSS Grid Layout",
    description:
      "Two‑dimensional layout system enabling rows and columns for complex, responsive layouts.",
    status: {
      baseline: true,
      support: { 
        chrome: "57", 
        firefox: "52", 
        safari: "10.1", 
        edge: "16",
        chrome_android: "57",
        firefox_android: "52",
        safari_ios: "10.3"
      },
    },
    aliases: ["grid", "grid layout", "css grid"],
    group: "css",
    baselineYear: 2017,
    baselineLowDate: "2017-03-07",
    baselineHighDate: "2019-09-07",
    related: [
      "css.properties.flexbox",
      "css.properties.container-query",
      "css.selectors.has",
    ],
  },
  "css.properties.flexbox": {
    id: "css.properties.flexbox",
    title: "CSS Flexbox",
    description:
      "One‑dimensional layout model for distributing space and aligning items within a container.",
    status: {
      baseline: true,
      support: { 
        chrome: "29", 
        firefox: "28", 
        safari: "9", 
        edge: "12",
        chrome_android: "29",
        firefox_android: "28",
        safari_ios: "9"
      },
    },
    aliases: ["flex", "flexbox", "flex layout", "css flexbox"],
    group: "css",
    baselineYear: 2015,
    baselineLowDate: "2015-09-30",
    baselineHighDate: "2018-03-30",
    related: [
      "css.properties.grid",
      "css.properties.aspect-ratio",
      "css.functions.clamp",
    ],
  },
  "css.properties.container-query": {
    id: "css.properties.container-query",
    title: "CSS Container Queries",
    status: {
      baseline: false,
      support: { chrome: "105", firefox: "110", safari: "16", edge: "105" },
    },
    aliases: ["container queries", "container query"],
    group: "css",
    suggestions: ["css.at-rules.media", "css.properties.flexbox"],
  },
  "css.properties.aspect-ratio": {
    id: "css.properties.aspect-ratio",
    title: "CSS Aspect Ratio",
    status: {
      baseline: "low",
      support: { chrome: "88", firefox: "89", safari: "15", edge: "88" },
    },
    aliases: ["aspect ratio", "aspect-ratio"],
    group: "css",
  },
  "css.properties.position-sticky": {
    id: "css.properties.position-sticky",
    title: "CSS position: sticky",
    status: {
      baseline: true,
      support: { chrome: "56", firefox: "32", safari: "6.1", edge: "16" },
    },
    aliases: ["sticky", "position sticky"],
    group: "css",
  },

  // Theming
  "css.media.prefers-color-scheme": {
    id: "css.media.prefers-color-scheme",
    title: "Dark Mode (prefers-color-scheme)",
    status: {
      baseline: true,
      support: { 
        chrome: "76", 
        firefox: "67", 
        safari: "12.1", 
        edge: "79",
        chrome_android: "76",
        firefox_android: "67",
        safari_ios: "13"
      },
    },
    aliases: ["dark mode", "theming", "prefers-color-scheme"],
    group: "css",
  },
  "css.properties.color-scheme": {
    id: "css.properties.color-scheme",
    title: "CSS color-scheme",
    status: {
      baseline: true,
      support: { chrome: "81", firefox: "96", safari: "15", edge: "81" },
    },
    aliases: ["color scheme", "color-scheme"],
    group: "css",
  },
  "css.custom-properties": {
    id: "css.custom-properties",
    title: "CSS Custom Properties (Variables)",
    status: {
      baseline: true,
      support: { chrome: "49", firefox: "31", safari: "9.1", edge: "15" },
    },
    aliases: ["css variables", "custom properties", "variables"],
    group: "css",
  },

  // Responsive design
  "css.at-rules.media": {
    id: "css.at-rules.media",
    title: "CSS Media Queries",
    status: {
      baseline: true,
      support: { chrome: "21", firefox: "9", safari: "6", edge: "12" },
    },
    aliases: ["media queries", "responsive", "@media"],
    group: "css",
  },
  "css.functions.clamp": {
    id: "css.functions.clamp",
    title: "CSS clamp()",
    status: {
      baseline: true,
      support: { chrome: "79", firefox: "75", safari: "13.1", edge: "79" },
    },
    aliases: ["clamp", "fluid typography"],
    group: "css",
    baselineYear: 2020,
    baselineLowDate: "2020-04-07",
    baselineHighDate: "2022-10-07",
  },

  // Modern selectors
  "css.selectors.has": {
    id: "css.selectors.has",
    title: ":has() selector",
    description:
      "Parent‑aware selector enabling styling based on the existence of descendants or subsequent elements.",
    status: {
      baseline: "low",
      support: { chrome: "105", firefox: "121", safari: "15.4", edge: "105" },
    },
    aliases: [":has", "has selector"],
    group: "css",
    baselineYear: 2024,
    baselineLowDate: "2024-03-05",
  },
  "css.selectors.is": {
    id: "css.selectors.is",
    title: ":is() selector",
    status: {
      baseline: true,
      support: { chrome: "88", firefox: "78", safari: "14", edge: "88" },
    },
    aliases: [":is", "is selector"],
    group: "css",
  },
  "css.selectors.where": {
    id: "css.selectors.where",
    title: ":where() selector",
    status: {
      baseline: true,
      support: { chrome: "88", firefox: "78", safari: "15.4", edge: "88" },
    },
    aliases: [":where", "where selector"],
    group: "css",
  },

  // Images
  "html.elements.img.srcset": {
    id: "html.elements.img.srcset",
    title: "Responsive Images: srcset",
    status: {
      baseline: true,
      support: { chrome: "34", firefox: "38", safari: "9", edge: "14" },
    },
    aliases: ["responsive images", "srcset"],
    group: "html",
  },
  "html.elements.img.sizes": {
    id: "html.elements.img.sizes",
    title: "Responsive Images: sizes",
    status: {
      baseline: true,
      support: { chrome: "34", firefox: "38", safari: "9", edge: "14" },
    },
    aliases: ["sizes attribute", "responsive images"],
    group: "html",
  },

  // ----- HTML -----
  "html.elements.dialog": {
    id: "html.elements.dialog",
    title: "<dialog> element",
    description:
      "Built‑in modal and non‑modal dialog container with focus management and the showModal() API.",
    status: {
      baseline: true,
      support: { 
        chrome: true, 
        firefox: true, 
        safari: true, 
        edge: true,
        chrome_android: true,
        firefox_android: true,
        safari_ios: "15.4"
      },
    },
    aliases: ["dialog", "modal dialog"],
    group: "html",
    baselineYear: 2022,
    baselineLowDate: "2022-03-14",
    baselineHighDate: "2024-09-14",
    mdn: "https://developer.mozilla.org/docs/Web/HTML/Element/dialog",
    links: { explainer: "https://open-ui.org/components/dialog.research" },
  },
  "html.attributes.popover": {
    id: "html.attributes.popover",
    title: "Popover attribute",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["popover", "popover attribute"],
    group: "html",
    suggestions: ["html.elements.dialog"],
    mdn: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/popover",
  },

  // ----- JavaScript -----
  "js.syntax.optional-chaining": {
    id: "js.syntax.optional-chaining",
    title: "Optional chaining (?.)",
    description: "Safe property access that returns undefined instead of throwing errors when accessing nested object properties that might be null or undefined.",
    status: {
      baseline: true,
      support: { 
        chrome: "80", 
        firefox: "72", 
        safari: "13.1", 
        edge: "80",
        chrome_android: "80",
        firefox_android: "79",
        safari_ios: "13.4"
      },
    },
    aliases: ["optional chaining", "?.", "safe navigation", "null conditional"],
    group: "javascript",
    baselineYear: 2020,
    baselineLowDate: "2020-04-07",
    baselineHighDate: "2022-10-07",
    tags: ["syntax", "safety", "es2020"],
    mdn: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
    spec: "https://tc39.es/ecma262/#sec-optional-chaining",
  },
  "js.syntax.top-level-await": {
    id: "js.syntax.top-level-await",
    title: "Top-level await",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["tla", "top level await"],
    group: "javascript",
    mdn: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/await#top-level_await",
  },
  "js.import-maps": {
    id: "js.import-maps",
    title: "Import Maps",
    description:
      "Control module specifier resolution in browsers without bundling; map bare specifiers to URLs.",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["import maps"],
    group: "javascript",
    suggestions: ["js.syntax.optional-chaining"],
    mdn: "https://developer.mozilla.org/docs/Web/HTML/Element/script/type/importmap",
    links: { explainer: "https://github.com/WICG/import-maps" },
  },

  // ----- Core Web APIs / Network -----
  "api.fetch": {
    id: "api.fetch",
    title: "Fetch API",
    description:
      "Promise‑based HTTP requests with streaming, credentials, and abort support.",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["fetch"],
    group: "network",
    tags: ["http", "network"],
    related: ["api.abort-controller", "api.websocket", "http.csp"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Fetch_API",
  },
  "api.abort-controller": {
    id: "api.abort-controller",
    title: "AbortController",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["abortcontroller", "abort signal"],
    group: "network",
    related: ["api.fetch", "api.websocket"],
    mdn: "https://developer.mozilla.org/docs/Web/API/AbortController",
  },
  "api.websocket": {
    id: "api.websocket",
    title: "WebSocket",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["websocket"],
    group: "network",
    related: ["api.fetch", "api.abort-controller", "api.webrtc"],
    mdn: "https://developer.mozilla.org/docs/Web/API/WebSocket",
  },

  // ----- Storage -----
  "api.indexeddb": {
    id: "api.indexeddb",
    title: "IndexedDB",
    description:
      "Transactional key‑value database in the browser for large structured storage.",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["indexeddb", "idb"],
    group: "storage",
    mdn: "https://developer.mozilla.org/docs/Web/API/IndexedDB_API",
  },
  "api.cache-storage": {
    id: "api.cache-storage",
    title: "Cache Storage API",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["cache storage", "caches"],
    group: "storage",
    secureContext: true,
    mdn: "https://developer.mozilla.org/docs/Web/API/CacheStorage",
  },

  // ----- PWA -----
  "api.service-worker": {
    id: "api.service-worker",
    title: "Service Worker",
    description:
      "Background script for offline caching, network control, and push/background tasks.",
    status: {
      baseline: true,
      support: { 
        chrome: true, 
        firefox: true, 
        safari: true, 
        edge: true,
        chrome_android: true,
        firefox_android: true,
        safari_ios: "11.1"
      },
    },
    aliases: ["service worker", "sw"],
    group: "pwa",
    secureContext: true,
    hasWPT: true,
    tags: ["offline", "cache", "background"],
    baselineYear: 2018,
    baselineLowDate: "2018-01-25",
    baselineHighDate: "2020-07-25",
    dependsOn: ["api.cache-storage"],
    related: ["api.web-app-manifest", "api.web-share", "api.fetch"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Service_Worker_API",
    links: { explainer: "https://w3c.github.io/ServiceWorker/" },
  },
  "api.web-app-manifest": {
    id: "api.web-app-manifest",
    title: "Web App Manifest",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["manifest.json", "pwa manifest"],
    group: "pwa",
    related: ["api.service-worker", "api.web-share", "api.file-system-access"],
    mdn: "https://developer.mozilla.org/docs/Web/Manifest",
  },
  "api.web-share": {
    id: "api.web-share",
    title: "Web Share API",
    status: {
      baseline: "low",
      support: { 
        chrome: true, 
        firefox: false, 
        safari: true, 
        edge: true,
        chrome_android: true,
        firefox_android: false,
        safari_ios: true
      },
    },
    aliases: ["navigator.share", "web share"],
    group: "pwa",
    secureContext: true,
    permissionsPolicy: ["clipboard-write"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Navigator/share",
  },
  "api.file-system-access": {
    id: "api.file-system-access",
    title: "File System Access API",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: false, edge: true },
    },
    aliases: ["file system access", "showOpenFilePicker"],
    group: "storage",
    secureContext: true,
    permissions: ["local-files"],
    tags: ["files", "opfs"],
    suggestions: ["api.indexeddb"],
    mdn: "https://developer.mozilla.org/docs/Web/API/File_System_Access_API",
  },

  // ----- Security/Privacy/Policy -----
  "http.csp": {
    id: "http.csp",
    title: "Content Security Policy (CSP)",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["csp", "content security policy"],
    group: "security",
    mdn: "https://developer.mozilla.org/docs/Web/HTTP/CSP",
  },
  "http.referrer-policy": {
    id: "http.referrer-policy",
    title: "Referrer Policy",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["referrer policy"],
    group: "security",
    mdn: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Referrer-Policy",
  },
  "api.webauthn": {
    id: "api.webauthn",
    title: "WebAuthn (Passkeys)",
    description:
      "Phishing‑resistant authentication using public‑key credentials (platform/cross‑platform authenticators).",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["webauthn", "passkeys"],
    group: "security",
    secureContext: true,
    hasWPT: true,
    permissionsPolicy: ["publickey-credentials-get"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Web_Authentication_API",
  },

  // ----- Sensors/Device -----
  "api.geolocation": {
    id: "api.geolocation",
    title: "Geolocation API",
    status: {
      baseline: true,
      support: { 
        chrome: true, 
        firefox: true, 
        safari: true, 
        edge: true,
        chrome_android: true,
        firefox_android: true,
        safari_ios: true
      },
    },
    aliases: ["geolocation"],
    group: "sensors",
    secureContext: true,
    permissions: ["geolocation"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Geolocation_API",
  },
  "api.screen-wake-lock": {
    id: "api.screen-wake-lock",
    title: "Screen Wake Lock API",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["wake lock", "screen wakelock"],
    group: "sensors",
    secureContext: true,
    mdn: "https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API",
  },

  // ----- Media -----
  "api.mediarecorder": {
    id: "api.mediarecorder",
    title: "MediaRecorder",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["media recorder", "record media"],
    group: "media",
    mdn: "https://developer.mozilla.org/docs/Web/API/MediaRecorder",
  },
  "api.webrtc": {
    id: "api.webrtc",
    title: "WebRTC",
    description:
      "Real‑time audio/video and data channels between peers with NAT traversal.",
    status: {
      baseline: true,
      support: { 
        chrome: true, 
        firefox: true, 
        safari: true, 
        edge: true,
        chrome_android: true,
        firefox_android: true,
        safari_ios: "11"
      },
    },
    aliases: ["webrtc", "rtc"],
    group: "media",
    permissions: ["camera", "microphone"],
    permissionsPolicy: ["camera", "microphone"],
    mdn: "https://developer.mozilla.org/docs/Web/API/WebRTC_API",
  },
  "api.media-session": {
    id: "api.media-session",
    title: "Media Session API",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["media session"],
    group: "media",
    mdn: "https://developer.mozilla.org/docs/Web/API/Media_Session_API",
  },

  // ----- UX / View -----
  "api.view-transitions": {
    id: "api.view-transitions",
    title: "View Transitions API",
    description:
      "Seamless animated transitions between DOM states and navigations, ideal for SPA page changes.",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["view transitions", "document.startViewTransition"],
    group: "web-apis",
    tags: ["animations", "spa"],
    baselineYear: 2024,
    baselineLowDate: "2024-05-14",
    dependsOn: ["api.navigation"],
    related: ["css.selectors.has", "css.functions.clamp"],
    mdn: "https://developer.mozilla.org/docs/Web/API/View_Transitions_API",
    links: { explainer: "https://github.com/WICG/view-transitions" },
  },
  "api.navigation": {
    id: "api.navigation",
    title: "Navigation API",
    description:
      "New navigation model with app‑history, form participation, and transition integration for SPAs.",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["navigation api", "app history"],
    group: "web-apis",
    tags: ["routing", "spa"],
    related: ["api.view-transitions", "js.syntax.top-level-await"],
    mdn: "https://developer.mozilla.org/docs/Web/API/Navigation_API",
    links: { explainer: "https://github.com/WICG/app-history" },
  },
  "js.sharedarraybuffer": {
    id: "js.sharedarraybuffer",
    title: "SharedArrayBuffer & Atomics",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["sharedarraybuffer", "atomics"],
    group: "javascript",
    requiresIsolation: true,
    tags: ["concurrency", "performance"],
    dependsOn: ["http.headers.coop", "http.headers.coep"],
    related: ["api.webgpu", "api.offscreen-canvas"],
    mdn: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer",
  },

  // ----- Security: COOP/COEP/CORP -----
  "http.headers.coop": {
    id: "http.headers.coop",
    title: "Cross-Origin-Opener-Policy (COOP)",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["coop", "cross-origin-opener-policy"],
    group: "security",
    tags: ["isolation", "headers"],
    mdn: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy",
  },
  "http.headers.coep": {
    id: "http.headers.coep",
    title: "Cross-Origin-Embedder-Policy (COEP)",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["coep", "cross-origin-embedder-policy"],
    group: "security",
    tags: ["isolation", "headers"],
    mdn: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy",
  },
  "http.headers.corp": {
    id: "http.headers.corp",
    title: "Cross-Origin-Resource-Policy (CORP)",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["corp", "cross-origin-resource-policy"],
    group: "security",
    tags: ["isolation", "headers"],
    mdn: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy",
  },

  // ----- Clipboard -----
  "api.clipboard": {
    id: "api.clipboard",
    title: "Async Clipboard API",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: [
      "clipboard api",
      "navigator.clipboard",
      "clipboard-read",
      "clipboard-write",
    ],
    group: "web-apis",
    secureContext: true,
    permissions: ["clipboard-read", "clipboard-write"],
    permissionsPolicy: ["clipboard-read", "clipboard-write"],
    partialSupport: true,
    partialNotes:
      "Capabilities vary by browser and gesture; reading text/images may require user gesture or permissions.",
    mdn: "https://developer.mozilla.org/docs/Web/API/Clipboard_API",
  },

  // ----- Web Components internals -----
  "api.elementinternals": {
    id: "api.elementinternals",
    title: "ElementInternals (Custom Elements)",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["element internals", "form-associated custom elements"],
    group: "web-apis",
    tags: ["web-components", "forms"],
    experimental: true,
    mdn: "https://developer.mozilla.org/docs/Web/API/ElementInternals",
  },

  // ----- ResizeObserver -----
  "api.resize-observer": {
    id: "api.resize-observer",
    title: "ResizeObserver",
    status: {
      baseline: true,
      support: { chrome: true, firefox: true, safari: true, edge: true },
    },
    aliases: ["resizeobserver"],
    group: "web-apis",
    tags: ["layout", "observer"],
    mdn: "https://developer.mozilla.org/docs/Web/API/ResizeObserver",
  },

  // ----- Media: WebCodecs -----
  "api.webcodecs": {
    id: "api.webcodecs",
    title: "WebCodecs",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["web codecs"],
    group: "media",
    secureContext: true,
    tags: ["media", "codec", "encoding"],
    mdn: "https://developer.mozilla.org/docs/Web/API/WebCodecs_API",
  },

  // ----- Graphics/Compute: WebGPU -----
  "api.webgpu": {
    id: "api.webgpu",
    title: "WebGPU",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: false, safari: true, edge: true },
    },
    aliases: ["wgpu", "gpu"],
    group: "graphics",
    secureContext: true,
    experimental: true,
    tags: ["gpu", "graphics", "compute"],
    suggestions: ["api.offscreen-canvas"],
    related: ["js.sharedarraybuffer", "api.offscreen-canvas", "api.webcodecs"],
    mdn: "https://developer.mozilla.org/docs/Web/API/WebGPU_API",
  },

  // ----- Canvas: OffscreenCanvas -----
  "api.offscreen-canvas": {
    id: "api.offscreen-canvas",
    title: "OffscreenCanvas",
    status: {
      baseline: "low",
      support: { chrome: true, firefox: true, safari: false, edge: true },
    },
    aliases: ["offscreen canvas", "transferControlToOffscreen"],
    group: "graphics",
    tags: ["canvas", "workers", "performance"],
    mdn: "https://developer.mozilla.org/docs/Web/API/OffscreenCanvas",
  },
};
