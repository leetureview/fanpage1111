
import React, { useState, DragEvent } from 'react';
import { ContentPlan, PostStatus, PostType, Fanpage } from '../types';
import { STATUS_COLORS } from '../constants';
import { Filter, Calendar as CalendarIcon, Image as ImageIcon, Video, Film, Layers, Type, MoreHorizontal } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

interface KanbanViewProps {
  posts: ContentPlan[];
  fanpage: Fanpage;
  onPostClick: (post: ContentPlan) => void;
  onStatusChange: (postId: string, newStatus: PostStatus) => void;
}

const STATUS_LABELS_VN: Record<PostStatus, string> = {
    [PostStatus.IDEA]: 'Ý TƯỞNG',
    [PostStatus.DRAFT]: 'BẢN NHÁP',
    [PostStatus.REVIEW]: 'CHỜ DUYỆT',
    [PostStatus.PUBLISHED]: 'ĐÃ ĐĂNG',
};

const FormatIcon = ({ type, size = 14 }: { type: PostType, size?: number }) => {
    switch (type) {
        case PostType.IMAGE: return <ImageIcon size={size} />;
        case PostType.VIDEO: return <Video size={size} />;
        case PostType.REEL: return <Film size={size} />;
        case PostType.ALBUM: return <Layers size={size} />;
        default: return <Type size={size} />;
    }
};

const KanbanView: React.FC<KanbanViewProps> = ({ posts, fanpage, onPostClick, onStatusChange }) => {
  const [filterFormat, setFilterFormat] = useState<PostType | 'ALL'>('ALL');
  const [filterTime, setFilterTime] = useState<'ALL' | 'THIS_MONTH'>('ALL');
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PostStatus | null>(null);

  // --- Filtering Logic ---
  const filteredPosts = posts.filter(post => {
      // Filter by Format
      if (filterFormat !== 'ALL' && post.format !== filterFormat) return false;
      
      // Filter by Time
      if (filterTime === 'THIS_MONTH') {
          const postDate = new Date(post.postDate);
          const now = new Date();
          if (postDate.getMonth() !== now.getMonth() || postDate.getFullYear() !== now.getFullYear()) {
              return false;
          }
      }
      return true;
  });

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, postId: string) => {
    setDraggedPostId(postId);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image if needed, or default browser ghost
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: PostStatus) => {
    e.preventDefault(); // Necessary to allow dropping
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: PostStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedPostId) {
        onStatusChange(draggedPostId, newStatus);
        setDraggedPostId(null);
    }
  };

  const columns = Object.values(PostStatus);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar Filters */}
      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
         <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-2">
            <Filter size={16} />
            <span>Bộ lọc:</span>
         </div>
         
         <div className="relative">
            <select 
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value as any)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-green-500 focus:border-green-500"
            >
                <option value="ALL">Tất cả định dạng</option>
                {Object.values(PostType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
         </div>

         <div className="relative">
             <select 
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value as any)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-green-500 focus:border-green-500"
            >
                <option value="ALL">Tất cả thời gian</option>
                <option value="THIS_MONTH">Tháng này</option>
            </select>
         </div>

         <div className="ml-auto text-xs text-gray-400">
            Kéo thả thẻ để chuyển trạng thái
         </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-[1000px]">
            {columns.map((status) => {
            const columnPosts = filteredPosts.filter((p) => p.status === status);
            const isDragOver = dragOverCol === status;
            
            return (
                <div 
                    key={status} 
                    className={`flex-1 flex flex-col min-w-[280px] rounded-xl transition-colors duration-200 max-h-full border ${isDragOver ? 'bg-green-50 border-green-300' : 'bg-gray-100 border-gray-200'}`}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    {/* Column Header */}
                    <div className="p-4 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status].split(' ')[0].replace('bg-', 'bg-')}`}></span>
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{STATUS_LABELS_VN[status]}</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                            {columnPosts.length}
                        </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
                        {columnPosts.map((post) => (
                        <div
                            key={post.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, post.id)}
                            onClick={() => onPostClick(post)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
                            style={{ borderLeft: `4px solid ${fanpage.mainColor}` }}
                        >
                            {/* Card Header: Date & Goal */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <CalendarIcon size={12} />
                                    <span>{new Date(post.postDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {post.goal}
                                </span>
                            </div>

                            {/* Card Body: Topic & Caption Snippet */}
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-400"><FormatIcon type={post.format} size={14} /></span>
                                    <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{post.topic || 'Chưa có tiêu đề'}</h4>
                                </div>
                                {post.captionDraft && (
                                    <p className="text-xs text-gray-500 line-clamp-2 pl-5 border-l-2 border-gray-100 italic">
                                        "{post.captionDraft}"
                                    </p>
                                )}
                            </div>

                            {/* Card Footer: Fanpage & Platform */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-1.5">
                                    <img src={fanpage.avatar} alt="" className="w-4 h-4 rounded-full" />
                                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[80px]">{fanpage.name}</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-gray-400 hover:text-green-600">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                        {columnPosts.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                Thả bài viết vào đây
                            </div>
                        )}
                    </div>
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
};

export default KanbanView;