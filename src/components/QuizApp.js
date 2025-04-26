import React, { useState, useRef, useEffect } from "react";
import questionData from "../data/full_data.json";
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
  const [tab, setTab] = useState("wrong");
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [expandedYears, setExpandedYears] = useState([]);
  const quizStartTimeRef = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState("mipt");

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("scoreHistory")) || [];
    setScoreHistory(storedScores);
  }, []);

  const startQuiz = () => {
    const yearWeekId = (year, week) => year * 100 + week;
  
    const filtered = questionData.filter((q) =>
      q.subject === selectedSubject &&
      selectedWeeks.includes(yearWeekId(q.year, q.week))
    );
  
    const shuffled = shuffleArray([...filtered]).map((q) => ({
      ...q,
      options: 
        selectedSubject === "mipt" ? shuffleArray([...q.options]) : [...q.options],
    }));
  
    setQuestions(shuffled);
    setQuizStarted(true);
    quizStartTimeRef.current = Date.now();
  };
  

  // Get all subjects
  const allSubjects = [...new Set(questionData.map((q) => q.subject))];

  const handleSelectSubject = (subject) => {
    if (selectedSubject === subject) {
      setSelectedSubject(null); // Deselect if clicked again
      setSelectedWeeks([]); // Also clear selected weeks
    } else {
      setSelectedSubject(subject);
      setSelectedWeeks([]); // Reset weeks when new subject is chosen
    }
  };
  
  const handleAnswer = (selected) => {
    const isCorrect = selected === questions[current].correct_answer;
    setAttempted((attempted) => attempted + 1);
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers((prev) => [
      ...prev,
      { ...questions[current], selected, isCorrect, skipped: false },
    ]);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      const finalAttempted = attempted + 1;
      const finalScore = isCorrect ? score + 1 : score;
      handleSubmitQuiz(true, finalScore, finalAttempted);
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

  const handleSubmitQuiz = (auto = false, finalScore = score, finalAttempted = attempted) => {
    setQuizCompleted(true);
    const accuracy = finalAttempted > 0 ? (finalScore / finalAttempted) * 100 : 0;

    const durationMs = quizStartTimeRef.current ? Date.now() - quizStartTimeRef.current : 0;
    const totalSeconds = Math.floor(durationMs / 1000);

    const updatedHistory = [
      ...scoreHistory,
      {
        date: new Date().toLocaleString(),
        score: finalScore,
        duration: totalSeconds,
        total: finalAttempted,
        accuracy: accuracy.toFixed(2),
      },
    ];
    setScoreHistory(updatedHistory);
    localStorage.setItem("scoreHistory", JSON.stringify(updatedHistory));
  };  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const clearHistory = () => {
    localStorage.removeItem("scoreHistory");
    setScoreHistory([]);
  };

  // Week selection screen
  if (!quizStarted) {
    // Get weeks for selected subject
    const weeksForSubject = questionData
    .filter((q) => q.subject === selectedSubject)
    .map((q) => ({ year: q.year, week: q.week }));

    const uniqueYearWeeks = Array.from(
    new Set(weeksForSubject.map((item) => `${item.year}-${item.week}`))
    ).map((str) => {
    const [year, week] = str.split("-");
    return { year: parseInt(year), week: parseInt(week) };
    });

    // Group by year
    const groupedByYear = uniqueYearWeeks.reduce((acc, { year, week }) => {
    if (!acc[year]) acc[year] = [];
    acc[year].push(week);
    return acc;
    }, {});
    
    const toggleYear = (year) => {
      setExpandedYears((prev) =>
        prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
      );
    };

    const yearWeekId = (year, week) => year * 100 + week;
    
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
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-center">Select Subject</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {allSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSelectSubject(subject)}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                  selectedSubject === subject
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {subject.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center">Select {selectedSubject[0].toUpperCase()}{selectedSubject.slice(1)} Weeks</h2>
  
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
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:bg-gray-400 mb-4 mt-4"
        >
          Start Quiz
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="w-full border-2 border-slate-500 dark:border-white text-slate-500 dark:text-white font-medium py-2 px-4 rounded-lg transition mb-4"
        >
          View Score History
        </button>

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
                  duration: parseFloat(entry.duration),
                }))}
              >
                <XAxis dataKey="index" />
                
                {/* Left Y-Axis for Accuracy */}
                <YAxis yAxisId="left" domain={[0, 100]} />
                
                {/* Right Y-Axis for Duration */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}s`}
                />

                <Tooltip
                  formatter={(value, name, props) => {
                    const key = props.dataKey
                    if (key === "accuracy") return [`${value}%`, "Accuracy"];
                    if (key === "duration") return [`${value}s`, "Duration"];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#ccc",
                    color: "#000",
                  }}
                  labelStyle={{ color: "#000" }}
                />

                {/* Accuracy Line (left axis) */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3182ce"
                  strokeWidth={2}
                  name="Accuracy"
                />

                {/* Duration Line (right axis) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="duration"
                  stroke="#e53e3e"
                  strokeWidth={2}
                  name="Duration"
                />
              </LineChart>

              </ResponsiveContainer>
              <div className="overflow-scroll max-h-96">
                <ul className="space-y-2 text-sm mt-4">
                  {scoreHistory.slice().reverse().map((entry, index) => (
                    <li key={index} className="flex justify-between border-b pb-1">
                      <span>{entry.date}</span>
                      <span className="font-semibold">
                        {entry.score}/{entry.total} ({entry.accuracy}%)
                      </span>
                      <span className="font-semibold">
                        {formatTime(entry.duration)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
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

  if (quizCompleted) {
    const correctAnswers = answers.filter((a) => a.isCorrect);
    const wrongAnswers = answers.filter((a) => !a.isCorrect && !a.skipped);
    const skippedQs = answers.filter((a) => a.skipped);

    const resetQuiz = () => {
      setQuestions([])
      setQuizCompleted(false)
      setQuizStarted(false)
      setSelectedWeeks([])
      setCurrent(0)
      setScore(0)
      setAttempted(0)
      setAnswers([])
      setShowHistory(false)
    }

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
          className="w-full border-2 border-slate-500 dark:border-white text-slate-500 dark:text-white font-medium py-2 px-4 rounded-lg transition mb-4"
        >
          View Score History
        </button>

        <button
          onClick={resetQuiz}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Main Menu
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
                  duration: parseFloat(entry.duration),
                }))}
              >
                <XAxis dataKey="index" />
                
                {/* Left Y-Axis for Accuracy */}
                <YAxis yAxisId="left" domain={[0, 100]} />
                
                {/* Right Y-Axis for Duration */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}s`}
                />

                <Tooltip
                  formatter={(value, name, props) => {
                    const key = props.dataKey
                    if (key === "accuracy") return [`${value}%`, "Accuracy"];
                    if (key === "duration") return [`${value}s`, "Duration"];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#ccc",
                    color: "#000",
                  }}
                  labelStyle={{ color: "#000" }}
                />

                {/* Accuracy Line (left axis) */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3182ce"
                  strokeWidth={2}
                  name="Accuracy"
                />

                {/* Duration Line (right axis) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="duration"
                  stroke="#e53e3e"
                  strokeWidth={2}
                  name="Duration"
                />
              </LineChart>

              </ResponsiveContainer>
              <div className="overflow-scroll max-h-96">
                <ul className="space-y-2 text-sm mt-4">
                  {scoreHistory.slice().reverse().map((entry, index) => (
                    <li key={index} className="flex justify-between border-b pb-1">
                      <span>{entry.date}</span>
                      <span className="font-semibold">
                        {entry.score}/{entry.total} ({entry.accuracy}%)
                      </span>
                      <span className="font-semibold">
                        {formatTime(entry.duration)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
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

  if (questions.length === 0)
    return <div className="text-center mt-10">Loading...</div>;

  const highlightKeywords = (text, keywords) => {
    const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'));
    return parts.map((part, i) =>
      keywords.some(kw => kw.toLowerCase() === part.toLowerCase()) ? (
        <strong className="dark:text-red-400" key={i}>{part}</strong>
      ) : (
        part
      )
    );
  };

  const keywordsToBold = [' incorrect ', ' not '];

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Question {current + 1} of {questions.length}
        </h2>
        <p className="mb-4">
          {highlightKeywords(questions[current].question, keywordsToBold)}
        </p>
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
      </div>
    </div>
  );
}

