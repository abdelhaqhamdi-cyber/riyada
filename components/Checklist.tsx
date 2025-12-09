import React, { useState } from 'react';
import { ProjectTask } from '../types';
import { Check, Trash2, ListChecks, Sparkles, Plus, Loader } from 'lucide-react';

interface ChecklistProps {
  task: ProjectTask;
  onToggleItem: (itemId: string) => void;
  onAddItem: (text: string) => void;
  onDeleteItem: (itemId: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const Checklist: React.FC<ChecklistProps> = ({ task, onToggleItem, onAddItem, onDeleteItem, onGenerate, isGenerating }) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const checklist = task.checklist || [];
  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-amber-500" />
          قائمة المراجعة (معايير القبول)
        </h3>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              توليد قائمة المراجعة بالذكاء الاصطناعي
            </>
          )}
        </button>
      </div>

      {totalCount > 0 && (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-500">
                    التقدم العام
                </span>
                <span className="text-xs font-bold text-slate-600">
                    {completedCount} / {totalCount} ({Math.round(progressPercentage)}%)
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200">
                <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
      )}
      
      <div className="space-y-2 mb-4">
        {checklist.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group">
            <button
              onClick={() => onToggleItem(item.id)}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                item.completed ? 'bg-primary border-primary' : 'bg-white border-slate-300'
              }`}
            >
              {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onDeleteItem(item.id)}
              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-4 border-t border-slate-100">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="إضافة بند جديد في القائمة..."
          className="flex-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button type="submit" className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </form>
    </section>
  );
};
