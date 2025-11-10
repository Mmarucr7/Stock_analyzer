import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ChartData, TimeRange } from '../types';

interface StockChartProps {
  data: ChartData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const StockChart: React.FC<StockChartProps> = ({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const [chartType, setChartType] = useState<'area' | 'candle'>('area');
  
  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded ${
              chartType === 'area'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={`px-3 py-1 rounded ${
              chartType === 'candle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Candlestick
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis 
              yAxisId="price"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
              formatter={(value: number, name: string) => {
                if (name === 'Volume') {
                  return [`${(value / 1000000).toFixed(2)}M`, name];
                }
                return [`$${value.toFixed(2)}`, name];
              }}
            />
            <Legend />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                name="Price"
                yAxisId="price"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            ) : (
              <>
                <Line
                  type="linear"
                  dataKey="high"
                  name="High"
                  yAxisId="price"
                  stroke="#22c55e"
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="low"
                  name="Low"
                  yAxisId="price"
                  stroke="#ef4444"
                  dot={false}
                />
              </>
            )}
            <Bar
              dataKey="volume"
              name="Volume"
              yAxisId="volume"
              fill="#94a3b8"
              opacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;