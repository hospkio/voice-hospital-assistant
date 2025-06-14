
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

  // Enhanced input validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation - adjust regex as needed
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '').trim(); // Basic XSS prevention
  };

  const sendAppointmentConfirmation = async (booking: AppointmentBooking): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Enhanced input validation
      if (!booking.patientName || !booking.phoneNumber || !booking.department) {
        console.error('Missing required booking information');
        return false;
      }

      if (!validatePhoneNumber(booking.phoneNumber)) {
        console.error('Invalid phone number format');
        return false;
      }

      // Sanitize inputs
      const sanitizedBooking = {
        patientName: sanitizeInput(booking.patientName),
        phoneNumber: booking.phoneNumber.replace(/[^\d\+]/g, ''), // Keep only digits and +
        department: sanitizeInput(booking.department),
        doctorName: booking.doctorName ? sanitizeInput(booking.doctorName) : undefined,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime
      };

      const tokenNumber = `APT${Date.now().toString().slice(-6)}`;
      
      const message = `🏥 *City Hospital Appointment Confirmation*

✅ *Token Number:* ${tokenNumber}
👤 *Patient:* ${sanitizedBooking.patientName}
🏥 *Department:* ${sanitizedBooking.department}
${sanitizedBooking.doctorName ? `👨‍⚕️ *Doctor:* ${sanitizedBooking.doctorName}` : ''}
${sanitizedBooking.appointmentDate ? `📅 *Date:* ${sanitizedBooking.appointmentDate}` : ''}
${sanitizedBooking.appointmentTime ? `⏰ *Time:* ${sanitizedBooking.appointmentTime}` : ''}

📱 Please arrive 15 minutes early with this token number.
📞 For any changes, call: +91-XXXXXXXXXX

Thank you for choosing City Hospital! 🙏`;

      // Use Edge Function instead of direct API call for security
      const response = await fetch('/functions/v1/whatsapp-send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: sanitizedBooking.phoneNumber,
          message: message,
          tokenNumber: tokenNumber
        }),
      });

      if (!response.ok) {
        console.error('WhatsApp service response not ok:', response.status);
        return false;
      }

      const result = await response.json();
      
      if (result.success) {
        // Store appointment in database
        await storeAppointment({
          ...sanitizedBooking,
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
      // Use Edge Function for secure database operations
      const response = await fetch('/functions/v1/store-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Store appointment failed: ${response.status}`);
      }

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
