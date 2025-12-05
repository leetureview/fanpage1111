
import { Asset, ContentPlan, PostType } from "../types";

// Khai báo types cho Facebook SDK
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

// ==================================================================================
// ⚠️ QUAN TRỌNG: THAY THẾ APP ID CỦA BẠN VÀO DÒNG DƯỚI ĐÂY ĐỂ KẾT NỐI THẬT
// ==================================================================================
const FB_APP_ID: string = '2260791701054935'; 
// Ví dụ: const FB_APP_ID = '123456789012345';

// State to track if we should use the real SDK or Mock data
let isMockMode = false;
let isSdkInitialized = false;

export const initFacebookSdk = (): Promise<void> => {
  return new Promise((resolve) => {
    // 1. Kiểm tra cấu hình môi trường
    const hasValidAppId = FB_APP_ID && FB_APP_ID !== 'YOUR_FB_APP_ID';
    
    // Kiểm tra môi trường an toàn (HTTPS hoặc Localhost)
    // window.isSecureContext là chuẩn mới của trình duyệt để check HTTPS/Localhost
    const isSecure = window.isSecureContext || 
                     window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

    // Nếu không có App ID HOẶC không phải HTTPS -> Dùng Mock Mode
    if (!hasValidAppId || !isSecure) {
      if (!hasValidAppId) {
          console.warn("⚠️ CHƯA CÓ FACEBOOK APP ID: Đang chạy chế độ Giả lập (Mock Mode).");
      }
      if (!isSecure) {
          console.warn("🛑 PHÁT HIỆN HTTP (KHÔNG BẢO MẬT): Facebook SDK bắt buộc HTTPS. Tự động chuyển sang Mock Mode để tránh lỗi.");
      }
      
      isMockMode = true;
      isSdkInitialized = true;
      resolve();
      return;
    }

    if (window.FB) {
      isSdkInitialized = true;
      resolve();
      return;
    }

    // 2. Setup Async Init cho Real SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v19.0' // Sử dụng Graph API mới nhất
      });
      isSdkInitialized = true;
      console.log("✅ Facebook SDK Thật đã được khởi tạo.");
      resolve();
    };

    // 3. Inject Script
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s) as HTMLScriptElement; js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js"; // Dùng bản tiếng Việt
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
  picture?: { data: { url: string } };
}

// Mock Data (Chỉ dùng khi chưa có App ID hoặc chạy HTTP)
const MOCK_PAGES: FacebookPage[] = [
  {
    id: 'mock-page-123',
    name: '123 GO - Taxi Điện (Mock)',
    access_token: 'mock_token_123',
    category: 'Transportation',
    tasks: ['MANAGE', 'PUBLISH']
  },
  {
    id: 'mock-page-luxury',
    name: 'Minio Luxury (Mock)',
    access_token: 'mock_token_lux',
    category: 'Transportation',
    tasks: ['MANAGE', 'PUBLISH']
  }
];

export const loginAndGetPages = async (): Promise<FacebookPage[]> => {
  // MOCK MODE FALLBACK
  if (isMockMode) {
    return new Promise((resolve) => {
      console.log("Mock Login initiated...");
      setTimeout(() => {
        resolve(MOCK_PAGES);
      }, 1000); 
    });
  }

  // REAL SDK LOGIC
  return new Promise((resolve, reject) => {
    if (!isSdkInitialized || !window.FB) {
      // Nếu SDK chưa sẵn sàng, thử check lại mock mode lần cuối
      if (isMockMode) {
          resolve(MOCK_PAGES);
          return;
      }
      reject('Facebook SDK chưa sẵn sàng hoặc bị chặn.');
      return;
    }

    // Yêu cầu quyền: public_profile, pages_show_list, pages_read_engagement, pages_manage_posts
    window.FB.login((response: any) => {
      if (response.authResponse) {
        console.log("Đăng nhập thành công. Đang lấy danh sách trang...");
        
        // Gọi API lấy danh sách Pages kèm Token và Avatar
        window.FB.api('/me/accounts', { fields: 'name,access_token,category,tasks,picture', limit: 50 }, (pagesResponse: any) => {
          if (pagesResponse && !pagesResponse.error) {
            console.log("Đã tìm thấy pages:", pagesResponse.data);
            resolve(pagesResponse.data as FacebookPage[]);
          } else {
            console.error("Lỗi lấy Pages:", pagesResponse.error);
            reject(pagesResponse.error);
          }
        });
      } else {
        console.warn("Người dùng đã hủy đăng nhập.");
        reject('Bạn đã hủy đăng nhập Facebook.');
      }
    }, { scope: 'pages_show_list,pages_read_engagement,pages_manage_posts' });
  });
};

export const publishPostToFacebook = async (
  pageId: string,
  accessToken: string,
  post: ContentPlan
): Promise<{ id: string; permalink_url?: string }> => {
  // MOCK MODE FALLBACK
  if (isMockMode) {
    return new Promise((resolve) => {
      console.log(`Mock Publishing to Page ${pageId}...`, post);
      setTimeout(() => {
        const mockId = `mock_post_${Date.now()}`;
        resolve({
          id: mockId,
          permalink_url: `https://facebook.com/mock-page/posts/${mockId}`
        });
      }, 2000);
    });
  }

  // REAL SDK LOGIC
  return new Promise((resolve, reject) => {
    if (!window.FB) {
        reject('SDK chưa tải xong.');
        return;
    }

    const message = `${post.captionDraft || ''}`;
    const hasImage = post.assets.length > 0 && post.assets[0].type === 'IMAGE';
    
    // Lưu ý: SDK JS Client-side hạn chế upload ảnh trực tiếp từ local file input (File Object)
    // Nó hoạt động tốt nhất với URL ảnh công khai.
    
    if (hasImage) {
        const imageUrl = post.assets[0].urlOrPath;
        
        // Kiểm tra xem URL có phải là Blob (local) không. Facebook API không nhận Blob URL từ client dễ dàng.
        if (imageUrl.startsWith('blob:')) {
            reject("Lỗi: Facebook API yêu cầu URL ảnh công khai (Public URL), không hỗ trợ upload trực tiếp từ máy tính trong phiên bản web này. Hãy thử dùng URL ảnh từ mạng.");
            return;
        }

        window.FB.api(
            `/${pageId}/photos`,
            'POST',
            {
                url: imageUrl, 
                caption: message,
                access_token: accessToken
            },
            (response: any) => {
                if (response && !response.error) {
                    resolve({ id: response.post_id || response.id, permalink_url: `https://facebook.com/${response.post_id || response.id}` });
                } else {
                    console.error("FB Publish Error:", response.error);
                    reject(response.error?.message || "Lỗi đăng ảnh lên Facebook");
                }
            }
        );
    } else {
        // Đăng text thuần hoặc Link
        window.FB.api(
            `/${pageId}/feed`,
            'POST',
            {
                message: message,
                access_token: accessToken,
                link: post.postLink
            },
            (response: any) => {
                if (response && !response.error) {
                    const postIdParts = response.id.split('_'); // PageID_PostID
                    const realPostId = postIdParts[1] || postIdParts[0];
                    resolve({ id: response.id, permalink_url: `https://facebook.com/${realPostId}` });
                } else {
                    console.error("FB Publish Error:", response.error);
                    reject(response.error?.message || "Lỗi đăng bài lên Facebook");
                }
            }
        );
    }
  });
};
