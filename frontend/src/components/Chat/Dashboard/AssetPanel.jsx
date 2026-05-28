import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBolt,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaSync,
  FaIndustry,
  FaTachometerAlt,
  FaTemperatureHigh,
  FaFan
} from 'react-icons/fa';

const AssetPanel = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockAssets = [
      {
        id: 1,
        name: 'پمپ سانتریفیوژ اصلی',
        type: 'پمپ',
        status: 'normal',
        health: 85,
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        alerts: 0,
        temperature: 65,
        vibration: 2.1,
        pressure: 3.2
      },
      {
        id: 2,
        name: 'کمپرسور هوای صنعتی',
        type: 'کمپرسور',
        status: 'warning',
        health: 62,
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-03-20',
        alerts: 2,
        temperature: 78,
        vibration: 4.5,
        pressure: 8.1
      },
      {
        id: 3,
        name: 'توربین گازی A',
        type: 'توربین',
        status: 'critical',
        health: 45,
        lastMaintenance: '2023-12-20',
        nextMaintenance: '2024-02-28',
        alerts: 5,
        temperature: 92,
        vibration: 7.8,
        pressure: 12.3
      },
      {
        id: 4,
        name: 'پمپ انتقال آب',
        type: 'پمپ',
        status: 'normal',
        health: 92,
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-05-20',
        alerts: 0,
        temperature: 58,
        vibration: 1.8,
        pressure: 2.8
      },
      {
        id: 5,
        name: 'کمپرسور خنک‌کننده',
        type: 'کمپرسور',
        status: 'normal',
        health: 78,
        lastMaintenance: '2024-01-18',
        nextMaintenance: '2024-04-18',
        alerts: 1,
        temperature: 62,
        vibration: 2.9,
        pressure: 7.2
      }
    ];

    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 text-lg" />;
      case 'critical':
        return <FaExclamationTriangle className="text-red-500 text-lg" />;
      default:
        return <FaCog className="text-gray-400 text-lg" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'critical') return matchesSearch && asset.status === 'critical';
    if (filter === 'warning') return matchesSearch && asset.status === 'warning';
    if (filter === 'normal') return matchesSearch && asset.status === 'normal';

    return matchesSearch;
  });

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaIndustry className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">وضعیت تجهیزات</h2>
              <p className="text-sm text-gray-500">نمایش لحظه‌ای</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            <FaSync className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در تجهیزات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>

          <div className="flex space-x-2 space-x-reverse overflow-x-auto">
            {[
              { key: 'all', label: 'همه', count: assets.length },
              { key: 'critical', label: 'بحرانی', count: assets.filter(a => a.status === 'critical').length },
              { key: 'warning', label: 'هشدار', count: assets.filter(a => a.status === 'warning').length },
              { key: 'normal', label: 'نرمال', count: assets.filter(a => a.status === 'normal').length }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === item.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{item.label}</span>
                <span className="bg-white px-1.5 py-0.5 rounded text-xs">
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-24"></div>
              </div>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaIndustry className="text-4xl text-gray-300 mx-auto mb-3" />
            <p>تجهیزی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getStatusIcon(asset.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {asset.name}
                      </h3>
                      <p className="text-gray-500 text-xs">{asset.type}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                    {asset.status === 'normal' && 'نرمال'}
                    {asset.status === 'warning' && 'هشدار'}
                    {asset.status === 'critical' && 'بحرانی'}
                  </div>
                </div>

                {/* Health Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <FaChartLine className="text-gray-400 text-sm" />
                    <span className="text-xs text-gray-600">سلامت تجهیز:</span>
                  </div>
                  <span className={`text-sm font-bold ${getHealthColor(asset.health)}`}>
                    {asset.health}%
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center space-x-1 space-x-reverse justify-center bg-white rounded-lg p-2">
                    <FaTemperatureHigh className="text-red-400" />
                    <span>{asset.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse justify-center bg-white rounded-lg p-2">
                    <FaFan className="text-blue-400" />
                    <span>{asset.vibration}mm/s</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse justify-center bg-white rounded-lg p-2">
                    <FaTachometerAlt className="text-green-400" />
                    <span>{asset.pressure}bar</span>
                  </div>
                </div>

                {/* Alerts */}
                {asset.alerts > 0 && (
                  <div className="mt-3 flex items-center space-x-2 space-x-reverse text-xs">
                    <FaExclamationTriangle className="text-yellow-500" />
                    <span className="text-yellow-700">{asset.alerts} هشدار فعال</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{assets.length}</div>
            <div className="text-xs text-gray-500">کل تجهیزات</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {assets.filter(a => a.status === 'normal').length}
            </div>
            <div className="text-xs text-gray-500">سالم</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {assets.filter(a => a.status === 'critical').length}
            </div>
            <div className="text-xs text-gray-500">بحرانی</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPanel;