import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Download,
  Save,
  Trash2,
  RefreshCw,
  Play,
  Square,
  FileText,
  Upload,
  FileJson,
  HardDrive
} from 'lucide-react';

// Updated storage key to ensure new tasks (v8) are loaded for the user
const STORAGE_KEY = 'muhandis_tasks_v8';
const ACTIVE_TASK_KEY = 'muhandis_active_task_v8';
const AUTO_SAVE_KEY = 'muhandis_auto_save_pref';

const App: React.FC = () => {
  // 1. Persistence Logic: Load from localStorage or fall back to INITIAL_TASKS
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          return parsedTasks;
        }
      }
    } catch (e) {
      console.error("Failed to load tasks from storage", e);
    }
    return INITIAL_TASKS;
  });

  // Load active task ID from storage
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_TASK_KEY);
  });

  // Load auto-save preference
  const [autoSaveToDisk, setAutoSaveToDisk] = useState<boolean>(() => {
    return localStorage.getItem(AUTO_SAVE_KEY) === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Batch processing state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const stopBatchRef = useRef(false);
  
  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Save activeTaskId to localStorage
  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem(ACTIVE_TASK_KEY, activeTaskId);
    } else {
      localStorage.removeItem(ACTIVE_TASK_KEY);
    }
  }, [activeTaskId]);

  // Save auto-save preference
  useEffect(() => {
    localStorage.setItem(AUTO_SAVE_KEY, String(autoSaveToDisk));
  }, [autoSaveToDisk]);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleTaskClick = (task: ProjectTask) => {
    setActiveTaskId(task.id);
  };

  // 2. Editable Prompts Logic
  const handlePromptChange = (newPrompt: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => 
      t.id === activeTaskId ? { ...t, prompt: newPrompt } : t
    ));
  };

  const handleGoalChange = (newGoal: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => 
      t.id === activeTaskId ? { ...t, goal: newGoal } : t
    ));
  };

  // 3. Export Logic (Single Task)
  const downloadTask = (task: ProjectTask) => {
    if (!task.result) return;
    
    const element = document.createElement("a");
    const file = new Blob([task.result], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${task.title.replace(/\s+/g, '_')}_spec.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCurrent = () => {
    if (activeTask) downloadTask(activeTask);
  };

  // 4. Export Full Project Report (Markdown)
  const handleExportFullProject = () => {
    if (tasks.every(t => !t.result)) {
      alert("لا يوجد محتوى مكتمل لتصديره. يرجى توليد المهام أولاً.");
      return;
    }

    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.result);
    let fullReport = `# وثيقة المواصفات التقنية الكاملة - Muhandis AI\n`;
    fullReport += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n\n`;
    fullReport += `## جدول المحتويات\n`;
    
    completedTasks.forEach((task, index) => {
      fullReport += `${index + 1}. [${task.title}](#task-${task.id})\n`;
    });
    fullReport += `\n---\n\n`;

    completedTasks.forEach((task, index) => {
      fullReport += `<div id="task-${task.id}"></div>\n\n`;
      fullReport += `# ${index + 1}. ${task.title}\n\n`;
      fullReport += `**الهدف:** ${task.goal}\n\n`;
      fullReport += `### المتطلبات:\n${task.prompt}\n\n`;
      fullReport += `### المواصفات الفنية:\n\n${task.result}\n\n`;
      fullReport += `---\n\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([fullReport], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `MuhandisAI_Full_Project_Spec_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 5. Backup & Restore Logic (JSON)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const element = document.createElement("a");
    const file = new Blob([dataStr], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `MuhandisAI_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        // Basic validation
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
            if (window.confirm("تحذير: سيتم استبدال جميع المهام الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟")) {
                setTasks(parsed);
                // Reset active task to the first one in the backup
                setActiveTaskId(parsed[0].id);
                alert("تم استعادة النسخة الاحتياطية بنجاح.");
            }
        } else {
            alert("الملف المختار غير صالح أو تالف.");
        }
      } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء قراءة الملف.");
      }
    };
    reader.readAsText(file);
    // Reset value to allow re-uploading same file if needed
    event.target.value = '';
  };

  const handleGenerate = async () => {
    if (!activeTask) return;

    setTasks(prev => prev.map(t => 
      t.id === activeTask.id ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t
    ));

    try {
      const result = await generateTechnicalSpec(activeTask.prompt);
      
      const updatedTask = { ...activeTask, status: TaskStatus.COMPLETED, result: result };
      
      setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? updatedTask : t
      ));

      if (autoSaveToDisk) {
        downloadTask(updatedTask);
      }

    } catch (error) {
       console.error("Task generation failed:", error);
       const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف";
       setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? { ...t, status: TaskStatus.FAILED, errorMessage: errorMsg } : t
      ));
    }
  };

  // Simplified Batch Generation Logic
  const handleBatchGenerate = async () => {
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.FAILED);
    const allCompleted = tasks.length > 0 && pendingTasks.length === 0;

    let tasksToProcessIds: string[] = [];

    if (pendingTasks.length > 0) {
      tasksToProcessIds = pendingTasks.map(t => t.id);
    } else if (allCompleted) {
      if (!window.confirm("جميع المهام مكتملة. هل تريد إعادة توليد جميع المهام؟")) {
        return;
      }
      tasksToProcessIds = tasks.map(t => t.id);
    } else {
      return;
    }

    setIsBatchProcessing(true);
    stopBatchRef.current = false;

    try {
      for (const id of tasksToProcessIds) {
        if (stopBatchRef.current) break;
        const task = tasks.find(t => t.id === id);
        if (!task) continue;

        setActiveTaskId(id);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for UX and Rate limits

        if (stopBatchRef.current) break;

        try {
           const result = await generateTechnicalSpec(task.prompt);
           const updatedTask = { ...task, status: TaskStatus.COMPLETED, result };
           setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
           
           if (autoSaveToDisk) {
             downloadTask(updatedTask);
           }

        } catch (error) {
           console.error(`Error generating task ${id}:`, error);
           const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
           setTasks(prev => prev.map(t => t.id === id ? { ...t, status: TaskStatus.FAILED, errorMessage: errorMsg } : t));
        }
      }
    } catch (globalError) {
      console.error("Critical batch error:", globalError);
    } finally {
      setIsBatchProcessing(false);
      stopBatchRef.current = false;
    }
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
  };

  const createNewTask = () => {
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: 'مهمة جديدة',
      prompt: 'اكتب تفاصيل المتطلبات التقنية هنا...',
      goal: 'تحديد الهدف...',
      status: TaskStatus.PENDING,
      createdAt: Date.now()
    };
    setTasks([...tasks, newTask]);
    setActiveTaskId(newTask.id);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if(window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      const newTasks = tasks.filter(t => t.id !== taskId);
      setTasks(newTasks);
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
    }
  }

  const handleResetAll = () => {
    if(window.confirm('هل أنت متأكد؟ سيتم حذف جميع التغييرات والعودة للحالة الأولية.')) {
      setTasks(INITIAL_TASKS);
      setActiveTaskId(null);
      localStorage.removeItem(ACTIVE_TASK_KEY);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-80' : 'w-0'} 
          bg-white border-l border-slate-200 flex-shrink-0 transition-all duration-300 flex flex-col
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center">
            <Cpu className="w-6 h-6 text-primary ml-2" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Muhandis<span className="text-primary">AI</span></h1>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">مهام المشروع</h2>
            <button onClick={createNewTask} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="إضافة مهمة">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="relative group">
                <TaskCard 
                  task={task} 
                  isActive={task.id === activeTaskId} 
                  onClick={handleTaskClick}
                />
                <button 
                  onClick={(e) => handleDeleteTask(e, task.id)}
                  className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="حذف المهمة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          
          {/* Auto Save Toggle */}
          <div 
            onClick={() => setAutoSaveToDisk(!autoSaveToDisk)}
            className={`
              flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
              ${autoSaveToDisk ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-2">
              <HardDrive className={`w-4 h-4 ${autoSaveToDisk ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="text-xs font-bold text-slate-700">حفظ الملفات تلقائياً</div>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoSaveToDisk ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${autoSaveToDisk ? 'translate-x-[-16px]' : ''}`}></div>
            </div>
          </div>

          {/* Data Management & Export Area */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 bg-white text-slate-600 py-2 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
              title="تصدير ملف المشروع (Backup)"
            >
              <FileJson className="w-4 h-4" />
              حفظ نسخة
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-white text-slate-600 py-2 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
              title="استعادة ملف مشروع"
            >
              <Upload className="w-4 h-4" />
              استعادة
            </button>
          </div>

          <button 
            onClick={handleExportFullProject}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
             تصدير التقرير الكامل
          </button>

          {/* Batch Processing Control */}
          <div className="flex gap-2">
            {isBatchProcessing ? (
              <button 
                onClick={handleStopBatch}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
              >
                <Square className="w-4 h-4 fill-current" />
                إيقاف
              </button>
            ) : (
              <button 
                onClick={handleBatchGenerate}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                توليد الكل
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                MA
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">مدير النظام</p>
                <p className="text-xs text-slate-500">جاهز للعمل الميداني</p>
              </div>
            </div>
            <button 
              onClick={handleResetAll} 
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="إعادة ضبط المصنع"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
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
                  <input 
                    type="text" 
                    value={activeTask.title}
                    onChange={(e) => {
                      setTasks(prev => prev.map(t => t.id === activeTaskId ? {...t, title: e.target.value} : t))
                    }}
                    className="text-slate-900 font-medium bg-transparent border-none focus:ring-0 p-0 w-64 hover:bg-slate-50 rounded"
                  />
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             {isBatchProcessing && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 font-medium flex items-center gap-1 animate-pulse shadow-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  جاري التوليد التلقائي...
                </span>
             )}
             <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-medium flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               Gemini Pro 3.0
             </span>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {activeTask ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* Prompt Section (Editable) */}
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-shadow hover:shadow-md focus-within:shadow-md focus-within:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-primary rounded-xl flex-shrink-0">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                       <h2 className="text-lg font-bold text-slate-900">المدخلات (المتطلبات)</h2>
                       <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border">قابل للتعديل</span>
                    </div>
                    
                    <textarea 
                      className="w-full min-h-[120px] p-3 text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y font-sans mb-4"
                      value={activeTask.prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder="صف المتطلبات التقنية بدقة..."
                      disabled={activeTask.status === TaskStatus.PROCESSING || isBatchProcessing}
                    />

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">الهدف:</span>
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 focus:ring-1 focus:ring-primary outline-none"
                        value={activeTask.goal}
                        onChange={(e) => handleGoalChange(e.target.value)}
                        disabled={activeTask.status === TaskStatus.PROCESSING || isBatchProcessing}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Area */}
              {activeTask.status !== TaskStatus.COMPLETED && activeTask.status !== TaskStatus.PROCESSING && (
                 <div className="flex justify-center py-4">
                   <button 
                    onClick={handleGenerate}
                    disabled={isBatchProcessing}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Bot className="w-5 h-5" />
                     {activeTask.status === TaskStatus.FAILED ? 'إعادة المحاولة' : 'توليد المخطط المعماري والكود'}
                   </button>
                 </div>
              )}

              {/* Result Section */}
              {activeTask.status === TaskStatus.PROCESSING && (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">جاري تحليل البنية...</h3>
                  <p className="text-slate-500 max-w-md">يقوم الذكاء الاصطناعي الآن ببناء النماذج وتصميم الـ API بناءً على أفضل الممارسات.</p>
                </div>
              )}

              {activeTask.status === TaskStatus.COMPLETED && activeTask.result && (
                <section className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md ring-1 ring-slate-200/50 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-bold text-slate-800">المواصفات التقنية المولدة</h2>
                          <p className="text-xs text-slate-400 font-mono">Gemini 3.0 Pro Preview</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={handleGenerate}
                          disabled={isBatchProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          إعادة التوليد
                        </button>
                        <button 
                          onClick={handleDownloadCurrent}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تصدير .MD
                        </button>
                      </div>
                   </div>
                   <div className="p-8 bg-white min-h-[500px]">
                      <SimpleMarkdown content={activeTask.result} />
                   </div>
                </section>
              )}

              {activeTask.status === TaskStatus.FAILED && (
                 <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">فشل الاتصال</p>
                      <p className="text-sm mb-1">حدث خطأ أثناء معالجة الطلب. التفاصيل التقنية:</p>
                      <code className="block bg-red-100 p-2 rounded text-xs font-mono dir-ltr text-left">
                        {activeTask.errorMessage || "Unknown Error"}
                      </code>
                    </div>
                 </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-slate-100">
                <Cpu className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">مرحباً بك في Muhandis AI</h2>
              <p className="text-slate-500 max-w-md mb-8">
                أداة المطور المحترف لتوليد المواصفات التقنية والمخططات المعمارية.
              </p>
              <div className="flex gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1"><Save className="w-4 h-4" /> حفظ تلقائي</div>
                <div className="flex items-center gap-1"><Code2 className="w-4 h-4" /> نسخ الكود</div>
                <div className="flex items-center gap-1"><Download className="w-4 h-4" /> تصدير الملفات</div>
              </div>
              
              <button 
                onClick={handleBatchGenerate}
                disabled={isBatchProcessing}
                className="mt-8 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                ابدأ توليد جميع المهام
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;