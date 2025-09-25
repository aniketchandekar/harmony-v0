import React from "react";
import { UploadIcon, SparkleIcon } from "./Icons";

interface FileUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  previewUrl: string | null;
  fileName?: string;
  isLoading: boolean;
  error: string;
  userNotes: string;
  onUserNotesChange: (val: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  onAnalyze,
  previewUrl,
  fileName,
  isLoading,
  error,
  userNotes,
  onUserNotesChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Upload Your Design
      </h2>

      <div className="flex-grow">
        <label
          htmlFor="file-upload"
          className="relative block w-full h-48 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <UploadIcon className="w-10 h-10 mb-2" />
              <span className="font-medium">
                Click to upload or drag & drop
              </span>
              <span className="text-sm">PNG, JPG, WEBP (max 4MB)</span>
            </div>
          )}
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={onFileChange}
            accept="image/png, image/jpeg, image/webp"
          />
        </label>

        {fileName && !previewUrl && (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Selected: <span className="font-medium">{fileName}</span>
          </div>
        )}
      </div>

      {/* Additional details textarea */}
      <div className="mt-4">
        <label
          htmlFor="user-notes"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Any additional details?
        </label>
        <textarea
          id="user-notes"
          className="w-full min-h-[90px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., I want scrolling to be smooth; use system fonts; prefer CSS Grid; accessibility is a priority; etc."
          value={userNotes}
          onChange={(e) => onUserNotesChange(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          We'll consider these when generating your implementation plan.
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={!previewUrl || isLoading}
        className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <SparkleIcon className="w-5 h-5" />
            <span>Analyze Design</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FileUpload;
