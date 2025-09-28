import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

interface FallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  fallbackCode: {
    code: string;
    bundleSizeImpact: string;
    notes: string;
  } | null;
  featureName: string;
}

export const FallbackModal: React.FC<FallbackModalProps> = ({
  isOpen,
  onClose,
  fallbackCode,
  featureName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !fallbackCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fallbackCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          AI-Generated Fallback for {featureName}
        </h2>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Notes</h3>
          <p className="text-sm text-gray-600">{fallbackCode.notes}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">
            Estimated Bundle Size Impact
          </h3>
          <p className="text-sm text-gray-600">
            {fallbackCode.bundleSizeImpact}
          </p>
        </div>

        <div className="relative bg-gray-800 text-white p-4 rounded-md">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <CopyIcon className="w-5 h-5" />
            )}
          </button>
          <pre>
            <code>{fallbackCode.code}</code>
          </pre>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};
