import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET || "proofpass-secret-key-change-in-production";
const upload = multer({ storage: multer.memoryStorage() });

// Haversine distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// JWT middleware
function authenticateToken(req: Request, res: Response, next: Function) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Simulated IPFS upload (returns mock CID)
async function uploadToIPFS(data: Buffer | object): Promise<string> {
  // In production, this would upload to Pinata
  const mockCID = `bafybei${randomUUID().replace(/-/g, '').substring(0, 46)}`;
  return mockCID;
}

// Simulated NFT minting
async function mintNFT(tokenId: string, metadataCID: string): Promise<{ serial: string }> {
  // In production, this would use Hedera SDK
  const serial = String(Math.floor(Math.random() * 1000000));
  return { serial };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===================
  // AUTH ROUTES
  // ===================
  
  // Organizer Registration
  app.post("/api/auth/organizer/register", async (req, res) => {
    try {
      const { name, email, password, hederaAccountId } = req.body;
      
      const existing = await storage.getOrganizerByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const organizer = await storage.createOrganizer({
        name,
        email,
        password: hashedPassword,
        hederaAccountId: hederaAccountId || null,
      });
      
      const token = jwt.sign({ id: organizer.id, email, role: "organizer" }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.json({ id: organizer.id, name: organizer.name, email: organizer.email, hederaAccountId: organizer.hederaAccountId, role: "organizer" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });
  
  // Organizer Login
  app.post("/api/auth/organizer/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const organizer = await storage.getOrganizerByEmail(email);
      if (!organizer) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const valid = await bcrypt.compare(password, organizer.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: organizer.id, email, role: "organizer" }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.json({ id: organizer.id, name: organizer.name, email: organizer.email, hederaAccountId: organizer.hederaAccountId, role: "organizer" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });
  
  // Student Registration
  app.post("/api/auth/student/register", async (req, res) => {
    try {
      const { email, password, hederaAccountId } = req.body;
      
      const existing = await storage.getStudentByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const student = await storage.createStudent({
        email,
        password: hashedPassword,
        hederaAccountId: hederaAccountId || null,
        profileCID: null,
        name: null,
        college: null,
        department: null,
        rollNo: null,
      });
      
      const token = jwt.sign({ id: student.id, email, role: "student" }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.json({ id: student.id, email: student.email, hederaAccountId: student.hederaAccountId, role: "student" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });
  
  // Student Login
  app.post("/api/auth/student/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const student = await storage.getStudentByEmail(email);
      if (!student) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const valid = await bcrypt.compare(password, student.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: student.id, email, role: "student" }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.json({ id: student.id, name: student.name, email: student.email, hederaAccountId: student.hederaAccountId, role: "student" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      
      if (user.role === "organizer") {
        const organizer = await storage.getOrganizer(user.id);
        if (!organizer) return res.status(404).json({ message: "User not found" });
        return res.json({ id: organizer.id, name: organizer.name, email: organizer.email, hederaAccountId: organizer.hederaAccountId, role: "organizer" });
      } else {
        const student = await storage.getStudent(user.id);
        if (!student) return res.status(404).json({ message: "User not found" });
        return res.json({ id: student.id, name: student.name, email: student.email, hederaAccountId: student.hederaAccountId, role: "student" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });
  
  // ===================
  // ORGANIZER ROUTES
  // ===================
  
  // Get organizer events
  app.get("/api/organizer/events", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
      }
      const events = await storage.getEventsByOrganizer(user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get organizer stats
  app.get("/api/organizer/stats", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
      }
      const stats = await storage.getOrganizerStats(user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===================
  // EVENT ROUTES
  // ===================
  
  // Create event
  app.post("/api/events", authenticateToken, upload.single("badgeImage"), async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
      }
      const { name, description, date, venueName, venueLat, venueLong, radius } = req.body;
      
      let badgeImageCID = null;
      if (req.file) {
        badgeImageCID = await uploadToIPFS(req.file.buffer);
      }
      
      // Generate mock token ID for this event
      const tokenId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;
      
      const event = await storage.createEvent({
        name,
        description,
        date,
        venueName,
        venueLat: parseFloat(venueLat),
        venueLong: parseFloat(venueLong),
        radius: parseInt(radius) || 100,
        badgeImageCID,
        attendanceStatus: "CLOSED",
        organizerId: user.id,
        tokenId,
      });
      
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update attendance status
  app.patch("/api/events/:id/attendance", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
      }
      const { status } = req.body;
      const event = await storage.updateEvent(req.params.id, { 
        attendanceStatus: status,
        attendanceStartedAt: status === "OPEN" ? new Date() : null,
      });
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get event registrations
  app.get("/api/events/:id/registrations", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
      }
      const registrations = await storage.getRegistrationsByEvent(req.params.id);
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Register for event
  app.post("/api/events/:id/register", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const { studentAccountId } = req.body;
      
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const existing = await storage.getRegistrationByEventAndStudent(req.params.id, user.id);
      if (existing) {
        return res.status(400).json({ message: "Already registered" });
      }
      
      const registration = await storage.createRegistration({
        eventId: req.params.id,
        studentId: user.id,
        studentAccountId: studentAccountId || null,
      });
      
      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's registration for event
  app.get("/api/events/:id/registration/:studentId", authenticateToken, async (req, res) => {
    try {
      const registration = await storage.getRegistrationByEventAndStudent(req.params.id, req.params.studentId);
      if (!registration) {
        return res.status(404).json({ message: "Not registered" });
      }
      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Claim badge
  app.post("/api/events/:id/claim", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const { location } = req.body;
      
      // Get event
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check attendance is open
      if (event.attendanceStatus !== "OPEN") {
        return res.status(400).json({ message: "Attendance window is closed" });
      }
      
      // Get registration
      const registration = await storage.getRegistrationByEventAndStudent(req.params.id, user.id);
      if (!registration) {
        return res.status(400).json({ message: "Not registered for this event" });
      }
      
      // Check not already claimed
      if (registration.claimed) {
        return res.status(400).json({ message: "Badge already claimed" });
      }
      
      // Verify location
      if (location) {
        const distance = calculateDistance(location.lat, location.long, event.venueLat, event.venueLong);
        if (distance > event.radius) {
          return res.status(400).json({ message: `Outside venue radius. Distance: ${Math.round(distance)}m` });
        }
      }
      
      // Get student
      const student = await storage.getStudent(user.id);
      if (!student?.hederaAccountId) {
        return res.status(400).json({ message: "Wallet not connected" });
      }
      
      // Get organizer for issuer name
      const organizer = await storage.getOrganizer(event.organizerId);
      
      // Create NFT metadata
      const metadata = {
        name: `${event.name} – Proof of Attendance`,
        description: `Issued for attending ${event.name}`,
        image: event.badgeImageCID ? `ipfs://${event.badgeImageCID}` : "",
        attributes: [
          { trait_type: "Event ID", value: event.id },
          { trait_type: "Student Profile CID", value: student.profileCID || "" },
          { trait_type: "Issued By", value: organizer?.name || "" },
          { trait_type: "Date", value: event.date },
        ],
      };
      
      // Upload metadata to IPFS
      const metadataCID = await uploadToIPFS(metadata);
      
      // Mint NFT
      const { serial } = await mintNFT(event.tokenId || "", metadataCID);
      
      // Update registration
      const updatedRegistration = await storage.updateRegistration(registration.id, {
        claimed: true,
        claimedAt: new Date(),
        nftSerial: serial,
        metadataCID,
      });
      
      res.json({
        success: true,
        tokenId: event.tokenId,
        serial,
        metadataCID,
        registration: updatedRegistration,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===================
  // STUDENT ROUTES
  // ===================
  
  // Get available events (all events)
  app.get("/api/student/events/available", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const events = await storage.getAllEvents();
      
      // Add registration status to each event
      const eventsWithRegistration = await Promise.all(
        events.map(async (event) => {
          const registration = await storage.getRegistrationByEventAndStudent(event.id, user.id);
          return { ...event, registration };
        })
      );
      
      res.json(eventsWithRegistration);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get registered events
  app.get("/api/student/events/registered", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const registrations = await storage.getRegistrationsByStudent(user.id);
      
      const events = await Promise.all(
        registrations
          .filter(r => !r.claimed)
          .map(async (reg) => {
            const event = await storage.getEvent(reg.eventId);
            return event ? { ...event, registration: reg } : null;
          })
      );
      
      res.json(events.filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get claimed badges
  app.get("/api/student/badges", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const registrations = await storage.getRegistrationsByStudent(user.id);
      
      const events = await Promise.all(
        registrations
          .filter(r => r.claimed)
          .map(async (reg) => {
            const event = await storage.getEvent(reg.eventId);
            return event ? { ...event, registration: reg } : null;
          })
      );
      
      res.json(events.filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update student wallet
  app.patch("/api/student/wallet", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const { hederaAccountId } = req.body;
      
      const student = await storage.updateStudent(user.id, { hederaAccountId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ hederaAccountId: student.hederaAccountId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update student profile
  app.patch("/api/student/profile", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
      }
      const { name, college, department, rollNo } = req.body;
      
      // Upload profile to IPFS
      const profileData = { name, college, department, rollNo };
      const profileCID = await uploadToIPFS(profileData);
      
      const student = await storage.updateStudent(user.id, {
        name,
        college,
        department,
        rollNo,
        profileCID,
      });
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ profileCID, ...profileData });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===================
  // VERIFICATION ROUTES
  // ===================
  
  app.get("/api/verify", async (req, res) => {
    try {
      const { tokenId, serial } = req.query;
      
      if (!tokenId || !serial) {
        return res.status(400).json({ verified: false, error: "Missing tokenId or serial" });
      }
      
      // Find event by tokenId
      const events = await storage.getAllEvents();
      const event = events.find(e => e.tokenId === tokenId);
      
      if (!event) {
        return res.status(404).json({ verified: false, error: "Token not found" });
      }
      
      // Find registration with this serial
      const registrations = await storage.getRegistrationsByEvent(event.id);
      const registration = registrations.find(r => r.nftSerial === serial);
      
      if (!registration || !registration.claimed) {
        return res.status(404).json({ verified: false, error: "Badge not found" });
      }
      
      // Get student and organizer info
      const student = await storage.getStudent(registration.studentId);
      const organizer = await storage.getOrganizer(event.organizerId);
      
      res.json({
        verified: true,
        tokenId,
        serial,
        owner: student?.hederaAccountId,
        eventName: event.name,
        issuer: organizer?.name,
        date: event.date,
        badgeImageCID: event.badgeImageCID,
        metadataCID: registration.metadataCID,
      });
    } catch (error: any) {
      res.status(500).json({ verified: false, error: error.message });
    }
  });

  return httpServer;
}
