
import React, { useEffect, useState } from 'react';
import { Zap, Clock, CheckCircle, FileText, ChevronDown, Plus, Lightbulb, ArrowRight, Calendar, Facebook } from 'lucide-react';
import { ContentPlan, PostStatus, Fanpage } from '../types';
import StatusBadge from '../components/StatusBadge';
import { generatePostIdeas, generateTopicSuggestion } from '../services/geminiService';

interface DashboardViewProps {
  posts: ContentPlan[];
  fanpage: Fanpage;
  allFanpages: Fanpage[];
  onFanpageChange: (id: string) => void;
  onPostClick: (post: ContentPlan) => void;
  onCreateFromIdea: (idea: string, topic?: string) => void;
  onQuickCreate: () => void;
  onConnectFacebook: () => void; // New prop
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
    posts, 
    fanpage, 
    allFanpages, 
    onFanpageChange, 
    onPostClick, 
    onCreateFromIdea,
    onQuickCreate,
    onConnectFacebook
}) => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState<Record<string, string>>({});

  // --- Statistics Calculation ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Format date helper YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const todayStr = formatDate(today);

  // Calculate Next 7 Days for Gaps
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return formatDate(d);
  });

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const publishedLast7Days = posts.filter(p => {
    const pDate = new Date(p.postDate);
    return p.status === PostStatus.PUBLISHED && pDate >= sevenDaysAgo && pDate <= today;
  }).length;

  const weeklyGoal = 5; 
  const weeklyProgress = Math.min((publishedLast7Days / weeklyGoal) * 100, 100);

  // --- COLUMN 1: READY TO POST (Today) ---
  const readyToPostItems = posts.filter(p => {
    return p.postDate === todayStr && (p.status === PostStatus.DRAFT || p.status === PostStatus.REVIEW);
  });

  // --- COLUMN 2: TO-DO (Creation Needed) ---
  const creationNeededItems = posts.filter(p => {
    const pDate = new Date(p.postDate);
    pDate.setHours(0,0,0,0);
    return (
        p.status === PostStatus.IDEA && 
        pDate >= today && 
        pDate <= threeDaysFromNow
    );
  }).sort((a, b) => new Date(a.postDate).getTime() - new Date(b.postDate).getTime());

  // --- COLUMN 3: CALENDAR GAPS ---
  const gapDays = next7Days.filter(dateStr => {
      // Check if any post exists for this date
      return !posts.some(p => p.postDate === dateStr);
  });


  useEffect(() => {
    setIdeas([]);
  }, [fanpage.id]);

  // Auto-fetch suggestions for gaps
  useEffect(() => {
    const fetchSuggestions = async () => {
        const missing = gapDays.filter(d => !topicSuggestions[d]);
        if (missing.length > 0) {
            const newSuggestions: Record<string, string> = {};
            for (const date of missing) {
                // simple optimization: fetch sequentially or parallel
                const topic = await generateTopicSuggestion(fanpage, date);
                newSuggestions[date] = topic;
            }
            setTopicSuggestions(prev => ({ ...prev, ...newSuggestions }));
        }
    };
    if (gapDays.length > 0) {
        fetchSuggestions();
    }
  }, [fanpage.id, gapDays.join(',')]); // Re-run if gaps change


  const handleGenerateIdeas = async () => {
      setLoadingIdeas(true);
      const newIdeas = await generatePostIdeas(fanpage);
      setIdeas(newIdeas);
      setLoadingIdeas(false);
  }

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto h-full flex flex-col">
      {/* 1. Top Header: Fanpage Selector & FB Connect */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
            <img src={fanpage.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
            <div className="relative group">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Đang quản lý</div>
                <select 
                    value={fanpage.id}
                    onChange={(e) => onFanpageChange(e.target.value)}
                    className="appearance-none bg-transparent font-bold text-xl text-gray-800 pr-8 focus:outline-none cursor-pointer hover:text-green-600 transition-colors"
                >
                    {allFanpages.map(fp => (
                        <option key={fp.id} value={fp.id}>{fp.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-0 bottom-1.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* FB Connection Status */}
            {fanpage.isConnected ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                    <Facebook size={12} fill="currentColor" />
                    Đã kết nối
                </div>
            ) : (
                <button 
                    onClick={onConnectFacebook}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded-full border border-gray-200 transition-colors"
                >
                    <Facebook size={12} />
                    Kết nối Facebook
                </button>
            )}
        </div>
        <div className="flex gap-3">
             <button 
                onClick={onQuickCreate}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Plus size={18} />
                <span>Tạo bài hôm nay</span>
            </button>
        </div>
      </div>

      {/* 2. Idea Slider (Horizontal Scroll) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 shrink-0">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                Kho Ý Tưởng AI
            </h3>
            <button 
                onClick={handleGenerateIdeas}
                className="text-xs text-purple-600 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
                {loadingIdeas ? 'Đang tạo...' : 'Làm mới ý tưởng ↻'}
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory custom-scrollbar">
             {ideas.length > 0 ? (
                ideas.map((idea, idx) => (
                    <div key={idx} className="snap-center min-w-[280px] w-[280px] bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all flex flex-col justify-between h-[160px]">
                        <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">"{idea}"</p>
                        <button 
                            onClick={() => onCreateFromIdea(idea, 'Ý tưởng từ AI')}
                            className="mt-3 w-full text-xs bg-white text-green-600 border border-green-200 py-1.5 rounded hover:bg-green-600 hover:text-white transition-colors font-medium shadow-sm"
                        >
                            Viết bài này
                        </button>
                    </div>
                ))
            ) : (
                <div className="w-full h-[120px] flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Lightbulb size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">Bấm "Làm mới" để nhận 5 ý tưởng ngay.</p>
                </div>
            )}
          </div>
      </div>

      {/* 3. Daily Care Columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Column 1: Today - Ready to Post */}
          <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100 bg-green-50/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Sẵn sàng đăng (Hôm nay)
                  </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {readyToPostItems.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                          <p className="text-sm">Không có bài nào cần đăng hôm nay.</p>
                      </div>
                  ) : (
                      readyToPostItems.map(post => (
                          <div key={post.id} className="p-3 border border-gray-200 rounded-lg bg-white hover:border-green-400 transition-colors shadow-sm">
                              <div className="flex justify-between mb-2">
                                  <StatusBadge status={post.status} />
                                  <span className="text-xs text-gray-500 font-mono">{post.timeSlot}</span>
                              </div>
                              <h4 className="font-bold text-gray-800 text-sm mb-1">{post.topic}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.captionDraft || 'Chưa có caption'}</p>
                              <div className="flex gap-2">
                                  <button onClick={() => onPostClick(post)} className="flex-1 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded text-gray-700">Chi tiết</button>
                                  <button onClick={() => { navigator.clipboard.writeText(post.captionDraft); alert('Đã copy caption!'); }} className="flex-1 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded">Copy Caption</button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Column 2: To-Do - Needs Content */}
          <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100 bg-orange-50/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Clock size={18} className="text-orange-500" />
                      Cần viết nội dung (3 ngày tới)
                  </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {creationNeededItems.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                          <p className="text-sm">Tuyệt vời! Bạn đã xử lý hết bài tồn đọng.</p>
                      </div>
                  ) : (
                      creationNeededItems.map(post => (
                          <div key={post.id} onClick={() => onPostClick(post)} className="p-3 border border-gray-200 rounded-lg bg-white hover:border-orange-400 cursor-pointer transition-colors shadow-sm group">
                              <div className="flex justify-between mb-2">
                                   <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                       {new Date(post.postDate).getDate()}/{new Date(post.postDate).getMonth()+1}
                                   </span>
                                  <span className="text-xs text-gray-400">{post.format}</span>
                              </div>
                              <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-orange-600">{post.topic}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.mainIdea || 'Chưa có ý tưởng'}</p>
                              <button className="w-full py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded hover:bg-orange-100 flex items-center justify-center gap-1">
                                  <Zap size={12} /> AI Viết Nháp
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Column 3: Calendar Gaps - Suggestions */}
          <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500" />
                      Lấp trống lịch (7 ngày tới)
                  </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {gapDays.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                          <p className="text-sm">Lịch đăng bài đã kín.</p>
                      </div>
                  ) : (
                      gapDays.map(date => (
                          <div key={date} className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-400 transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                   <span className="text-xs font-bold text-gray-500">
                                       {new Date(date).getDate()}/{new Date(date).getMonth()+1}
                                   </span>
                                   <div className="h-px bg-gray-200 flex-1"></div>
                              </div>
                              <div className="flex items-start gap-2">
                                  <Lightbulb size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                                  <div>
                                      <p className="text-xs text-gray-500 mb-1">Gợi ý chủ đề:</p>
                                      <p className="text-sm font-bold text-gray-800 mb-2">{topicSuggestions[date] || 'Đang tải...'}</p>
                                      <button 
                                        onClick={() => onCreateFromIdea(topicSuggestions[date], topicSuggestions[date])}
                                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium"
                                      >
                                          Tạo bài này
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardView;
