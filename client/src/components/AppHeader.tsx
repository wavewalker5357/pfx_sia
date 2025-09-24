import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Calendar } from 'lucide-react';
import { SummitResourcesDropdown } from '@/components/SummitResourcesDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import { useQuery } from '@tanstack/react-query';
import type { HeaderSettings } from '@shared/schema';

interface AppHeaderProps {
  isAdmin?: boolean;
}

export function AppHeader({ isAdmin = false }: AppHeaderProps) {
  // Fetch header settings from API
  const { data: headerSettings } = useQuery<HeaderSettings>({
    queryKey: ['/api/header-settings'],
    queryFn: async () => {
      const response = await fetch('/api/header-settings', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return default settings if API fails
        return {
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
        } as HeaderSettings;
      }
      return response.json();
    },
  });

  // Apply custom styles based on header settings
  useEffect(() => {
    if (headerSettings) {
      const root = document.documentElement;
      
      // Apply CSS custom properties for header styling
      root.style.setProperty('--header-bg-color', headerSettings.backgroundColor || '#ffffff');
      root.style.setProperty('--header-text-color', headerSettings.textColor || '#000000');
      root.style.setProperty('--header-title-color', headerSettings.titleColor || '#000000');
      root.style.setProperty('--header-subtitle-color', headerSettings.subtitleColor || '#666666');
      root.style.setProperty('--header-border-color', headerSettings.borderColor || '#e5e7eb');
      root.style.setProperty('--header-padding-x', headerSettings.paddingX || '1rem');
      root.style.setProperty('--header-padding-y', headerSettings.paddingY || '1rem');
      root.style.setProperty('--header-mobile-title-size', headerSettings.mobileTitleSize || '1.5rem');
      root.style.setProperty('--header-desktop-title-size', headerSettings.desktopTitleSize || '2rem');
      root.style.setProperty('--header-mobile-breakpoint', headerSettings.mobileBreakpoint || '768px');
      
      // Background image handling
      if (headerSettings.backgroundImage) {
        root.style.setProperty('--header-bg-image', `url(${headerSettings.backgroundImage})`);
        root.style.setProperty('--header-bg-opacity', headerSettings.backgroundImageOpacity || '0.1');
        root.style.setProperty('--header-bg-position', headerSettings.backgroundImagePosition || 'center');
        root.style.setProperty('--header-bg-size', headerSettings.backgroundImageSize || 'cover');
      } else {
        root.style.removeProperty('--header-bg-image');
      }
    }
  }, [headerSettings]);

  if (!headerSettings) {
    return null; // Loading state
  }

  const title = isAdmin ? headerSettings.adminTitle : headerSettings.attendeeTitle;
  const subtitle = isAdmin ? headerSettings.adminSubtitle : headerSettings.attendeeSubtitle;
  const exitLabel = isAdmin ? headerSettings.logoutButtonLabel : headerSettings.exitButtonLabel;

  return (
    <header 
      className="app-header border-b relative overflow-hidden"
      style={{
        backgroundColor: headerSettings.backgroundColor,
        borderColor: headerSettings.borderColor,
        minHeight: headerSettings.headerHeight !== 'auto' ? headerSettings.headerHeight : undefined,
      }}
    >
      {/* Background image overlay */}
      {headerSettings.backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${headerSettings.backgroundImage})`,
            backgroundPosition: headerSettings.backgroundImagePosition,
            backgroundSize: headerSettings.backgroundImageSize,
            backgroundRepeat: 'no-repeat',
            opacity: parseFloat(headerSettings.backgroundImageOpacity || '0.1'),
          }}
        />
      )}
      
      {/* Header content */}
      <div className="relative z-10 container mx-auto">
        <div 
          className="flex items-center justify-between w-full"
          style={{
            padding: `${headerSettings.paddingY} ${headerSettings.paddingX}`,
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
                  color: headerSettings.titleColor,
                  fontSize: 'var(--header-title-size)' 
                }}
                data-testid="header-title"
              >
                {title}
              </h1>
              <p 
                className="text-sm leading-tight truncate app-header-subtitle"
                style={{ color: headerSettings.subtitleColor }}
                data-testid="header-subtitle"
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SummitResourcesDropdown 
              customLabel={headerSettings.summitResourcesLabel}
            />
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
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
              onClick={() => window.location.reload()}
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