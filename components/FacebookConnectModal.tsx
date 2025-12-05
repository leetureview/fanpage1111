
import React from 'react';
import { FacebookPage } from '../services/facebookService';
import { X, CheckCircle } from 'lucide-react';

interface FacebookConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  availablePages: FacebookPage[];
  onSelectPage: (page: FacebookPage) => void;
  error: string | null;
}

const FacebookConnectModal: React.FC<FacebookConnectModalProps> = ({
  isOpen, onClose, isLoading, availablePages, onSelectPage, error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <h3 className="font-bold text-lg">Kết nối Facebook Fanpage</h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-sm">Đang kết nối tới Facebook...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!isLoading && availablePages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Chọn Fanpage bạn muốn quản lý:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availablePages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onSelectPage(page)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-gray-800 group-hover:text-blue-700">{page.name}</div>
                      <div className="text-xs text-gray-400">ID: {page.id}</div>
                    </div>
                    <CheckCircle className="text-gray-300 group-hover:text-blue-600" size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && availablePages.length === 0 && !error && (
             <div className="text-center py-6 text-gray-500">
                Không tìm thấy Fanpage nào. Hãy chắc chắn bạn là Admin của ít nhất 1 trang.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookConnectModal;
