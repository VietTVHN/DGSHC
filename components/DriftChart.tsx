import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { SPRTRecord } from '../types';

interface DriftChartProps {
  records: SPRTRecord[];
}

const DriftChart: React.FC<DriftChartProps> = ({ records }) => {
  // We need to group by serial number to make sense, but for this overview, 
  // let's just plot R_tpw values over time for a unique Serial if there are multiple,
  // or just show all R_tpw values relative to 25.5 (or base) if many devices? 
  // Let's make it simple: Filter for the most frequent Serial Number to show a "Case Study" or just show the last 10 records' R_tpw deviance from mean.
  
  // Better approach for Dashboard: Show R_tpw history of the *most recently added* serial number.
  if (records.length === 0) return null;

  const latestSerial = records[0].serial; // Assuming records are prepended (newest first). 
  // Actually, we usually want to sort by date for charts.
  
  // Find unique serials
  const serials = Array.from(new Set(records.map(r => r.serial)));
  const selectedSerial = serials[0]; // Just pick the first one found for demo, or the one with most records.

  const chartData = records
    .filter(r => r.serial === selectedSerial)
    .sort((a, b) => a.calibrationYear - b.calibrationYear)
    .map(r => ({
      year: r.calibrationYear,
      rtpw: r.r_tpw_current,
      wga: r.w_ga,
      whg: r.w_hg
    }));

  if (chartData.length < 2) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 h-64">
        Cần ít nhất 2 bản ghi của cùng số Serial ({selectedSerial}) để vẽ biểu đồ xu hướng.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-slate-700 font-bold mb-4">Xu hướng ổn định R(tpw) - S/N: {selectedSerial}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} width={80} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Line type="monotone" dataKey="rtpw" name="R(tpw) (Ω)" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 h-48 w-full border-t border-slate-100 pt-4">
         <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Chỉ số W(Ga) & W(Hg)</h4>
         <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
             <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
             <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} stroke="#10b981" fontSize={12} />
             <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#f59e0b" fontSize={12} />
             <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
             <Legend />
             {/* Reference lines for ITS-90 limits */}
             <ReferenceLine yAxisId="left" y={1.11807} label={{ value: "Min Ga", position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }} stroke="#10b981" strokeDasharray="3 3" />
             <ReferenceLine yAxisId="right" y={0.844235} label={{ value: "Max Hg", position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
             
             <Line yAxisId="left" type="monotone" dataKey="wga" name="W(Ga)" stroke="#10b981" strokeWidth={2} dot={false} />
             <Line yAxisId="right" type="monotone" dataKey="whg" name="W(Hg)" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DriftChart;
