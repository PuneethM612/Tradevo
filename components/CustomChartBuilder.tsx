import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from 'recharts';

// Example field options for user to select
const FIELD_OPTIONS = [
  { label: 'Profit', value: 'profit' },
  { label: 'R:R', value: 'rr' },
  { label: 'Lots', value: 'lots' },
  { label: 'Session', value: 'session' },
  { label: 'Asset', value: 'symbol' },
  { label: 'Date', value: 'displayDate' },
  { label: 'Tag', value: 'tags' },
];

const CHART_TYPES = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
  { label: 'Pie', value: 'pie' },
];

export default function CustomChartBuilder({ trades, theme }: { trades: any[]; theme: 'dark' | 'light' }) {
  const [chartType, setChartType] = useState('line');
  const [xField, setXField] = useState('displayDate');
  const [yField, setYField] = useState('profit');

  // Prepare data for chart
  const chartData = trades.map(t => ({
    ...t,
    profit: parseFloat(t.profit) || 0,
    rr: parseFloat(t.rr) || 0,
    lots: parseFloat(t.lots) || 0,
  }));

  return (
    <div className="border rounded-2xl p-8 shadow-xl space-y-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="px-3 py-2 rounded-lg border">
          {CHART_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={xField} onChange={e => setXField(e.target.value)} className="px-3 py-2 rounded-lg border">
          {FIELD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {chartType !== 'pie' && (
          <select value={yField} onChange={e => setYField(e.target.value)} className="px-3 py-2 rounded-lg border">
            {FIELD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        )}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yField} stroke="#00ff9c" strokeWidth={2} />
            </LineChart>
          )}
          {chartType === 'bar' && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yField} fill="#00ff9c" />
            </BarChart>
          )}
          {chartType === 'pie' && (
            <PieChart>
              <Pie data={chartData} dataKey={yField} nameKey={xField} cx="50%" cy="50%" outerRadius={100} fill="#00ff9c">
                {chartData.map((entry, idx) => <Cell key={idx} fill="#00ff9c" />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
