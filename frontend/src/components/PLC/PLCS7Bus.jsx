import React from 'react';
import { Cpu } from 'lucide-react';
import './PLC.css';


const PLCS7Bus = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cpu size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">S7 BUS (CP 443-1)</h1>
        </div>
        <p className="text-gray-600">Direct S7 Protocol connection to CP 443-1</p>
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-center text-gray-500">
            S7 BUS monitoring coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLCS7Bus;
