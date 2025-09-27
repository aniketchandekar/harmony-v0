// Browser-friendly web features service with curated data and alias matching
// Avoids importing Node-only packages at runtime.
import { WEB_FEATURES_DATA } from "./webFeaturesData";

export type BaselineStatus = "high" | "low" | "unknown";

export interface FeatureBaselineStatus {
  status: BaselineStatus;
  support: { [browser: string]: boolean };
  mobileSupport?: { [browser: string]: boolean };
  versions?: { [browser: string]: string | number | boolean };
  mobileVersions?: { [browser: string]: string | number | boolean };
  // Optional metadata echoed from dataset
  description?: string;
  experimental?: boolean;
  deprecated?: boolean;
  secureContext?: boolean;
  permissions?: string[];
  mdn?: string;
  spec?: string;
  links?: { explainer?: string };
  group?: string;
  tags?: string[];
  title?: string;
  id?: string;
  requiresIsolation?: boolean;
  permissionsPolicy?: string[];
  nonStandard?: boolean;
  hasWPT?: boolean;
  baselineYear?: number;
  baselineLowDate?: string; // When feature reached "newly available" status
  baselineHighDate?: string; // When feature reached "widely available" status
  dependsOn?: string[];
  related?: string[];
  behindFlag?: { [browser: string]: boolean | string };
  partialSupport?: boolean;
  partialNotes?: string;
  discouraged?: {
    according_to: string[];
    alternatives?: string[];
  };
  caniuse?: string[]; // Caniuse feature IDs for deep linking
  // Feature redirect handling
  kind?: "feature" | "moved" | "split";
  redirectTarget?: string;
  redirectTargets?: string[];
  // Rich content
  descriptionHtml?: string;
  compatFeatures?: string[];
  // Advanced categorization
  groups?: string[];
  snapshots?: string[];
}

const BROWSER_SUPPORT_MAP: { [key: string]: string } = {
  chrome: "chrome",
  chrome_android: "chrome_android",
  edge: "edge",
  firefox: "firefox",
  firefox_android: "firefox_android",
  safari: "safari",
  safari_ios: "safari_ios",
};

// Legacy minimal mock (kept as a fallback if an id is missing from the curated set)
const mockFeatures: { [key: string]: any } = {
  "css.properties.display": {
    status: {
      baseline: true,
      support: {
        chrome: "1",
        firefox: "1",
        safari: "1",
        edge: "12",
      },
    },
  },
  "css.properties.grid": {
    status: {
      baseline: true,
      support: {
        chrome: "57",
        firefox: "52",
        safari: "10.1",
        edge: "16",
      },
    },
  },
  "css.properties.flexbox": {
    status: {
      baseline: true,
      support: {
        chrome: "29",
        firefox: "28",
        safari: "9",
        edge: "12",
      },
    },
  },
  "css.properties.container-query": {
    status: {
      baseline: false,
      support: {
        chrome: "105",
        firefox: "110",
        safari: "16",
        edge: "105",
      },
    },
  },
  "css.properties.aspect-ratio": {
    status: {
      baseline: "low",
      support: {
        chrome: "88",
        firefox: "89",
        safari: "15",
        edge: "88",
      },
    },
  },
  // Theming-related features
  "css.media.prefers-color-scheme": {
    status: {
      baseline: true,
      support: {
        chrome: "76",
        firefox: "67",
        safari: "12.1",
        edge: "79",
      },
    },
  },
  "css.properties.color-scheme": {
    status: {
      baseline: true,
      support: {
        chrome: "81",
        firefox: "96",
        safari: "15",
        edge: "81",
      },
    },
  },
  "css.custom-properties": {
    status: {
      baseline: true,
      support: {
        chrome: "49",
        firefox: "31",
        safari: "9.1",
        edge: "15",
      },
    },
  },
};

