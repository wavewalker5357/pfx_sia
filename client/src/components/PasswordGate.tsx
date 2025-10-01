import { useState } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Users, Shield, Calendar, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { CountdownTimer } from "./CountdownTimer";
import { Footer } from "./Footer";
import type { LandingPageSettings } from "@shared/schema";

interface PasswordGateProps {
  onAttendeeAccess: () => void;
  onAdminAccess: () => void;
}

export default function PasswordGate({
  onAttendeeAccess,
  onAdminAccess,
}: PasswordGateProps) {
  const { toast } = useToast();
  const [attendeePassword, setAttendeePassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch landing page settings to determine which mode to show
  const { data: landingPageSettings, isLoading: isLoadingSettings } =
    useQuery<LandingPageSettings>({
      queryKey: ["/api/landing-page-settings"],
      queryFn: async () => {
        const response = await fetch("/api/landing-page-settings", {
          credentials: "include",
        });
        if (!response.ok) {
          // If no settings exist, default to summit mode
          if (response.status === 404) {
            return { mode: "summit" } as LandingPageSettings;
          }
          throw new Error("Failed to fetch landing page settings");
        }
        return response.json();
      },
      retry: false,
    });

  const handleAttendeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (attendeePassword === "summit2025") {
        toast({
          title: "Welcome to AI Summit Ideas!",
          description: "You can now submit and browse ideas.",
        });
        onAttendeeAccess();
      } else {
        toast({
          title: "Invalid password",
          description: "Please check the password and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (adminUsername === "admin" && adminPassword === "admin123") {
        toast({
          title: "Admin access granted",
          description: "Welcome to the admin dashboard.",
        });
        onAdminAccess();
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your username and password.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine current mode (default to summit if no settings)
  const currentMode = landingPageSettings?.mode || "summit";

  // Maintenance Mode
  if (currentMode === "maintenance") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-2">
                Product & Engineering Summit 2025
              </p>
            </div>

            {/* Maintenance Message */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h2 className="text-2xl font-semibold">
                    Platform Under Maintenance
                  </h2>
                  <p
                    className="text-lg text-muted-foreground"
                    data-testid="text-maintenance-message"
                  >
                    {landingPageSettings?.maintenanceMessage ||
                      "The AI Summit platform is currently under construction. Please check back soon!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Countdown Mode
  if (currentMode === "countdown") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-2">
                Product & Engineering Summit 2025
              </p>
              <p className="text-muted-foreground">
                September 30th - October 2nd • Collaborative Idea Platform
              </p>
            </div>

            {/* Countdown Timer */}
            <Card>
              <CardContent className="p-8">
                <CountdownTimer
                  targetDate={(() => {
                    if (landingPageSettings?.summitStartDate) {
                      const date = new Date(
                        landingPageSettings.summitStartDate,
                      );
                      // Check if date is valid
                      if (!isNaN(date.getTime())) {
                        return date;
                      }
                    }
                    // Fallback to default summit date
                    return new Date("2025-10-01T08:00:00.000Z");
                  })()}
                  message={
                    landingPageSettings?.countdownMessage ||
                    "Time to start of the Pricefx Product & Engineering Summit"
                  }
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Summit Mode (default) - show attendee login only
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Summit Ideas</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Product & Engineering Summit 2025
            </p>
            <p className="text-muted-foreground">
              September 30th - October 2nd • Pricefx, Prague
            </p>
          </div>

          {/* Attendee Access */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Summit Access</CardTitle>
              </div>
              <CardDescription>
                Enter the shared password to access the collaboration platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAttendeeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee-password">Access Password</Label>
                  <Input
                    id="attendee-password"
                    type="password"
                    placeholder="Enter shared password"
                    value={attendeePassword}
                    onChange={(e) => setAttendeePassword(e.target.value)}
                    data-testid="input-attendee-password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-attendee-login"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Checking..." : "Enter Summit"}
                </Button>
              </form>

              {/* <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Submit AI ideas, stories, and solutions</li>
                  <li>• Browse all submitted ideas</li>
                  <li>• View participation analytics</li>
                  <li>• Filter and search contributions</li>
                </ul>
              </div> */}

              <div className="mt-6 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="51"
                  height="20"
                  fill="none"
                  viewBox="0 0 51 20"
                  alt="Pricefx logo"
                  class="loginPage__logo"
                >
                  <path
                    fill="#0099CD"
                    d="M50.775 5.253q0-.2-.207-.2h-2.774q-.166 0-.3.1-.135.1-.322.32l-2.194 2.763-1.346-2.763a2.3 2.3 0 0 0-.186-.31q-.083-.11-.249-.11h-4.495l.358-1.719c.068-.44.26-.832.384-.959q.187-.19.663-.19h.698l.413-2.181c-.636.002-1.119 0-1.194 0-.58 0-1.225-.023-1.59.04-.47.08-.883.206-1.248.446q-.55.36-.932 1.042-.383.68-.57 1.802l-.3 1.446-.928 5.09-1.22 6.677q-.062.36-.134.56a.7.7 0 0 1-.207.311.7.7 0 0 1-.352.14c-.06.009-.509.012-1.032.012L31.07 20c.492-.003 1.176.001 1.33.001a8 8 0 0 0 1.396-.119q.704-.11 1.253-.47t.942-1.041q.393-.682.6-1.823l1.677-9.072 2.06-.001c.332 0 .606.092.758.218.05.048.116.13.175.22l1.358 2.647-4.638 5.568a.34.34 0 0 0-.083.22q0 .18.186.18h2.775q.165 0 .3-.09t.32-.31l2.485-3.125 1.491 3.105q.103.22.187.32.082.1.248.1h2.96a.24.24 0 0 0 .197-.09.33.33 0 0 0 .073-.21.3.3 0 0 0-.021-.12l-2.774-5.387 4.368-5.247a.3.3 0 0 0 .083-.22"
                  ></path>
                  <path
                    fill="#000"
                    d="M7.64 8.745q0-1.821-.996-2.82-.996-1.001-2.878-1.001-.896 0-1.76.112-.864.113-1.528.276-.309.075-.393.164T0 5.745v10.464q0 .12.1.209.1.09.224.09h1.867a.3.3 0 0 0 .216-.09.28.28 0 0 0 .093-.21v-2.582q.339.045.687.075.346.03.579.03 1.959 0 2.916-1.03T7.64 9.91zm-2.501 1.17q0 .387-.062.722a1.6 1.6 0 0 1-.216.58 1.1 1.1 0 0 1-.416.387q-.264.142-.68.142-.278 0-.632-.03-.356-.03-.633-.06V7.014q.216-.03.548-.053.331-.021.718-.022.415 0 .679.134.261.134.416.38.155.244.216.573.062.326.062.729zm8.457-3.262V5.225q0-.12-.093-.21a.3.3 0 0 0-.216-.091q-.555 0-1.103.188a3.2 3.2 0 0 0-.98.534v-.302q0-.12-.093-.21a.3.3 0 0 0-.216-.09H9.06a.3.3 0 0 0-.216.089.28.28 0 0 0-.093.209v7.941q0 .12.1.216a.31.31 0 0 0 .224.098h1.867a.3.3 0 0 0 .216-.097.3.3 0 0 0 .093-.216V7.46q.432-.223.926-.372.494-.15 1.065-.149h.123q.108 0 .17-.09a.34.34 0 0 0 .062-.196m3.426-4.267q0-.12-.093-.209a.3.3 0 0 0-.216-.09h-2.006a.3.3 0 0 0-.216.09.28.28 0 0 0-.093.21v1.388q0 .12.093.209a.3.3 0 0 0 .216.09h2.006a.3.3 0 0 0 .216-.09.28.28 0 0 0 .093-.21zm-.062 2.956q0-.12-.093-.21a.3.3 0 0 0-.216-.089H14.77a.3.3 0 0 0-.216.09.28.28 0 0 0-.093.209v7.956q0 .12.092.209.093.09.217.09h1.882q.124 0 .216-.09a.28.28 0 0 0 .093-.21zm7.037 7.822v-1.329a.23.23 0 0 0-.085-.187.33.33 0 0 0-.208-.067h-.031q-.432.045-.826.075t-1.057.03q-.263 0-.493-.082a.9.9 0 0 1-.402-.284 1.5 1.5 0 0 1-.27-.537q-.1-.336-.1-.829V8.701q0-.493.1-.829t.27-.537a.9.9 0 0 1 .402-.284 1.5 1.5 0 0 1 .493-.082 15 15 0 0 1 1.883.104h.031a.33.33 0 0 0 .208-.067.23.23 0 0 0 .085-.186V5.49q0-.164-.077-.231a.6.6 0 0 0-.247-.112q-.324-.075-.841-.15a9 9 0 0 0-1.211-.074q-1.637 0-2.616.97t-.98 2.807v1.253q0 1.836.98 2.807t2.616.97q.694 0 1.211-.075t.841-.149a.6.6 0 0 0 .247-.112q.077-.067.077-.231M32.27 8.85q0-.851-.24-1.568a3.4 3.4 0 0 0-.717-1.239 3.3 3.3 0 0 0-1.196-.82q-.717-.3-1.659-.3-.926 0-1.651.277a3.4 3.4 0 0 0-1.227.784 3.3 3.3 0 0 0-.764 1.239 4.8 4.8 0 0 0-.262 1.627v1.045q0 1.074.34 1.813.339.739.894 1.187t1.25.642 1.39.194q1.002 0 1.712-.09t1.451-.271q.2-.045.262-.135a.5.5 0 0 0 .062-.271v-1.143q0-.24-.293-.24h-.046q-.232.03-.587.053-.355.021-.764.037l-.826.03q-.416.015-.786.015-.465 0-.764-.133a1.3 1.3 0 0 1-.486-.356 1.3 1.3 0 0 1-.263-.517 2.4 2.4 0 0 1-.077-.607v-.03h4.923q.324 0 .324-.358zm-2.438-.269h-2.809v-.06q0-.82.386-1.239.386-.418 1.034-.418t1.018.411.37 1.246z"
                  ></path>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
