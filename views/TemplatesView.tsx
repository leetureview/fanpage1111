import React from 'react';
import { PostTemplate } from '../types';
import { MOCK_TEMPLATES } from '../constants';
import { Copy, PlusCircle } from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (template: PostTemplate) => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mẫu nội dung (Templates)</h2>
          <p className="text-gray-500">Các cấu trúc bài viết hiệu quả đã được kiểm chứng.</p>
        </div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-900">
            <PlusCircle size={16} /> Thêm mẫu mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TEMPLATES.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{tpl.useCase}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{tpl.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Tone: <span className="font-medium text-gray-700">{tpl.tone}</span></p>
                </div>
                
                <div className="p-5 flex-1 bg-gray-50">
                    <div className="mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cấu trúc</p>
                        <p className="text-sm text-gray-600">{tpl.structureDescription}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ví dụ</p>
                        <div className="bg-white border border-gray-200 p-3 rounded text-sm text-gray-700 font-mono whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
                            {tpl.captionExample}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button 
                        onClick={() => navigator.clipboard.writeText(tpl.captionExample)}
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                    >
                        <Copy size={16} /> Sao chép
                    </button>
                    <button 
                        onClick={() => onUseTemplate(tpl)}
                        className="flex-[2] flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                        Sử dụng mẫu
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesView;