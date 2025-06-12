
import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentsTabContentProps {
  onShowAppointmentModal: () => void;
}

const AppointmentsTabContent: React.FC<AppointmentsTabContentProps> = ({
  onShowAppointmentModal
}) => {
  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">WhatsApp Appointment Booking</h3>
            <p className="text-green-100">Quick, Easy & Instant Confirmations</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-8 p-8">
        <div className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-2 border-green-300 rounded-3xl p-8">
          <div className="text-6xl mb-6 animate-bounce">📱</div>
          <h3 className="text-3xl font-bold text-green-800 mb-4">
            Book via WhatsApp
          </h3>
          <p className="text-green-700 mb-8 text-xl">
            Get instant appointment confirmations sent directly to your WhatsApp!
          </p>
          
          <Button 
            onClick={onShowAppointmentModal}
            className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 h-20 px-12 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl"
            size="lg"
          >
            <Calendar className="h-8 w-8 mr-4" />
            📅 Book Appointment Now
          </Button>
        </div>
        
        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-5xl mb-4">1️⃣</div>
            <h4 className="font-bold text-blue-600 mb-4 text-2xl">Book Online</h4>
            <p className="text-gray-700 text-lg">Fill in your details and preferred time slot easily</p>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-5xl mb-4">2️⃣</div>
            <h4 className="font-bold text-green-600 mb-4 text-2xl">Get Token</h4>
            <p className="text-gray-700 text-lg">Receive token number via WhatsApp instantly</p>
          </div>
          
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
            <div className="text-5xl mb-4">3️⃣</div>
            <h4 className="font-bold text-purple-600 mb-4 text-2xl">Visit Hospital</h4>
            <p className="text-gray-700 text-lg">Show your token for quick check-in</p>
          </div>
        </div>

        {/* Elderly Help Section */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-3xl p-8">
          <h4 className="font-bold text-yellow-800 text-2xl mb-4">👴👵 Need Help?</h4>
          <p className="text-yellow-700 text-xl leading-relaxed">
            Our friendly hospital staff are always available to assist with appointments and any questions. 
            Just ask at the front desk or speak to our AI assistant!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsTabContent;
