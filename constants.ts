import { Fanpage, ContentPlan, PostStatus, PostType, Platform, PostGoal, PostTemplate } from './types';

export const MOCK_FANPAGES: Fanpage[] = [
  {
    id: 'fp-123go',
    name: '123 GO - Taxi Điện Giá Rẻ',
    niche: 'Vận tải / Taxi',
    avatar: 'https://picsum.photos/id/237/200/200',
    description: 'Dịch vụ taxi điện dòng xe Minio Green giá siêu rẻ chỉ 8.000đ/km.',
    brandVoice: 'Thân thiện, hài hước, nhấn mạnh giá rẻ (8k/km), năng lượng xanh. Sử dụng nhiều emoji, ngôn ngữ GenZ bắt trend.',
    mainColor: '#00AF66',
    note: 'Luôn kiểm tra link app trước khi đăng.'
  },
  {
    id: 'fp-luxury',
    name: 'Minio Luxury - Chuyên Gia Đưa Đón',
    niche: 'Vận tải cao cấp',
    avatar: 'https://picsum.photos/id/1074/200/200',
    description: 'Dịch vụ đưa đón sân bay, sự kiện bằng xe VinFast VF9 sang trọng.',
    brandVoice: 'Chuyên nghiệp, tinh tế, sang trọng, đáng tin cậy. Văn phong trang trọng.',
    mainColor: '#1A202C',
    note: 'Tập trung vào sự thoải mái và đúng giờ.'
  }
];

export const MOCK_TEMPLATES: PostTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Ra mắt khuyến mãi',
    useCase: 'Ra mắt sản phẩm/dịch vụ mới',
    structureDescription: 'Hook (Gây tò mò) -> Tính năng -> Lợi ích -> Giá -> CTA',
    captionExample: '🚀 SIÊU PHẨM ĐỔ BỘ! \n\nChính thức ra mắt dòng xe Minio Green - "Nhỏ mà có võ".\n✅ Êm ái không mùi xăng\n✅ Giá chỉ 8k/km cố định\n\nĐặt ngay hôm nay để trải nghiệm sự khác biệt! 👇\n[Link App]',
    tone: 'Hào hứng & Chuyên nghiệp'
  },
  {
    id: 'tpl-2',
    name: 'Meme / Hài hước',
    useCase: 'Tương tác & Viral',
    structureDescription: 'Tình huống đời thường -> Twist thương hiệu -> Câu hỏi/CTA',
    captionExample: 'Khi bạn nhận lương nhưng vẫn chọn đi 123 GO vì quá rẻ... 😎\n\nĐi taxi mà giá như đi xe máy, tội gì dầm mưa dãi nắng các bác nhỉ?\n\nComment ngay điểm đến cuối tuần này của bạn nào! 👇',
    tone: 'Hài hước & Vui vẻ'
  },
  {
    id: 'tpl-3',
    name: 'Feedback khách hàng',
    useCase: 'Bằng chứng xã hội (Social Proof)',
    structureDescription: 'Đánh giá sao -> Trích dẫn khách -> Cảm ơn -> CTA',
    captionExample: '⭐⭐⭐⭐⭐ "Xe sạch, bác tài vui tính, lại còn rẻ bất ngờ!"\n\nCảm ơn bạn An đã tin tưởng 123 GO. Sự hài lòng của khách hàng là động lực để chúng mình lăn bánh mỗi ngày.\n\nCòn bạn, bạn đã thử chưa? 🚕💨',
    tone: 'Biết ơn & Tin cậy'
  }
];

// Helper to get relative dates
const getRelativeDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PLANS: ContentPlan[] = [
  {
    id: 'p-1',
    fanpageId: 'fp-123go',
    topic: 'Teaser ra mắt Minio Green',
    postDate: getRelativeDate(0), // Today
    timeSlot: '09:00',
    status: PostStatus.IDEA,
    format: PostType.VIDEO,
    platform: Platform.FACEBOOK,
    goal: PostGoal.AWARENESS,
    mainIdea: 'Giới thiệu dòng xe Minio Green mới.',
    hook: 'Chờ đón siêu phẩm Minio Green đổ bộ! 🚕💨',
    captionDraft: '',
    cta: 'Tải App Ngay',
    assets: []
  },
  {
    id: 'p-2',
    fanpageId: 'fp-123go',
    topic: 'Review giá 8k/km',
    postDate: getRelativeDate(1), // Tomorrow
    timeSlot: '19:00',
    status: PostStatus.REVIEW,
    format: PostType.ALBUM,
    platform: Platform.FACEBOOK,
    goal: PostGoal.CONVERSION,
    mainIdea: 'So sánh giá 123 GO với taxi truyền thống.',
    hook: '8K/KM - RẺ HƠN LY TRÀ ĐÁ?',
    captionDraft: 'Nội dung đang soạn...',
    cta: 'Đặt xe ngay',
    assets: []
  },
  {
    id: 'p-3',
    fanpageId: 'fp-123go',
    topic: 'Meme tiết kiệm tiền',
    postDate: getRelativeDate(2), // Day after tomorrow
    timeSlot: '11:30',
    status: PostStatus.DRAFT,
    format: PostType.IMAGE,
    platform: Platform.FACEBOOK,
    goal: PostGoal.ENGAGEMENT,
    mainIdea: 'Meme vui về việc tiết kiệm tiền khi đi 123 GO.',
    hook: 'Khi bạn nhận ra đi taxi điện còn rẻ hơn uống trà sữa...',
    captionDraft: '',
    cta: 'Tag ngay đứa bạn thân',
    assets: []
  },
  {
    id: 'p-old-1',
    fanpageId: 'fp-123go',
    topic: 'Tổng kết tuần',
    postDate: getRelativeDate(-2), // 2 days ago
    timeSlot: '20:00',
    status: PostStatus.PUBLISHED,
    format: PostType.TEXT,
    platform: Platform.FACEBOOK,
    goal: PostGoal.ENGAGEMENT,
    mainIdea: 'Điểm lại các chuyến đi ấn tượng trong tuần',
    hook: 'Tổng kết tuần qua cùng 123 GO',
    captionDraft: 'Đã xong',
    cta: '',
    assets: []
  },
   {
    id: 'p-lux-1',
    fanpageId: 'fp-luxury',
    topic: 'Đưa đón sân bay VIP',
    postDate: getRelativeDate(1),
    timeSlot: '06:00',
    status: PostStatus.DRAFT,
    format: PostType.IMAGE,
    platform: Platform.FACEBOOK,
    goal: PostGoal.CONVERSION,
    mainIdea: 'Dịch vụ đưa đón sân bay sang trọng.',
    hook: 'Đưa đón sân bay chuẩn 5 sao',
    captionDraft: '',
    cta: 'Đặt trước ngay',
    assets: []
  }
];

export const STATUS_COLORS = {
  [PostStatus.IDEA]: 'bg-gray-100 text-gray-700 border-gray-200',
  [PostStatus.DRAFT]: 'bg-blue-100 text-blue-700 border-blue-200',
  [PostStatus.REVIEW]: 'bg-orange-100 text-orange-700 border-orange-200',
  [PostStatus.PUBLISHED]: 'bg-green-100 text-green-700 border-green-200',
};