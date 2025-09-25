import React, { useEffect, useState } from 'react';

export default function Home() {
  const TOTAL_QUESTIONS = 10;
  
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [justification, setJustification] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('http://localhost:5000/questions');
        const data = await res.json();
        if (data.success && data.questions.length === TOTAL_QUESTIONS) {
          setQuestions(data.questions);
        } else {
          setError(data.message || 'Failed to load a full set of questions. Please ensure you have at least 10 questions in your database.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching questions. Please make sure the backend is running.');
      }
    }
    loadQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round((answers.length / TOTAL_QUESTIONS) * 100);

  const handleNext = async () => {
    if (!currentQuestion || !selectedOption || !justification) return;
    
    setError(''); // Clear previous errors
    
    try {
      const res = await fetch('http://localhost:5000/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qId: currentQuestion._id,
          selectedOption,
          justification,
        }),
      });

      if (!res.ok) {
        // If the response is not OK (e.g., 404, 500), throw an error
        const errorText = await res.text();
        throw new Error(`Server responded with status: ${res.status}. Response: ${errorText}`);
      }
      
      const data = await res.json();
      
      setAnswers(prev => [
        ...prev,
        {
          qId: currentQuestion._id,
          selected: selectedOption,
          correct: data.isCorrect,
          difficulty: currentQuestion.DifficultyLevel,
        },
      ]);
      setSelectedOption('');
      setJustification('');
      
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < TOTAL_QUESTIONS) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setFinished(true);
      }
      
    } catch (err) {
      console.error('Error verifying answer:', err);
      setError('Failed to verify answer. Check the console for details.');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl text-center" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }
  if (questions.length === 0 && !finished) {
    return <p className="text-gray-600 text-center mt-8">Loading questions…</p>;
  }

  if (finished) {
    const correctCount = answers.filter(a => a.correct).length;
    const correctDifficulties = answers.filter(a => a.correct).map(a => a.difficulty);
    let level = 'Beginner';
    if (correctDifficulties.includes('Advanced')) level = 'Advanced';
    else if (correctDifficulties.includes('Intermediate')) level = 'Intermediate';

    const handleRetake = () => {
      window.location.reload();
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${(correctCount / TOTAL_QUESTIONS) * 100}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 text-center mt-2">
        {answers.length} / {TOTAL_QUESTIONS} Questions
      </p>
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Question {answers.length + 1} of {TOTAL_QUESTIONS}
          </h2>
          <p className="mb-6 text-gray-800">{currentQuestion.Question}</p>
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
                {currentQuestion[optKey]}
              </label>
            ))}
          </form>
          <div className="mt-4">
            <label className="block text-gray-700 font-semibold mb-2">Justify your answer:</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows="4"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Explain why you chose this option..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedOption || !justification}
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
