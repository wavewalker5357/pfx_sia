import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Calendar } from 'lucide-react';
import { SummitResourcesDropdown } from '@/components/SummitResourcesDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import { useQuery } from '@tanstack/react-query';
import type { HeaderSettings } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  isAdmin?: boolean;
}

export function AppHeader({ isAdmin = false }: AppHeaderProps) {
  // Default header settings fallback
  const defaultSettings: HeaderSettings = {
    id: 'default',
    attendeeTitle: 'AI Summit Ideas',
    attendeeSubtitle: 'Product & Engineering Summit 2025',
    adminTitle: 'AI Summit Admin',
    adminSubtitle: 'Platform Management Dashboard',
    summitResourcesLabel: 'Summit Resources',
    exitButtonLabel: 'Exit',
    logoutButtonLabel: 'Logout',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    titleColor: '#000000',
    subtitleColor: '#666666',
    borderColor: '#e5e7eb',
    backgroundImage: null,
    backgroundImageOpacity: '0.1',
    backgroundImagePosition: 'center',
    backgroundImageSize: 'cover',
    headerHeight: 'auto',
    paddingX: '1rem',
    paddingY: '1rem',
    mobileBreakpoint: '768px',
    mobileTitleSize: '1.5rem',
    desktopTitleSize: '2rem',
    isActive: 'true',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Fetch header settings from API
  const { data: headerSettings, isLoading, error } = useQuery<HeaderSettings>({
    queryKey: ['/api/header-settings'],
    queryFn: async () => {
      const response = await fetch('/api/header-settings', {
        credentials: 'include'
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
    setLocation('/'); // Redirect to login page
  };

  // Handle responsive breakpoints with JavaScript (since CSS custom properties can't be used in media queries)
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Apply custom styles and handle responsive breakpoints
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for header styling
    root.style.setProperty('--header-bg-color', activeSettings.backgroundColor || '#ffffff');
    root.style.setProperty('--header-text-color', activeSettings.textColor || '#000000');
    root.style.setProperty('--header-title-color', activeSettings.titleColor || '#000000');
    root.style.setProperty('--header-subtitle-color', activeSettings.subtitleColor || '#666666');
    root.style.setProperty('--header-border-color', activeSettings.borderColor || '#e5e7eb');
    root.style.setProperty('--header-padding-x', activeSettings.paddingX || '1rem');
    root.style.setProperty('--header-padding-y', activeSettings.paddingY || '1rem');
    root.style.setProperty('--header-mobile-title-size', activeSettings.mobileTitleSize || '1.5rem');
    root.style.setProperty('--header-desktop-title-size', activeSettings.desktopTitleSize || '2rem');
    
    // Apply header height if specified
    if (activeSettings.headerHeight && activeSettings.headerHeight !== 'auto') {
      root.style.setProperty('--header-height', activeSettings.headerHeight);
    } else {
      root.style.removeProperty('--header-height');
    }
    
    // Background image handling
    if (activeSettings.backgroundImage) {
      root.style.setProperty('--header-bg-image', `url(${activeSettings.backgroundImage})`);
      root.style.setProperty('--header-bg-opacity', activeSettings.backgroundImageOpacity || '0.1');
      root.style.setProperty('--header-bg-position', activeSettings.backgroundImagePosition || 'center');
      root.style.setProperty('--header-bg-size', activeSettings.backgroundImageSize || 'cover');
    } else {
      root.style.removeProperty('--header-bg-image');
    }

    // Handle responsive breakpoints
    const handleResize = () => {
      const mobileBreakpoint = parseInt(activeSettings.mobileBreakpoint || '768px');
      const smallMobileBreakpoint = mobileBreakpoint * 0.625; // ~480px for default 768px
      const currentWidth = window.innerWidth;
      
      setIsMobile(currentWidth <= mobileBreakpoint);
      setIsSmallMobile(currentWidth <= smallMobileBreakpoint);
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    console.warn('Failed to load header settings, using defaults:', error);
  }

  const title = isAdmin ? activeSettings.adminTitle : activeSettings.attendeeTitle;
  const subtitle = isAdmin ? activeSettings.adminSubtitle : activeSettings.attendeeSubtitle;
  const exitLabel = isAdmin ? activeSettings.logoutButtonLabel : activeSettings.exitButtonLabel;

  return (
    <header 
      className={`app-header border-b !bg-white dark:!bg-zinc-900 !border-gray-200 dark:!border-zinc-800 relative overflow-hidden ${isMobile ? 'is-mobile' : ''} ${isSmallMobile ? 'is-small-mobile' : ''}`}
      style={{
        backgroundColor: activeSettings.backgroundColor,
        borderColor: activeSettings.borderColor,
        minHeight: activeSettings.headerHeight !== 'auto' ? activeSettings.headerHeight : undefined,
      }}
    >
      {/* Error indicator */}
      {error && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full z-20" 
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
            backgroundRepeat: 'no-repeat',
            opacity: parseFloat(activeSettings.backgroundImageOpacity || '0.1'),
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
              <Calendar 
                className="w-6 h-6 flex-shrink-0 text-primary hidden sm:block" 
                data-testid="attendee-calendar-icon"
              />
            )}
            
            <div className="min-w-0 flex-1">
              <h1 
                className="font-bold leading-tight truncate app-header-title"
                style={{ 
                  color: activeSettings.titleColor,
                  fontSize: 'var(--header-title-size)' 
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
              data-testid={isAdmin ? "button-admin-logout-mobile" : "button-logout-mobile"}
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