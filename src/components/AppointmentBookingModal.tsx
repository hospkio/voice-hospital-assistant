
import React, { useState } from 'react';
import { Calendar, Clock, Phone, User, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppService } from '@/hooks/useWhatsAppService';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: string;
  doctorName?: string;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  department = '',
  doctorName = ''
}) => {
  const { toast } = useToast();
  const { sendAppointmentConfirmation, isLoading } = useWhatsAppService();
  
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    department: department,
    doctorName: doctorName,
    appointmentDate: '',
    appointmentTime: ''
  });

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const departments = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Emergency',
    'Radiology', 'Surgery', 'ICU', 'Pediatrics', 'Gynecology'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.phoneNumber || !formData.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await sendAppointmentConfirmation(formData);
      
      if (success) {
        toast({
          title: "Appointment Booked! 🎉",
          description: "Confirmation sent to your WhatsApp. Please check your messages for the token number.",
        });
        
        // Reset form and close modal
        setFormData({
          patientName: '',
          phoneNumber: '',
          department: '',
          doctorName: '',
          appointmentDate: '',
          appointmentTime: ''
        });
        onClose();
      } else {
        throw new Error('Failed to send confirmation');
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again or contact reception.",
        variant: "destructive"
      });
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>Book Appointment</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Patient Name *</span>
            </Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>WhatsApp Number *</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="+91 9876543210"
              required
            />
            <p className="text-xs text-gray-500">
              Appointment confirmation will be sent to this WhatsApp number
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Department *</span>
            </Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Preferred Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                min={getTomorrowDate()}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Time</span>
              </Label>
              <Select 
                value={formData.appointmentTime} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📱 <strong>WhatsApp Confirmation:</strong> You'll receive a token number via WhatsApp. 
              Please bring this token when visiting the hospital.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;
