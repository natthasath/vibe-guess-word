import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface QuestionFormProps {
  initialData?: {
    id?: number;
    answer: string;
    categoryId: number;
    isVisible?: boolean;
    hints: { id?: number; content: string; order: number }[];
  };
  categories: Array<{ id: number; name: string }>;
  onSubmit: (data: { answer: string; categoryId: number; hints: string[]; isVisible?: boolean }) => void;
  onCancel: () => void;
}

export default function QuestionForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 0);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible !== false);
  const [hints, setHints] = useState<string[]>(
    initialData?.hints ? initialData.hints.map(h => h.content) : ['']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      answer,
      categoryId,
      hints: hints.filter(Boolean),
      ...(initialData?.id ? { isVisible } : {})
    });
  };

  const addHint = () => {
    setHints([...hints, '']);
  };

  const removeHint = (index: number) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          หมวดหมู่
        </label>
        <select
          id="category"
          value={categoryId || ''}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
          required
        >
          <option value="">เลือกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          คำตอบ
        </label>
        <input
          type="text"
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">คำใบ้</label>
        <div className="space-y-3">
          {hints.map((hint, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={hint}
                onChange={(e) => updateHint(index, e.target.value)}
                placeholder={`คำใบ้ที่ ${index + 1}`}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
                required
              />
              {hints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="p-1 text-red-500 hover:text-red-600"
                  title="ลบคำใบ้"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addHint}
          className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          เพิ่มคำใบ้
        </button>
      </div>

      {initialData?.id && (
        <div className="flex items-center">
          <input
            id="isVisible"
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
            แสดงในหน้าแรก
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {initialData?.id ? 'บันทึก' : 'เพิ่ม'}
        </button>
      </div>
    </form>
  );
} 