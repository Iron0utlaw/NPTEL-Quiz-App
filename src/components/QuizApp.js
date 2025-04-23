import React, { useState, useEffect } from "react";
import questionData from "../data/data.json"; // Import JSON data

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const shuffled = shuffleArray([...questionData]).map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
    setQuestions(shuffled);
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
      setQuizCompleted(true);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
  };

  if (quizCompleted) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          Quiz Complete! Score: {score}/{questions.length}
        </h1>
        <div className="space-y-4">
          {answers.filter((a) => !a.isCorrect).map((item, index) => (
            <div
              key={index}
              className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl p-4 shadow"
            >
              <p className="font-semibold">{item.question}</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                {item.options.map((opt, i) => (
                  <li
                    key={i}
                    className={
                      opt === item.correct_answer
                        ? "font-bold text-green-600 dark:text-green-400"
                        : opt === item.selected
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
