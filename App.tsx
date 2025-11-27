import React, { useState, useEffect } from 'react';
import { SPRTRecord } from './types';
import SPRTForm from './components/SPRTForm';
import RecordList from './components/RecordList';
import StatsCards from './components/StatsCards';
import DriftChart from './components/DriftChart';

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

const App: React.FC = () => {
  const [records, setRecords] = useState<SPRTRecord[]>(() => {
    const saved = localStorage.getItem('sprt_records');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('sprt_records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (newRecord: Omit<SPRTRecord, 'id' | 'timestamp'>) => {
    const record: SPRTRecord = {
      ...newRecord,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    // Add to top
    setRecords(prev => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
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
          <div className="text-xs text-slate-400 hidden md:block">
            <i className="fa-solid fa-check-circle text-success mr-1"></i>
            Hỗ trợ bởi Google Gemini AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8">
        
        <StatsCards records={records} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Charts */}
          <div className="lg:col-span-1 space-y-6">
            <SPRTForm onAdd={handleAddRecord} />
            <DriftChart records={records} />
          </div>

          {/* Right Column: Table */}
          <div className="lg:col-span-2">
            <RecordList records={records} onDelete={handleDeleteRecord} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
        <p>&copy; {new Date().getFullYear()} Metrology Dept. ITS-90 Compliant.</p>
      </footer>
    </div>
  );
};

export default App;
