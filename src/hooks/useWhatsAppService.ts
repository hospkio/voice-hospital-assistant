
import { useState } from 'react';

interface WhatsAppMessage {
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface AppointmentBooking {
  patientName: string;
  phoneNumber: string;
  department: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

export const useWhatsAppService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendAppointmentConfirmation = async (booking: AppointmentBooking): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const tokenNumber = `APT${Date.now().toString().slice(-6)}`;
      
      const message = `🏥 *City Hospital Appointment Confirmation*

✅ *Token Number:* ${tokenNumber}
👤 *Patient:* ${booking.patientName}
🏥 *Department:* ${booking.department}
${booking.doctorName ? `👨‍⚕️ *Doctor:* ${booking.doctorName}` : ''}
${booking.appointmentDate ? `📅 *Date:* ${booking.appointmentDate}` : ''}
${booking.appointmentTime ? `⏰ *Time:* ${booking.appointmentTime}` : ''}

📱 Please arrive 15 minutes early with this token number.
📞 For any changes, call: +91-XXXXXXXXXX

Thank you for choosing City Hospital! 🙏`;

      const response = await fetch('/functions/v1/whatsapp-send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: booking.phoneNumber,
          message: message,
          tokenNumber: tokenNumber
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store appointment in database
        await storeAppointment({
          ...booking,
          tokenNumber,
          status: 'confirmed'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const storeAppointment = async (appointmentData: any) => {
    try {
      const response = await fetch('/functions/v1/store-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      return await response.json();
    } catch (error) {
      console.error('Error storing appointment:', error);
      throw error;
    }
  };

  return {
    sendAppointmentConfirmation,
    isLoading
  };
};
