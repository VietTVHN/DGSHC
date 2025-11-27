import React, { useState, useMemo } from 'react';
import { SPRTRecord, EvaluationResult, AIAnalysisResponse } from '../types';
import { analyzeSPRTData } from '../services/geminiService';

interface RecordListProps {
  records: SPRTRecord[];
  onDelete: (id: string) => void;
}

// Extended evaluation interface to include comparison context
interface ExtendedEvaluationResult extends EvaluationResult {
  comparisonYear?: number | string;
  isAutoCalculated: boolean;
}

const RecordList: React.FC<RecordListProps> = ({ records, onDelete }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Filter states
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Compute unique options for filters
  const years = useMemo(() => Array.from(new Set(records.map(r => r.calibrationYear))).sort((a, b) => Number(b) - Number(a)), [records]);
  const manufacturers = useMemo(() => Array.from(new Set(records.map(r => r.manufacturer))).sort(), [records]);

  // Helper to find previous record dynamically
  const findPreviousRecord = (currentRecord: SPRTRecord): SPRTRecord | undefined => {
    return records
      .filter(r => 
        r.serial === currentRecord.serial && 
        r.manufacturer === currentRecord.manufacturer && 
        r.calibrationYear < currentRecord.calibrationYear
      )
      .sort((a, b) => b.calibrationYear - a.calibrationYear)[0]; // Get the closest previous year
  };

  // Enhanced evaluate function
  const evaluateRecordSmart = (record: SPRTRecord): ExtendedEvaluationResult => {
    const isPassGa = record.w_ga >= 1.11807;
    const isPassHg = record.w_hg <= 0.844235;
    
    // Smart Drift Calculation
    const previousRecord = findPreviousRecord(record);
    
    let driftOhm = 0;
    let comparisonYear: number | string | undefined = undefined;
    let isAutoCalculated = false;

    if (previousRecord) {
      driftOhm = record.r_tpw_current - previousRecord.r_tpw_current;
      comparisonYear = previousRecord.calibrationYear;
      isAutoCalculated = true;
    } else if (record.r_tpw_previous > 0) {
      // Fallback to manual entry if no history found
      driftOhm = record.r_tpw_current - record.r_tpw_previous;
      comparisonYear = 'Manual';
      isAutoCalculated = false;
    }

    // Approx conversion: 0.1 Ohm/K for 25 Ohm SPRT. So Drift(K) = Drift(Ohm) * 10. Drift(mK) = Drift(Ohm) * 10000.
    const driftMK = driftOhm * 10000;

    // Status logic
    let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (!isPassGa || !isPassHg) status = 'FAIL';
    else if (Math.abs(driftMK) > 2) status = 'WARNING'; 

    return { isPassGa, isPassHg, driftOhm, driftMK, status, comparisonYear, isAutoCalculated };
  };

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const ev = evaluateRecordSmart(record);
      const matchesYear = yearFilter === 'ALL' || record.calibrationYear.toString() === yearFilter;
      const matchesManufacturer = manufacturerFilter === 'ALL' || record.manufacturer === manufacturerFilter;
      const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
      return matchesYear && matchesManufacturer && matchesStatus;
    });
  }, [records, yearFilter, manufacturerFilter, statusFilter]);

  const handleAnalyze = async (record: SPRTRecord) => {
    setSelectedRecordId(record.id);
    setLoadingAI(true);
    setAiAnalysis(null);
    
    const evaluation = evaluateRecordSmart(record);
    const result = await analyzeSPRTData(record, evaluation);
    
    setAiAnalysis(result);
    setLoadingAI(false);
  };

  const closeAnalysis = () => {
    setSelectedRecordId(null);
    setAiAnalysis(null);
  };

  const clearFilters = () => {
    setYearFilter('ALL');
    setManufacturerFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-list mr-2"></i>
            Danh sách thiết bị
            <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {filteredRecords.length} / {records.length}
            </span>
          </h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">Tất cả năm</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">Tất cả hãng</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PASS">Đạt (PASS)</option>
              <option value="WARNING">Cảnh báo (WARNING)</option>
              <option value="FAIL">Không đạt (FAIL)</option>
            </select>

            {(yearFilter !== 'ALL' || manufacturerFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button 
                onClick={clearFilters}
                className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-full transition-colors"
                title="Xóa bộ lọc"
              >
                <i className="fa-solid fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Thiết bị</th>
              <th className="px-4 py-3">R(tpw) (Ω)</th>
              <th className="px-4 py-3">Độ trôi (mK)</th>
              <th className="px-4 py-3 text-center">W(Ga)</th>
              <th className="px-4 py-3 text-center">W(Hg)</th>
              <th className="px-4 py-3 text-center">Đánh giá</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  {records.length === 0 ? "Chưa có dữ liệu nào. Hãy nhập thông tin ở trên." : "Không tìm thấy kết quả phù hợp với bộ lọc."}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const ev = evaluateRecordSmart(record);
                return (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{record.model}</div>
                        <div className="text-xs text-slate-500">SN: {record.serial} | {record.manufacturer}</div>
                        <div className="text-xs text-slate-400">Năm: {record.calibrationYear}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {record.r_tpw_current.toFixed(6)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-medium ${Math.abs(ev.driftMK) > 2 ? 'text-warning' : 'text-slate-600'}`}>
                           {ev.comparisonYear ? (
                            <>
                              {ev.driftMK > 0 ? '+' : ''}{ev.driftMK.toFixed(2)}
                            </>
                          ) : (
                            <span className="text-slate-300">--</span>
                          )}
                        </div>
                        {ev.comparisonYear && (
                          <div className="text-[10px] text-slate-400">
                            vs {ev.comparisonYear}
                            {ev.isAutoCalculated && <i className="fa-solid fa-bolt ml-1 text-yellow-400" title="Tự động tính từ lịch sử"></i>}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono ${ev.isPassGa ? 'text-success' : 'text-danger font-bold'}`}>
                        {record.w_ga.toFixed(7)}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono ${ev.isPassHg ? 'text-success' : 'text-danger font-bold'}`}>
                        {record.w_hg.toFixed(7)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ev.status === 'PASS' ? 'bg-green-100 text-green-800' :
                          ev.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ev.status === 'PASS' ? 'ĐẠT' : ev.status === 'FAIL' ? 'KHÔNG ĐẠT' : 'CẢNH BÁO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          onClick={() => handleAnalyze(record)}
                          className="text-accent hover:text-blue-700 transition-colors"
                          title="Phân tích AI"
                        >
                          <i className="fa-solid fa-robot"></i>
                        </button>
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="text-slate-400 hover:text-danger transition-colors"
                          title="Xóa"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                    {/* Analysis Modal/Expansion Area */}
                    {selectedRecordId === record.id && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 bg-blue-50/50 border-b border-blue-100">
                          <div className="relative">
                             <button onClick={closeAnalysis} className="absolute top-0 right-0 text-slate-400 hover:text-slate-600">
                               <i className="fa-solid fa-times"></i>
                             </button>
                             <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                               <i className="fa-solid fa-microchip mr-2"></i>
                               Phân tích chuyên sâu từ Gemini AI
                             </h4>
                             {loadingAI ? (
                               <div className="flex items-center space-x-2 text-blue-600 animate-pulse py-4">
                                 <i className="fa-solid fa-circle-notch fa-spin"></i>
                                 <span>Đang phân tích dữ liệu ITS-90...</span>
                               </div>
                             ) : aiAnalysis ? (
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                 <div className="bg-white p-3 rounded border border-blue-100">
                                   <div className="text-xs font-bold text-blue-500 uppercase mb-1">Tổng quan</div>
                                   <p className="text-slate-700">{aiAnalysis.summary}</p>
                                 </div>
                                 <div className="bg-white p-3 rounded border border-blue-100">
                                   <div className="text-xs font-bold text-blue-500 uppercase mb-1">Chi tiết kỹ thuật</div>
                                   <p className="text-slate-700">{aiAnalysis.technicalDetails}</p>
                                 </div>
                                 <div className="bg-white p-3 rounded border border-blue-100">
                                   <div className="text-xs font-bold text-blue-500 uppercase mb-1">Khuyến nghị</div>
                                   <p className="text-slate-700">{aiAnalysis.recommendation}</p>
                                 </div>
                               </div>
                             ) : null}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordList;