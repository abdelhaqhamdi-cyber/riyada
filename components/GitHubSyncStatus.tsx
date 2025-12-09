import React from 'react';
import { HardDrive, Save, RefreshCw, AlertCircle } from 'lucide-react';

type SyncStatus = 'synced' | 'unsynced' | 'syncing' | 'error';

interface GitHubSyncStatusProps {
  status: SyncStatus;
}

export const GitHubSyncStatus: React.FC<GitHubSyncStatusProps> = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'جاري الحفظ...',
          className: 'bg-blue-50 text-blue-700 border-blue-100',
          tooltip: 'يتم الآن حفظ التغييرات في متصفحك.'
        };
      case 'unsynced':
        return {
          icon: <Save className="w-4 h-4" />,
          text: 'تغييرات غير محفوظة',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-100',
          tooltip: 'لديك تغييرات لم يتم حفظها بعد. سيتم الحفظ تلقائياً.'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'فشل الحفظ',
          className: 'bg-red-50 text-red-700 border-red-100',
          tooltip: 'حدث خطأ أثناء محاولة حفظ تقدمك.'
        };
      case 'synced':
      default:
        return {
          icon: <HardDrive className="w-4 h-4" />,
          text: 'محفوظة محلياً',
          className: 'bg-green-50 text-green-700 border-green-100',
          tooltip: 'تم حفظ تقدمك في متصفحك. نوصي بتصدير حالة المشروع (ملف JSON) كنسخة احتياطية.'
        };
    }
  };

  const { icon, text, className, tooltip } = getStatusDetails();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border shadow-sm transition-all duration-300 ${className}`}
      title={tooltip}
    >
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </div>
  );
};
