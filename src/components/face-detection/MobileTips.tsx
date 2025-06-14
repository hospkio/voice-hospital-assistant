
import React from 'react';

const MobileTips: React.FC = () => {
  return (
    <div className="md:hidden bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4">
      <h5 className="text-yellow-800 font-bold text-lg mb-2">📱 Mobile Tips:</h5>
      <ul className="text-yellow-700 space-y-1">
        <li>• Hold device stable for best detection</li>
        <li>• Ensure good lighting</li>
        <li>• Face the camera directly</li>
      </ul>
    </div>
  );
};

export default MobileTips;
