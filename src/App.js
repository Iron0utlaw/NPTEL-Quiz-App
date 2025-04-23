import React, { useEffect, useState } from "react";
import QuizApp from "./components/QuizApp";

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex justify-end p-4">
        <button
          onClick={() => setDark(!dark)}
          className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-md text-sm"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <QuizApp />
    </div>
  );
}

export default App;