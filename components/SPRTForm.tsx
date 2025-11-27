import React, { useState } from 'react';
import { SPRTRecord } from '../types';

interface SPRTFormProps {
  onAdd: (record: Omit<SPRTRecord, 'id' | 'timestamp'>) => void;
}

const SPRTForm: React.FC<SPRTFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    model: '',
    serial: '',
    manufacturer: '',
    calibrationYear: new Date().getFullYear(),
    r_tpw_current: '',
    r_tpw_previous: '',
    w_ga: '',
    w_hg: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      model: formData.model,
      serial: formData.serial,
      manufacturer: formData.manufacturer,
      calibrationYear: Number(formData.calibrationYear),
      r_tpw_current: Number(formData.r_tpw_current),
      r_tpw_previous: formData.r_tpw_previous ? Number(formData.r_tpw_previous) : 0,
      w_ga: Number(formData.w_ga),
      w_hg: Number(formData.w_hg)
    });
    // Reset form mostly, keep manufacturer/model maybe? No, clear all for now.
    setFormData({
      model: '',
      serial: '',
      manufacturer: '',
      calibrationYear: new Date().getFullYear(),
      r_tpw_current: '',
      r_tpw_previous: '',
      w_ga: '',
      w_hg: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <i className="fa-solid fa-plus-circle mr-2 text-accent"></i>
        Nhập dữ liệu hiệu chuẩn mới
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* General Info */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
           <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hãng sản xuất</label>
            <input required name="manufacturer" value={formData.manufacturer} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="Ví dụ: Fluke, Hart" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Model</label>
            <input required name="model" value={formData.model} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="Ví dụ: 5681" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Số Serial</label>
            <input required name="serial" value={formData.serial} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="S/N" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Năm hiệu chuẩn</label>
            <input required name="calibrationYear" value={formData.calibrationYear} onChange={handleChange} type="number" min="1990" max="2100" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" />
          </div>
        </div>

        {/* Technical Data */}
        <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">R(tpw) Hiện tại (Ω)</label>
            <input required name="r_tpw_current" value={formData.r_tpw_current} onChange={handleChange} type="number" step="0.000001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="Ví dụ: 25.500125" />
        </div>
        <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">R(tpw) Trước đó (Ω) (Tùy chọn)</label>
            <input name="r_tpw_previous" value={formData.r_tpw_previous} onChange={handleChange} type="number" step="0.000001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="Để trống nếu lần đầu" />
        </div>

        <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">W(Ga) (Điểm nóng chảy Gallium)</label>
            <input required name="w_ga" value={formData.w_ga} onChange={handleChange} type="number" step="0.0000001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder=">= 1.11807" />
        </div>
        <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">W(Hg) (Điểm ba thủy ngân)</label>
            <input required name="w_hg" value={formData.w_hg} onChange={handleChange} type="number" step="0.0000001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" placeholder="<= 0.844235" />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-2">
          <button type="submit" className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2">
            <i className="fa-solid fa-save"></i>
            Lưu kết quả & Đánh giá
          </button>
        </div>
      </form>
    </div>
  );
};

export default SPRTForm;
