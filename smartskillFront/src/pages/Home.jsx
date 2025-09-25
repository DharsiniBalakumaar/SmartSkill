import React, { useEffect, useState } from 'react';

export default function Home() {
  const TOTAL_QUESTIONS = 10;

  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [unused, setUnused] = useState({ Beginner: [], Intermediate: [], Advanced: [] });
  const [current, setCurrent] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('http://localhost:5000/questions');
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);

          // Group questions by difficulty (normalize cases and trim)
          const byLevel = { Beginner: [], Intermediate: [], Advanced: [] };
          data.questions.forEach(q => {
            const level = (q.DifficultyLevel || '').trim();
            if (level === 'Beginner') byLevel.Beginner.push(q);
            else if (level === 'Intermediate') byLevel.Intermediate.push(q);
            else if (level === 'Advanced') byLevel.Advanced.push(q);
          });
          setUnused(byLevel);

          // Start with first available Beginner, or fallback to next levels
          if (byLevel.Beginner.length) {
            setCurrent(byLevel.Beginner[0]);
            byLevel.Beginner.splice(0, 1);
            setUnused({ ...byLevel });
            setCurrentLevel('Beginner');
          } else if (byLevel.Intermediate.length) {
            setCurrent(byLevel.Intermediate[0]);
            byLevel.Intermediate.splice(0, 1);
            setUnused({ ...byLevel });
            setCurrentLevel('Intermediate');
          } else if (byLevel.Advanced.length) {
            setCurrent(byLevel.Advanced[0]);
            byLevel.Advanced.splice(0, 1);
            setUnused({ ...byLevel });
            setCurrentLevel('Advanced');
          } else {
            setError('No questions available');
          }
        } else {
          setError(data.message || 'Failed to load questions');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching questions');
      }
    }
    loadQuestions();
  }, []);

  const totalAnswered = answers.length;
  const progressPercent = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);

  const handleNext = () => {
    if (!current || !selectedOption) return;

    const isCorrect = selectedOption === current.Correct_Option;

    setAnswers(prev => [
      ...prev,
      {
        qId: current._id,
        selected: selectedOption,
        correct: isCorrect,
        difficulty: current.DifficultyLevel
      }
    ]);
    setSelectedOption('');

    // Adaptive difficulty logic
    let nextLevel = currentLevel;
    if (isCorrect) {
      if (currentLevel === 'Beginner') nextLevel = 'Intermediate';
      else if (currentLevel === 'Intermediate') nextLevel = 'Advanced';
    } else {
      if (currentLevel === 'Advanced') nextLevel = 'Intermediate';
      else if (currentLevel === 'Intermediate') nextLevel = 'Beginner';
    }

    // Pick next question from nextLevel if available
    const levelQuestions = unused[nextLevel];
    if (levelQuestions && levelQuestions.length && totalAnswered + 1 < TOTAL_QUESTIONS) {
      const nextQ = levelQuestions[0];
      setCurrent(nextQ);
      setCurrentLevel(nextLevel);
      setUnused(prev => ({
        ...prev,
        [nextLevel]: prev[nextLevel].slice(1)
      }));
    } else {
      // If no questions left at nextLevel, try other levels (priority: Beginner -> Intermediate -> Advanced)
      const levelsPriority = ['Beginner', 'Intermediate', 'Advanced'];
      let found = false;
      for (const lvl of levelsPriority) {
        if (unused[lvl].length && totalAnswered + 1 < TOTAL_QUESTIONS) {
          setCurrent(unused[lvl][0]);
          setCurrentLevel(lvl);
          setUnused(prev => ({
            ...prev,
            [lvl]: prev[lvl].slice(1)
          }));
          found = true;
          break;
        }
      }
      if (!found || totalAnswered + 1 >= TOTAL_QUESTIONS) {
        setFinished(true);
        setCurrent(null);
      }
    }
  };

  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  }
  if (!current && !finished) {
    return <p className="text-gray-600 text-center mt-8">Loading questions…</p>;
  }

  if (finished) {
    const correctCount = answers.filter(a => a.correct).length;

    // Calculate highest achieved level
    const correctDifficulties = answers.filter(a => a.correct).map(a => a.difficulty);
    let level = 'Beginner';
    if (correctDifficulties.includes('Advanced')) level = 'Advanced';
    else if (correctDifficulties.includes('Intermediate')) level = 'Intermediate';

    const handleRetake = () => {
      window.location.reload();
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        {/* Score Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${(correctCount / TOTAL_QUESTIONS) * 100}, 100`}
                strokeLinecap="round"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {correctCount} / {TOTAL_QUESTIONS}
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-8">Your Level: {level}</h2>

        <div className="w-full max-w-3xl space-y-4 mb-8">
          {answers.map((a, idx) => {
            const q = questions.find(q => q._id === a.qId);
            if (!q) return null;
            return (
              <div
                key={a.qId}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <p className="font-medium mb-2">
                  {idx + 1}. {q.Question}
                </p>
                {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => {
                  const text = q[optKey];
                  const isCorrect = optKey === q.Correct_Option;
                  const isSelected = a.selected === optKey;
                  // Highlight correct answer and user selected colored differently
                  const bgClass = isCorrect
                    ? 'bg-blue-100 text-blue-700'
                    : isSelected
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700';
                  return (
                    <p key={optKey} className={`pl-4 py-1 rounded ${bgClass}`}>
                      {text}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRetake}
          className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 text-center mt-2">
        {totalAnswered} / {TOTAL_QUESTIONS} Questions
      </p>

      {/* Question Card */}
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Question {totalAnswered + 1} of {TOTAL_QUESTIONS}
          </h2>
          <p className="mb-6 text-gray-800">{current.Question}</p>

          <form>
            {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => (
              <label
                key={optKey}
                className={`block border rounded-lg p-4 mb-4 cursor-pointer transition-colors ${
                  selectedOption === optKey
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={optKey}
                  checked={selectedOption === optKey}
                  onChange={e => setSelectedOption(e.target.value)}
                  className="mr-3 form-radio text-blue-500"
                />
                {current[optKey]}
              </label>
            ))}
          </form>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="mt-4 bg-blue-500 text-white py-2 px-5 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
