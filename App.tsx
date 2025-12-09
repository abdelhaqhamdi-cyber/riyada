import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectTask, TaskStatus } from './types';
import { INITIAL_TASKS, EXECUTION_ORDER } from './constants';
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
  Trash2,
  RefreshCw,
  Play,
  Square,
  FileText,
  Upload,
  FileJson,
  HardDrive,
  Brain,
  CloudCheck,
  Crosshair,
  FileCode,
  Terminal,
  Monitor,
  Search,
  Filter,
  Check
} from 'lucide-react';

// Updated storage key to ensure new tasks (v8) are loaded for the user
const STORAGE_KEY = 'muhandis_tasks_v8';
const ACTIVE_TASK_KEY = 'muhandis_active_task_v8';
const AUTO_SAVE_KEY = 'muhandis_auto_save_pref';

const App: React.FC = () => {
  // 1. Persistence Logic: Smart Merge Strategy
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsedTasks: ProjectTask[] = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
           let merged = [...parsedTasks];
           const missingFromStorage = INITIAL_TASKS.filter(
             init => !merged.some(saved => saved.id === init.id)
           );
           if (missingFromStorage.length > 0) {
             merged = [...merged, ...missingFromStorage];
             merged.sort((a, b) => {
                const idA = parseInt(a.id);
                const idB = parseInt(b.id);
                if (!isNaN(idA) && !isNaN(idB)) {
                    return idA - idB;
                }
                return 0; 
             });
           }
           return merged;
        }
      }
    } catch (e) {
      console.error("Failed to load tasks from storage", e);
    }
    return INITIAL_TASKS;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_TASK_KEY);
  });

  const [autoSaveToDisk, setAutoSaveToDisk] = useState<boolean>(() => {
    return localStorage.getItem(AUTO_SAVE_KEY) === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const stopBatchRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem(ACTIVE_TASK_KEY, activeTaskId);
    } else {
      localStorage.removeItem(ACTIVE_TASK_KEY);
    }
  }, [activeTaskId]);

  useEffect(() => {
    localStorage.setItem(AUTO_SAVE_KEY, String(autoSaveToDisk));
  }, [autoSaveToDisk]);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  // --- Filtered Tasks Logic ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.id.includes(searchTerm);
      const matchesStatus = filterStatus === 'ALL' 
        ? true 
        : filterStatus === 'COMPLETED' 
          ? task.status === TaskStatus.COMPLETED 
          : task.status !== TaskStatus.COMPLETED;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, filterStatus]);


  // --- Helper to Collect Context ---
  // Modified to accept an optional list, defaulting to current state
  const getProjectContext = (taskList = tasks) => {
    const completedTasks = taskList.filter(t => t.status === TaskStatus.COMPLETED && t.result);
    if (completedTasks.length === 0) return "";
    
    return completedTasks.map(t => 
      `### المهمة المنجزة: ${t.title} (${t.id})\n${t.result}\n`
    ).join("\n---\n");
  };

  const handleTaskClick = (task: ProjectTask) => {
    setActiveTaskId(task.id);
  };

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

  const handleExportFullProject = () => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.result);

    if (completedTasks.length === 0) {
      alert("لا يوجد محتوى مكتمل لتصديره. يرجى توليد المهام أولاً.");
      return;
    }

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

  const handleExportToShellScript = (osType: 'unix' | 'windows') => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.result);
    if (completedTasks.length === 0) {
      alert("يرجى توليد المهام أولاً قبل إنشاء سكربت التثبيت.");
      return;
    }
    if (!window.confirm(`سيقوم النظام بإنشاء ملف تشغيلي (${osType === 'unix' ? '.sh' : '.bat'}) يقوم تلقائياً بإنشاء مجلدات المشروع وكتابة الأكواد التي تم توليدها داخل الملفات المناسبة.\n\nهل تريد المتابعة؟`)) {
      return;
    }
    let scriptContent = "";
    const rootDir = "Muhandis_Project";
    if (osType === 'unix') {
      scriptContent += `#!/bin/bash\n\n`;
      scriptContent += `echo "🚀 Starting Muhandis AI Project Builder..."\n`;
      scriptContent += `mkdir -p "${rootDir}"\n`;
      scriptContent += `cd "${rootDir}"\n\n`;
      completedTasks.forEach(task => {
        if (!task.result) return;
        const safeTitle = task.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
        scriptContent += `echo "Processing: ${task.title}..."\n`;
        scriptContent += `mkdir -p "docs"\n`;
        const safeDocContent = task.result.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        scriptContent += `cat << 'EOF' > "docs/${task.id}_${safeTitle}.md"\n${task.result}\nEOF\n\n`;
        const lines = task.result.split('\n');
        let inCodeBlock = false;
        let currentFile = "";
        let codeBuffer = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
               if (currentFile) {
                 const dirName = currentFile.substring(0, currentFile.lastIndexOf('/'));
                 if (dirName) {
                   scriptContent += `mkdir -p "${dirName}"\n`;
                 }
                 const code = codeBuffer.join('\n').replace(/`/g, '\\`').replace(/\$/g, '\\$');
                 scriptContent += `cat << 'EOF' > "${currentFile}"\n${code}\nEOF\n`;
                 scriptContent += `echo "  - Created: ${currentFile}"\n`;
               }
               inCodeBlock = false;
               currentFile = "";
               codeBuffer = [];
            } else {
               inCodeBlock = true;
            }
            continue;
          }
          if (inCodeBlock) {
            const filenameMatch = line.match(/^(?:\/\/|#|<!--)\s*filename:\s*([^\n\r]+)/i);
            if (filenameMatch) {
              currentFile = filenameMatch[1].trim();
            } else {
              codeBuffer.push(line);
            }
          }
        }
      });
      scriptContent += `\necho "✅ Project build complete in folder: ${rootDir}"\n`;
      scriptContent += `echo "📂 You can now run 'git init' to start version control."\n`;
    } else {
      scriptContent += `@echo off\n`;
      scriptContent += `echo 🚀 Starting Muhandis AI Project Builder...\n`;
      scriptContent += `mkdir "${rootDir}" 2>nul\n`;
      scriptContent += `cd "${rootDir}"\n\n`;
      completedTasks.forEach(task => {
         const safeTitle = task.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
         scriptContent += `echo Processing: ${safeTitle}...\n`;
         scriptContent += `mkdir "docs" 2>nul\n`;
         scriptContent += `echo (Documentation saved in app) > "docs\\${task.id}_Spec.txt"\n`;
          const lines = task.result?.split('\n') || [];
          let inCodeBlock = false;
          let currentFile = "";
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('```')) {
              if (inCodeBlock) {
                 if (currentFile) {
                   const winFile = currentFile.replace(/\//g, '\\');
                   const lastSlash = winFile.lastIndexOf('\\');
                   if (lastSlash !== -1) {
                     const dir = winFile.substring(0, lastSlash);
                     scriptContent += `mkdir "${dir}" 2>nul\n`;
                   }
                   scriptContent += `echo. > "${winFile}"\n`; 
                   scriptContent += `echo [NOTE: Content needs to be copied from app due to Windows Batch limitations] >> "${winFile}"\n`;
                 }
                 inCodeBlock = false;
                 currentFile = "";
              } else {
                 inCodeBlock = true;
              }
              continue;
            }
            if (inCodeBlock) {
               const filenameMatch = line.match(/^(?:\/\/|#|<!--)\s*filename:\s*([^\n\r]+)/i);
               if (filenameMatch) {
                 currentFile = filenameMatch[1].trim();
               }
            }
          }
      });
      scriptContent += `\necho ✅ Structure created. For full content population, use the Bash script in Git Bash or WSL.\n`;
      scriptContent += `pause\n`;
    }
    const element = document.createElement("a");
    const file = new Blob([scriptContent], {type: osType === 'unix' ? 'application/x-sh' : 'application/bat'});
    element.href = URL.createObjectURL(file);
    element.download = osType === 'unix' ? 'install_project.sh' : 'install_structure.bat';
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
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
            if (window.confirm("تحذير: سيتم استبدال جميع المهام الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟")) {
                setTasks(parsed);
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
    event.target.value = '';
  };

  const handleGenerate = async () => {
    if (!activeTask) return;
    
    // COLLECT CONTEXT
    const context = getProjectContext();

    setTasks(prev => prev.map(t => 
      t.id === activeTask.id ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t
    ));

    try {
      // Pass context to service
      const result = await generateTechnicalSpec(activeTask.prompt, context);
      
      const updatedTask = { ...activeTask, status: TaskStatus.COMPLETED, result: result };
      setTasks(prev => prev.map(t => t.id === activeTask.id ? updatedTask : t));
      if (autoSaveToDisk) downloadTask(updatedTask);
    } catch (error) {
       console.error("Task generation failed:", error);
       const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف";
       setTasks(prev => prev.map(t => 
        t.id === activeTask.id ? { ...t, status: TaskStatus.FAILED, errorMessage: errorMsg } : t
      ));
    }
  };

  const runBatchProcess = async (taskIds: string[]) => {
    setIsBatchProcessing(true);
    setProcessingMessage("🚀 بدء التوليد الاستراتيجي...");
    stopBatchRef.current = false;

    let currentTasksState = [...tasks];

    try {
      for (const id of taskIds) {
        if (stopBatchRef.current) {
          setProcessingMessage("🛑 تم إيقاف العملية.");
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        }
        
        const task = currentTasksState.find(t => t.id === id);
        if (!task) continue;

        setActiveTaskId(id);
        
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t));
        setProcessingMessage(`⏳ جاري توليد: ${task.title.substring(0, 30)}...`);
        
        const currentContext = getProjectContext(currentTasksState);

        // Smart Throttling: Add a delay *before* the API call to respect rate limits.
        await new Promise(resolve => setTimeout(resolve, 4000)); 

        if (stopBatchRef.current) { // Check again after the delay
          setProcessingMessage("🛑 تم إيقاف العملية.");
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        }

        try {
           const result = await generateTechnicalSpec(task.prompt, currentContext);
           const updatedTask = { ...task, status: TaskStatus.COMPLETED, result };
           
           currentTasksState = currentTasksState.map(t => t.id === id ? updatedTask : t);
           setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
           
           if (autoSaveToDisk) downloadTask(updatedTask);
        } catch (error) {
           console.error(`Error generating task ${id}:`, error);
           const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
           
           const failedTask = { ...task, status: TaskStatus.FAILED, errorMessage: errorMsg };
           currentTasksState = currentTasksState.map(t => t.id === id ? failedTask : t);
           
           setTasks(prev => prev.map(t => t.id === id ? failedTask : t));

           // Smart Error Handling: Pause for quota errors, break for fatal errors.
           if (errorMsg.includes('Rate Limit Exceeded') || errorMsg.includes('تجاوز حد الاستخدام')) {
                setProcessingMessage("⚠️ تم تجاوز الحصة. سيتم الانتظار لمدة دقيقة والمتابعة تلقائياً.");
                await new Promise(resolve => setTimeout(resolve, 60000));
           } else if (errorMsg.includes('Invalid API Key') || errorMsg.includes('مفتاح API غير صالح')) {
                setProcessingMessage("🛑 خطأ فادح: مفتاح API غير صالح. توقفت العملية.");
                await new Promise(resolve => setTimeout(resolve, 4000)); // Wait to show message
                break; // Stop the whole batch process
           }
        }
      }
    } catch (globalError) {
      console.error("Critical batch error:", globalError);
    } finally {
      setIsBatchProcessing(false);
      if (!stopBatchRef.current) {
        setProcessingMessage("✅ اكتملت جميع المهام!");
      }
      await new Promise(resolve => setTimeout(() => setProcessingMessage(null), 3000));
      stopBatchRef.current = false;
    }
  };

  const handleGeneratePending = () => {
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.FAILED);
    if (pendingTasks.length === 0) {
        alert("لا توجد مهام متبقية. يمكنك استخدام زر 'إعادة التوليد' لتوليد كل شيء من جديد.");
        return;
    }
    const pendingIds = pendingTasks.map(t => t.id);
    // Sort the pending tasks based on the master execution plan
    const sortedIds = pendingIds.sort((a, b) => {
        const indexA = EXECUTION_ORDER.indexOf(a);
        const indexB = EXECUTION_ORDER.indexOf(b);
        // If a task is not in the master plan (e.g., user-created), it goes to the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    runBatchProcess(sortedIds);
  };

  const handleRegenerateAll = () => {
      if (window.confirm("تحذير: سيتم إعادة توليد جميع المهام بالترتيب الاستراتيجي، مما قد يستهلك جزءاً كبيراً من الحصة المتاحة. هل أنت متأكد؟")) {
          const allTaskIds = tasks.map(t => t.id);
          // Sort all tasks based on the master execution plan
          const sortedIds = allTaskIds.sort((a, b) => {
              const indexA = EXECUTION_ORDER.indexOf(a);
              const indexB = EXECUTION_ORDER.indexOf(b);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
          });
          runBatchProcess(sortedIds);
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
      <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-l border-slate-200 flex-shrink-0 transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center">
            <Cpu className="w-6 h-6 text-primary ml-2" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Muhandis<span className="text-primary">AI</span></h1>
          </div>
        </div>

        {/* Sidebar Search & Filter Area */}
        <div className="px-4 pt-4 pb-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="بحث في المهام..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-1">
             <button 
               onClick={() => setFilterStatus('ALL')}
               className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${filterStatus === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
             >
               الكل
             </button>
             <button 
               onClick={() => setFilterStatus('PENDING')}
               className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${filterStatus === 'PENDING' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
             >
               متبقي
             </button>
             <button 
               onClick={() => setFilterStatus('COMPLETED')}
               className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${filterStatus === 'COMPLETED' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
             >
               مكتمل
             </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
               المهام ({filteredTasks.length})
            </h2>
            <button onClick={createNewTask} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="إضافة مهمة">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
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
            )) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                لا توجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          
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
              <div className="flex gap-2 w-full">
                 <button 
                    onClick={handleGeneratePending}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    توليد المتبقي
                  </button>
                  <button 
                    onClick={handleRegenerateAll}
                    className="flex-shrink-0 flex items-center justify-center px-3 bg-white text-slate-500 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="إعادة توليد الكل"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
             {/* Auto-save Toggle */}
            <div className="flex items-center gap-2">
                <label htmlFor="auto-save-toggle" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                    حفظ تلقائي
                </label>
                <button
                    id="auto-save-toggle"
                    onClick={() => setAutoSaveToDisk(!autoSaveToDisk)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${autoSaveToDisk ? 'bg-primary' : 'bg-slate-200'}`}
                    role="switch"
                    aria-checked={autoSaveToDisk}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${autoSaveToDisk ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
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
             {processingMessage && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 font-medium flex items-center gap-2 shadow-sm">
                  {processingMessage}
                </span>
             )}
             <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-medium flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               Gemini 3.0
             </span>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {activeTask ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              
              {/* Prompt Section (Editable) */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-500" />
                    المتطلبات التقنية (Prompt)
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={activeTask.status === TaskStatus.PROCESSING}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all
                        ${activeTask.status === TaskStatus.PROCESSING 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg shadow-indigo-500/20'
                        }
                      `}
                    >
                      {activeTask.status === TaskStatus.PROCESSING ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          توليد المواصفات
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  value={activeTask.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed text-slate-700 resize-none"
                  placeholder="اكتب المتطلبات هنا..."
                  dir="rtl"
                />
              </section>

              {/* Goal Section */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crosshair className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-slate-800">الهدف (Goal)</h3>
                </div>
                <input
                  type="text"
                  value={activeTask.goal}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-700"
                  placeholder="حدد الهدف..."
                />
              </section>

              {/* Deep Thinking UI (Visual Feedback) */}
              {activeTask.status === TaskStatus.PROCESSING && (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-500 relative overflow-hidden mb-6">
                  {/* Deep Thinking Animation */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">جاري التفكير العميق...</h3>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm">يقوم النموذج بتحليل المتطلبات وبناء الهيكل المعماري.</p>
                    <p className="text-slate-400 text-xs animate-pulse">يتم استدعاء سياق المشروع السابق لضمان الاتساق...</p>
                  </div>
                  
                  {/* Subtle background glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
                </div>
              )}

              {/* Result Section */}
              {activeTask.result && (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-slate-800">المواصفات المولدة</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleDownloadCurrent}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="تحميل Markdown"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <SimpleMarkdown content={activeTask.result} />
                </section>
              )}

              {activeTask.status === TaskStatus.FAILED && activeTask.errorMessage && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">فشل التوليد</p>
                    <p className="text-sm mt-1 opacity-90">{activeTask.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Bot className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">اختر مهمة للبدء</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
