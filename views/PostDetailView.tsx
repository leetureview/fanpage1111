
import React, { useState } from 'react';
import { ContentPlan, PostStatus, PostType, Fanpage, Platform, PostGoal, Asset } from '../types';
import { generatePostFromPlan, AIPostResponse } from '../services/geminiService';
import { publishPostToFacebook } from '../services/facebookService';
import { ArrowLeft, Save, Wand2, Image as ImageIcon, Send, Upload, Trash2, Copy, CheckCircle, RefreshCw, Facebook, Loader } from 'lucide-react';

interface PostDetailViewProps {
  post: ContentPlan;
  fanpage: Fanpage;
  onSave: (post: ContentPlan) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  onPublishSuccess: (link: string) => void; // New callback
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, fanpage, onSave, onBack, onDelete, onPublishSuccess }) => {
  const [editedPost, setEditedPost] = useState<ContentPlan>({ ...post });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false); // Publish state
  const [activeTab, setActiveTab] = useState<'STRATEGY' | 'CREATIVE'>('STRATEGY');
  
  // Temporary state to hold AI results before user commits choices
  const [aiResult, setAiResult] = useState<AIPostResponse | null>(null);

  const handleChange = (field: keyof ContentPlan, value: any) => {
    setEditedPost(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateContent = async () => {
    if (!editedPost.topic) {
      alert("Vui lòng nhập chủ đề (Topic) trước khi dùng AI.");
      return;
    }
    
    setIsGenerating(true);
    const result = await generatePostFromPlan(editedPost, fanpage);
    
    if (result) {
        setAiResult(result);
        
        // Auto-fill parts that don't require choice if empty
        setEditedPost(prev => ({
            ...prev,
            cta: result.cta,
            visualBrief: Array.isArray(result.visual_ideas) ? result.visual_ideas.join('\n\n') : '', 
        }));
        
        setActiveTab('CREATIVE');
    } else {
        alert("Lỗi tạo nội dung. Vui lòng thử lại.");
    }
    setIsGenerating(false);
  };

  const handlePublishToFacebook = async () => {
      if (!fanpage.isConnected || !fanpage.accessToken || !fanpage.facebookPageId) {
          alert("Fanpage này chưa được kết nối với Facebook.");
          return;
      }
      
      if (!window.confirm("Bạn có chắc muốn đăng bài này lên Facebook ngay bây giờ?")) return;

      setIsPublishing(true);
      try {
          const result = await publishPostToFacebook(fanpage.facebookPageId, fanpage.accessToken, editedPost);
          
          const updatedPost = {
              ...editedPost,
              status: PostStatus.PUBLISHED,
              postLink: result.permalink_url || `https://facebook.com/${result.id}`
          };
          setEditedPost(updatedPost);
          onSave(updatedPost); // Save changes to parent
          onPublishSuccess(updatedPost.postLink!); // Trigger toast
      } catch (error) {
          console.error(error);
          alert("Lỗi đăng bài: " + JSON.stringify(error));
      } finally {
          setIsPublishing(false);
      }
  };

  const applyHook = (hook: string) => {
      if (!aiResult) return;
      
      const hashtags = Array.isArray(aiResult.hashtag_suggestions) ? aiResult.hashtag_suggestions.join(' ') : '';
      const fullCaption = `${hook}\n\n${aiResult.caption}\n\n${aiResult.cta}\n\n${hashtags}`;
      
      setEditedPost(prev => ({
          ...prev,
          hook: hook,
          captionDraft: fullCaption
      }));
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       const mockUrl = URL.createObjectURL(file);
       const newAsset: Asset = {
           id: `new-${Date.now()}`,
           fanpageId: fanpage.id,
           type: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
           urlOrPath: mockUrl,
           description: file.name,
           relatedContentPlanId: editedPost.id
       };
       setEditedPost(prev => ({...prev, assets: [...prev.assets, newAsset]}));
    }
  };

  const removeAsset = (assetId: string) => {
    setEditedPost(prev => ({
        ...prev,
        assets: prev.assets.filter(a => a.id !== assetId)
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <input 
                type="text" 
                value={editedPost.topic} 
                onChange={(e) => handleChange('topic', e.target.value)}
                className="text-lg font-bold text-gray-800 border-none focus:ring-0 p-0 placeholder-gray-300 bg-transparent w-96"
                placeholder="Nhập chủ đề / tiêu đề bài viết..."
            />
             <div className="text-xs text-gray-500">ID: {editedPost.id}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onDelete(post.id)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <select 
            value={editedPost.status} 
            onChange={(e) => handleChange('status', e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
          >
            {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={() => onSave(editedPost)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Save size={18} />
            <span>Lưu nháp</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input Form */}
        <div className="w-1/2 flex flex-col bg-gray-50 border-r border-gray-200">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6">
                <button 
                    onClick={() => setActiveTab('STRATEGY')}
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'STRATEGY' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    1. Kế hoạch & Chiến lược
                </button>
                <button 
                    onClick={() => setActiveTab('CREATIVE')}
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'CREATIVE' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    2. Sáng tạo & Nội dung
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {activeTab === 'STRATEGY' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Thời gian & Nền tảng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng</label>
                                    <input 
                                        type="date" 
                                        value={editedPost.postDate} 
                                        onChange={(e) => handleChange('postDate', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ</label>
                                    <input 
                                        type="time" 
                                        value={editedPost.timeSlot} 
                                        onChange={(e) => handleChange('timeSlot', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nền tảng</label>
                                    <select 
                                        value={editedPost.platform} 
                                        onChange={(e) => handleChange('platform', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng</label>
                                    <select 
                                        value={editedPost.format} 
                                        onChange={(e) => handleChange('format', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        {Object.values(PostType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                             <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Chiến lược nội dung</h3>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (Goal)</label>
                                    <select 
                                        value={editedPost.goal} 
                                        onChange={(e) => handleChange('goal', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        {Object.values(PostGoal).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ý tưởng chính / Key Message</label>
                                    <textarea 
                                        value={editedPost.mainIdea}
                                        onChange={(e) => handleChange('mainIdea', e.target.value)}
                                        rows={3}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                        placeholder="Thông điệp quan trọng nhất bạn muốn truyền tải là gì?"
                                    />
                                </div>
                             </div>
                             
                             <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <button 
                                    onClick={handleGenerateContent}
                                    disabled={isGenerating}
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm ${
                                        isGenerating 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-md'
                                    }`}
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Wand2 size={18} />}
                                    {isGenerating ? 'Đang phân tích & Viết...' : 'Viết content bằng AI'}
                                </button>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'CREATIVE' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        
                        {/* AI Suggestions Panel */}
                        {aiResult && (
                            <div className="bg-gradient-to-b from-purple-50 to-white p-5 rounded-lg shadow-sm border border-purple-100">
                                <div className="flex items-start gap-2 mb-3">
                                    <Wand2 size={16} className="text-purple-600 mt-0.5"/>
                                    <div>
                                        <h3 className="text-sm font-bold text-purple-900">AI Phân tích</h3>
                                        <p className="text-xs text-purple-700">{aiResult.analysis}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Chọn câu mở đầu (Hook)</p>
                                    <div className="space-y-2">
                                        {aiResult.hooks.map((hook, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => applyHook(hook)}
                                                className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-2 ${editedPost.hook === hook ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-purple-300'}`}
                                            >
                                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${editedPost.hook === hook ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
                                                    {editedPost.hook === hook && <CheckCircle size={12} />}
                                                </div>
                                                <span className="text-sm text-gray-800 font-medium">{hook}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Biên tập nội dung (Caption)</h3>
                                <div className="text-xs text-gray-400">
                                    {editedPost.captionDraft.length} ký tự
                                </div>
                            </div>
                            <textarea 
                                value={editedPost.captionDraft}
                                onChange={(e) => handleChange('captionDraft', e.target.value)}
                                rows={12}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 font-mono text-sm leading-relaxed"
                                placeholder={aiResult ? "Chọn một Hook ở trên để tạo caption..." : "Viết caption của bạn ở đây hoặc dùng AI ở tab Chiến lược..."}
                            />
                        </div>

                        {/* Visual Brief Section */}
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Yêu cầu hình ảnh (Gửi Designer)</h3>
                            {aiResult && aiResult.visual_ideas.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {aiResult.visual_ideas.map((idea, idx) => (
                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                            💡 {idea}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <textarea 
                                value={editedPost.visualBrief || ''} 
                                onChange={(e) => handleChange('visualBrief', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                                rows={3}
                                placeholder="Mô tả yêu cầu về hình ảnh/video..."
                            />
                        </div>

                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">File đính kèm (Media)</h3>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                {editedPost.assets.map(asset => (
                                    <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
                                        {asset.type === 'IMAGE' ? (
                                            <img src={asset.urlOrPath} alt={asset.description} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">Video File</div>
                                        )}
                                        <button 
                                            onClick={() => removeAsset(asset.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                                            {asset.description}
                                        </div>
                                    </div>
                                ))}
                                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center aspect-video cursor-pointer hover:bg-gray-50 hover:border-green-400 transition-colors">
                                    <Upload size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500 font-medium">Tải ảnh lên</span>
                                    <input type="file" className="hidden" onChange={handleAssetUpload} accept="image/*,video/*" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto custom-scrollbar flex flex-col items-center py-8">
            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Xem trước ({editedPost.platform})</h3>
            
            <div className="w-[375px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 mb-4 shrink-0">
                {/* FB Post Header */}
                <div className="p-4 flex items-center gap-3">
                    <img src={fanpage.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-100" />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 leading-tight">{fanpage.name}</h4>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>Vừa xong</span> · <span>🌍</span>
                        </div>
                    </div>
                </div>
                
                {/* Caption */}
                <div className="px-4 pb-3 text-[15px] text-gray-900 whitespace-pre-wrap leading-normal">
                    {editedPost.captionDraft || <span className="text-gray-300 italic">Nội dung sẽ hiển thị ở đây...</span>}
                </div>

                {/* Media */}
                <div className="bg-gray-100 min-h-[250px] flex items-center justify-center border-y border-gray-100">
                    {editedPost.assets.length > 0 ? (
                        <img src={editedPost.assets[0].urlOrPath} alt="Post media" className="w-full h-auto max-h-[450px] object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 py-10 px-6 text-center">
                            <ImageIcon size={48} className="mb-2 opacity-50"/>
                            {editedPost.visualBrief ? (
                                <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded w-full">
                                    <strong>Brief Hình ảnh:</strong><br/>
                                    {editedPost.visualBrief}
                                </div>
                            ) : (
                                <span className="text-sm">Chưa có hình ảnh</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Engagement Bar */}
                <div className="p-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-3 border-b border-gray-100 pb-2">
                        <span>👍 ❤️ 12</span>
                        <span>4 Bình luận</span>
                    </div>
                    <div className="flex justify-between">
                        <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 py-1 hover:bg-gray-50 rounded text-sm font-medium">
                            Thích
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 py-1 hover:bg-gray-50 rounded text-sm font-medium">
                            Bình luận
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 py-1 hover:bg-gray-50 rounded text-sm font-medium">
                            Chia sẻ
                        </button>
                    </div>
                </div>
            </div>

            {/* FB Publish Button */}
             {fanpage.isConnected ? (
                <button 
                    onClick={handlePublishToFacebook}
                    disabled={isPublishing}
                    className={`w-[375px] py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isPublishing 
                        ? 'bg-blue-800 text-blue-200 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                    }`}
                >
                    {isPublishing ? <Loader className="animate-spin" size={20} /> : <Facebook size={20} fill="currentColor"/>}
                    {isPublishing ? 'Đang đăng bài...' : 'ĐĂNG NGAY LÊN FACEBOOK'}
                </button>
            ) : (
                <div className="w-[375px] bg-gray-100 border border-gray-200 text-gray-500 text-center py-3 rounded-lg text-sm">
                    Kết nối Facebook để đăng ngay từ đây
                </div>
            )}

            <div className="text-center space-y-2 mt-6">
                <p className="text-xs text-gray-400">Link bài viết (nếu đã đăng)</p>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 max-w-[375px] w-full">
                    <span className="truncate flex-1">{editedPost.postLink || 'Chưa đăng'}</span>
                    <button className="text-gray-400 hover:text-gray-600"><Copy size={14}/></button>
                </div>
            </div>
            
             {editedPost.status === PostStatus.PUBLISHED && editedPost.postLink && (
                <a 
                    href={editedPost.postLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition-colors"
                >
                    <Send size={16} /> Xem bài viết thực tế
                </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;
