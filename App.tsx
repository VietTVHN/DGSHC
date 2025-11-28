import React, { useState, useEffect } from 'react';
import { SPRTRecord, EvaluationCriteria } from './types';
import SPRTForm from './components/SPRTForm';
import RecordList from './components/RecordList';
import StatsCards from './components/StatsCards';
import DriftChart from './components/DriftChart';
import CriteriaSettings from './components/CriteriaSettings';

// Mock initial data
const INITIAL_DATA: SPRTRecord[] = [
  {
    id: '1',
    model: '5681',
    serial: '4056',
    manufacturer: 'Fluke',
    calibrationYear: 2023,
    r_tpw_current: 25.500120,
    r_tpw_previous: 25.500110,
    w_ga: 1.1180720,
    w_hg: 0.8442340,
    timestamp: Date.now()
  },
  {
    id: '2',
    model: '5681',
    serial: '4056',
    manufacturer: 'Fluke',
    calibrationYear: 2022,
    r_tpw_current: 25.500110,
    r_tpw_previous: 25.500105,
    w_ga: 1.1180730,
    w_hg: 0.8442335,
    timestamp: Date.now() - 100000
  },
  {
    id: '3',
    model: '162CE',
    serial: '10234',
    manufacturer: 'Rosemount',
    calibrationYear: 2024,
    r_tpw_current: 25.234100,
    r_tpw_previous: 0,
    w_ga: 1.1180690, // Fail
    w_hg: 0.8442360, // Fail
    timestamp: Date.now()
  }
];

const INITIAL_CRITERIA: EvaluationCriteria = {
  w_ga_min: 1.11807,
  w_hg_max: 0.844235,
  drift_warning_mk: 2.0,
  drift_fail_mk: 4.0
};

const App: React.FC = () => {
  // Safe loader for Records with Data Sanitization
  const [records, setRecords] = useState<SPRTRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sprt_records');
      if (!saved || saved === 'undefined') return INITIAL_DATA;
      
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_DATA;

      // Sanitize data: Ensure all required fields exist and are correct types
      return parsed.map((r: any) => ({
        id: r.id || crypto.randomUUID(),
        model: r.model || 'Unknown',
        serial: r.serial || 'Unknown',
        manufacturer: r.manufacturer || 'Unknown',
        calibrationYear: Number(r.calibrationYear) || new Date().getFullYear(),
        r_tpw_current: Number(r.r_tpw_current) || 0,
        r_tpw_previous: Number(r.r_tpw_previous) || 0,
        w_ga: Number(r.w_ga) || 0,
        w_hg: Number(r.w_hg) || 0,
        timestamp: Number(r.timestamp) || Date.now()
      }));
    } catch (e) {
      console.error("Failed to load records from storage, using default.", e);
      return INITIAL_DATA;
    }
  });

  // Safe loader for Criteria
  const [criteria, setCriteria] = useState<EvaluationCriteria>(() => {
    try {
      const saved = localStorage.getItem('sprt_criteria');
      if (!saved || saved === 'undefined') return INITIAL_CRITERIA;
      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object') return INITIAL_CRITERIA;
      
      // Merge with initial to ensure all fields exist
      return { ...INITIAL_CRITERIA, ...parsed };
    } catch (e) {
      console.error("Failed to load criteria from storage, using default.", e);
      return INITIAL_CRITERIA;
    }
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('sprt_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('sprt_criteria', JSON.stringify(criteria));
  }, [criteria]);

  const handleAddRecord = (newRecord: Omit<SPRTRecord, 'id' | 'timestamp'>) => {
    const record: SPRTRecord = {
      ...newRecord,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setRecords(prev => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleResetData = () => {
    if (window.confirm('Hành động này sẽ xóa toàn bộ dữ liệu và đưa về mặc định. Bạn có chắc không?')) {
        setRecords(INITIAL_DATA);
        setCriteria(INITIAL_CRITERIA);
        localStorage.removeItem('sprt_records');
        localStorage.removeItem('sprt_criteria');
        window.location.reload();
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
               <i className="fa-solid fa-temperature-high"></i>
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight">SPRT Tracker Pro</h1>
               <p className="text-xs text-slate-400">Hệ thống đánh giá chuẩn nhiệt kế ITS-90</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="text-sm bg-secondary hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-2"
            >
              <i className="fa-solid fa-cog"></i>
              <span className="hidden md:inline">Cấu hình tiêu chí</span>
            </button>
            <div className="text-xs text-slate-400 hidden md:block border-l border-slate-700 pl-4">
              <i className="fa-solid fa-check-circle text-success mr-1"></i>
              Hỗ trợ bởi Google Gemini AI
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8">
        
        {records && Array.isArray(records) ? (
            <StatsCards records={records} criteria={criteria} />
        ) : (
            <div className="p-4 bg-red-100 text-red-800 rounded">Dữ liệu bị lỗi. Vui lòng Reset.</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Charts */}
          <div className="lg:col-span-1 space-y-6">
            <SPRTForm onAdd={handleAddRecord} />
            <DriftChart records={records || []} />
          </div>

          {/* Right Column: Table */}
          <div className="lg:col-span-2">
            <RecordList 
              records={records || []} 
              criteria={criteria}
              onDelete={handleDeleteRecord} 
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 text-sm pb-8 border-t border-slate-200 pt-8">
        <p>&copy; {new Date().getFullYear()} Metrology Dept. ITS-90 Compliant.</p>
        <button onClick={handleResetData} className="mt-4 text-xs text-slate-300 hover:text-red-400 underline">
            Reset dữ liệu về mặc định
        </button>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <CriteriaSettings 
          currentCriteria={criteria} 
          onSave={setCriteria} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};

export default App;