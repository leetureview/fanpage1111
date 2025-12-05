import React from 'react';
import { LayoutDashboard, Calendar, Trello, PlusCircle, Settings, LogOut, FileText } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onCreateNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onCreateNew }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'CALENDAR', label: 'Lịch nội dung', icon: Calendar },
    { id: 'KANBAN', label: 'Bảng Kanban', icon: Trello },
    { id: 'TEMPLATES', label: 'Mẫu & Ý tưởng', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-10">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
          GO
        </div>
        <div>
            <h1 className="text-sm font-bold text-gray-800">Fanpage Care</h1>
            <p className="text-xs text-gray-400">123 GO Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium mb-6 shadow-sm transition-all"
        >
          <PlusCircle size={20} />
          <span>Tạo bài mới</span>
        </button>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings size={20} />
          <span>Cài đặt</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-1">
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;