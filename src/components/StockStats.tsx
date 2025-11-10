import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { ChartData } from '../types';

interface StockStatsProps {
  data: ChartData[];
  symbol: string;
}

const StockStats: React.FC<StockStatsProps> = ({ data, symbol }) => {
  if (data.length === 0) return null;

  const latestData = data[0];
  const previousData = data[1];
  const priceChange = latestData.close - previousData.close;
  const priceChangePercentage = (priceChange / previousData.close) * 100;

  // Calculate additional metrics
  const highestPrice = Math.max(...data.map(d => d.high));
  const lowestPrice = Math.min(...data.map(d => d.low));
  const averageVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
  const volatility = Math.sqrt(
    data.reduce((sum, d) => sum + Math.pow(d.close - latestData.close, 2), 0) / data.length
  );

  const stats = [
    {
      name: 'Current Price',
      value: `$${latestData.close.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      name: 'Price Change',
      value: `${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)}`,
      change: `${priceChangePercentage >= 0 ? '+' : ''}${priceChangePercentage.toFixed(2)}%`,
      icon: priceChange >= 0 ? TrendingUp : TrendingDown,
      type: priceChange >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Volume',
      value: latestData.volume.toLocaleString(),
      subValue: `Avg: ${averageVolume.toLocaleString()}`,
      icon: BarChart,
    },
    {
      name: 'Day High',
      value: `$${latestData.high.toFixed(2)}`,
      icon: ArrowUpRight,
      type: 'increase',
    },
    {
      name: 'Day Low',
      value: `$${latestData.low.toFixed(2)}`,
      icon: ArrowDownRight,
      type: 'decrease',
    },
    {
      name: 'Volatility',
      value: `$${volatility.toFixed(2)}`,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
              {stat.change && (
                <p className={`mt-1 text-sm ${
                  stat.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              )}
              {stat.subValue && (
                <p className="mt-1 text-sm text-gray-500">
                  {stat.subValue}
                </p>
              )}
            </div>
            <stat.icon className={`w-8 h-8 ${
              stat.type === 'increase' ? 'text-green-600' : 
              stat.type === 'decrease' ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockStats;