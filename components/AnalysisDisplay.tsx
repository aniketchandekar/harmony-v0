import React, { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import {
  SparkleIcon,
  DocumentIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "./Icons";
import { BaselineBadges } from "./BaselineBadges";
import {
  FeatureBaselineStatus,
  getFeatureBaselineStatus,
  getFeatureBaselineByName,
  resolveFeatureIdByName,
} from "../services/webFeaturesService";

export interface WebFeature {
  featureId: string;
  name: string;
  baseline?: FeatureBaselineStatus;
}

export interface AnalysisSection {
  title: string;
  content: string;
  webFeatures?: WebFeature[];
}

interface AnalysisDisplayProps {
  implementationPlan: AnalysisSection[];
  isLoading: boolean;
  hasFile: boolean;
  onAskAI?: (featureName: string, featureDetails: any) => void;
}

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
    </div>
  );
};

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  const html = useMemo(() => marked.parse(text || ""), [text]);
  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  implementationPlan,
  isLoading,
  hasFile,
  onAskAI,
}) => {
  const hasAnalysis = implementationPlan && implementationPlan.length > 0;

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [requireSecure, setRequireSecure] = useState(false);
  const [requirePermissions, setRequirePermissions] = useState(false);
  const [requireIsolation, setRequireIsolation] = useState(false);
  const [onlyExperimental, setOnlyExperimental] = useState(false);
  const [excludeDeprecated, setExcludeDeprecated] = useState(false);
  const [onlyBehindFlag, setOnlyBehindFlag] = useState(false);
  const [onlyPartialSupport, setOnlyPartialSupport] = useState(false);
  const [onlyHasWPT, setOnlyHasWPT] = useState(false);
  const [onlyNonStandard, setOnlyNonStandard] = useState(false);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [highlightedFeature, setHighlightedFeature] = useState<string | null>(
    null
  );

  type EnrichedFeature = WebFeature & { baseline?: FeatureBaselineStatus };

  // Build enriched list with baseline details
  const buildEnrichedList = (
    tabIndex: number,
    list?: WebFeature[]
  ): EnrichedFeature[] => {
    const src = list || implementationPlan[tabIndex]?.webFeatures || [];
    const uniqueFeatures = new Map<string, EnrichedFeature>();

    (src || []).forEach((f) => {
      if (!uniqueFeatures.has(f.name)) {
        let baseline: FeatureBaselineStatus | undefined = f.baseline;
        try {
          const id = f.featureId || resolveFeatureIdByName(f.name);
          if (id) baseline = getFeatureBaselineStatus(id) || baseline;
        } catch {
          // ignore
        }
        if (!baseline) {
          try {
            const b = getFeatureBaselineByName(f.name);
            if (b) baseline = b;
          } catch {
            // ignore
          }
        }
        uniqueFeatures.set(f.name, { ...f, baseline });
      }
    });

    return Array.from(uniqueFeatures.values());
  };

  // Supported group chips (fixed set)
  const supportedGroups = useMemo(
    () => [
      { id: "css", label: "CSS" },
      { id: "html", label: "HTML" },
      { id: "javascript", label: "JS" },
      { id: "pwa", label: "PWA" },
      { id: "storage", label: "Storage" },
      { id: "network", label: "Network" },
      { id: "media", label: "Media" },
      { id: "security", label: "Security" },
      { id: "sensors", label: "Sensors" },
    ],
    []
  );

  // Compute per-section summaries for sidebar indicators
  const sectionSummaries = useMemo(() => {
    return (implementationPlan || []).map((section, idx) => {
      const enriched = buildEnrichedList(idx, section.webFeatures);
      if (!enriched || enriched.length === 0) {
        return { allBaseline: false, hasWarning: false };
      }
      const known = enriched.filter((e) => !!e.baseline);
      const unknownCount = enriched.length - known.length;
      // Green check: at least one known feature, and all known are Baseline (status === 'high')
      const allBaseline =
        known.length > 0 &&
        known.every((e) => (e.baseline as any)?.status === "high");
      // Warning: any unknowns, any not-baseline (status === 'low'), or any warning flags
      const hasWarning =
        unknownCount > 0 ||
        known.some((e) => {
          const b = e.baseline as FeatureBaselineStatus;
          return (
            (b as any)?.status === "low" ||
            !!b.experimental ||
            !!b.deprecated ||
            (!!b.behindFlag && Object.keys(b.behindFlag).length > 0) ||
            !!b.partialSupport ||
            !!b.requiresIsolation ||
            !!(b as any).nonStandard
          );
        });
      return { allBaseline, hasWarning };
    });
  }, [implementationPlan]);

  // Available tags (given current non-tag filters)
  const availableTags = useMemo(() => {
    if (!implementationPlan[activeTab]) return new Set<string>();
    const enriched = buildEnrichedList(
      activeTab,
      implementationPlan[activeTab].webFeatures
    );
    const filteredNoTag = enriched.filter((e) => {
      const b = e.baseline;
      if (!b)
        return (
          selectedGroup === "all" &&
          !requireSecure &&
          !requirePermissions &&
          !requireIsolation &&
          !onlyExperimental &&
          !excludeDeprecated &&
          !onlyBehindFlag &&
          !onlyPartialSupport
        );
      if (selectedGroup !== "all" && b.group && b.group !== selectedGroup)
        return false;
      if (selectedGroup !== "all" && !b.group) return false;
      if (requireSecure && !b.secureContext) return false;
      if (requirePermissions && !(b.permissions && b.permissions.length > 0))
        return false;
      if (requireIsolation && !b.requiresIsolation) return false;
      if (onlyExperimental && !b.experimental) return false;
      if (excludeDeprecated && b.deprecated) return false;
      if (
        onlyBehindFlag &&
        !(b.behindFlag && Object.keys(b.behindFlag).length > 0)
      )
        return false;
      if (onlyPartialSupport && !b.partialSupport) return false;
      return true;
    });
    const tags = new Set<string>();
    filteredNoTag.forEach((e) => {
      const t = e.baseline?.tags;
      if (t && t.length) t.forEach((tag) => tags.add(tag));
    });
    return tags;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    implementationPlan,
    selectedGroup,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
  ]);

  // Compute availability counts for toggle filters under current other filters
  const toggleCounts = useMemo(() => {
    const counts = {
      secure: 0,
      permissions: 0,
      isolation: 0,
      experimental: 0,
      deprecated: 0,
      behindFlag: 0,
      partial: 0,
    };
    if (!implementationPlan[activeTab]) return counts;
    const enriched = buildEnrichedList(
      activeTab,
      implementationPlan[activeTab].webFeatures
    );
    const passesBase = (b: FeatureBaselineStatus | undefined) => {
      if (!b) return false;
      if (selectedGroup !== "all") {
        if (!b.group || b.group !== selectedGroup) return false;
      }
      if (selectedTag !== "all") {
        if (!b.tags || !b.tags.includes(selectedTag)) return false;
      }
      return true;
    };
    enriched.forEach((e) => {
      const b = e.baseline;
      if (!passesBase(b)) return;
      // secure availability (ignore requireSecure itself)
      if (
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!onlyExperimental || b?.experimental) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0)) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.secureContext) counts.secure++;
      }
      // permissions availability (ignore requirePermissions itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!onlyExperimental || b?.experimental) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0)) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.permissions && b.permissions.length > 0) counts.permissions++;
      }
      // isolation availability (ignore requireIsolation itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!onlyExperimental || b?.experimental) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0)) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.requiresIsolation) counts.isolation++;
      }
      // experimental availability (ignore onlyExperimental itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0)) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.experimental) counts.experimental++;
      }
      // deprecated availability (ignore excludeDeprecated itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!onlyExperimental || b?.experimental) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0)) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.deprecated) counts.deprecated++;
      }
      // behind flag availability (ignore onlyBehindFlag itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!onlyExperimental || b?.experimental) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyPartialSupport || b?.partialSupport)
      ) {
        if (b?.behindFlag && Object.keys(b.behindFlag).length > 0)
          counts.behindFlag++;
      }
      // partial support availability (ignore onlyPartialSupport itself)
      if (
        (!requireSecure || b?.secureContext) &&
        (!requirePermissions || (b?.permissions && b.permissions.length > 0)) &&
        (!requireIsolation || b?.requiresIsolation) &&
        (!onlyExperimental || b?.experimental) &&
        (!excludeDeprecated || !b?.deprecated) &&
        (!onlyBehindFlag ||
          (b?.behindFlag && Object.keys(b.behindFlag).length > 0))
      ) {
        if (b?.partialSupport) counts.partial++;
      }
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    implementationPlan,
    selectedGroup,
    selectedTag,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
  ]);

  // Auto-reset toggles if they become unavailable under current filters
  useEffect(() => {
    if (requireSecure && toggleCounts.secure === 0) setRequireSecure(false);
    if (requirePermissions && toggleCounts.permissions === 0)
      setRequirePermissions(false);
    if (requireIsolation && toggleCounts.isolation === 0)
      setRequireIsolation(false);
    if (onlyExperimental && toggleCounts.experimental === 0)
      setOnlyExperimental(false);
    if (excludeDeprecated && toggleCounts.deprecated === 0)
      setExcludeDeprecated(false);
    if (onlyBehindFlag && toggleCounts.behindFlag === 0)
      setOnlyBehindFlag(false);
    if (onlyPartialSupport && toggleCounts.partial === 0)
      setOnlyPartialSupport(false);
    if (onlyHasWPT && toggleCounts.wpt === 0) setOnlyHasWPT(false);
    if (onlyNonStandard && toggleCounts.nonStandard === 0)
      setOnlyNonStandard(false);
  }, [
    toggleCounts,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
    onlyHasWPT,
    onlyNonStandard,
  ]);

  // Available groups (given current non-group filters)
  const availableGroups = useMemo(() => {
    if (!implementationPlan[activeTab]) return new Set<string>();
    const enriched = buildEnrichedList(
      activeTab,
      implementationPlan[activeTab].webFeatures
    );
    const set = new Set<string>();
    enriched.forEach((e) => {
      const b = e.baseline;
      if (!b) return; // ignore unknowns for group availability
      if (requireSecure && !b.secureContext) return;
      if (requirePermissions && !(b.permissions && b.permissions.length > 0))
        return;
      if (requireIsolation && !b.requiresIsolation) return;
      if (onlyExperimental && !b.experimental) return;
      if (excludeDeprecated && b.deprecated) return;
      if (
        onlyBehindFlag &&
        !(b.behindFlag && Object.keys(b.behindFlag).length > 0)
      )
        return;
      if (onlyPartialSupport && !b.partialSupport) return;
      if (onlyHasWPT && !b.hasWPT) return;
      if (onlyNonStandard && !b.nonStandard) return;
      if (selectedTag !== "all") {
        if (!b.tags || !b.tags.includes(selectedTag)) return;
      }
      if (b.group) set.add(b.group);
    });
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    implementationPlan,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
    selectedTag,
  ]);

  // If current selectedGroup becomes unavailable, reset to 'all'
  useEffect(() => {
    if (selectedGroup !== "all" && !availableGroups.has(selectedGroup)) {
      setSelectedGroup("all");
    }
  }, [availableGroups, selectedGroup]);

  // Group counts under current non-group filters
  const groupCounts = useMemo(() => {
    if (!implementationPlan[activeTab])
      return { all: 0 } as Record<string, number>;
    const enriched = buildEnrichedList(
      activeTab,
      implementationPlan[activeTab].webFeatures
    );
    let all = 0;
    const counts: Record<string, number> = {};
    enriched.forEach((e) => {
      const b = e.baseline;
      if (!b) return; // don't count unknowns for groups
      if (requireSecure && !b.secureContext) return;
      if (requirePermissions && !(b.permissions && b.permissions.length > 0))
        return;
      if (requireIsolation && !b.requiresIsolation) return;
      if (onlyExperimental && !b.experimental) return;
      if (excludeDeprecated && b.deprecated) return;
      if (
        onlyBehindFlag &&
        !(b.behindFlag && Object.keys(b.behindFlag).length > 0)
      )
        return;
      if (onlyPartialSupport && !b.partialSupport) return;
      if (onlyHasWPT && !b.hasWPT) return;
      if (onlyNonStandard && !b.nonStandard) return;
      if (selectedTag !== "all" && (!b.tags || !b.tags.includes(selectedTag)))
        return;
      all++;
      if (b.group) counts[b.group] = (counts[b.group] || 0) + 1;
    });
    return { all, ...counts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    implementationPlan,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
    selectedTag,
  ]);

  // Tag counts under current non-tag filters
  const tagCounts = useMemo(() => {
    if (!implementationPlan[activeTab])
      return { all: 0 } as Record<string, number>;
    const enriched = buildEnrichedList(
      activeTab,
      implementationPlan[activeTab].webFeatures
    );
    let all = 0;
    const counts: Record<string, number> = {};
    enriched.forEach((e) => {
      const b = e.baseline;
      if (!b) return; // ignore unknowns for tags
      if (selectedGroup !== "all") {
        if (!b.group || b.group !== selectedGroup) return;
      }
      if (requireSecure && !b.secureContext) return;
      if (requirePermissions && !(b.permissions && b.permissions.length > 0))
        return;
      if (requireIsolation && !b.requiresIsolation) return;
      if (onlyExperimental && !b.experimental) return;
      if (excludeDeprecated && b.deprecated) return;
      if (
        onlyBehindFlag &&
        !(b.behindFlag && Object.keys(b.behindFlag).length > 0)
      )
        return;
      if (onlyPartialSupport && !b.partialSupport) return;
      if (onlyHasWPT && !b.hasWPT) return;
      if (onlyNonStandard && !b.nonStandard) return;
      all++;
      const tags = b.tags || [];
      tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1));
    });
    return { all, ...counts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    implementationPlan,
    selectedGroup,
    requireSecure,
    requirePermissions,
    requireIsolation,
    onlyExperimental,
    excludeDeprecated,
    onlyBehindFlag,
    onlyPartialSupport,
  ]);

  // Compute display list under all current filters and sort order
  const getDisplayFeatures = (
    tabIndex: number,
    list?: WebFeature[]
  ): EnrichedFeature[] => {
    const enriched = buildEnrichedList(tabIndex, list);
    const filtered = enriched.filter((e) => {
      const b = e.baseline;
      if (!b) return false; // hide unknowns from list
      if (selectedGroup !== "all") {
        if (!b.group || b.group !== selectedGroup) return false;
      }
      if (selectedTag !== "all") {
        if (!b.tags || !b.tags.includes(selectedTag)) return false;
      }
      if (requireSecure && !b.secureContext) return false;
      if (requirePermissions && !(b.permissions && b.permissions.length > 0))
        return false;
      if (requireIsolation && !b.requiresIsolation) return false;
      if (onlyExperimental && !b.experimental) return false;
      if (excludeDeprecated && b.deprecated) return false;
      if (
        onlyBehindFlag &&
        !(b.behindFlag && Object.keys(b.behindFlag).length > 0)
      )
        return false;
      if (onlyPartialSupport && !b.partialSupport) return false;
      if (onlyHasWPT && !b.hasWPT) return false;
      if (onlyNonStandard && !b.nonStandard) return false;
      return true;
    });

    const bySupportBreadth = (b?: FeatureBaselineStatus) => {
      const v = b?.versions || {};
      return Object.values(v).filter(Boolean).length;
    };

    const isBaseline = (b?: FeatureBaselineStatus) =>
      typeof (b as any)?.baselineYear === "number";

    const sorted = [...filtered].sort((a, b) => {
      const ba = a.baseline;
      const bb = b.baseline;
      if (sortBy === "support") {
        return bySupportBreadth(bb) - bySupportBreadth(ba);
      }
      if (sortBy === "baseline") {
        const ia = isBaseline(ba) ? 1 : 0;
        const ib = isBaseline(bb) ? 1 : 0;
        if (ib !== ia) return ib - ia; // baseline first
        const ya = (ba as any)?.baselineYear ?? Infinity;
        const yb = (bb as any)?.baselineYear ?? Infinity;
        return ya - yb; // earlier year first
      }
      if (sortBy === "baselineYear") {
        const ya = (ba as any)?.baselineYear ?? Infinity;
        const yb = (bb as any)?.baselineYear ?? Infinity;
        return ya - yb;
      }
      if (sortBy === "gaps") {
        const gapsA = Object.values(ba?.support || {}).filter(
          (ok) => !ok
        ).length;
        const gapsB = Object.values(bb?.support || {}).filter(
          (ok) => !ok
        ).length;
        if (gapsB !== gapsA) return gapsB - gapsA; // most gaps first
        // tie-breaker: non-baseline first
        const ia = isBaseline(ba) ? 1 : 0;
        const ib = isBaseline(bb) ? 1 : 0;
        return ia - ib;
      }
      return 0; // relevance: keep original order
    });

    return sorted;
  };

  // Handle navigation to a specific feature
  const handleFeatureClick = (featureId: string) => {
    // Highlight the feature temporarily
    setHighlightedFeature(featureId);

    // Scroll to the feature if it exists in current view
    const element = document.querySelector(`[data-feature-id="${featureId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Clear highlight after animation
      setTimeout(() => setHighlightedFeature(null), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col min-h-[300px]">
      {isLoading ? (
        <LoadingSkeleton />
      ) : hasAnalysis ? (
        <>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center">
                <DocumentIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Implementation Plan
              </h2>
              <button
                type="button"
                onClick={() => setShowLegend(true)}
                className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/40 border border-slate-200 dark:border-slate-600"
                title="What do these badges mean?"
                aria-label="Open badges legend"
              >
                <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
                Badges Info
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a step on the left to view details.
            </p>
          </div>

          {showLegend && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-labelledby="baseline-legend-title"
            >
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowLegend(false)}
              />
              <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3
                    id="baseline-legend-title"
                    className="text-base font-semibold text-slate-800 dark:text-slate-100"
                  >
                    What the badges mean
                  </h3>
                  <button
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setShowLegend(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <div className="font-semibold mb-1">Baseline (green)</div>
                    <p>
                      Recognized web platform feature that is part of the
                      current Web Baseline and broadly supported across major
                      browsers.
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">
                      Not Baseline (yellow)
                    </div>
                    <p>
                      Recognized feature, but not in the current Web Baseline.
                      Expect partial or uneven support and consider progressive
                      enhancement.
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Unknown (gray)</div>
                    <p>
                      We couldn’t map the item to a known Web Platform feature
                      in our dataset. It might be a generic concept (e.g., a
                      framework) or a feature we haven’t added yet.
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">
                      Browser support chips
                    </div>
                    <p>
                      The chips show which major browsers report support. Green
                      = supported, red = not supported. Use this along with the
                      Baseline badge to guide fallbacks and testing.
                    </p>
                  </div>
                </div>
                <div className="mt-5 text-right">
                  <button
                    onClick={() => setShowLegend(false)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-1 min-h-0">
            {/* Vertical tab list */}
            <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700 p-2 overflow-y-auto">
              <nav
                className="flex flex-col gap-1"
                role="tablist"
                aria-orientation="vertical"
                aria-label="Implementation steps"
              >
                {implementationPlan.map((section, index) => {
                  const isActive = activeTab === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`text-left px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors
                        ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/40"
                        }`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="block truncate">{section.title}</span>
                        <span className="shrink-0 inline-flex items-center gap-1">
                          {sectionSummaries[index]?.allBaseline && (
                            <CheckCircleIcon
                              className="w-4 h-4 text-green-600"
                              title="All features are Baseline"
                              role="img" // decorative
                            />
                          )}
                          {sectionSummaries[index]?.hasWarning && (
                            <ExclamationTriangleIcon
                              className="w-4 h-4 text-amber-500"
                              title="Some features need attention"
                              role="img" // decorative
                            />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6">
              {implementationPlan[activeTab] && (
                <>
                  <FormattedAnalysis
                    text={implementationPlan[activeTab].content}
                  />
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-3">
                      Web Platform Features
                    </h3>
                    {/* Filters toolbar */}
                    <div className="mb-3 flex items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Group:
                        </span>
                        {(
                          [
                            { id: "all", label: "All" },
                            ...supportedGroups.filter((g) =>
                              availableGroups.has(g.id)
                            ),
                          ] as Array<{ id: string; label: string }>
                        ).map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setSelectedGroup(g.id)}
                            className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                              selectedGroup === g.id
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/40"
                            }`}
                            aria-pressed={selectedGroup === g.id}
                          >
                            {g.label}
                            <span className="ml-1 opacity-70">
                              (
                              {g.id === "all"
                                ? groupCounts.all
                                : groupCounts[g.id] || 0}
                              )
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {toggleCounts.secure > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={requireSecure}
                              onChange={(e) =>
                                setRequireSecure(e.target.checked)
                              }
                            />
                            Secure Context
                          </label>
                        )}
                        {toggleCounts.permissions > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={requirePermissions}
                              onChange={(e) =>
                                setRequirePermissions(e.target.checked)
                              }
                            />
                            Requires Permissions
                          </label>
                        )}
                        {toggleCounts.isolation > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={requireIsolation}
                              onChange={(e) =>
                                setRequireIsolation(e.target.checked)
                              }
                            />
                            Requires Isolation
                          </label>
                        )}
                        {toggleCounts.experimental > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={onlyExperimental}
                              onChange={(e) =>
                                setOnlyExperimental(e.target.checked)
                              }
                            />
                            Experimental only
                          </label>
                        )}
                        {toggleCounts.deprecated > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={excludeDeprecated}
                              onChange={(e) =>
                                setExcludeDeprecated(e.target.checked)
                              }
                            />
                            Hide Deprecated
                          </label>
                        )}
                        {toggleCounts.behindFlag > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={onlyBehindFlag}
                              onChange={(e) =>
                                setOnlyBehindFlag(e.target.checked)
                              }
                            />
                            Behind flag only
                          </label>
                        )}
                        {toggleCounts.partial > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={onlyPartialSupport}
                              onChange={(e) =>
                                setOnlyPartialSupport(e.target.checked)
                              }
                            />
                            Partial support only
                          </label>
                        )}
                        {toggleCounts.wpt > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={onlyHasWPT}
                              onChange={(e) => setOnlyHasWPT(e.target.checked)}
                            />
                            Has WPT coverage
                          </label>
                        )}
                        {toggleCounts.nonStandard > 0 && (
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={onlyNonStandard}
                              onChange={(e) =>
                                setOnlyNonStandard(e.target.checked)
                              }
                            />
                            Non‑standard only
                          </label>
                        )}
                        {availableTags.size > 0 && (
                          <div className="inline-flex items-center gap-2 ml-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Tag:
                            </span>
                            {["all", ...Array.from(availableTags).sort()].map(
                              (id) => (
                                <button
                                  key={id}
                                  onClick={() => setSelectedTag(id)}
                                  className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                                    selectedTag === id
                                      ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700"
                                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/40"
                                  }`}
                                  aria-pressed={selectedTag === id}
                                >
                                  {id}
                                  <span className="ml-1 opacity-70">
                                    (
                                    {id === "all"
                                      ? tagCounts.all
                                      : tagCounts[id] || 0}
                                    )
                                  </span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                        <div className="inline-flex items-center gap-2 ml-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Sort:
                          </span>
                          <select
                            className="px-2 py-1 rounded-md text-xs border bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort features"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="support">Support breadth</option>
                            <option value="baseline">Baseline first</option>
                            <option value="baselineYear">Baseline year</option>
                            <option value="gaps">Most gaps first</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    {(() => {
                      const list = getDisplayFeatures(
                        activeTab,
                        implementationPlan[activeTab].webFeatures
                      );
                      if (!list || list.length === 0) {
                        return (
                          <div className="text-xs italic text-slate-500 dark:text-slate-400">
                            No features match the current filters.
                          </div>
                        );
                      }
                      return list.map((feature) => (
                        <div
                          key={feature.featureId}
                          data-feature-id={feature.featureId}
                          className={`transition-all duration-500 ${
                            highlightedFeature === feature.featureId
                              ? "ring-2 ring-indigo-400 ring-opacity-75 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                              : ""
                          }`}
                        >
                          <BaselineBadges
                            feature={feature}
                            onFeatureClick={handleFeatureClick}
                            onAskAI={onAskAI}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6">
          <SparkleIcon className="w-12 h-12 mb-3" />
          <p className="font-medium">
            {hasFile
              ? "Ready to analyze your design."
              : "Upload a design to get started."}
          </p>
          <p className="text-xs mt-1">
            Your detailed implementation plan and developer suggestions will
            appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
