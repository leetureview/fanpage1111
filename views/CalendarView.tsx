import React, { useState } from 'react';
import { ContentPlan, PostStatus, PostType, PostGoal, Fanpage } from '../types';
import { Image as ImageIcon, Video, Film, Layers, Type, Filter, ChevronLeft, ChevronRight, LayoutGrid, List, Plus } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface CalendarViewProps {
  posts: ContentPlan[];
  fanpage: Fanpage;
  onPostClick: (post: ContentPlan) => void;
  onNewPost: (date: string) => void;
}

const FormatIcon = ({ type, size = 14 }: { type: PostType, size?: number }) => {
    switch (type) {
        case PostType.IMAGE: return <ImageIcon size={size} />;
        case PostType.VIDEO: return <Video size={size} />;
        case PostType.REEL: return <Film size={size} />;
        case PostType.ALBUM: return <Layers size={size} />;
        default: return <Type size={size} />;
    }
};

const CalendarView: React.FC<CalendarViewProps> = ({ posts, fanpage, onPostClick, onNewPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'MONTH' | 'LIST'>('MONTH');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'ALL'>('ALL');
  const [filterFormat, setFilterFormat] = useState<PostType | 'ALL'>('ALL');

  // Calendar Logic
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Data Filtering
  const filteredPosts = posts.filter(post => {
      if (filterStatus !== 'ALL' && post.status !== filterStatus) return false;
      if (filterFormat !== 'ALL' && post.format !== filterFormat) return false;
      return true;
  });

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredPosts.filter(p => p.postDate === dateStr);
  };

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentDate(newDate);
  };

  const statusColorMap = {
      [PostStatus.IDEA]: 'border-l-4 border-l-gray-300 bg-gray-50',
      [PostStatus.DRAFT]: 'border-l-4 border-l-blue-400 bg-blue-50',
      [PostStatus.REVIEW]: 'border-l-4 border-l-orange-400 bg-orange-50',
      [PostStatus.PUBLISHED]: 'border-l-4 border-l-green-500 bg-green-50',
  };

  return (
    <div className="flex flex-col h-full gap-4">
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left: Date Nav */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={18} /></button>
                    <span className="px-4 font-bold text-gray-700 min-w-[140px] text-center capitalize">
                        Tháng {currentMonth + 1}, {currentYear}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={18} /></button>
                </div>
                <button 
                    onClick={() => { setCurrentDate(new Date()); }}
                    className="text-sm text-gray-500 hover:text-green-600 font-medium"
                >
                    Hôm nay
                </button>
            </div>

            {/* Middle: Filters */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <Filter size={14} className="text-gray-400" />
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-transparent text-sm border-none focus:ring-0 text-gray-600 cursor-pointer"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <select 
                    value={filterFormat}
                    onChange={(e) => setFilterFormat(e.target.value as any)}
                    className="bg-transparent text-sm border-none focus:ring-0 text-gray-600 cursor-pointer"
                >
                    <option value="ALL">Tất cả định dạng</option>
                    {Object.values(PostType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Right: View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                    onClick={() => setViewMode('MONTH')}
                    className={`p-1.5 rounded ${viewMode === 'MONTH' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-1.5 rounded ${viewMode === 'LIST' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <List size={18} />
                </button>
            </div>
        </div>
      
        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {days.map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {day}
                </div>
                ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px overflow-y-auto">
                {/* Empty slots for previous month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50/50 min-h-[120px]"></div>
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayPosts = getPostsForDay(day);
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

                    return (
                        <div 
                            key={day} 
                            className={`bg-white min-h-[140px] p-2 hover:bg-gray-50 transition-colors group relative flex flex-col ${isToday ? 'bg-blue-50/30' : ''}`}
                            onClick={() => onNewPost(dateStr)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 text-green-600 hover:bg-green-100 p-1 rounded transition-opacity">
                                    <Plus size={14} />
                                </button>
                            </div>
                            
                            <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[120px]">
                                {dayPosts.map(post => (
                                    <div 
                                        key={post.id}
                                        onClick={(e) => { e.stopPropagation(); onPostClick(post); }}
                                        className={`rounded px-2 py-1.5 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent ${statusColorMap[post.status]}`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 text-gray-800">
                                            <FormatIcon type={post.format} size={12} />
                                            <span className="truncate text-xs font-semibold leading-tight">{post.topic || 'Không tiêu đề'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500 opacity-80">
                                            <span>{post.timeSlot}</span>
                                            <span>{post.goal.slice(0, 3)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CalendarView;