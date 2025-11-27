import React from 'react';
import { SPRTRecord } from '../types';

interface StatsCardsProps {
  records: SPRTRecord[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  const total = records.length;
  const passCount = records.filter(r => r.w_ga >= 1.11807 && r.w_hg <= 0.844235).length;
  const failCount = total - passCount;
  
  // Calculate smart drift (compare current record with its nearest previous record)
  let totalDrift = 0;
  let driftCount = 0;

  records.forEach(record => {
    // Find the nearest previous record for this specific device (Serial + Manufacturer)
    const previousRecord = records
      .filter(r => 
        r.serial === record.serial && 
        r.manufacturer === record.manufacturer && 
        r.calibrationYear < record.calibrationYear
      )
      .sort((a, b) => b.calibrationYear - a.calibrationYear)[0];

    if (previousRecord) {
      const drift = Math.abs(record.r_tpw_current - previousRecord.r_tpw_current) * 10000; // mK
      totalDrift += drift;
      driftCount++;
    } else if (record.r_tpw_previous > 0) {
      // Fallback to manual previous if exists
      const drift = Math.abs(record.r_tpw_current - record.r_tpw_previous) * 10000;
      totalDrift += drift;
      driftCount++;
    }
  });

  const avgDrift = driftCount > 0 ? totalDrift / driftCount : 0;

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
        <div className="text-xs text-slate-400 mt-1">Giữa các kỳ hiệu chuẩn</div>
      </div>
    </div>
  );
};

export default StatsCards;