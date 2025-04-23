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

  useEffect(() => {
    const shuffled = shuffleArray([...questionData]).map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
    setQuestions(shuffled);

    const storedScores = JSON.parse(localStorage.getItem("scoreHistory")) || [];
    setScoreHistory(storedScores);
  }, []);

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

  const clearHistory = () => {
    localStorage.removeItem("scoreHistory");
    setScoreHistory([]);
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

  if (quizCompleted) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          Quiz Complete! Score: {score}/{attempted}
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            View Score History
          </button>
        </div>

        {/* Show score history modal */}
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
                    date: i + 1,
                    accuracy: parseFloat(entry.accuracy),
                  }))}
                >
                  <XAxis dataKey="index" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }}
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
                    contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }}
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
