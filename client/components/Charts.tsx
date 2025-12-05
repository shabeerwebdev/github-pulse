import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { RepoStat, ActivityStat } from '../types';
import { COLORS } from '../constants';

interface TopReposChartProps {
  data: RepoStat[];
}

interface ActivityChartProps {
  data: ActivityStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dashboard-bg/90 backdrop-blur-sm border border-dashboard-border p-3 rounded-lg shadow-xl ring-1 ring-white/10">
        <p className="text-dashboard-muted text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-lg font-mono font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
          {payload[0].value}
          <span className="text-xs font-normal text-dashboard-muted">events</span>
        </p>
      </div>
    );
  }
  return null;
};

export const TopReposChart: React.FC<TopReposChartProps> = ({ data }) => {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} strokeOpacity={0.2} />
          <XAxis 
            type="number" 
            stroke={COLORS.muted} 
            tick={{ fill: COLORS.muted, fontSize: 11 }} 
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
            hide // Hide X axis numbers for cleaner look, tooltip handles values
          />
          <YAxis
            dataKey="_id"
            type="category"
            width={140} // Increased width for repo names
            stroke={COLORS.muted}
            tick={{ fill: COLORS.text, fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) => {
              // Safety check for undefined/null values
              if (!value) return '';
              return value.length > 20 ? `${value.substring(0, 20)}...` : value;
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: COLORS.grid, opacity: 0.1 }} 
          />
          <Bar 
            dataKey="count" 
            fill={COLORS.primary} 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  // Fill missing minutes with 0 for a smoother chart if backend doesn't provide all 0-59
  const filledData = Array.from({ length: 60 }, (_, i) => {
    const existing = data.find((d) => d._id === i);
    return existing || { _id: i, count: 0 };
  });

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filledData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Rich Neon Gradient for Fill */}
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.5} />
              <stop offset="50%" stopColor={COLORS.primary} stopOpacity={0.2} />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
            
            {/* Glow Filter for the Stroke */}
            <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={COLORS.grid} 
            vertical={false} 
            strokeOpacity={0.15} 
          />
          
          <XAxis 
            dataKey="_id" 
            stroke={COLORS.muted} 
            tick={{ fill: COLORS.muted, fontSize: 11 }} 
            interval={5}
            tickLine={false}
            axisLine={false}
            dy={10}
            label={{ value: 'Timeline (Minutes)', position: 'insideBottomRight', offset: -5, fill: COLORS.muted, fontSize: 10 }}
          />
          
          <YAxis 
            stroke={COLORS.muted} 
            tick={{ fill: COLORS.muted, fontSize: 11 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: COLORS.primary, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }} 
          />
          
          <Area
            type="monotone"
            dataKey="count"
            stroke={COLORS.primary}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCount)"
            filter="url(#neonGlow)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};