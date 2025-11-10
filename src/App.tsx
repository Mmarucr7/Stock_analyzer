import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import StockChart from './components/StockChart';
import StockStats from './components/StockStats';
import { ChartData, TimeRange } from './types';

// ✅ Use .env file for API key (fallback to 'demo' if not set)
const API_KEY = import.meta.env.VITE_ALPHA_API_KEY || 'demo';

const POPULAR_STOCKS = [
  { symbol: 'IBM', name: 'IBM' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
];

function App() {
  const [symbol, setSymbol] = useState<string>('IBM');
  const [inputSymbol, setInputSymbol] = useState<string>('IBM');
  const [stockData, setStockData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  const fetchStockData = async (stockSymbol: string) => {
    setLoading(true);
    setError('');
    try {
      if (API_KEY === 'demo' && stockSymbol !== 'MSFT') {
        throw new Error('Alpha Vantage demo API key only supports MSFT. Please use a valid API key.');
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data['Error Message']) {
        throw new Error(`API Error: ${data['Error Message']}`);
      }

      if (data['Note']) {
        throw new Error('API call frequency exceeded. Please try again in 1 minute.');
      }

      const timeSeriesData = data['Time Series (Daily)'];
      if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
        throw new Error(`No data available for symbol: ${stockSymbol}`);
      }

      const chartData: ChartData[] = Object.entries(timeSeriesData)
        .map(([date, values]) => {
          const parsedValues = {
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseFloat(values['5. volume']),
          };

          const isValid = Object.entries(parsedValues).every(([key, value]) =>
            key === 'date' || (!isNaN(value) && value > 0)
          );

          return isValid ? parsedValues : null;
        })
        .filter((item): item is ChartData => item !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (chartData.length === 0) {
        throw new Error(`No valid price data found for symbol: ${stockSymbol}`);
      }

      setStockData(chartData);
      setSymbol(stockSymbol);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(symbol);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      fetchStockData(inputSymbol.trim().toUpperCase());
    }
  };

  const handlePopularStockClick = (stockSymbol: string) => {
    setInputSymbol(stockSymbol);
    fetchStockData(stockSymbol);
  };

  const getFilteredData = () => {
    if (!stockData.length) return [];

    const ranges: Record<TimeRange, number> = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': stockData.length,
    };

    return stockData.slice(-ranges[timeRange]).reverse();
  };

  const filteredData = getFilteredData();

  return (
  <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stock Market Analyzer
          </h1>
          <p className="text-gray-600">
            Enter a stock symbol or select from popular stocks to view price analysis
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Popular Stocks
          </h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handlePopularStockClick(stock.symbol)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${symbol === stock.symbol
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {stock.name} ({stock.symbol})
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  value={inputSymbol}
                  onChange={(e) => setInputSymbol(e.target.value)}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            {error.includes('frequency exceeded') && (
              <p className="mt-2 text-sm">
                Note: The free API tier has a limit of 5 calls per minute. Please wait and try again.
              </p>
            )}
          </div>
        )}

        {filteredData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {symbol} Stock Analysis
            </h2>
            <StockStats data={filteredData} symbol={symbol} />
            <StockChart
              data={filteredData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
        )}
      </div>
    </div></>
  );
}

export default App;

