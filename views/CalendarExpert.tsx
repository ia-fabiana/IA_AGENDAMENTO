import React from 'react';
import { GoogleCalendarExpert } from '../components/GoogleCalendarExpert';

// This would normally come from context or props
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export const CalendarExpert: React.FC = () => {
  const handleConnectionSuccess = () => {
    console.log('Google Calendar connected successfully!');
    // Could trigger analytics, notifications, etc.
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <GoogleCalendarExpert 
        tenantId={TENANT_ID}
        onConnectionSuccess={handleConnectionSuccess}
      />
    </div>
  );
};
