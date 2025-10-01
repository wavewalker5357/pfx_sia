import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { SummitResourcesDropdown } from "@/components/SummitResourcesDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import type { HeaderSettings } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  isAdmin?: boolean;
}

export function AppHeader({ isAdmin = false }: AppHeaderProps) {
  // Default header settings fallback
  const defaultSettings: HeaderSettings = {
    id: "default",
    attendeeTitle: "AI Summit Ideas",
    attendeeSubtitle: "Product & Engineering Summit 2025",
    adminTitle: "AI Summit Admin",
    adminSubtitle: "Platform Management Dashboard",
    summitResourcesLabel: "Summit Resources",
    exitButtonLabel: "Exit",
    logoutButtonLabel: "Logout",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    titleColor: "#000000",
    subtitleColor: "#666666",
    borderColor: "#e5e7eb",
    backgroundImage: null,
    backgroundImageOpacity: "0.1",
    backgroundImagePosition: "center",
    backgroundImageSize: "cover",
    headerHeight: "auto",
    paddingX: "1rem",
    paddingY: "1rem",
    mobileBreakpoint: "768px",
    mobileTitleSize: "1.5rem",
    desktopTitleSize: "2rem",
    isActive: "true",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Fetch header settings from API
  const {
    data: headerSettings,
    isLoading,
    error,
  } = useQuery<HeaderSettings>({
    queryKey: ["/api/header-settings"],
    queryFn: async () => {
      const response = await fetch("/api/header-settings", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch header settings: ${response.status}`);
      }
      return response.json();
    },
    // Use default settings as fallback on error
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Use header settings or fallback to defaults
  const activeSettings = headerSettings || defaultSettings;

  // Logout functionality
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout(); // Clears sessionStorage and React state
    setLocation("/"); // Redirect to login page
  };

  // Handle responsive breakpoints with JavaScript (since CSS custom properties can't be used in media queries)
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Apply custom styles and handle responsive breakpoints
  useEffect(() => {
    const root = document.documentElement;

    // Apply CSS custom properties for header styling
    root.style.setProperty(
      "--header-bg-color",
      activeSettings.backgroundColor || "#ffffff",
    );
    root.style.setProperty(
      "--header-text-color",
      activeSettings.textColor || "#000000",
    );
    root.style.setProperty(
      "--header-title-color",
      activeSettings.titleColor || "#000000",
    );
    root.style.setProperty(
      "--header-subtitle-color",
      activeSettings.subtitleColor || "#666666",
    );
    root.style.setProperty(
      "--header-border-color",
      activeSettings.borderColor || "#e5e7eb",
    );
    root.style.setProperty(
      "--header-padding-x",
      activeSettings.paddingX || "1rem",
    );
    root.style.setProperty(
      "--header-padding-y",
      activeSettings.paddingY || "1rem",
    );
    root.style.setProperty(
      "--header-mobile-title-size",
      activeSettings.mobileTitleSize || "1.5rem",
    );
    root.style.setProperty(
      "--header-desktop-title-size",
      activeSettings.desktopTitleSize || "2rem",
    );

    // Apply header height if specified
    if (activeSettings.headerHeight && activeSettings.headerHeight !== "auto") {
      root.style.setProperty("--header-height", activeSettings.headerHeight);
    } else {
      root.style.removeProperty("--header-height");
    }

    // Background image handling
    if (activeSettings.backgroundImage) {
      root.style.setProperty(
        "--header-bg-image",
        `url(${activeSettings.backgroundImage})`,
      );
      root.style.setProperty(
        "--header-bg-opacity",
        activeSettings.backgroundImageOpacity || "0.1",
      );
      root.style.setProperty(
        "--header-bg-position",
        activeSettings.backgroundImagePosition || "center",
      );
      root.style.setProperty(
        "--header-bg-size",
        activeSettings.backgroundImageSize || "cover",
      );
    } else {
      root.style.removeProperty("--header-bg-image");
    }

    // Handle responsive breakpoints
    const handleResize = () => {
      const mobileBreakpoint = parseInt(
        activeSettings.mobileBreakpoint || "768px",
      );
      const smallMobileBreakpoint = mobileBreakpoint * 0.625; // ~480px for default 768px
      const currentWidth = window.innerWidth;

      setIsMobile(currentWidth <= mobileBreakpoint);
      setIsSmallMobile(currentWidth <= smallMobileBreakpoint);
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSettings]);

  // Loading state - show a skeleton header
  if (isLoading) {
    return (
      <header className="app-header border-b bg-background animate-pulse">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 bg-muted rounded" />
              <div>
                <div className="h-6 bg-muted rounded w-48 mb-1" />
                <div className="h-4 bg-muted rounded w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Error state - show header with default settings and error indicator
  if (error) {
    console.warn("Failed to load header settings, using defaults:", error);
  }

  const title = isAdmin
    ? activeSettings.adminTitle
    : activeSettings.attendeeTitle;
  const subtitle = isAdmin
    ? activeSettings.adminSubtitle
    : activeSettings.attendeeSubtitle;
  const exitLabel = isAdmin
    ? activeSettings.logoutButtonLabel
    : activeSettings.exitButtonLabel;

  return (
    <header
      className={`app-header border-b !bg-white dark:!bg-zinc-900 !border-gray-200 dark:!border-zinc-800 relative overflow-hidden ${isMobile ? "is-mobile" : ""} ${isSmallMobile ? "is-small-mobile" : ""}`}
      style={{
        backgroundColor: activeSettings.backgroundColor,
        borderColor: activeSettings.borderColor,
        minHeight:
          activeSettings.headerHeight !== "auto"
            ? activeSettings.headerHeight
            : undefined,
      }}
    >
      {/* Error indicator */}
      {error && (
        <div
          className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full z-20"
          title="Using default header settings - failed to load custom settings"
        />
      )}

      {/* Background image overlay */}
      {activeSettings.backgroundImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${activeSettings.backgroundImage})`,
            backgroundPosition: activeSettings.backgroundImagePosition,
            backgroundSize: activeSettings.backgroundImageSize,
            backgroundRepeat: "no-repeat",
            opacity: parseFloat(activeSettings.backgroundImageOpacity || "0.1"),
          }}
        />
      )}

      {/* Header content */}
      <div className="relative z-10 container mx-auto">
        <div
          className="flex items-center justify-between w-full"
          style={{
            padding: `${activeSettings.paddingY} ${activeSettings.paddingX}`,
          }}
        >
          {/* Left side - Logo and titles */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isAdmin && (
              <Shield
                className="w-6 h-6 flex-shrink-0 text-primary"
                data-testid="admin-shield-icon"
              />
            )}
            {!isAdmin && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="51"
                height="20"
                fill="none"
                viewBox="0 0 51 20"
                aria-label="Pricefx logo"
                data-testid="attendee-pricefx-logo"
                className="flex-shrink-0 hidden sm:block"
              >
                <path
                  fill="#0099CD"
                  d="M50.775 5.253q0-.2-.207-.2h-2.774q-.166 0-.3.1-.135.1-.322.32l-2.194 2.763-1.346-2.763a2.3 2.3 0 0 0-.186-.31q-.083-.11-.249-.11h-4.495l.358-1.719c.068-.44.26-.832.384-.959q.187-.19.663-.19h.698l.413-2.181c-.636.002-1.119 0-1.194 0-.58 0-1.225-.023-1.59.04-.47.08-.883.206-1.248.446q-.55.36-.932 1.042-.383.68-.57 1.802l-.3 1.446-.928 5.09-1.22 6.677q-.062.36-.134.56a.7.7 0 0 1-.207.311.7.7 0 0 1-.352.14c-.06.009-.509.012-1.032.012L31.07 20c.492-.003 1.176.001 1.33.001a8 8 0 0 0 1.396-.119q.704-.11 1.253-.47t.942-1.041q.393-.682.6-1.823l1.677-9.072 2.06-.001c.332 0 .606.092.758.218.05.048.116.13.175.22l1.358 2.647-4.638 5.568a.34.34 0 0 0-.083.22q0 .18.186.18h2.775q.165 0 .3-.09t.32-.31l2.485-3.125 1.491 3.105q.103.22.187.32.082.1.248.1h2.96a.24.24 0 0 0 .197-.09.33.33 0 0 0 .073-.21.3.3 0 0 0-.021-.12l-2.774-5.387 4.368-5.247a.3.3 0 0 0 .083-.22"
                ></path>
                <path
                  fill="#000"
                  d="M7.64 8.745q0-1.821-.996-2.82-.996-1.001-2.878-1.001-.896 0-1.76.112-.864.113-1.528.276-.309.075-.393.164T0 5.745v10.464q0 .12.1.209.1.09.224.09h1.867a.3.3 0 0 0 .216-.09.28.28 0 0 0 .093-.21v-2.582q.339.045.687.075.346.03.579.03 1.959 0 2.916-1.03T7.64 9.91zm-2.501 1.17q0 .387-.062.722a1.6 1.6 0 0 1-.216.58 1.1 1.1 0 0 1-.416.387q-.264.142-.68.142-.278 0-.632-.03-.356-.03-.633-.06V7.014q.216-.03.548-.053.331-.021.718-.022.415 0 .679.134.261.134.416.38.155.244.216.573.062.326.062.729zm8.457-3.262V5.225q0-.12-.093-.21a.3.3 0 0 0-.216-.091q-.555 0-1.103.188a3.2 3.2 0 0 0-.98.534v-.302q0-.12-.093-.21a.3.3 0 0 0-.216-.09H9.06a.3.3 0 0 0-.216.089.28.28 0 0 0-.093.209v7.941q0 .12.1.216a.31.31 0 0 0 .224.098h1.867a.3.3 0 0 0 .216-.097.3.3 0 0 0 .093-.216V7.46q.432-.223.926-.372.494-.15 1.065-.149h.123q.108 0 .17-.09a.34.34 0 0 0 .062-.196m3.426-4.267q0-.12-.093-.209a.3.3 0 0 0-.216-.09h-2.006a.3.3 0 0 0-.216.09.28.28 0 0 0-.093.21v1.388q0 .12.093.209a.3.3 0 0 0 .216.09h2.006a.3.3 0 0 0 .216-.09.28.28 0 0 0 .093-.21zm0 2.958v-.127q0-.119-.093-.209a.3.3 0 0 0-.216-.09h-2.006a.3.3 0 0 0-.216.09.28.28 0 0 0-.093.21v7.94q0 .12.093.217a.3.3 0 0 0 .216.097h1.867a.3.3 0 0 0 .216-.097.3.3 0 0 0 .093-.216zm7.713 2.628q0-1.104-.432-1.925a3.4 3.4 0 0 0-1.164-1.268 5.1 5.1 0 0 0-1.652-.716 8 8 0 0 0-1.905-.224q-.772 0-1.544.09-.772.09-1.375.283-.293.075-.378.157t-.084.276v1.4q0 .119.1.208.1.09.223.09.062 0 .124-.015a14 14 0 0 1 1.451-.313q.772-.105 1.544-.105 1.022 0 1.513.424.493.424.493 1.282v.194q-.34-.03-.802-.045a6 6 0 0 0-.91-.015q-.848 0-1.59.134a4.3 4.3 0 0 0-1.3.447q-.555.313-.879.813-.324.499-.324 1.22 0 1.313.664 1.96.663.648 1.96.648.895 0 1.544-.343a3.4 3.4 0 0 0 1.041-.849v.298q0 .119.093.208.093.09.216.09h1.714q.124 0 .216-.09a.28.28 0 0 0 .093-.209zm-2.36 2.763q0 .655-.432 1.088-.432.433-1.21.433-.617 0-.965-.298a1.06 1.06 0 0 1-.347-.842q0-.58.347-.86.346-.28 1.068-.28.432 0 .787.03.354.03.525.06zm9.653-3.785q0 .12-.1.164-.1.045-.361.045h-4.033v.96q0 .849.408 1.283.408.432 1.226.432.617 0 1.148-.112a9 9 0 0 0 1.018-.283q.139-.06.216-.06.124 0 .217.09.092.09.092.209v1.373q0 .164-.077.26-.078.097-.34.208a7 7 0 0 1-1.226.327 8.8 8.8 0 0 1-1.513.127q-.926 0-1.675-.246a3.6 3.6 0 0 1-1.28-.74 3.2 3.2 0 0 1-.817-1.223 4.6 4.6 0 0 1-.285-1.67q0-1.046.324-1.865.323-.82.879-1.37a3.6 3.6 0 0 1 1.29-.827 4.4 4.4 0 0 1 1.528-.276q.895 0 1.559.261.663.261 1.103.75.44.491.663 1.193.224.701.224 1.574zm-2.283-.835q0-.805-.293-1.178t-.957-.373q-.694 0-1.057.395-.362.395-.424 1.156z"
                ></path>
              </svg>
            )}

            <div className="min-w-0 flex-1">
              <h1
                className="font-bold leading-tight truncate app-header-title"
                style={{
                  color: activeSettings.titleColor,
                  fontSize: "var(--header-title-size)",
                }}
                data-testid="header-title"
              >
                {title}
              </h1>
              <p
                className="text-sm leading-tight truncate app-header-subtitle"
                style={{ color: activeSettings.subtitleColor }}
                data-testid="header-subtitle"
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <SummitResourcesDropdown
              customLabel={activeSettings.summitResourcesLabel}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid={isAdmin ? "button-admin-logout" : "button-logout"}
              className="hidden sm:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {exitLabel}
            </Button>

            {/* Mobile logout button (icon only) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid={
                isAdmin ? "button-admin-logout-mobile" : "button-logout-mobile"
              }
              className="sm:hidden"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
