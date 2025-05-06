'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Modal from '@/components/Modal';
import CategoryForm from '@/components/CategoryForm';
import QuestionForm from '@/components/QuestionForm';

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

interface Statistics {
  totalCategories: number;
  totalQuestions: number;
  totalHints: number;
  questionsPerCategory: { [key: string]: number };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'questions'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    totalCategories: 0,
    totalQuestions: 0,
    totalHints: 0,
    questionsPerCategory: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesRes, questionsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/questions'),
      ]);

      if (!categoriesRes.ok || !questionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const categoriesData = await categoriesRes.json();
      const questionsData = await questionsRes.json();

      setCategories(categoriesData);
      setQuestions(questionsData);

      // Calculate statistics
      const stats: Statistics = {
        totalCategories: categoriesData.length,
        totalQuestions: questionsData.length,
        totalHints: questionsData.reduce((acc: number, q: Question) => acc + q.hints.length, 0),
        questionsPerCategory: {},
      };

      questionsData.forEach((question: Question) => {
        stats.questionsPerCategory[question.categoryId.toString()] = (stats.questionsPerCategory[question.categoryId.toString()] || 0) + 1;
      });

      setStatistics(stats);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? คำถามทั้งหมดในหมวดหมู่นี้จะถูกลบด้วย')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete category');
      await fetchData();
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบหมวดหมู่');
      console.error('Failed to delete category:', error);
    }
  };

  const handleAddQuestion = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingItem(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคำถามนี้?')) return;

    try {
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete question');
      await fetchData();
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบคำถาม');
      console.error('Failed to delete question:', error);
    }
  };

  const handleToggleVisibility = async (type: 'category' | 'question', id: number, currentVisibility: boolean) => {
    try {
      const endpoint = type === 'category' ? `/api/categories/${id}` : `/api/questions/${id}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isVisible: !currentVisibility,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${type} visibility`);
      }

      if (type === 'category') {
        setCategories(categories.map(cat =>
          cat.id === id ? { ...cat, isVisible: !currentVisibility } : cat
        ));
      } else {
        setQuestions(questions.map(q =>
          q.id === id ? { ...q, isVisible: !currentVisibility } : q
        ));
      }
    } catch (error) {
      console.error(`Error updating ${type} visibility:`, error);
      alert(`เกิดข้อผิดพลาดในการอัพเดทสถานะการแสดงผล`);
    }
  };

  interface CategoryFormData {
    name: string;
    description: string;
    isVisible?: boolean;
  }

  interface QuestionFormData {
    answer: string;
    categoryId: number;
    hints: string[];
    isVisible?: boolean;
  }

  const handleSubmit = async (data: CategoryFormData | QuestionFormData) => {
    try {
      if (activeTab === 'categories') {
        const response = await fetch(
          editingItem ? `/api/categories/${editingItem.id}` : '/api/categories',
          {
            method: editingItem ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to save category');
        }

        const savedCategory = await response.json();
        if (editingItem) {
          setCategories(categories.map(cat =>
            cat.id === editingItem.id ? savedCategory : cat
          ));
        } else {
          setCategories([...categories, savedCategory]);
        }
      } else {
        const response = await fetch(
          editingItem ? `/api/questions/${editingItem.id}` : '/api/questions',
          {
            method: editingItem ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to save question');
        }

        const savedQuestion = await response.json();
        if (editingItem) {
          setQuestions(questions.map(q =>
            q.id === editingItem.id ? savedQuestion : q
          ));
        } else {
          setQuestions([...questions, savedQuestion]);
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-indigo-800">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
              title="กลับไปหน้าเล่นเกม"
            >
              <ArrowLeftIcon className="w-6 h-6 text-indigo-700" />
            </Link>
            <h1 className="text-3xl font-bold text-indigo-900">จัดการเกมทายคำตอบ</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-sm">
                {statistics.totalCategories} หมวดหมู่ • {statistics.totalQuestions} คำถาม • {statistics.totalHints} คำใบ้
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-indigo-200 p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              หมวดหมู่
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              คำถาม
            </button>
          </div>

          {activeTab === 'categories' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-800">หมวดหมู่ทั้งหมด</h2>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>เพิ่มหมวดหมู่</span>
                </button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    <div>
                      <h3 className="font-medium text-indigo-800">{category.name}</h3>
                      <p className="text-sm text-indigo-600">{category.description}</p>
                      <p className="text-sm text-indigo-500 mt-1">
                        {statistics.questionsPerCategory[category.id.toString()] || 0} คำถาม
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleVisibility('category', category.id, category.isVisible)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                          category.isVisible
                            ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {category.isVisible ? 'ซ่อน' : 'แสดง'}
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-800">คำถามทั้งหมด</h2>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>เพิ่มคำถาม</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    <div>
                      <h3 className="font-medium text-indigo-800">คำตอบ: {question.answer}</h3>
                      <p className="text-sm text-indigo-600 mt-1">
                        หมวดหมู่: {categories.find(c => c.id === question.categoryId)?.name}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-indigo-600">คำใบ้:</h4>
                        <ul className="list-disc list-inside text-sm text-indigo-500">
                          {question.hints.map((hint) => (
                            <li key={hint.id}>{hint.content}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleVisibility('question', question.id, question.isVisible)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                          question.isVisible
                            ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {question.isVisible ? 'ซ่อน' : 'แสดง'}
                      </button>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={
          activeTab === 'categories'
            ? editingItem
              ? 'แก้ไขหมวดหมู่'
              : 'เพิ่มหมวดหมู่'
            : editingItem
            ? 'แก้ไขคำถาม'
            : 'เพิ่มคำถาม'
        }
      >
        {activeTab === 'categories' ? (
          <CategoryForm
            initialData={editingItem as Category}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
          />
        ) : (
          <QuestionForm
            initialData={editingItem as Question}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
          />
        )}
      </Modal>
    </main>
  );
} 