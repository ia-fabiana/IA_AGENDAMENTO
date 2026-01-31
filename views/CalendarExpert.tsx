import React from 'react';
import { GoogleCalendarExpert } from '../components/GoogleCalendarExpert';

interface CalendarExpertProps {
  tenantId?: string;
}

// Default tenant ID for demo purposes - in production, this should come from user context/auth
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export const CalendarExpert: React.FC<CalendarExpertProps> = ({ tenantId = DEFAULT_TENANT_ID }) => {
  const handleConnectionSuccess = () => {
    console.log('Google Calendar connected successfully!');
    // Could trigger analytics, notifications, etc.
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <GoogleCalendarExpert 
        tenantId={tenantId}
        onConnectionSuccess={handleConnectionSuccess}
      />
    </div>
  );
};
