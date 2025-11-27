import React from 'react';
import { SPRTRecord } from '../types';

interface StatsCardsProps {
  records: SPRTRecord[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  const total = records.length;
  const passCount = records.filter(r => r.w_ga >= 1.11807 && r.w_hg <= 0.844235).length;
  const failCount = total - passCount;
  
  // Calculate average drift (absolute) for records with previous data
  const driftRecords = records.filter(r => r.r_tpw_previous > 0);
  const avgDrift = driftRecords.length > 0
    ? (driftRecords.reduce((acc, r) => acc + Math.abs(r.r_tpw_current - r.r_tpw_previous), 0) / driftRecords.length) * 10000 // approx mK
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Tổng thiết bị</div>
        <div className="text-2xl font-bold text-slate-800">{total}</div>
        <div className="text-xs text-slate-400 mt-1">Đã ghi nhận</div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Đạt chuẩn ITS-90</div>
        <div className="text-2xl font-bold text-success">{passCount}</div>
        <div className="text-xs text-slate-400 mt-1">{(total > 0 ? (passCount/total*100).toFixed(1) : 0)}% Đạt</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Cần lưu ý</div>
        <div className="text-2xl font-bold text-danger">{failCount}</div>
        <div className="text-xs text-slate-400 mt-1">Không đạt W(Ga) hoặc W(Hg)</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Độ trôi TB (mK)</div>
        <div className="text-2xl font-bold text-accent">{avgDrift.toFixed(2)}</div>
        <div className="text-xs text-slate-400 mt-1">Ước tính (k=1)</div>
      </div>
    </div>
  );
};

export default StatsCards;
