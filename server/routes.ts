import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenFreezeTransaction,
  Hbar
} from "@hashgraph/sdk";

// Initialize Hedera Client
let hederaClient: Client | null = null;

try {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (operatorId && operatorKey) {
    hederaClient = Client.forTestnet();
    hederaClient.setOperator(operatorId, operatorKey);
    console.log("Hedera Client Initialized with Operator:", operatorId);
  } else {
    console.warn("HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY missing. Hedera operations will fail or be mocked.");
  }
} catch (error) {
  console.error("Failed to initialize Hedera Client:", error);
}
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

// Simulated IPFS upload (writes to local disk)
async function uploadToIPFS(data: Buffer | object): Promise<string> {
  const mockCID = `bafybei${randomUUID().replace(/-/g, '').substring(0, 46)}`;
  const filePath = path.join(UPLOADS_DIR, mockCID);

  if (Buffer.isBuffer(data)) {
    await fs.promises.writeFile(filePath, data);
  } else {
    await fs.promises.writeFile(filePath, JSON.stringify(data));
  }

  return mockCID;
}

// Helper to create a new NFT Collection (Token)
async function createHederaToken(name: string, symbol: string): Promise<string> {
  if (!hederaClient) throw new Error("Hedera Client not initialized");

  const transaction = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setInitialSupply(0)
    .setMaxSupply(1000) // Default max supply
    .setTreasuryAccountId(hederaClient.operatorAccountId!)
    .setAdminKey(hederaClient.operatorPublicKey!)
    .setSupplyKey(hederaClient.operatorPublicKey!)
    .freezeWith(hederaClient);

  const signTx = await transaction.sign(PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!));
  const txResponse = await signTx.execute(hederaClient);
  const receipt = await txResponse.getReceipt(hederaClient);

  return receipt.tokenId!.toString();
}

// Real NFT minting and transfer
async function mintNFT(tokenId: string, metadataCID: string, receiverId: string): Promise<{ serial: string }> {
  if (!hederaClient) {
    // Fallback for development if keys missing 
    console.warn("Hedera Client missing, returning mock serial");
    const serial = String(Math.floor(Math.random() * 1000000));
    return { serial };
  }

  // 1. Mint the NFT
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([Buffer.from(`https://gateway.pinata.cloud/ipfs/${metadataCID}`)])
    .freezeWith(hederaClient);

  const signMintTx = await mintTx.sign(PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!));
  const mintResponse = await signMintTx.execute(hederaClient);
  const mintReceipt = await mintResponse.getReceipt(hederaClient);
  const serial = mintReceipt.serials[0].toString();

  // 2. Transfer to Student
  // Note: Student must associate token first if not using auto-association. 
  // For this PoC, we assume auto-association or explicit association handled elsewhere, 
  // OR we just try to transfer. If it fails, strictly we should handle association.
  // Assuming testnet accounts often have unlimited auto-associations or we just try.

  try {
    const transferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, Number(serial), hederaClient.operatorAccountId!, AccountId.fromString(receiverId))
      .freezeWith(hederaClient);

    const signTransferTx = await transferTx.sign(PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY!));
    const transferResponse = await signTransferTx.execute(hederaClient);
    await transferResponse.getReceipt(hederaClient);
    console.log(`NFT ${tokenId} serial ${serial} transferred to ${receiverId}`);



  } catch (err: any) {
    console.error("Transfer failed (receiver might need to associate token):", err);
    // Throw error so the main route handles it and doesn't mark as claimed
    throw new Error(`Transfer failed: ${err.message || "Ensure Token is Associated"}`);
  }

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

      let tokenId: string;

      try {
        if (hederaClient) {
          // Create real NFT collection on Hedera
          tokenId = await createHederaToken(name, "PROOF"); // Using generic symbol
          console.log(`Created Hedera Token: ${tokenId}`);
        } else {
          // Mock if no client
          tokenId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;
        }
      } catch (err) {
        console.error("Failed to create token:", err);
        // Fallback to mock on error to allow app usage
        tokenId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;
      }

      const event = await storage.createEvent({
        name,
        description,
        date: date,
        venueName,
        venueLat: parseFloat(venueLat),
        venueLong: parseFloat(venueLong),
        radius: parseInt(radius),
        badgeImageCID,
        attendanceStatus: "OPEN", // Auto-open for testing
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
      const { serial } = await mintNFT(event.tokenId || "", metadataCID, student.hederaAccountId);

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

  // Serve uploaded files (simulating IPFS gateway)
  app.get("/api/uploads/:cid", (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.cid);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  return httpServer;
}
