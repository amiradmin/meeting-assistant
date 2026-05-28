import React, { useState } from 'react';
import { Settings, Power, Play, Square, AlertCircle } from 'lucide-react';
import './PLC.css';

const ControlPanel = () => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-blue-600" />
          PLC Control Panel
        </h1>
        <p className="text-gray-500 mt-1">
          Manual control interface for Siemens S7-400 / CP 443-1
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Conveyor Control</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsRunning(true)}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Start
            </button>
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              <Square size={18} />
              Stop
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Valve Control</h2>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full"
            defaultValue="0"
          />
          <div className="text-center mt-2">Position: 0%</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            Emergency Stop
          </h2>
          <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition">
            EMERGENCY STOP
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