// Simple alias table to resolve common feature names to ids (manual extras)
const manualAlias: { [alias: string]: string } = {
  // Dark mode / theming
  "dark mode": "css.media.prefers-color-scheme",
  "dark mode/theming": "css.media.prefers-color-scheme",
  theming: "css.media.prefers-color-scheme",
  theme: "css.media.prefers-color-scheme",
  "prefers color scheme": "css.media.prefers-color-scheme",
  "prefers-color-scheme": "css.media.prefers-color-scheme",

  // Color scheme property
  "color scheme": "css.properties.color-scheme",
  "color-scheme": "css.properties.color-scheme",

  // CSS Variables / Custom properties
  "css variables": "css.custom-properties",
  variables: "css.custom-properties",
  "custom properties": "css.custom-properties",
  "css custom properties": "css.custom-properties",

  // Flexbox
  flexbox: "css.properties.flexbox",
  "flexbox layout": "css.properties.flexbox",
  "css flexbox": "css.properties.flexbox",
  "flex layout": "css.properties.flexbox",

  // Grid
  grid: "css.properties.grid",
  "grid layout": "css.properties.grid",
  "css grid": "css.properties.grid",
  "css grid layout": "css.properties.grid",

  // Common Web APIs
  fetch: "api.fetch",
  websocket: "api.websocket",
  websockets: "api.websocket",
  abortcontroller: "api.abort-controller",

  // PWA
  "service worker": "api.service-worker",
  "web app manifest": "api.web-app-manifest",
  manifest: "api.web-app-manifest",
  "web share": "api.web-share",

  // Storage
  indexeddb: "api.indexeddb",
  idb: "api.indexeddb",
  caches: "api.cache-storage",

  // Security
  csp: "http.csp",
  "referrer policy": "http.referrer-policy",
  webauthn: "api.webauthn",

  // JS
  "optional chaining": "js.syntax.optional-chaining",
  "import maps": "js.import-maps",

  // Navigation/View/Isolation
  "view transitions": "api.view-transitions",
  "navigation api": "api.navigation",
  sharedarraybuffer: "js.sharedarraybuffer",
  // Security headers / isolation
  coop: "http.headers.coop",
  coep: "http.headers.coep",
  corp: "http.headers.corp",
  // Clipboard
  clipboard: "api.clipboard",
  "clipboard api": "api.clipboard",
  "navigator.clipboard": "api.clipboard",
  // Web components / DOM
  "element internals": "api.elementinternals",
  elementinternals: "api.elementinternals",
  // Observers
  resizeobserver: "api.resize-observer",
  "resize observer": "api.resize-observer",
  // Media/Graphics
  webcodecs: "api.webcodecs",
  "web codecs": "api.webcodecs",
  webgpu: "api.webgpu",
  wgpu: "api.webgpu",
  gpu: "api.webgpu",
  offscreencanvas: "api.offscreen-canvas",
  "offscreen canvas": "api.offscreen-canvas",
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Build an alias index from curated dataset titles/aliases + manual extras
const aliasIndex: Record<string, string> = (() => {
  const out: Record<string, string> = { ...manualAlias };
  Object.values(WEB_FEATURES_DATA).forEach((rec: any) => {
    out[normalize(rec.title)] = rec.id;
    if (Array.isArray(rec.aliases)) {
      rec.aliases.forEach((a: string) => (out[normalize(a)] = rec.id));
    }
  });
  return out;
})();

export const resolveFeatureIdByName = (name: string): string | undefined => {
  const n = normalize(name);
  if (aliasIndex[n]) return aliasIndex[n];
  // fuzzy contains: try to find an alias contained in the name or vice versa
  for (const [alias, id] of Object.entries(aliasIndex)) {
    if (n.includes(alias) || alias.includes(n)) {
      return id;
    }
  }
  return undefined;
};

export const getFeatureBaselineStatus = (
  featureId: string
): FeatureBaselineStatus | undefined => {
  const feature =
    (WEB_FEATURES_DATA as any)[featureId] || mockFeatures[featureId];

  if (!feature || !("status" in feature)) {
    return undefined;
  }

  const baselineStatus = feature.status.baseline;
  const support: { [browser: string]: boolean } = {};
  const versions: { [browser: string]: string | number | boolean } = {};
  let status: BaselineStatus = "unknown";

  if (typeof baselineStatus === "boolean") {
    status = baselineStatus ? "high" : "low";
  } else if (typeof baselineStatus === "string") {
    status = baselineStatus as BaselineStatus;
  }

  // Browser support detection from version/boolean flags
  const mobileSupport: { [browser: string]: boolean } = {};
  const mobileVersions: { [browser: string]: string | number | boolean } = {};

  Object.keys(BROWSER_SUPPORT_MAP).forEach((browser) => {
    const v = feature.status.support && feature.status.support[browser];
    if (typeof v === "string" || typeof v === "number") support[browser] = true;
    else if (typeof v === "boolean") support[browser] = v;
    else support[browser] = false;
    if (v !== undefined) versions[browser] = v;

    // Handle mobile browsers separately
    if (browser.includes("_android") || browser.includes("_ios")) {
      if (typeof v === "string" || typeof v === "number")
        mobileSupport[browser] = true;
      else if (typeof v === "boolean") mobileSupport[browser] = v;
      else mobileSupport[browser] = false;
      if (v !== undefined) mobileVersions[browser] = v;
    }
  });

  return {
    status,
    support,
    mobileSupport:
      Object.keys(mobileSupport).length > 0 ? mobileSupport : undefined,
    versions,
    mobileVersions:
      Object.keys(mobileVersions).length > 0 ? mobileVersions : undefined,
    experimental: feature.experimental,
    deprecated: feature.deprecated,
    secureContext: feature.secureContext,
    permissions: feature.permissions,
    description: feature.description,
    mdn: feature.mdn,
    spec: feature.spec,
    links: feature.links,
    group: feature.group,
    tags: feature.tags,
    title: feature.title,
    id: feature.id,
    requiresIsolation: feature.requiresIsolation,
    permissionsPolicy: feature.permissionsPolicy,
    nonStandard: feature.nonStandard,
    hasWPT: feature.hasWPT,
    baselineYear: feature.baselineYear,
    baselineLowDate: feature.status?.baseline_low_date,
    baselineHighDate: feature.status?.baseline_high_date,
    dependsOn: feature.dependsOn,
    related: feature.related,
    behindFlag: feature.behindFlag,
    partialSupport: feature.partialSupport,
    partialNotes: feature.partialNotes,
    discouraged: feature.discouraged,
    caniuse: feature.caniuse,
    // Feature redirect handling
    kind: feature.kind,
    redirectTarget: feature.redirect_target,
    redirectTargets: feature.redirect_targets,
    // Rich content
    descriptionHtml: feature.description_html,
    compatFeatures: feature.compat_features,
    // Advanced categorization
    groups: feature.group
      ? Array.isArray(feature.group)
        ? feature.group
        : [feature.group]
      : undefined,
    snapshots: feature.snapshot,
  };
};

export const getFeatureBaselineByName = (
  featureName: string
): FeatureBaselineStatus | undefined => {
  const id = resolveFeatureIdByName(featureName);
  if (!id) return undefined;
  return getFeatureBaselineStatus(id);
};

// Handle feature redirects (moved/split features)
export const resolveFeatureRedirects = (
  featureId: string
): FeatureBaselineStatus | undefined => {
  const feature = (WEB_FEATURES_DATA as any)[featureId];

  if (!feature) return undefined;

  // Handle moved features
  if (feature.kind === "moved" && feature.redirect_target) {
    return getFeatureBaselineStatus(feature.redirect_target);
  }

  // Handle split features - return the first (most relevant) target
  if (
    feature.kind === "split" &&
    feature.redirect_targets &&
    feature.redirect_targets.length > 0
  ) {
    return getFeatureBaselineStatus(feature.redirect_targets[0]);
  }

  // Regular feature
  return getFeatureBaselineStatus(featureId);
};

// Get all redirect targets for split features
export const getSplitFeatureTargets = (
  featureId: string
): FeatureBaselineStatus[] => {
  const feature = (WEB_FEATURES_DATA as any)[featureId];

  if (feature && feature.kind === "split" && feature.redirect_targets) {
    return feature.redirect_targets
      .map((id: string) => getFeatureBaselineStatus(id))
      .filter(
        (f: FeatureBaselineStatus | undefined): f is FeatureBaselineStatus =>
          f !== undefined
      );
  }

  return [];
};
