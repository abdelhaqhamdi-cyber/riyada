import React, { useState } from 'react';
import { ProjectTask, TaskStatus } from './types';
import { INITIAL_TASKS } from './constants';
import { generateTechnicalSpec } from './services/geminiService';
import { TaskCard } from './components/TaskCard';
import { SimpleMarkdown } from './components/SimpleMarkdown';
import { 
  LayoutDashboard, 
  Plus, 
  Bot, 
  Cpu, 
  Code2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleTaskClick = (task: ProjectTask) => {
    setActiveTaskId(task.id);
  };

  const handleGenerate = async () => {
    if (!activeTask) return;

    // Update status to PROCESSING
    setTasks(prev => prev.map(t => 
      t.id === activeTask.id ? { ...t, status: TaskStatus.PROCESSING } : t
    ));

    try {
      const result = await generateTechnicalSpec(activeTask.prompt);
      
      // Update status to COMPLETED and save result
      setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? { 
          ...t, 
          status: TaskStatus.COMPLETED, 
          result: result 
        } : t
      ));
    } catch (error) {
       setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? { ...t, status: TaskStatus.FAILED } : t
      ));
    }
  };

  const createNewTask = () => {
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: 'مهمة جديدة',
      prompt: 'اكتب تفاصيل المتطلبات هنا...',
      goal: 'تحديد الهدف...',
      status: TaskStatus.PENDING,
      createdAt: Date.now()
    };
    setTasks([...tasks, newTask]);
    setActiveTaskId(newTask.id);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-80' : 'w-0'} 
          bg-white border-l border-slate-200 flex-shrink-0 transition-all duration-300 flex flex-col
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Cpu className="w-6 h-6 text-primary ml-2" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Muhandis<span className="text-primary">AI</span></h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">مهام المشروع</h2>
            <button onClick={createNewTask} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isActive={task.id === activeTaskId} 
                onClick={handleTaskClick}
              />
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              MA
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">مدير النظام</p>
              <p className="text-xs text-slate-500">مشروع المنصة الرياضية</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50">
        
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            {activeTask && (
               <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>المشاريع</span>
                  <span>/</span>
                  <span className="text-slate-900 font-medium">{activeTask.title}</span>
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-medium flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               Gemini Active
             </span>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {activeTask ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Prompt Section */}
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-primary rounded-xl">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">المدخلات (المتطلبات)</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {activeTask.prompt}
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">الهدف:</span>
                      {activeTask.goal}
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Area */}
              {activeTask.status !== TaskStatus.COMPLETED && activeTask.status !== TaskStatus.PROCESSING && (
                 <div className="flex justify-center py-4">
                   <button 
                    onClick={handleGenerate}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                   >
                     <Bot className="w-5 h-5" />
                     توليد المخطط المعماري والكود
                   </button>
                 </div>
              )}

              {/* Result Section */}
              {activeTask.status === TaskStatus.PROCESSING && (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">جاري تحليل البنية...</h3>
                  <p className="text-slate-500 max-w-md">يقوم الذكاء الاصطناعي الآن ببناء النماذج وتصميم الـ API بناءً على أفضل الممارسات.</p>
                </div>
              )}

              {activeTask.status === TaskStatus.COMPLETED && activeTask.result && (
                <section className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md ring-1 ring-slate-200/50">
                   <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-800">المواصفات التقنية المولدة</h2>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Generated by Gemini 2.5</span>
                   </div>
                   <div className="p-8 bg-white min-h-[500px]">
                      <SimpleMarkdown content={activeTask.result} />
                   </div>
                </section>
              )}

              {activeTask.status === TaskStatus.FAILED && (
                 <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-6 h-6" />
                    <p>حدث خطأ أثناء معالجة الطلب. يرجى التأكد من مفتاح API والمحاولة مرة أخرى.</p>
                 </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Cpu className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">مرحباً بك في Muhandis AI</h2>
              <p className="text-slate-500 max-w-md">
                اختر مهمة من القائمة الجانبية للبدء في تخطيط البنية التحتية وتوليد الأكواد البرمجية للمنصة الرياضية.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
