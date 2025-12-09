


import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import { ProjectTask, TaskStatus, ChecklistItem } from './types';
import { INITIAL_TASKS, EXECUTION_ORDER } from './constants';
import { generateTechnicalSpec, generateChecklist } from './services/geminiService';
import { TaskCard } from './components/TaskCard';
import { SimpleMarkdown } from './components/SimpleMarkdown';
import { GitHubSyncStatus } from './components/GitHubSyncStatus';
import { Checklist } from './components/Checklist';
import { 
  LayoutDashboard, 
  Plus, 
  Bot, 
  Cpu, 
  Code2,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  Play,
  Square,
  FileText,
  Upload,
  FileJson,
  Brain,
  Crosshair,
  Search,
  Settings,
  Power
} from 'lucide-react';

const STORAGE_KEY = 'muhandis_tasks_v9';
const ACTIVE_TASK_KEY = 'muhandis_active_task_v9';
const AUTO_SAVE_KEY = 'muhandis_auto_save_pref';
const BATCH_TASK_DELAY_MS = 4000; // Increased delay for proactive pacing to avoid quota errors

const App: React.FC = () => {
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
  const [isChecklistGenerating, setIsChecklistGenerating] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const stopBatchRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'unsynced' | 'syncing' | 'error'>('synced');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [regenerationTrigger, setRegenerationTrigger] = useState<ProjectTask[] | null>(null);

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
  
  useEffect(() => {
    if (syncStatus === 'syncing') {
        const timer = setTimeout(() => {
            // Only set to synced if it was previously syncing to avoid overwriting error/unsynced states
            setSyncStatus(prev => (prev === 'syncing' ? 'synced' : prev));
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);

  // Effect to handle the regeneration process robustly.
  useEffect(() => {
    if (regenerationTrigger) {
      // This effect runs after the state has been updated and the component re-rendered.
      // It ensures the batch process starts with the correct, stable state.
      runBatchProcess(EXECUTION_ORDER, regenerationTrigger);
      setRegenerationTrigger(null); // Reset trigger after use
    }
  }, [regenerationTrigger]);

  const activeTask = tasks.find(t => t.id === activeTaskId);

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

  const getProjectContext = (taskList = tasks) => {
    const completedTasks = taskList.filter(t => t.status === TaskStatus.COMPLETED && t.result);
    if (completedTasks.length === 0) return "";
    return completedTasks.map(t => 
      `### المهمة المنجزة: ${t.title} (${t.id})\n${t.result}\n`
    ).join("\n---\n");
  };

  const handleTaskClick = (task: ProjectTask) => setActiveTaskId(task.id);
  const handlePromptChange = (newPrompt: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, prompt: newPrompt } : t));
    setSyncStatus('unsynced');
  };
  const handleGoalChange = (newGoal: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, goal: newGoal } : t));
    setSyncStatus('unsynced');
  };
  
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportProject = async () => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.result);
    if (completedTasks.length === 0) {
      alert("لا توجد مهام مكتملة لتصديرها.");
      return;
    }

    const zip = new JSZip();
    const fileRegex = /\/\/ filename: (.+?)\n\`\`\`(?:[a-z]+)?\n([\s\S]+?)\n\`\`\`/g;

    for (const task of completedTasks) {
      const matches = [...task.result!.matchAll(fileRegex)];
      for (const match of matches) {
        const filename = match[1].trim();
        const code = match[2].trim();
        if (filename && code) {
          zip.file(filename, code);
        }
      }
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'muhandis_project.zip');
  };
  
  const handleExportState = () => {
    try {
      const projectState = JSON.stringify(tasks, null, 2);
      const blob = new Blob([projectState], { type: 'application/json' });
      downloadFile(blob, `muhandis_project_state_${Date.now()}.json`);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Failed to export project state:", error);
      alert("فشل تصدير حالة المشروع.");
    }
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not readable text.");
        
        const importedTasks = JSON.parse(text);

        if (!Array.isArray(importedTasks) || (importedTasks.length > 0 && (!importedTasks[0].id || !importedTasks[0].title))) {
          throw new Error("ملف JSON غير صالح أو لا يطابق بنية المشروع.");
        }

        if (window.confirm("هل أنت متأكد؟ سيتم استبدال المشروع الحالي بالكامل بالمشروع الذي تم استيراده.")) {
          setTasks(importedTasks);
          setActiveTaskId(null);
          setSyncStatus('unsynced');
          alert("تم استيراد المشروع بنجاح!");
        }
      } catch (error) {
        console.error("Failed to import project state:", error);
        alert(`فشل استيراد المشروع: ${error instanceof Error ? error.message : "خطأ غير معروف"}`);
      } finally {
          if(event.target) {
              event.target.value = '';
          }
      }
    };
    reader.readAsText(file);
  };
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerate = async () => {
    if (!activeTask) return;
    setSyncStatus('syncing');
    setTasks(p => p.map(t => t.id === activeTask.id ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t));
    try {
      const checklistContext = activeTask.checklist ? activeTask.checklist.map(c => `- ${c.text}`).join('\n') : "";
      const result = await generateTechnicalSpec(activeTask.prompt, getProjectContext(tasks), checklistContext);
      
      setTasks(p => p.map(t => t.id === activeTask.id ? { ...t, status: TaskStatus.COMPLETED, result } : t));
      if (autoSaveToDisk) handleExportState();

    } catch (error) {
       const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف";
       setTasks(p => p.map(t => t.id === activeTask.id ? { ...t, status: TaskStatus.FAILED, errorMessage: errorMsg } : t));
       setSyncStatus('error');
    }
  };
  
  const handleGenerateChecklist = async () => {
    if (!activeTask) return;
    setIsChecklistGenerating(true);
    try {
      const items = await generateChecklist(activeTask.prompt, activeTask.goal);
      const newChecklist: ChecklistItem[] = items.map(text => ({
        id: `c-${activeTask.id}-${Date.now()}-${Math.random()}`,
        text,
        completed: false,
      }));
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, checklist: newChecklist } : t));
      setSyncStatus('unsynced');
    } catch (error) {
       alert(error instanceof Error ? error.message : "فشل توليد قائمة المراجعة");
    } finally {
      setIsChecklistGenerating(false);
    }
  };

  const runBatchProcess = async (taskIds: string[], initialTasksState: ProjectTask[]) => {
    setIsBatchProcessing(true);
    stopBatchRef.current = false;
    setSyncStatus('syncing');

    let currentTasksState = initialTasksState;

    for (let i = 0; i < taskIds.length; i++) {
      if (stopBatchRef.current) {
        setProcessingMessage("تم إيقاف التنفيذ.");
        break;
      }
      
      const taskId = taskIds[i];
      const task = currentTasksState.find(t => t.id === taskId);
      if (!task) continue;

      setProcessingMessage(`(${i + 1}/${taskIds.length}) جاري معالجة: ${task.title}`);
      
      currentTasksState = currentTasksState.map(t => t.id === taskId ? { ...t, status: TaskStatus.PROCESSING, errorMessage: undefined } : t);
      setTasks(currentTasksState);

      try {
        const projectContext = getProjectContext(currentTasksState);
        const checklistContext = task.checklist ? task.checklist.map(c => `- ${c.text}`).join('\n') : "";
        const result = await generateTechnicalSpec(task.prompt, projectContext, checklistContext);
        
        currentTasksState = currentTasksState.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, result } : t);
        setTasks(currentTasksState);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "حدث خطأ غير معروف";

        // Intelligent Auto-Recovery for Quota Errors
        if (errorMsg.includes('تجاوزت الحصة')) {
          setProcessingMessage("تم الوصول إلى الحد الأقصى للطلبات. سيتم إيقاف التنفيذ مؤقتاً لمدة دقيقة واحدة ثم المتابعة تلقائياً.");
          await delay(60000); // Pause for 1 minute
          i--; // Decrement index to retry the same task
          continue; // Skip the rest of the loop (including the delay at the end)
        }

        // Handle other errors normally
        currentTasksState = currentTasksState.map(t => t.id === taskId ? { ...t, status: TaskStatus.FAILED, errorMessage: errorMsg } : t);
        setTasks(currentTasksState);
        setSyncStatus('error');
      }

      if (i < taskIds.length - 1 && !stopBatchRef.current) {
        await delay(BATCH_TASK_DELAY_MS);
      }
    }

    setIsBatchProcessing(false);
    if (!stopBatchRef.current) {
        setProcessingMessage("اكتمل التنفيذ المتسلسل بنجاح!");
        if (autoSaveToDisk) handleExportState();
        setSyncStatus('synced');
    }
    setTimeout(() => setProcessingMessage(null), 4000);
  };

  const handleGeneratePending = () => {
    const pendingIds = EXECUTION_ORDER.filter(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.status !== TaskStatus.COMPLETED;
    });
    if(pendingIds.length > 0) {
        runBatchProcess(pendingIds, tasks);
    } else {
        alert("جميع المهام مكتملة بالفعل.");
    }
  };

  const handleRegenerateAll = () => {
    if (window.confirm("هل أنت متأكد؟ سيتم مسح جميع المخرجات الحالية وإعادة توليد المشروع بالكامل.")) {
      // 1. Create the new state with all tasks reset.
      const resetTasks = tasks.map(t => ({
        ...t,
        status: TaskStatus.PENDING,
        result: undefined,
        errorMessage: undefined,
      }));

      // 2. Apply the state update to immediately reflect the reset in the UI.
      setTasks(resetTasks);
      
      // 3. Instead of setTimeout, trigger a useEffect to run the batch process.
      // This is a more robust pattern in React for handling side effects after state updates.
      setRegenerationTrigger(resetTasks);
    }
  };
  
  const handleClearAllOutputs = () => {
    if (window.confirm("هل أنت متأكد؟ سيتم مسح جميع النتائج وحالات المهام.")) {
      setTasks(prev => prev.map(t => ({
        ...t,
        status: TaskStatus.PENDING,
        result: undefined,
        errorMessage: undefined,
      })));
      setSyncStatus('unsynced');
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
      createdAt: Date.now(),
      checklist: []
    };
    setTasks([...tasks, newTask]);
    setActiveTaskId(newTask.id);
    setSyncStatus('unsynced');
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if(window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      const newTasks = tasks.filter(t => t.id !== taskId);
      setTasks(newTasks);
      if (activeTaskId === taskId) setActiveTaskId(null);
      setSyncStatus('unsynced');
    }
  };

  const handleResetAll = () => {
    if(window.confirm('هل أنت متأكد؟ سيتم حذف جميع التغييرات والعودة للحالة الأولية.')) {
      setTasks(INITIAL_TASKS);
      setActiveTaskId(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_TASK_KEY);
      setSyncStatus('synced');
      setIsSettingsOpen(false);
    }
  };
  
  // Checklist handlers
  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => t.id === activeTaskId ? {
      ...t,
      checklist: t.checklist?.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c)
    } : t));
    setSyncStatus('unsynced');
  };

  const handleAddChecklistItem = (text: string) => {
    if (!activeTaskId || !text.trim()) return;
    const newItem: ChecklistItem = {
      id: `c-${activeTaskId}-${Date.now()}`,
      text: text.trim(),
      completed: false
    };
    setTasks(prev => prev.map(t => t.id === activeTaskId ? {
      ...t,
      checklist: [...(t.checklist || []), newItem]
    } : t));
    setSyncStatus('unsynced');
  };

  const handleDeleteChecklistItem = (itemId: string) => {
     if (!activeTaskId) return;
     setTasks(prev => prev.map(t => t.id === activeTaskId ? {
      ...t,
      checklist: t.checklist?.filter(c => c.id !== itemId)
    } : t));
    setSyncStatus('unsynced');
  };
  
  const handleDownloadCurrent = () => {
    if (activeTask && activeTask.result) {
      const blob = new Blob([activeTask.result], { type: 'text/markdown;charset=utf-8' });
      const filename = `${activeTask.title.replace(/[\/\\?%*:|"<>]/g, '_')}.md`;
      downloadFile(blob, filename);
    }
  };

  const hasCompletedTasks = useMemo(() => tasks.some(t => t.status === TaskStatus.COMPLETED), [tasks]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleFileImport} />

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-l border-slate-200 flex-shrink-0 transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center">
            <Cpu className="w-6 h-6 text-primary ml-2" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Muhandis<span className="text-primary">AI</span></h1>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="px-4 pt-4 pb-2 space-y-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
            <input type="text" placeholder="بحث في المهام..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['ALL', 'PENDING', 'COMPLETED'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                        filterStatus === status
                            ? 'bg-primary text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {status === 'ALL' ? 'الكل' : status === 'PENDING' ? 'قيد الانتظار' : 'مكتمل'}
                </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">المهام ({filteredTasks.length})</h2>
            <button onClick={createNewTask} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="إضافة مهمة"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} isActive={task.id === activeTaskId} onClick={handleTaskClick} />
                <button onClick={(e) => handleDeleteTask(e, task.id)} className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50" title="حذف المهمة">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )) : <div className="text-center py-8 text-slate-400 text-sm">لا توجد نتائج مطابقة</div>}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">التحكم في التنفيذ</h3>
             {isBatchProcessing ? (
                <div className="space-y-2 text-center">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium animate-pulse">
                        {processingMessage || 'جاري التهيئة...'}
                    </div>
                    <button 
                        onClick={handleStopBatch}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow"
                    >
                        <Square className="w-4 h-4" />
                        إيقاف التنفيذ
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                     <button 
                        onClick={handleGeneratePending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                    >
                        <Play className="w-4 h-4" />
                        بدء التنفيذ المتسلسل
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={handleRegenerateAll}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            إعادة توليد الكل
                        </button>
                         <button 
                            onClick={handleClearAllOutputs}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            مسح المخرجات
                        </button>
                    </div>
                </div>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><LayoutDashboard className="w-5 h-5" /></button>
            {activeTask && (
               <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>المشاريع</span><span>/</span>
                  <input type="text" value={activeTask.title}
                    onChange={(e) => {
                      setTasks(p => p.map(t => t.id === activeTaskId ? {...t, title: e.target.value} : t));
                      setSyncStatus('unsynced');
                    }}
                    className="text-slate-900 font-medium bg-transparent border-none focus:ring-0 p-0 w-64 hover:bg-slate-50 rounded" />
               </div>
            )}
          </div>
          <div className="flex items-center gap-3">
             <GitHubSyncStatus status={syncStatus} />
             
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                    onClick={handleTriggerImport}
                    className="p-2 hover:bg-white rounded-md text-slate-600 hover:text-primary transition-colors"
                    title="استعادة مشروع من ملف نسخة احتياطية (.json)"
                >
                    <Upload className="w-4 h-4" />
                </button>
                <button
                    onClick={handleExportState}
                    className="p-2 hover:bg-white rounded-md text-slate-600 hover:text-primary transition-colors"
                    title="حفظ نسخة احتياطية من جميع مهامك وتقدمك في ملف .json. استخدم هذا الملف لاستعادة عملك لاحقاً."
                >
                    <FileJson className="w-4 h-4" />
                </button>
             </div>
             
             <div className="w-px h-6 bg-slate-200"></div>

             <button
                onClick={handleExportProject}
                disabled={!hasCompletedTasks}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                title="تنزيل الكود المصدري (.zip) - لا يمكن استيراد هذا الملف"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملفات الكود</span>
              </button>
              
              <div className="relative">
                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="الإعدادات">
                  <Settings className="w-5 h-5" />
                </button>
                {isSettingsOpen && (
                  <div ref={settingsRef} className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">حفظ تلقائي على القرص</span>
                                <span className="text-xs text-slate-500 mt-1">تنزيل نسخة احتياطية (json) بعد كل توليد</span>
                            </div>
                            <input type="checkbox" checked={autoSaveToDisk} onChange={e => setAutoSaveToDisk(e.target.checked)} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="border-t border-slate-100 p-2">
                        <button onClick={handleResetAll} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <Power className="w-4 h-4" />
                            <span>إعادة تعيين المشروع بالكامل</span>
                        </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {activeTask ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Code2 className="w-5 h-5 text-indigo-500" />المتطلبات التقنية (Prompt)</h3>
                  <button onClick={handleGenerate} disabled={activeTask.status === TaskStatus.PROCESSING || isBatchProcessing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all ${activeTask.status === TaskStatus.PROCESSING || isBatchProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg shadow-indigo-500/20'}`}>
                    {activeTask.status === TaskStatus.PROCESSING ? <><RefreshCw className="w-4 h-4 animate-spin" />جاري المعالجة...</> : <><Bot className="w-4 h-4" />توليد المواصفات</>}
                  </button>
                </div>
                <textarea value={activeTask.prompt} onChange={(e) => handlePromptChange(e.target.value)}
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed text-slate-700 resize-none"
                  placeholder="اكتب المتطلبات هنا..." dir="rtl" />
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Crosshair className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-slate-800">الهدف (Goal)</h3>
                </div>
                <input type="text" value={activeTask.goal} onChange={(e) => handleGoalChange(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-700"
                  placeholder="حدد الهدف..." />
              </section>

              <Checklist 
                task={activeTask}
                onToggleItem={handleToggleChecklistItem}
                onAddItem={handleAddChecklistItem}
                onDeleteItem={handleDeleteChecklistItem}
                onGenerate={handleGenerateChecklist}
                isGenerating={isChecklistGenerating}
              />
              
              {activeTask.errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 font-bold mb-2">
                          <AlertCircle className="w-5 h-5" />
                          حدث خطأ أثناء المعالجة
                      </div>
                      <p className="text-sm font-mono text-red-700">{activeTask.errorMessage}</p>
                  </div>
              )}

              {activeTask.result && (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-slate-800">المواصفات المولدة</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDownloadCurrent} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="تحميل Markdown"><Download className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <SimpleMarkdown content={activeTask.result} />
                </section>
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