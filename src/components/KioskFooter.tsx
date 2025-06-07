
import React from 'react';

const KioskFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white p-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-2xl mb-6 font-bold">
          🤖 Powered by Google AI • 📱 WhatsApp Integration • 🎥 Face Detection • 🗣️ Multi-Language Support
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <span className="bg-white/20 px-4 py-3 rounded-full">"Find cardiology department"</span>
          <span className="bg-white/20 px-4 py-3 rounded-full">"Book appointment with Dr. Kumar"</span>
          <span className="bg-white/20 px-4 py-3 rounded-full">"Emergency directions"</span>
          <span className="bg-white/20 px-4 py-3 rounded-full">"Visiting hours"</span>
        </div>
        <p className="mt-6 text-blue-100">
          © 2024 MediCare Smart Kiosk • Advanced Healthcare Technology
        </p>
      </div>
    </footer>
  );
};

export default KioskFooter;
