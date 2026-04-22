import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesDataDefault = [ 
  { name: 'Jan', sales: 12000, visitors: 8000 }, { name: 'Feb', sales: 19000, visitors: 12000 },
  { name: 'Mar', sales: 15000, visitors: 10000 }, { name: 'Apr', sales: 22000, visitors: 15000 },
  { name: 'May', sales: 28000, visitors: 20000 }, { name: 'Jun', sales: 24000, visitors: 18000 },
  { name: 'Jul', sales: 32000, visitors: 25000 }, { name: 'Aug', sales: 38000, visitors: 30000 },
];

interface AnalyticsChartProps {
    title?: string;
    data?: any[]; 
    className?: string;
    hideHeader?: boolean;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title = "Performance Trend", data = salesDataDefault, className = "", hideHeader = false }) => {
  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-6 px-2 shrink-0">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{title}</h3>
        </div>
      )}

      <div className="flex-1 w-full min-h-0 relative">
        <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fafafa" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3f3f46" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#18181b" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#27272a" 
                    tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#27272a" 
                    tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{ stroke: '#52525b', strokeWidth: 1 }} 
                    contentStyle={{ 
                        backgroundColor: '#09090b', 
                        border: '1px solid #27272a', 
                        borderRadius: '4px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                    }}
                    itemStyle={{ color: '#fafafa', fontSize: '10px', fontWeight: 700 }}
                    labelStyle={{ color: '#52525b', fontSize: '9px', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', tracking: '0.1em' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3f3f46" 
                    strokeWidth={1}
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                />
                <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#fafafa" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
