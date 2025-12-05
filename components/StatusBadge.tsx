import React from 'react';
import { PostStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: PostStatus;
}

const STATUS_LABELS_VN: Record<PostStatus, string> = {
    [PostStatus.IDEA]: 'Ý TƯỞNG',
    [PostStatus.DRAFT]: 'BẢN NHÁP',
    [PostStatus.REVIEW]: 'CHỜ DUYỆT',
    [PostStatus.PUBLISHED]: 'ĐÃ ĐĂNG',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS_VN[status]}
    </span>
  );
};

export default StatusBadge;