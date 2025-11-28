import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { SPRTRecord } from '../types';

interface DriftChartProps {
  records: SPRTRecord[];
}

const DriftChart: React.FC<DriftChartProps> = ({ records }) => {
  if (!records || records.length === 0) return null;

  // Find most frequent or latest serial to show relevant chart
  const serials = Array.from(new Set(records.map(r => r.serial).filter(Boolean)));
  if (serials.length === 0) return null;
  
  const selectedSerial = serials[0];

  const chartData = records
    .filter(r => r.serial === selectedSerial && !isNaN(Number(r.calibrationYear)) && !isNaN(Number(r.r_tpw_current)))
    .sort((a, b) => Number(a.calibrationYear) - Number(b.calibrationYear))
    .map(r => ({
      year: Number(r.calibrationYear),
      rtpw: Number(r.r_tpw_current),
      wga: Number(r.w_ga),
      whg: Number(r.w_hg)
    }));

  if (chartData.length < 2) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 h-64 text-center text-sm">
        Cần ít nhất 2 bản ghi của thiết bị {selectedSerial} <br/> để vẽ biểu đồ xu hướng.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-slate-700 font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-chart-line text-accent"></i>
        Xu hướng R(tpw) - S/N: {selectedSerial}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} type="number" domain={['dataMin', 'dataMax']} allowDecimals={false} />
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
             <XAxis dataKey="year" stroke="#64748b" fontSize={12} type="number" domain={['dataMin', 'dataMax']} allowDecimals={false} />
             <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} stroke="#10b981" fontSize={12} />
             <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#f59e0b" fontSize={12} />
             <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
             <Legend />
             <ReferenceLine yAxisId="left" y={1.11807} stroke="#10b981" strokeDasharray="3 3" />
             <ReferenceLine yAxisId="right" y={0.844235} stroke="#f59e0b" strokeDasharray="3 3" />
             
             <Line yAxisId="left" type="monotone" dataKey="wga" name="W(Ga)" stroke="#10b981" strokeWidth={2} dot={false} />
             <Line yAxisId="right" type="monotone" dataKey="whg" name="W(Hg)" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DriftChart;