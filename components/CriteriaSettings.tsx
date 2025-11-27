import React, { useState } from 'react';
import { EvaluationCriteria } from '../types';

interface CriteriaSettingsProps {
  currentCriteria: EvaluationCriteria;
  onSave: (criteria: EvaluationCriteria) => void;
  onClose: () => void;
}

const CriteriaSettings: React.FC<CriteriaSettingsProps> = ({ currentCriteria, onSave, onClose }) => {
  const [formData, setFormData] = useState<EvaluationCriteria>(currentCriteria);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    // Reset to ITS-90 defaults
    setFormData({
      w_ga_min: 1.11807,
      w_hg_max: 0.844235,
      drift_warning_mk: 2.0,
      drift_fail_mk: 4.0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg"><i className="fa-solid fa-sliders mr-2"></i>Cấu hình tiêu chí đánh giá</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            {/* ITS-90 Criteria */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">
                Tiêu chuẩn ITS-90 (W)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">W(Ga) Tối thiểu (>=)</label>
                  <input
                    type="number" step="0.0000001" name="w_ga_min"
                    value={formData.w_ga_min} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">W(Hg) Tối đa (<=)</label>
                  <input
                    type="number" step="0.0000001" name="w_hg_max"
                    value={formData.w_hg_max} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Drift Criteria */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">
                Đánh giá độ trôi (R_tpw Drift)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-yellow-600 mb-1">Ngưỡng Cảnh báo (mK)</label>
                  <div className="relative">
                    <input
                      type="number" step="0.1" name="drift_warning_mk"
                      value={formData.drift_warning_mk} onChange={handleChange}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">mK</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Nếu độ trôi {'>'} giá trị này: WARNING</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-600 mb-1">Ngưỡng Không đạt (mK)</label>
                  <div className="relative">
                    <input
                      type="number" step="0.1" name="drift_fail_mk"
                      value={formData.drift_fail_mk} onChange={handleChange}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">mK</span>
                  </div>
                   <p className="text-[10px] text-slate-400 mt-1">Nếu độ trôi {'>'} giá trị này: FAIL</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
            >
              Mặc định ITS-90
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-bold hover:bg-blue-600 transition shadow-md"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriteriaSettings;
