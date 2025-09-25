import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import AnalysisDisplay, { AnalysisSection } from "./components/AnalysisDisplay";
import ChatSidebar from "./components/ChatSidebar";

type Theme = "light" | "dark";

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [implementationPlan, setImplementationPlan] = useState<
    AnalysisSection[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [theme, setTheme] = useState<Theme>("light");
  const [userNotes, setUserNotes] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const isDarkMode =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDarkMode ? "dark" : "light");
    // Load saved user notes if present
    const savedNotes = localStorage.getItem("userNotes");
    if (savedNotes) setUserNotes(savedNotes);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        // 4MB limit
        setError("File size exceeds 4MB. Please upload a smaller image.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImplementationPlan([]);
      setError("");
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setImplementationPlan([]);
    setError("");

    try {
      // Dynamically import to avoid loading @google/genai at startup
      const { analyzeUIDesign } = await import("./services/geminiService");
      const result = await analyzeUIDesign(selectedFile, userNotes);
      setImplementationPlan(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError("An unknown error occurred during analysis.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, userNotes]);

  // Persist notes for convenience
  useEffect(() => {
    try {
      if (userNotes && userNotes.trim().length > 0) {
        localStorage.setItem("userNotes", userNotes);
      } else {
        localStorage.removeItem("userNotes");
      }
    } catch (e) {
      // ignore persistence errors (private mode, etc.)
    }
  }, [userNotes]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main
        className={`container mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          isSidebarOpen ? "md:mr-96" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
          <FileUpload
            onFileChange={handleFileChange}
            onAnalyze={handleAnalyze}
            previewUrl={previewUrl}
            fileName={selectedFile?.name}
            isLoading={isLoading}
            error={error}
            userNotes={userNotes}
            onUserNotesChange={setUserNotes}
          />
          <AnalysisDisplay
            implementationPlan={implementationPlan}
            isLoading={isLoading}
            hasFile={!!selectedFile}
          />
        </div>
      </main>

      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        implementationPlan={implementationPlan}
      />
    </div>
  );
};

export default App;
