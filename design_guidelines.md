# Design Guidelines: AI Summit Collaboration Platform

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern productivity tools like Linear and Notion, combined with the visual appeal of collaborative platforms like Miro. This creates a professional yet engaging interface suitable for a tech summit environment.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 220 15% 95% (background), 220 25% 15% (text)
- Dark Mode: 220 15% 8% (background), 220 15% 95% (text)
- Accent: 210 100% 60% (interactive elements, primary actions)

**Status Colors:**
- Success: 142 76% 45% (submitted ideas)
- Warning: 38 92% 50% (trending indicators)
- Info: 210 100% 60% (analytics highlights)

### B. Typography
- Primary: Inter (Google Fonts) - clean, readable for data-heavy content
- Display: Inter (600 weight) for headings and section titles
- Body: Inter (400 weight) for descriptions and form fields
- Monospace: JetBrains Mono for technical tags and IDs

### C. Layout System
**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16
- Tight spacing (p-2, m-2) for form elements and buttons
- Medium spacing (p-4, gap-6) for card layouts and sections
- Large spacing (p-8, mt-12) for major section breaks

### D. Component Library

**Navigation:**
- Clean header with platform title and password-protected sections
- Tabbed navigation for Ideas/Analytics/Admin views
- Breadcrumb navigation for deep filtering

**Forms:**
- Card-based submission form with clear field groupings
- Dropdown selectors for categories and types
- Auto-suggest for component tags
- Character counters for description fields

**Data Displays:**
- Card-grid layout for idea browsing (3-4 columns on desktop)
- Compact list view with filtering sidebar
- Interactive charts using modern data visualization patterns
- Real-time counters and trending indicators

**Analytics Dashboard:**
- Chart cards with subtle shadows and rounded corners
- Progress bars for participation metrics
- Leaderboard tables with avatars (initials-based)
- Tag clouds for trending topics

**Admin Interface:**
- Clean management tables with batch actions
- Export buttons with download icons
- Password change forms with validation feedback
- Activity logs with timestamps

### E. Visual Treatments

**Cards and Containers:**
- Subtle border radius (rounded-lg) for modern feel
- Light drop shadows for depth without distraction
- Hover states with gentle elevation changes

**Interactive Elements:**
- Primary buttons with solid background and white text
- Secondary buttons with outline style and accent color
- Form inputs with focus states using accent color
- Loading states with skeleton animations

**Charts and Analytics:**
- Bar charts for submission counts by category
- Pie charts for idea type distribution
- Line graphs for submission trends over time
- Color-coded metrics with consistent palette

## Key Design Principles

1. **Clarity Over Decoration**: Prioritize readability and data comprehension
2. **Responsive First**: Mobile-friendly layouts for summit attendees
3. **Real-time Feedback**: Visual indicators for successful submissions and live updates
4. **Accessibility**: High contrast ratios and keyboard navigation support
5. **Professional Polish**: Clean, modern aesthetic appropriate for enterprise summit

## Special Considerations

- **No hero images**: Focus on functional dashboard design
- **Minimal animations**: Subtle transitions only for state changes
- **Dense information display**: Optimize for data scanning and quick interactions
- **Quick actions**: Prominent submission and export buttons
- **Visual hierarchy**: Clear distinction between public and admin sections

This design approach balances the collaborative nature of idea sharing with the professional context of a Product & Engineering summit, ensuring both usability and visual appeal for all 150 attendees.