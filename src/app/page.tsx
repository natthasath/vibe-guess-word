'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description: string;
  isVisible: boolean;
  questions: Question[];
}

interface Question {
  id: number;
  answer: string;
  categoryId: number;
  isVisible: boolean;
  hints: { id: number; content: string; order: number }[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/game');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.filter((cat: Category) => cat.isVisible));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentQuestion(null);
    setCurrentHintIndex(0);
    setUserAnswer('');
    setMessage('');
    setIsCorrect(false);
  };

  const handleStartGame = () => {
    if (!selectedCategory) return;

    const visibleQuestions = selectedCategory.questions.filter(q => q.isVisible);
    if (visibleQuestions.length === 0) {
      setMessage('ไม่มีคำถามในหมวดหมู่นี้');
      return;
    }

    const randomQuestion = visibleQuestions[Math.floor(Math.random() * visibleQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setCurrentHintIndex(0);
    setUserAnswer('');
    setMessage('');
    setIsCorrect(false);
  };

  const handleShowHint = () => {
    if (!currentQuestion) return;

    if (currentHintIndex < currentQuestion.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setMessage('ถูกต้อง! 🎉');
      setIsCorrect(true);
    } else {
      setMessage('ไม่ถูกต้อง ลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            เกมทายคำ
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-indigo-600">
            เลือกหมวดหมู่และทายคำจากคำใบ้
          </p>
        </div>

        {!selectedCategory ? (
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-indigo-100"
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-indigo-800">
                      {category.name}
                    </h3>
                    <p className="mt-3 text-base text-indigo-500">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-white shadow-md rounded-lg border border-indigo-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-indigo-800">
                  {selectedCategory.name}
                </h3>
                <div className="mt-2 max-w-xl text-sm text-indigo-600">
                  <p>{selectedCategory.description}</p>
                </div>
                {!currentQuestion ? (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      เริ่มเกม
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="hints" className="block text-sm font-medium text-indigo-700">
                        คำใบ้ที่เปิด {currentHintIndex + 1}/{currentQuestion.hints.length}:
                      </label>
                      <div className="mt-2 space-y-3">
                        {currentQuestion.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                          <div key={hint.id} className="bg-indigo-50 border border-indigo-100 p-3 rounded-md">
                            <p className="text-lg text-indigo-900">
                              <span className="font-medium text-indigo-700">{index + 1}:</span> {hint.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentHintIndex < currentQuestion.hints.length - 1 && (
                      <button
                        type="button"
                        onClick={handleShowHint}
                        className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        ดูคำใบ้ถัดไป
                      </button>
                    )}

                    <div>
                      <label htmlFor="answer" className="block text-sm font-medium text-indigo-700">
                        คำตอบ
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="answer"
                          id="answer"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-base py-2 px-3 border-indigo-300 rounded-md"
                          placeholder="พิมพ์คำตอบของคุณ"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        ส่งคำตอบ
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        กลับไปเลือกหมวดหมู่
                      </button>
                    </div>

                    {message && (
                      <div className={`mt-4 p-4 rounded-md ${
                        isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            จัดการข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
