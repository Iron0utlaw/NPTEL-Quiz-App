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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("wrong");
  const [scoreHistory, setScoreHistory] = useState([]);

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
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers((prev) => [
      ...prev,
      { ...questions[current], selected, isCorrect },
    ]);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      handleSubmitQuiz(true);
    }
  };

  const handleSubmitQuiz = (auto = false) => {
    setQuizCompleted(true);
    const updatedHistory = [
      ...scoreHistory,
      {
        date: new Date().toLocaleString(),
        score,
        total: questions.length,
      },
    ];
    setScoreHistory(updatedHistory);
    localStorage.setItem("scoreHistory", JSON.stringify(updatedHistory));
    setActiveTab("wrong");
  };

  if (quizCompleted) {
    const filteredAnswers = answers.filter(
      (a) => a.isCorrect === (activeTab === "correct")
    );

    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          Quiz Complete! Score: {score}/{questions.length}
        </h1>

        {/* Tab Navigation */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab("wrong")}
            className={`flex-1 py-2 font-semibold rounded-l-lg ${
              activeTab === "wrong"
                ? "bg-red-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            Wrong Answers
          </button>
          <button
            onClick={() => setActiveTab("correct")}
            className={`flex-1 py-2 font-semibold ${
              activeTab === "correct"
                ? "bg-green-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            Correct Answers
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 font-semibold rounded-r-lg ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            Score History
          </button>
        </div>

        {/* Answer Lists */}
        {activeTab === "wrong" || activeTab === "correct" ? (
          <div className="space-y-4 mb-6">
            {filteredAnswers.map((item, index) => (
              <div
                key={index}
                className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow"
              >
                <p className="font-semibold mb-2">{item.question}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {item.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        opt === item.correct_answer
                          ? "font-bold text-green-600 dark:text-green-400"
                          : opt === item.selected && !item.isCorrect
                          ? "text-red-600 dark:text-red-300"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {/* Score History Tab */}
        {activeTab === "history" && (
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Score History</h2>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={scoreHistory.map((entry, i) => ({ ...entry, index: i + 1 }))}
              >
                <XAxis dataKey="index" />
                <YAxis domain={[0, questions.length]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3182ce"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

            <ul className="space-y-2 text-sm mt-4">
              {scoreHistory.slice().reverse().map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-1"
                >
                  <span>{entry.date}</span>
                  <span className="font-semibold">
                    {entry.score}/{entry.total}
                  </span>
                </li>
              ))}
            </ul>
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
        <div className="mt-4">
          <button
            onClick={handleSubmitQuiz}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
