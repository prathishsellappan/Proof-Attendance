import { 
  type Organizer, type InsertOrganizer,
  type Student, type InsertStudent,
  type Event, type InsertEvent,
  type Registration, type InsertRegistration,
  type User, type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Organizers
  getOrganizer(id: string): Promise<Organizer | undefined>;
  getOrganizerByEmail(email: string): Promise<Organizer | undefined>;
  createOrganizer(organizer: InsertOrganizer): Promise<Organizer>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined>;

  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Registrations
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByEventAndStudent(eventId: string, studentId: string): Promise<Registration | undefined>;
  getRegistrationsByEvent(eventId: string): Promise<Registration[]>;
  getRegistrationsByStudent(studentId: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | undefined>;

  // Stats
  getOrganizerStats(organizerId: string): Promise<{
    totalEvents: number;
    totalRegistrations: number;
    totalClaimed: number;
    activeEvents: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private organizers: Map<string, Organizer>;
  private students: Map<string, Student>;
  private events: Map<string, Event>;
  private registrations: Map<string, Registration>;

  constructor() {
    this.users = new Map();
    this.organizers = new Map();
    this.students = new Map();
    this.events = new Map();
    this.registrations = new Map();
  }

  // Users (legacy)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Organizers
  async getOrganizer(id: string): Promise<Organizer | undefined> {
    return this.organizers.get(id);
  }

  async getOrganizerByEmail(email: string): Promise<Organizer | undefined> {
    return Array.from(this.organizers.values()).find(
      (org) => org.email === email,
    );
  }

  async createOrganizer(insertOrganizer: InsertOrganizer): Promise<Organizer> {
    const id = randomUUID();
    const organizer: Organizer = { ...insertOrganizer, id };
    this.organizers.set(id, organizer);
    return organizer;
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    const updated = { ...student, ...updates };
    this.students.set(id, updated);
    return updated;
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.organizerId === organizerId,
    );
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      attendanceStatus: insertEvent.attendanceStatus || "CLOSED",
      attendanceStartedAt: null,
      badgeImageCID: insertEvent.badgeImageCID || null,
      description: insertEvent.description || null,
      venueName: insertEvent.venueName || null,
      tokenId: insertEvent.tokenId || null,
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updated = { ...event, ...updates };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Registrations
  async getRegistration(id: string): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }

  async getRegistrationByEventAndStudent(eventId: string, studentId: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (reg) => reg.eventId === eventId && reg.studentId === studentId,
    );
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.eventId === eventId,
    );
  }

  async getRegistrationsByStudent(studentId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.studentId === studentId,
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const registration: Registration = { 
      ...insertRegistration, 
      id,
      registeredAt: new Date(),
      claimed: false,
      claimedAt: null,
      nftSerial: null,
      metadataCID: null,
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | undefined> {
    const registration = this.registrations.get(id);
    if (!registration) return undefined;
    const updated = { ...registration, ...updates };
    this.registrations.set(id, updated);
    return updated;
  }

  // Stats
  async getOrganizerStats(organizerId: string): Promise<{
    totalEvents: number;
    totalRegistrations: number;
    totalClaimed: number;
    activeEvents: number;
  }> {
    const events = await this.getEventsByOrganizer(organizerId);
    const eventIds = events.map(e => e.id);
    
    let totalRegistrations = 0;
    let totalClaimed = 0;
    
    for (const eventId of eventIds) {
      const regs = await this.getRegistrationsByEvent(eventId);
      totalRegistrations += regs.length;
      totalClaimed += regs.filter(r => r.claimed).length;
    }
    
    const activeEvents = events.filter(e => e.attendanceStatus === "OPEN").length;
    
    return {
      totalEvents: events.length,
      totalRegistrations,
      totalClaimed,
      activeEvents,
    };
  }
}

export const storage = new MemStorage();
