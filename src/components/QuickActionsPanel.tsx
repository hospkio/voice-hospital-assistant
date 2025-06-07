
import React from 'react';
import { MapPin, Calendar, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsPanelProps {
  onQuickAction: (query: string) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onQuickAction }) => {
  const quickActions = [
    { 
      icon: MapPin, 
      label: 'Find Department', 
      query: 'Where is the cardiology department?',
      color: 'bg-blue-500' 
    },
    { 
      icon: Calendar, 
      label: 'Book Appointment', 
      query: 'I want to book an appointment',
      color: 'bg-green-500' 
    },
    { 
      icon: Info, 
      label: 'Hospital Info', 
      query: 'What are the visiting hours?',
      color: 'bg-purple-500' 
    },
    { 
      icon: HelpCircle, 
      label: 'Emergency Help', 
      query: 'Where is the emergency department?',
      color: 'bg-red-500' 
    }
  ];

  return (
    <Card className="shadow-lg border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className="text-green-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start h-16 text-lg hover:shadow-md transition-all duration-200 border-2"
            onClick={() => onQuickAction(action.query)}
          >
            <action.icon className="h-6 w-6 mr-3" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;
