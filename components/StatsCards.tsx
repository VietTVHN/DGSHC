import React, { useMemo } from 'react';
import { SPRTRecord, EvaluationCriteria } from '../types';

interface StatsCardsProps {
  records: SPRTRecord[];
  criteria: EvaluationCriteria;
}

const StatsCards: React.FC<StatsCardsProps> = ({ records, criteria }) => {
  // Helper to get unique ID for a physical device
  const getDeviceId = (r: SPRTRecord) => `${r.manufacturer}-${r.model}-${r.serial}`;

  const { uniqueDeviceCount, passCount, failCount, warningCount, avgDrift } = useMemo(() => {
    if (!records || records.length === 0) {
        return { uniqueDeviceCount: 0, passCount: 0, failCount: 0, warningCount: 0, avgDrift: 0 };
    }

    const uniqueDevicesMap = new Map<string, SPRTRecord[]>();

    // Group records by device
    records.forEach(r => {
      const id = getDeviceId(r);
      if (!uniqueDevicesMap.has(id)) {
        uniqueDevicesMap.set(id, []);
      }
      uniqueDevicesMap.get(id)?.push(r);
    });

    const uniqueDeviceCount = uniqueDevicesMap.size;
    let totalDriftSum = 0;
    let deviceWithDriftCount = 0;
    let pass = 0;
    let fail = 0;
    let warn = 0;

    // Analyze each device based on its LATEST record for status, and Average drift for drift stats
    uniqueDevicesMap.forEach((deviceRecords) => {
      // Sort by year descending (newest first)
      const sortedRecords = deviceRecords.sort((a, b) => Number(b.calibrationYear) - Number(a.calibrationYear));
      const latestRecord = sortedRecords[0];

      if (!latestRecord) return;

      // 1. Calculate Status based on Latest Record and Criteria
      // Safety check for criteria properties
      const w_ga_min = criteria?.w_ga_min ?? 1.11807;
      const w_hg_max = criteria?.w_hg_max ?? 0.844235;
      const drift_fail_mk = criteria?.drift_fail_mk ?? 4.0;
      const drift_warning_mk = criteria?.drift_warning_mk ?? 2.0;

      const isPassGa = latestRecord.w_ga >= w_ga_min;
      const isPassHg = latestRecord.w_hg <= w_hg_max;
      
      // Calculate drift for status (latest vs previous)
      let latestDriftMK = 0;
      if (sortedRecords.length > 1) {
        latestDriftMK = Math.abs(latestRecord.r_tpw_current - sortedRecords[1].r_tpw_current) * 10000;
      } else if (latestRecord.r_tpw_previous > 0) {
        latestDriftMK = Math.abs(latestRecord.r_tpw_current - latestRecord.r_tpw_previous) * 10000;
      }

      if (!isPassGa || !isPassHg || latestDriftMK > drift_fail_mk) {
        fail++;
      } else if (latestDriftMK > drift_warning_mk) {
        warn++;
      } else {
        pass++;
      }

      // 2. Calculate Average Drift for this device (History analysis)
      let deviceDriftSum = 0;
      let comparisons = 0;

      for (let i = 0; i < sortedRecords.length - 1; i++) {
        const current = sortedRecords[i];
        const prev = sortedRecords[i+1];
        deviceDriftSum += Math.abs(current.r_tpw_current - prev.r_tpw_current) * 10000;
        comparisons++;
      }
      // If only 1 record but has manual previous
      if (sortedRecords.length === 1 && sortedRecords[0].r_tpw_previous > 0) {
         deviceDriftSum += Math.abs(sortedRecords[0].r_tpw_current - sortedRecords[0].r_tpw_previous) * 10000;
         comparisons++;
      }

      if (comparisons > 0) {
        totalDriftSum += (deviceDriftSum / comparisons);
        deviceWithDriftCount++;
      }
    });

    const avgDrift = deviceWithDriftCount > 0 ? totalDriftSum / deviceWithDriftCount : 0;

    return { uniqueDeviceCount, passCount: pass, failCount: fail, warningCount: warn, avgDrift };
  }, [records, criteria]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Tổng số thiết bị</div>
        <div className="text-2xl font-bold text-slate-800">{uniqueDeviceCount}</div>
        <div className="text-xs text-slate-400 mt-1">Đang quản lý (Dựa trên S/N)</div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Đạt chuẩn (PASS)</div>
        <div className="text-2xl font-bold text-success">{passCount}</div>
        <div className="text-xs text-slate-400 mt-1">Theo kỳ hiệu chuẩn mới nhất</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Cảnh báo / Không đạt</div>
        <div className="flex items-end gap-2">
           <span className="text-2xl font-bold text-danger">{failCount}</span>
           <span className="text-sm font-bold text-slate-300">/</span>
           <span className="text-2xl font-bold text-warning">{warningCount}</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">Fail / Warning</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium">Độ trôi TB (mK)</div>
        <div className="text-2xl font-bold text-accent">{avgDrift.toFixed(2)}</div>
        <div className="text-xs text-slate-400 mt-1">Trung bình lịch sử từng thiết bị</div>
      </div>
    </div>
  );
};

export default StatsCards;