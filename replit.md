# ProofPass - Blockchain Proof of Attendance Platform

## Overview

ProofPass is a blockchain-based Proof-of-Attendance platform using Hedera NFTs and IPFS storage. The system enables event organizers to create events and control attendance windows, while students register for events, verify their physical presence via GPS within a configurable radius, and claim soulbound NFT badges.

## Project Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Storage**: In-memory (MemStorage)
- **Authentication**: JWT cookie-based auth
- **Blockchain**: Hedera (simulated for MVP)
- **File Storage**: IPFS/Pinata (simulated for MVP)

### Key Features
1. **Dual User Roles**: Organizers (create/manage events) and Students (register/claim badges)
2. **Event Management**: Full CRUD with badge image upload, venue location, attendance radius
3. **GPS Verification**: Haversine distance calculation for location verification
4. **NFT Badge System**: Simulated Hedera NFT minting with IPFS metadata
5. **Public Verification**: Trustless badge verification via token ID and serial number

### Directory Structure
```
├── client/src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login/Register pages
│   │   ├── organizer/    # Organizer dashboard, event management
│   │   └── student/      # Student dashboard, badge claiming
│   └── lib/              # Utilities (queryClient)
├── server/
│   ├── routes.ts         # API endpoints with role-based auth
│   ├── storage.ts        # In-memory data storage
│   └── index.ts          # Express server setup
└── shared/
    └── schema.ts         # Shared TypeScript types
```

## API Routes

### Authentication
- `POST /api/auth/organizer/register` - Register as organizer
- `POST /api/auth/organizer/login` - Organizer login
- `POST /api/auth/student/register` - Register as student
- `POST /api/auth/student/login` - Student login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Organizer Routes (requires organizer role)
- `GET /api/organizer/events` - Get organizer's events
- `GET /api/organizer/stats` - Get dashboard stats
- `POST /api/events` - Create new event
- `PATCH /api/events/:id/attendance` - Toggle attendance window
- `GET /api/events/:id/registrations` - Get event registrations

### Student Routes (requires student role)
- `GET /api/student/events/available` - Browse all events
- `GET /api/student/events/registered` - Get registered events
- `GET /api/student/badges` - Get claimed badges
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/claim` - Claim attendance badge
- `PATCH /api/student/wallet` - Connect wallet
- `PATCH /api/student/profile` - Update profile

### Public Routes
- `GET /api/events/:id` - Get event details
- `GET /api/verify` - Verify badge by tokenId and serial

## Recent Changes

### December 2024
- Implemented complete authentication system with JWT cookies
- Added role-based access control (organizer vs student)
- Created all frontend pages with Material Design 3 + Web3 aesthetics
- Implemented GPS location verification with Haversine formula
- Added badge claiming flow with minting animation
- Built public verification page

## User Preferences

- Design: Material Design 3 principles with Web3 aesthetics
- Fonts: Inter (UI), Space Grotesk (headings)
- Theme: Dark mode support with purple/violet primary colors
- Storage: In-memory for rapid prototyping

## Environment Variables

- `SESSION_SECRET` - JWT signing secret (required)
