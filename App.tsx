
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import KanbanView from './views/KanbanView';
import PostDetailView from './views/PostDetailView';
import TemplatesView from './views/TemplatesView';
import FacebookConnectModal from './components/FacebookConnectModal';
import Toast, { ToastMessage, ToastType } from './components/Toast';
import { ContentPlan, PostStatus, PostType, ViewMode, Platform, PostGoal, PostTemplate, Fanpage } from './types';
import { INITIAL_PLANS, MOCK_FANPAGES } from './constants';
import { initFacebookSdk, loginAndGetPages, FacebookPage } from './services/facebookService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('DASHBOARD');
  
  // Load initial state from LocalStorage if available, else use Mock data
  const [posts, setPosts] = useState<ContentPlan[]>(() => {
    const saved = localStorage.getItem('app_posts');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [fanpages, setFanpages] = useState<Fanpage[]>(() => {
    const saved = localStorage.getItem('app_fanpages');
    return saved ? JSON.parse(saved) : MOCK_FANPAGES;
  });

  const [selectedPost, setSelectedPost] = useState<ContentPlan | null>(null);
  const [selectedFanpageId, setSelectedFanpageId] = useState<string>(MOCK_FANPAGES[0].id);

  // Facebook Modal State
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [availableFbPages, setAvailableFbPages] = useState<FacebookPage[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentFanpage = fanpages.find(fp => fp.id === selectedFanpageId) || fanpages[0];
  const filteredPosts = posts.filter(p => p.fanpageId === selectedFanpageId);

  // Init FB SDK on mount
  useEffect(() => {
    initFacebookSdk().then(() => console.log('FB SDK Init'));
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('app_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('app_fanpages', JSON.stringify(fanpages));
  }, [fanpages]);

  // Toast Helpers
  const showToast = (message: string, type: ToastType = 'SUCCESS') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleConnectFacebook = async () => {
      setIsFbModalOpen(true);
      setIsFbLoading(true);
      setFbError(null);
      try {
          const pages = await loginAndGetPages();
          setAvailableFbPages(pages);
      } catch (err: any) {
          setFbError(typeof err === 'string' ? err : 'Lỗi kết nối Facebook');
      } finally {
          setIsFbLoading(false);
      }
  };

  const handleSelectFbPage = (fbPage: FacebookPage) => {
      // Map FB Page to current App Fanpage
      const updatedFanpages = fanpages.map(fp => {
          if (fp.id === selectedFanpageId) {
              return {
                  ...fp,
                  facebookPageId: fbPage.id,
                  accessToken: fbPage.access_token,
                  isConnected: true
              };
          }
          return fp;
      });
      setFanpages(updatedFanpages);
      setIsFbModalOpen(false);
      showToast(`Đã kết nối với Fanpage ${fbPage.name}`);
  };

  const handleCreatePost = (initialData?: Partial<ContentPlan>) => {
    const newPost: ContentPlan = {
      id: `p-${Date.now()}`,
      fanpageId: selectedFanpageId,
      topic: initialData?.topic || '',
      postDate: initialData?.postDate || new Date().toISOString().split('T')[0],
      timeSlot: '09:00',
      status: PostStatus.IDEA,
      format: PostType.IMAGE,
      platform: Platform.FACEBOOK,
      goal: PostGoal.AWARENESS,
      mainIdea: initialData?.mainIdea || '',
      hook: '',
      cta: '',
      captionDraft: initialData?.captionDraft || '',
      assets: [],
      ...initialData
    };
    setPosts([newPost, ...posts]);
    setSelectedPost(newPost);
    setCurrentView('DETAIL');
  };

  const handleUseTemplate = (tpl: PostTemplate) => {
      handleCreatePost({
          topic: `[Nháp] ${tpl.name}`,
          captionDraft: tpl.captionExample,
          mainIdea: `Sử dụng cấu trúc: ${tpl.structureDescription}`
      });
      showToast('Đã tạo bài viết từ mẫu');
  };

  const handlePostClick = (post: ContentPlan) => {
    setSelectedPost(post);
    setCurrentView('DETAIL');
  };

  const handleSavePost = (updatedPost: ContentPlan) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    showToast('Đã lưu bài viết');
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        setPosts(posts.filter(p => p.id !== id));
        setCurrentView('DASHBOARD');
        setSelectedPost(null);
        showToast('Đã xóa bài viết', 'INFO');
    }
  };

  const handleStatusChange = (postId: string, newStatus: PostStatus) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));
    showToast('Đã cập nhật trạng thái');
  };

  const handlePublishSuccess = (postLink: string) => {
      showToast('Đăng bài lên Facebook thành công!');
  };

  const renderContent = () => {
    if (currentView === 'DETAIL' && selectedPost) {
      return (
        <PostDetailView 
          post={selectedPost} 
          fanpage={currentFanpage}
          onSave={handleSavePost}
          onBack={() => setCurrentView('DASHBOARD')}
          onDelete={handleDeletePost}
          onPublishSuccess={handlePublishSuccess}
        />
      );
    }

    switch (currentView) {
      case 'DASHBOARD':
        return (
          <DashboardView 
            posts={filteredPosts} 
            fanpage={currentFanpage}
            allFanpages={fanpages}
            onFanpageChange={setSelectedFanpageId}
            onPostClick={handlePostClick}
            onCreateFromIdea={(idea, topic) => handleCreatePost({ mainIdea: idea, topic: topic || 'Ý tưởng từ AI' })}
            onQuickCreate={() => handleCreatePost({ postDate: new Date().toISOString().split('T')[0] })}
            onConnectFacebook={handleConnectFacebook}
          />
        );
      case 'CALENDAR':
        return (
          <CalendarView 
            posts={filteredPosts} 
            fanpage={currentFanpage}
            onPostClick={handlePostClick}
            onNewPost={(date) => handleCreatePost({ postDate: date })}
          />
        );
      case 'KANBAN':
        return (
          <KanbanView 
            posts={filteredPosts} 
            fanpage={currentFanpage}
            onPostClick={handlePostClick}
            onStatusChange={handleStatusChange}
          />
        );
      case 'TEMPLATES':
        return (
            <TemplatesView onUseTemplate={handleUseTemplate} />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans">
      <Sidebar 
        currentView={currentView === 'DETAIL' ? 'DASHBOARD' : currentView} 
        onChangeView={setCurrentView}
        onCreateNew={() => handleCreatePost()}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-hidden h-screen relative">
        {renderContent()}

        {/* Toast Container */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
      </main>

      <FacebookConnectModal 
        isOpen={isFbModalOpen}
        onClose={() => setIsFbModalOpen(false)}
        isLoading={isFbLoading}
        error={fbError}
        availablePages={availableFbPages}
        onSelectPage={handleSelectFbPage}
      />
    </div>
  );
};

export default App;
