import React from 'react';
import { ProjectTask, TaskStatus } from '../types';
import { Layers, Server, ShieldCheck, ArrowLeft, Globe, Smartphone, Moon, BrainCircuit, Bot, Activity, Star, Database, Layout, Search, Calendar, CreditCard, ClipboardCheck, Trophy, Sparkles, LayoutDashboard, Banknote, Workflow, Rocket, Megaphone, LineChart, ShoppingBag, Map, BarChart3, DatabaseZap, Crosshair, Medal, Award, UserCheck, Building2, Wrench, FileSignature, TrendingUp, PieChart, Briefcase, Landmark, UserCog, BadgePercent, Package, FileText, Lock, Ticket, ToggleLeft, Users } from 'lucide-react';

interface TaskCardProps {
  task: ProjectTask;
  onClick: (task: ProjectTask) => void;
  isActive: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isActive }) => {
  const getIcon = () => {
    // Initial Tasks
    if (task.title.includes('Microservices') || task.title.includes('البنية')) return <Server className="w-6 h-6" />;
    if (task.title.includes('Auth') || task.title.includes('المصادقة')) return <ShieldCheck className="w-6 h-6" />;
    if (task.title.includes('i18n') || task.title.includes('التدويل')) return <Globe className="w-6 h-6" />;
    if (task.title.includes('Components') || task.title.includes('عناصر')) return <Layout className="w-6 h-6" />;
    if (task.title.includes('Search') || task.title.includes('البحث')) return <Search className="w-6 h-6" />;
    if (task.title.includes('Booking') || task.title.includes('الحجز')) return <Calendar className="w-6 h-6" />;
    if (task.title.includes('Payment') || task.title.includes('الدفع')) return <CreditCard className="w-6 h-6" />;
    if (task.title.includes('QA') || task.title.includes('الجودة') || task.title.includes('الاختبار')) return <ClipboardCheck className="w-6 h-6" />;
    if (task.title.includes('UI') || task.title.includes('واجهة') || task.title.includes('Mobile') || task.title.includes('هاتف')) return <Smartphone className="w-6 h-6" />;
    if (task.title.includes('Dark') || task.title.includes('الوضع')) return <Moon className="w-6 h-6" />;
    if (task.title.includes('Recommendation') || task.title.includes('التوصيات')) return <BrainCircuit className="w-6 h-6" />;
    if (task.title.includes('Assistant') || task.title.includes('المساعد')) return <Bot className="w-6 h-6" />;
    if (task.title.includes('Health') || task.title.includes('الصحة')) return <Activity className="w-6 h-6" />;
    if (task.title.includes('Rating') || task.title.includes('التقييم')) return <Star className="w-6 h-6" />;
    if (task.title.includes('Database') || task.title.includes('قاعدة البيانات')) return <Database className="w-6 h-6" />;
    if (task.title.includes('Challenges') || task.title.includes('التحديات')) return <Trophy className="w-6 h-6" />;
    if (task.title.includes('LLM') || task.title.includes('نموذج اللغة')) return <Sparkles className="w-6 h-6" />;
    if (task.title.includes('Admin') || task.title.includes('المسؤول') || task.title.includes('لوحة تحكم')) return <LayoutDashboard className="w-6 h-6" />;
    if (task.title.includes('Revenue') || task.title.includes('الإيرادات') || task.title.includes('العمولات')) return <Banknote className="w-6 h-6" />;
    if (task.title.includes('CI/CD') || task.title.includes('أنابيب')) return <Workflow className="w-6 h-6" />;
    if (task.title.includes('Deployment') || task.title.includes('النشر')) return <Rocket className="w-6 h-6" />;
    if (task.title.includes('Launch') || task.title.includes('الإطلاق')) return <Megaphone className="w-6 h-6" />;
    
    // Vendor & Advanced Analytics
    if (task.title.includes('Time Series') || task.title.includes('الزمنية')) return <LineChart className="w-6 h-6" />;
    if (task.title.includes('Basket') || task.title.includes('سلة')) return <ShoppingBag className="w-6 h-6" />;
    if (task.title.includes('Geospatial') || task.title.includes('المكانية') || task.title.includes('الخريطة')) return <Map className="w-6 h-6" />;
    if (task.title.includes('Benchmarking') || task.title.includes('المقارنة')) return <BarChart3 className="w-6 h-6" />;
    if (task.title.includes('Sponsorship') || task.title.includes('رعاية')) return <Trophy className="w-6 h-6" />;
    if (task.title.includes('Branding') || task.title.includes('تخصيص')) return <LayoutDashboard className="w-6 h-6" />;

    // Hyper-Personalization
    if (task.title.includes('Dynamic') || task.title.includes('مخططات')) return <DatabaseZap className="w-6 h-6" />;
    if (task.title.includes('Precision') || task.title.includes('الدقيق')) return <Crosshair className="w-6 h-6" />;
    if (task.title.includes('Leaderboards') || task.title.includes('الصدارة')) return <Medal className="w-6 h-6" />;
    if (task.title.includes('Gamification') || task.title.includes('الشارات')) return <Award className="w-6 h-6" />;
    if (task.title.includes('Personalized Dashboard') || task.title.includes('اللاعب المخصصة')) return <UserCheck className="w-6 h-6" />;
    
    // Smart Venue Management System (SVMS)
    if (task.title.includes('Unified Resource') || task.title.includes('الموارد المتعددة')) return <Building2 className="w-6 h-6" />;
    if (task.title.includes('Pricing Engine') || task.title.includes('التسعير الديناميكي')) return <TrendingUp className="w-6 h-6" />;
    if (task.title.includes('Maintenance') || task.title.includes('الصيانة')) return <Wrench className="w-6 h-6" />;
    if (task.title.includes('Contracts') || task.title.includes('العقود')) return <FileSignature className="w-6 h-6" />;
    if (task.title.includes('Venue BI') || task.title.includes('ذكاء الأعمال')) return <PieChart className="w-6 h-6" />;
    if (task.title.includes('Investment') || task.title.includes('الاستثمار')) return <Briefcase className="w-6 h-6" />;

    // Owner Personas
    if (task.title.includes('Persona Engine') || task.title.includes('تخصيص نمط المالك')) return <UserCog className="w-6 h-6" />;
    if (task.title.includes('Profit-Driven') || task.title.includes('القطاع الخاص')) return <BadgePercent className="w-6 h-6" />;
    if (task.title.includes('Municipal') || task.title.includes('المرافق العامة')) return <Landmark className="w-6 h-6" />;

    // Hybrid & Advanced Operations (v6)
    if (task.title.includes('Hybrid Pricing') || task.title.includes('التسعير الهجين')) return <Ticket className="w-6 h-6" />;
    if (task.title.includes('Asset') || task.title.includes('الأصول')) return <Package className="w-6 h-6" />;
    if (task.title.includes('Dual-Mode') || task.title.includes('التقارير المزدوج')) return <FileText className="w-6 h-6" />;
    if (task.title.includes('Lost Demand') || task.title.includes('الطلب الضائع')) return <LineChart className="w-6 h-6" />;
    if (task.title.includes('ACL') || task.title.includes('الصلاحيات')) return <Lock className="w-6 h-6" />;

    // Technical Harmony (v7)
    if (task.title.includes('Flexible Data') || task.title.includes('البنية المرنة')) return <Database className="w-6 h-6" />;
    if (task.title.includes('Mode Toggle') || task.title.includes('التبديل بين الأنماط')) return <ToggleLeft className="w-6 h-6" />;
    if (task.title.includes('Consumer Behavior') || task.title.includes('سلوك المستهلك')) return <Users className="w-6 h-6" />;

    return <Layers className="w-6 h-6" />;
  };

  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case TaskStatus.PROCESSING: return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case TaskStatus.FAILED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusText = () => {
     switch (task.status) {
      case TaskStatus.COMPLETED: return 'مكتمل';
      case TaskStatus.PROCESSING: return 'جاري المعالجة...';
      case TaskStatus.FAILED: return 'فشل';
      default: return 'قيد الانتظار';
    }
  };

  return (
    <div 
      onClick={() => onClick(task)}
      className={`
        cursor-pointer rounded-xl p-5 border transition-all duration-200 group relative overflow-hidden
        ${isActive 
          ? 'bg-white border-primary shadow-lg ring-1 ring-primary' 
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-50 text-primary' : 'bg-slate-50 text-slate-500'}`}>
          {getIcon()}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <h3 className={`font-bold text-lg mb-2 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
        {task.title}
      </h3>
      
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {task.goal}
      </p>

      <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>عرض التفاصيل</span>
        <ArrowLeft className="w-4 h-4 mr-1" />
      </div>
    </div>
  );
};