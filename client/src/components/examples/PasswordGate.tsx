import { useState } from 'react';
import PasswordGate from '../PasswordGate';

export default function PasswordGateExample() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [userType, setUserType] = useState<'attendee' | 'admin'>('attendee');

  if (accessGranted) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Access Granted - {userType === 'admin' ? 'Admin' : 'Attendee'} Mode
        </h2>
        <p className="text-muted-foreground">
          In the real app, this would redirect to the appropriate dashboard.
        </p>
      </div>
    );
  }

  return (
    <PasswordGate
      onAttendeeAccess={() => {
        setUserType('attendee');
        setAccessGranted(true);
      }}
      onAdminAccess={() => {
        setUserType('admin');
        setAccessGranted(true);
      }}
    />
  );
}