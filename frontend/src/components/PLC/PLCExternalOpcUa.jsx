import React from 'react';
import { Cloud } from 'lucide-react';
import './PLC.css';



const PLCExternalOpcUa = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cloud size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">External OPC UA Server</h1>
        </div>
        <p className="text-gray-600">Third-party OPC UA server connection</p>
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-center text-gray-500">
            External OPC UA monitoring coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLCExternalOpcUa;
