
export enum PostStatus {
  IDEA = 'IDEA',
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED'
}

export enum PostType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  REEL = 'REEL',
  ALBUM = 'ALBUM',
  STORY = 'STORY',
  TEXT = 'TEXT'
}

export enum Platform {
  FACEBOOK = 'Facebook',
  TIKTOK = 'TikTok',
  ZALO = 'Zalo',
  INSTAGRAM = 'Instagram'
}

export enum PostGoal {
  AWARENESS = 'Awareness', // Nhận diện
  ENGAGEMENT = 'Engagement', // Tương tác
  CONVERSION = 'Conversion', // Chuyển đổi
  RECRUITMENT = 'Recruitment', // Tuyển dụng
  OTHER = 'Other'
}

export interface Fanpage {
  id: string;
  name: string;
  niche: string; // e.g., Taxi Điện, F&B
  avatar: string;
  brandVoice: string;
  mainColor: string; // e.g., #00AF66
  description: string;
  note?: string;
  
  // Facebook Integration Fields
  facebookPageId?: string;     // ID thực trên Facebook
  accessToken?: string;        // Page Access Token
  isConnected?: boolean;       // Trạng thái kết nối
}

export interface PostTemplate {
  id: string;
  name: string; // e.g., Ra mắt dịch vụ
  useCase: string;
  structureDescription: string; // Hook - Problem - Solution...
  captionExample: string;
  tone: string; // Gần gũi, vui vẻ...
}

export interface Asset {
  id: string;
  fanpageId: string;
  type: 'IMAGE' | 'VIDEO' | 'LINK' | 'DRIVE' | 'CANVA';
  urlOrPath: string;
  description: string;
  relatedContentPlanId?: string; // Relationship to ContentPlan
}

// Renamed from Post to ContentPlan to match spec
export interface ContentPlan {
  id: string;
  fanpageId: string; // Relationship to Fanpage
  
  // Scheduling
  postDate: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM or Morning/Noon/Evening
  
  // Strategy
  goal: PostGoal;
  topic: string; // Acts as title
  platform: Platform;
  format: PostType;
  
  // Content
  mainIdea: string;
  hook: string;
  captionDraft: string;
  cta: string;
  visualBrief?: string;
  
  // Status & Meta
  status: PostStatus;
  postLink?: string;
  notes?: string;
  
  // Joined Data (for UI convenience)
  assets: Asset[];
}

export type ViewMode = 'DASHBOARD' | 'CALENDAR' | 'KANBAN' | 'DETAIL' | 'TEMPLATES';
