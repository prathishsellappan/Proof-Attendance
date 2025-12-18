# Design Guidelines: Hedera Proof-of-Attendance Platform

## Design Approach

**Selected System**: Material Design 3 principles with Web3-native aesthetics, inspired by Linear's clean dashboards and Stripe's trust-building patterns.

**Rationale**: This blockchain attendance system requires clarity for complex operations (NFT minting, wallet connections, GPS verification) while inspiring trust in a decentralized context. Material Design's elevation system and feedback patterns work perfectly for multi-step processes, while Web3 aesthetics communicate innovation.

---

## Typography System

**Font Families** (Google Fonts):
- Primary: Inter (400, 500, 600, 700) - for UI, forms, data
- Display: Space Grotesk (500, 700) - for headings, hero sections

**Hierarchy**:
- Hero/Landing: text-5xl to text-6xl, font-bold, Space Grotesk
- Page Titles: text-3xl to text-4xl, font-semibold, Space Grotesk
- Section Headers: text-2xl, font-semibold, Inter
- Card Titles: text-lg, font-semibold, Inter
- Body Text: text-base, font-normal, Inter
- Labels/Metadata: text-sm, font-medium, Inter
- Technical Data (Wallet IDs, CIDs): text-sm, font-mono (use system mono)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 24**
- Component padding: p-4, p-6
- Section spacing: py-12, py-16, py-24
- Card gaps: gap-6, gap-8
- Form field spacing: space-y-4

**Container Strategy**:
- Dashboard content: max-w-7xl mx-auto px-6
- Forms/Cards: max-w-2xl for single column, max-w-4xl for split layouts
- Full-width: Event listings, verification results

**Grid Patterns**:
- Event cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Dashboard stats: grid-cols-2 lg:grid-cols-4 gap-4
- Form sections: Single column for simplicity and focus

---

## Component Library

### Navigation
**Organizer/Student Dashboards**:
- Persistent sidebar (w-64) with role-specific navigation
- Top bar with wallet connection status, user profile dropdown
- Highlight active route with subtle background treatment
- Logo + platform name at sidebar top

**Public Pages**:
- Simple top navigation with "Verify Badge" CTA
- Minimal footer with platform info

### Hero Sections
**Landing Page**:
- Full-width hero (min-h-screen) with grid pattern background
- Large headline explaining proof-of-attendance concept
- Split layout: Left (text + CTAs), Right (3D isometric illustration of NFT badge + blockchain)
- Dual CTAs: "I'm an Organizer" (primary), "I'm a Student" (secondary)
- Trust indicators below fold: "Powered by Hedera" + "Secured with IPFS"

**Images Section**:
- Hero: Abstract geometric illustration showing blockchain nodes, location pins, and NFT badges in modern gradient style (purple-to-blue Web3 aesthetic)
- Features section: Icons from Heroicons for each feature (shield for security, map-pin for location, badge for NFTs)
- Event cards: Placeholder for uploaded badge images with subtle border radius

### Dashboard Cards
**Event Cards** (Organizer & Student):
- Elevated card design with subtle shadow
- Badge image thumbnail (aspect-square, rounded-lg)
- Event title (text-lg, font-semibold)
- Metadata grid: Date, venue, registered count
- Status pill: "Open" (green), "Closed" (gray), "Claimed" (blue)
- Action buttons at bottom

**Stat Cards** (Organizer Dashboard):
- Compact cards in 4-column grid
- Large number (text-4xl, font-bold)
- Label below (text-sm, muted)
- Icon in top-right corner

### Forms
**Event Creation** (Organizer):
- Multi-step form with progress indicator at top
- Generous spacing between fields (space-y-6)
- Field groups in cards with headers
- Location inputs: Two-column grid for lat/long
- Image upload: Drag-drop zone with preview
- Radius slider with real-time value display

**Student Profile**:
- Single-column form, max-w-xl
- Each field with clear label + helper text
- Auto-save indicator

**Badge Claim Interface**:
- Large card showing event details
- GPS status indicator (animated pulse when checking)
- Checklist showing claim requirements (✓ for met, • for pending)
- Prominent "Claim Badge" button (disabled until all checks pass)

### Blockchain Interactions
**Wallet Connection**:
- Modal with wallet options (HashPack, Blade)
- Connected state shows abbreviated wallet ID (0.0.xxxx)
- Copy button with success toast

**NFT Minting Progress**:
- Stepper component showing: Upload Metadata → Mint NFT → Transfer to Wallet
- Each step with spinner when active, checkmark when complete
- Estimated time display

**Verification Result** (Public):
- Large card with green checkmark or red X
- NFT metadata display: Image (large), attributes in key-value pairs
- IPFS links for transparency (opens in new tab)
- "Verified on Hedera" badge with timestamp

### Status Indicators
**Attendance Window**:
- Prominent toggle switch (organizer side)
- Status banner: Full-width at dashboard top
- "OPEN" = green background with countdown timer
- "CLOSED" = neutral background with "Start Attendance" CTA

**Location Verification**:
- Real-time distance display with visual indicator
- Inside radius: Green circle with ✓
- Outside radius: Red circle with X and distance to venue

### Data Tables
**Registration List** (Organizer):
- Sortable columns: Student wallet, registered time, claimed status
- Search/filter bar
- Export to CSV button
- Pagination for large lists

---

## Key Patterns

**Trust Elements**:
- Blockchain confirmation hashes displayed in monospace
- IPFS CID links with external link icons
- Transaction status with explorer links
- "Verified" badges throughout

**Feedback**:
- Toast notifications for all actions (success, error, info)
- Loading states with skeleton screens
- Optimistic UI updates for better perceived performance

**Accessibility**:
- All wallet IDs, CIDs, and hashes with copy buttons
- Form validation with inline error messages
- ARIA labels for all interactive elements
- Focus states on all interactive components

**Responsive Behavior**:
- Sidebar collapses to hamburger menu on mobile
- Cards stack to single column on small screens
- Tables switch to card view on mobile
- Sticky headers for long lists

---

## Animations

Use **sparingly** and purposefully:
- Page transitions: Subtle fade (150ms)
- GPS checking: Pulsing location icon
- NFT minting: Progress stepper animation
- Success states: Gentle scale + fade-in for checkmarks
- **No** scroll animations, parallax, or decorative motion