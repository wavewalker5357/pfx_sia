import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CountdownTimerProps {
  targetDate: Date;
  message?: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ targetDate, message = "Countdown", className = "" }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const calculateTimeRemaining = (target: Date): TimeRemaining => {
    const now = new Date().getTime();
    const targetTime = new Date(target).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  };

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every second
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // If countdown has finished
  if (timeRemaining.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-primary mb-2">
          The Summit Has Begun!
        </div>
        <div className="text-muted-foreground">
          Welcome to the AI Summit platform
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center space-y-6 ${className}`}>
      {/* Countdown Message */}
      {message && (
        <div className="text-xl font-semibold text-foreground mb-4" data-testid="text-countdown-message">
          {message}
        </div>
      )}

      {/* Countdown Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-countdown-days">
              {timeRemaining.days}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining.days === 1 ? 'Day' : 'Days'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-countdown-hours">
              {timeRemaining.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-countdown-minutes">
              {timeRemaining.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-countdown-seconds">
              {timeRemaining.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRemaining.seconds === 1 ? 'Second' : 'Seconds'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Date Display */}
      <div className="text-sm text-muted-foreground" data-testid="text-target-date">
        {new Date(targetDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })}
      </div>
    </div>
  );
}