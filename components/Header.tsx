import React from "react";
import { SparkleIcon, SunIcon, MoonIcon, ChatBubbleIcon } from "./Icons";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  isSidebarOpen,
  toggleSidebar,
}) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-1"></div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-2">
              <SparkleIcon className="w-7 h-7 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Harmony
              </h1>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors ${
                  isSidebarOpen
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
                aria-label="Toggle chat sidebar"
                title="Chat with AI about implementation"
              >
                <ChatBubbleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
