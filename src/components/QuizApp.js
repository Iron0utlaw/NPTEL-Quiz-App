import React, { useState, useEffect } from "react";
import questionData from "../data/data.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [attempted, setAttempted] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [tab, setTab] = useState("correct");
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [expandedYears, setExpandedYears] = useState([]);

  useEffect(() => {
    const weeks = [...new Set(questionData.map((q) => q.week))];
    setAvailableWeeks(weeks);
  }, []);

  const startQuiz = () => {
    const yearWeekId = (year, week) => year * 100 + week;

    const filtered = questionData.filter((q) =>
      selectedWeeks.includes(yearWeekId(q.year, q.week))
    );
    const shuffled = shuffleArray([...filtered]).map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
    setQuestions(shuffled);
    setQuizStarted(true);

    const storedScores = JSON.parse(localStorage.getItem("scoreHistory")) || [];
    setScoreHistory(storedScores);
  };

  const handleAnswer = (selected) => {
    const isCorrect = selected === questions[current].correct_answer;
    setAttempted(attempted + 1);
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers((prev) => [
      ...prev,
      { ...questions[current], selected, isCorrect, skipped: false },
    ]);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      handleSubmitQuiz(true);
    }
  };

  const handleSkip = () => {
    setAnswers((prev) => [
      ...prev,
      { ...questions[current], skipped: true },
    ]);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      handleSubmitQuiz(true);
    }
  };

  const handleSubmitQuiz = (auto = false) => {
    setQuizCompleted(true);
    const totalAnswered = attempted;
    const accuracy = totalAnswered > 0 ? (score / totalAnswered) * 100 : 0;
    const updatedHistory = [
      ...scoreHistory,
      {
        date: new Date().toLocaleString(),
        score,
        total: totalAnswered,
        accuracy: accuracy.toFixed(2),
      },
    ];
    setScoreHistory(updatedHistory);
    localStorage.setItem("scoreHistory", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    localStorage.removeItem("scoreHistory");
    setScoreHistory([]);
  };

  // Week selection screen
  if (!quizStarted) {
    const groupedByYear = questionData.reduce((acc, q) => {
      if (!acc[q.year]) acc[q.year] = new Set();
      acc[q.year].add(q.week);
      return acc;
    }, {});
    
    const toggleYear = (year) => {
      setExpandedYears((prev) =>
        prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
      );
    };

    const yearWeekId = (year, week) => year * 100 + week;
  
    const isWeekSelected = (year, week) =>
      selectedWeeks.includes(yearWeekId(year, week));
    
    const toggleWeek = (year, week) => {
      const id = yearWeekId(year, week);
      setSelectedWeeks((prev) =>
        prev.includes(id)
          ? prev.filter((w) => w !== id)
          : [...prev, id]
      );
    };
    
  
    const selectAll = () => {
      const allWeeks = questionData.map((q) => yearWeekId(q.year, q.week));
      setSelectedWeeks([...new Set(allWeeks)]);
    };
    
  
    const deselectAll = () => setSelectedWeeks([]);
  
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Select Weeks</h2>
  
        <div className="flex justify-between mb-4">
          <button
            onClick={selectAll}
            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-md"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md"
          >
            Deselect All
          </button>
        </div>
  
        <div className="space-y-4 mb-4">
        {Object.entries(groupedByYear).sort(([yearA], [yearB]) => yearB - yearA).map(([year, weeksSet]) => {
          const weeks = [...weeksSet].sort((a, b) => a - b);
          const isExpanded = expandedYears.includes(parseInt(year));

          return (
            <div key={year}>
              <button
                onClick={() => toggleYear(parseInt(year))}
                className="w-full px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 bg-gray-200 hover:bg-gray-300 font-medium flex justify-between items-center"
              >
                <span>{year}</span> <span className="text-xs">{year === "2020" ? "\u26A0\uFE0F GPT 4.1 extraction not upto the mark" : ""}</span>
                <span>{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-2">
                  <div className="flex justify-end gap-2 mb-2">
                    <button
                      onClick={() => {
                        const newWeekIds = weeks.map((week) =>
                          yearWeekId(parseInt(year), week)
                        );
                        setSelectedWeeks((prev) => [
                          ...new Set([...prev, ...newWeekIds]),
                        ]);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        const weekIdsToRemove = weeks.map((week) =>
                          yearWeekId(parseInt(year), week)
                        );
                        setSelectedWeeks((prev) =>
                          prev.filter((w) => !weekIdsToRemove.includes(w))
                        );
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {weeks.map((week) => {
                      const id = yearWeekId(parseInt(year), week);
                      const isSelected = selectedWeeks.includes(id);
                      return (
                        <button
                          key={week}
                          onClick={() => toggleWeek(parseInt(year), week)}
                          className={`py-1 rounded-lg text-sm font-medium transition ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          Week {week}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
  
        <button
          disabled={selectedWeeks.length === 0}
          onClick={startQuiz}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:bg-gray-400"
        >
          Start Quiz
        </button>
      </div>
    );
  }  

  if (quizCompleted) {
    const correctAnswers = answers.filter((a) => a.isCorrect);
    const wrongAnswers = answers.filter((a) => !a.isCorrect && !a.skipped);
    const skippedQs = answers.filter((a) => a.skipped);

    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          Quiz Complete! Score: {score}/{attempted}
        </h1>

        <div className="flex justify-center mb-4 space-x-4">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === "correct"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTab("correct")}
          >
            Correct Answers
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === "wrong"
                ? "bg-red-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTab("wrong")}
          >
            Wrong Answers
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === "skipped"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTab("skipped")}
          >
            Skipped Questions
          </button>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          View Score History
        </button>

        <ul className="space-y-4 mt-4">
          {(tab === "correct" ? correctAnswers : tab === "wrong" ? wrongAnswers : skippedQs).map((item, idx) => (
            <li
              key={idx}
              className="border p-3 rounded-lg shadow dark:bg-gray-800"
            >
              <p className="font-semibold mb-1">{item.question}</p>
              <p className="text-xs text-gray-500 mb-2">Week {item.week}</p>
              <ul className="space-y-1">
                {item.options.map((opt, i) => {
                  const isCorrect = opt === item.correct_answer;
                  const isSelected = opt === item.selected;
                  const baseStyle =
                    "px-3 py-1 rounded-lg inline-block w-full text-left";
                  const classes = isCorrect
                    ? "dark:text-green-500 text-green-600 font-medium"
                    : isSelected && !item.isCorrect
                    ? "dark:text-red-400 text-red-500"
                    : "";
                  return (
                    <li key={i} className={`${baseStyle} ${classes}`}>
                      {opt}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        {showHistory && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Score History</h2>
                <button
                  onClick={clearHistory}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Clear History
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={scoreHistory.map((entry, i) => ({
                    ...entry,
                    index: i + 1,
                    accuracy: parseFloat(entry.accuracy),
                  }))}
                >
                  <XAxis dataKey="index" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#ccc",
                      color: "#000",
                    }}
                    labelStyle={{ color: "#000" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3182ce"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm mt-4">
                {scoreHistory.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex justify-between border-b pb-1">
                    <span>{entry.date}</span>
                    <span className="font-semibold">
                      {entry.score}/{entry.total} ({entry.accuracy}%)
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowHistory(false)}
                className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  console.log(questions)

  if (questions.length === 0)
    return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Question {current + 1} of {questions.length}
        </h2>
        <p className="mb-4">{questions[current].question}</p>
        <div className="space-y-2">
          {questions[current].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleSubmitQuiz}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Submit Quiz
          </button>
          <button
            onClick={handleSkip}
            className="w-full border border-gray-300 hover:bg-slate-500 hover:text-white text-gray-800 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition"
          >
            Skip
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            View Score History
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Score History</h2>
              <button
                onClick={clearHistory}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Clear History
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={scoreHistory.map((entry, i) => ({
                  ...entry,
                  index: i + 1,
                  accuracy: parseFloat(entry.accuracy),
                }))}
              >
                <XAxis dataKey="index" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#ccc",
                    color: "#000",
                  }}
                  labelStyle={{ color: "#000" }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3182ce"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <ul className="space-y-2 text-sm mt-4">
              {scoreHistory.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between border-b pb-1">
                  <span>{entry.date}</span>
                  <span className="font-semibold">
                    {entry.score}/{entry.total} ({entry.accuracy}%)
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowHistory(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

