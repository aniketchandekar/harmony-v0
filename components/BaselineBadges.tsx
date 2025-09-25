import React from "react";
import {
  FeatureBaselineStatus,
  BaselineStatus,
} from "../services/webFeaturesService";
import {
  getFeatureBaselineStatus,
  getFeatureBaselineByName,
} from "../services/webFeaturesService";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from "./Icons";

interface BaselineBadgeProps {
  status: BaselineStatus;
}

const BaselineBadge: React.FC<BaselineBadgeProps> = ({ status }) => {
  const badgeConfig = {
    high: {
      label: "Baseline",
      icon: <CheckCircleIcon className="h-4 w-4" />,
      className:
        "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    },
    low: {
      label: "Not Baseline",
      icon: <ExclamationTriangleIcon className="h-4 w-4" />,
      className:
        "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    },
    unknown: {
      label: "Unknown",
      icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
      className:
        "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    },
  };

  const config = badgeConfig[status];

  const titleText =
    status === "unknown"
      ? "We couldn't map this item to a known Web Platform feature. It may be a generic concept or not yet in our dataset."
      : undefined;

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.className}`}
      title={titleText}
    >
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </div>
  );
};

interface BrowserSupportProps {
  support: { [browser: string]: boolean };
  versions?: { [browser: string]: string | number | boolean };
}

const BrowserSupport: React.FC<BrowserSupportProps> = ({
  support,
  versions,
}) => {
  const browserConfig = {
    chrome: { name: "Chrome", color: "text-blue-600" },
    firefox: { name: "Firefox", color: "text-orange-600" },
    safari: { name: "Safari", color: "text-gray-600" },
    edge: { name: "Edge", color: "text-blue-500" },
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Browser Support:
      </span>
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(support).map(([browser, isSupported]) => {
          const config = browserConfig[browser as keyof typeof browserConfig];
          const version = versions?.[browser];
          return (
            <div
              key={browser}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isSupported
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              }`}
              title={`${config?.name || browser}: ${
                isSupported ? "Supported" : "Not supported"
              }${version !== undefined ? ` (since ${String(version)})` : ""}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSupported ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="capitalize">
                {config?.name || browser}
                {version !== undefined && isSupported
                  ? ` ${String(version)}`
                  : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface BaselineBadgesProps {
  feature: {
    name: string;
    featureId?: string;
    baseline?: FeatureBaselineStatus;
  };
  onFeatureClick?: (featureId: string) => void;
}

export const BaselineBadges: React.FC<BaselineBadgesProps> = ({
  feature,
  onFeatureClick,
}) => {
  // Compute baseline on the fly if missing and we have an ID
  const baseline: FeatureBaselineStatus | undefined =
    feature.baseline ||
    (feature.featureId
      ? getFeatureBaselineStatus(feature.featureId)
      : getFeatureBaselineByName(feature.name));

  return (
    <div className="my-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {baseline?.title || feature.name}
          </p>
          <BaselineBadge
            status={baseline ? baseline.status : ("unknown" as BaselineStatus)}
          />
        </div>

        {baseline?.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {baseline.description}
          </p>
        )}

        {/* Secondary badges */}
        {baseline && (
          <div className="flex flex-wrap items-center gap-2">
            {baseline.experimental && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                title="Experimental: subject to change and not broadly stable"
              >
                Experimental
              </span>
            )}
            {baseline.deprecated && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                title="Deprecated: avoid new use; consider migration"
              >
                Deprecated
              </span>
            )}
            {baseline.secureContext && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                title="Requires HTTPS (secure context)"
              >
                Secure Context
              </span>
            )}
            {baseline.permissions && baseline.permissions.length > 0 && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                title={`Permissions required: ${baseline.permissions.join(
                  ", "
                )}`}
              >
                Permissions: {baseline.permissions.join(", ")}
              </span>
            )}
            {baseline.permissionsPolicy &&
              baseline.permissionsPolicy.length > 0 && (
                <span
                  className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                  title={`Permissions-Policy: ${baseline.permissionsPolicy.join(
                    ", "
                  )}`}
                >
                  Permissions-Policy
                </span>
              )}
            {baseline.requiresIsolation && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800"
                title="Requires cross-origin isolation (COOP/COEP)"
              >
                Requires Isolation
              </span>
            )}
            {baseline.nonStandard && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                title="Non-standard: not part of a standard spec"
              >
                Non‑standard
              </span>
            )}
            {baseline.hasWPT && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800"
                title="Has Web Platform Tests coverage"
              >
                WPT Coverage
              </span>
            )}
            {baseline.behindFlag &&
              Object.keys(baseline.behindFlag).length > 0 && (
                <span
                  className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800"
                  title={`Behind flag: ${Object.entries(baseline.behindFlag)
                    .map(([b, v]) => `${b}${v === true ? "" : `=${String(v)}`}`)
                    .join(", ")}`}
                >
                  Behind flag
                </span>
              )}
            {baseline.partialSupport && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                title={
                  baseline.partialNotes ||
                  "Partial or differing support across browsers"
                }
              >
                Partial support
              </span>
            )}
          </div>
        )}

        {baseline ? (
          <>
            <BrowserSupport
              support={baseline.support}
              versions={baseline.versions}
            />
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {baseline.baselineYear && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  title="Year when this feature entered the Baseline"
                >
                  Baseline {baseline.baselineYear}
                </span>
              )}
              {(() => {
                const missing = Object.entries(baseline.support)
                  .filter(([, ok]) => !ok)
                  .map(([b]) => b);
                if (missing.length > 0) {
                  return (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      title={`Gaps: ${missing.join(", ")}`}
                    >
                      Gaps: {missing.join(", ")}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </>
        ) : (
          <div className="text-xs italic text-slate-500 dark:text-slate-400">
            Browser support unknown
          </div>
        )}

        {/* Links */}
        {baseline &&
          (baseline.mdn || baseline.spec || baseline.links?.explainer) && (
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 flex-wrap">
              {baseline.mdn && (
                <a
                  href={baseline.mdn}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-indigo-600"
                >
                  MDN Docs
                </a>
              )}
              {baseline.spec && (
                <a
                  href={baseline.spec}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-indigo-600"
                >
                  Spec
                </a>
              )}
              {baseline.links?.explainer && (
                <a
                  href={baseline.links.explainer}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-indigo-600"
                >
                  Explainer
                </a>
              )}
              {baseline.title && (
                <a
                  href={`https://wpt.fyi/results?labels=master&q=${encodeURIComponent(
                    baseline.title
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-indigo-600"
                  title="Open WPT results search"
                >
                  WPT Results
                </a>
              )}
            </div>
          )}

        {/* Tags */}
        {baseline?.tags && baseline.tags.length > 0 && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {baseline.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Dependencies */}
        {baseline?.dependsOn && baseline.dependsOn.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Dependencies:
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {baseline.dependsOn.map((depId) => (
                <button
                  key={depId}
                  onClick={() => onFeatureClick?.(depId)}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                  title="Navigate to dependency"
                >
                  ⚡ {depId.split(".").pop()?.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Features */}
        {baseline?.related && baseline.related.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Related:
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {baseline.related.map((relId) => (
                <button
                  key={relId}
                  onClick={() => onFeatureClick?.(relId)}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                  title="Navigate to related feature"
                >
                  🔗 {relId.split(".").pop()?.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
