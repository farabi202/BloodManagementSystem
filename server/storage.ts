import { users, emergencyRequests, donations, type User, type InsertUser, type EmergencyRequest, type InsertEmergencyRequest, type Donation, type InsertDonation } from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  searchDonors(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;
  
  // Emergency request methods
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  getEmergencyRequests(): Promise<EmergencyRequest[]>;
  getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined>;
  updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyRequest | undefined>;
  
  // Donation methods
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByDonor(donorId: number): Promise<Donation[]>;
  getAllDonations(): Promise<Donation[]>;
  
  // Auth methods
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyRequests: Map<number, EmergencyRequest>;
  private donations: Map<number, Donation>;
  private currentUserId: number;
  private currentEmergencyId: number;
  private currentDonationId: number;

  constructor() {
    this.users = new Map();
    this.emergencyRequests = new Map();
    this.donations = new Map();
    this.currentUserId = 1;
    this.currentEmergencyId = 1;
    this.currentDonationId = 1;
    
    // Initialize with sample admin user
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@bdms.com",
      phone: "+8801700000000",
      password: await bcrypt.hash("admin123", 10),
      fullName: "Admin User",
      dateOfBirth: "1990-01-01",
      bloodGroup: "O+",
      weight: 70,
      district: "Dhaka",
      upazila: "Dhanmondi",
      address: "Admin Office, Dhaka",
      lastDonation: null,
      isVerified: true,
      isAvailable: true,
      donationCount: 0,
      rating: 50,
      profilePicture: null,
      coverPhoto: null,
      bio: "System Administrator",
      education: "Masters in Computer Science",
      work: "System Administrator",
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample verified donor
    const sampleDonor: User = {
      id: this.currentUserId++,
      username: "sarah.ahmed",
      email: "sarah.ahmed@email.com",
      phone: "+8801711111111",
      password: await bcrypt.hash("password123", 10),
      fullName: "Dr. Sarah Ahmed",
      dateOfBirth: "1992-05-15",
      bloodGroup: "O+",
      weight: 55,
      district: "Dhaka",
      upazila: "Dhanmondi",
      address: "House 15, Road 7, Dhanmondi, Dhaka",
      lastDonation: "2024-01-15",
      isVerified: true,
      isAvailable: true,
      donationCount: 15,
      rating: 49,
      profilePicture: null,
      coverPhoto: null,
      bio: "Medical professional dedicated to saving lives through blood donation",
      education: "MBBS, Dhaka Medical College",
      work: "Doctor at Square Hospital",
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(sampleDonor.id, sampleDonor);

    // Add sample donations for the donor
    const sampleDonation: Donation = {
      id: this.currentDonationId++,
      donorId: sampleDonor.id,
      recipientName: "Patient Rahman",
      hospitalName: "Dhaka Medical College",
      donationDate: "2024-03-15",
      bloodGroup: "O+",
      unitsGiven: 1,
      status: "completed",
      notes: "Emergency donation for accident victim",
      rating: 5,
      testimonial: "Dr. Sarah was incredibly responsive during our emergency. Her quick action helped save my father's life. Forever grateful!",
      createdAt: new Date(),
    };
    this.donations.set(sampleDonation.id, sampleDonation);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.username === identifier || user.email === identifier || user.phone === identifier
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      isVerified: false,
      isAvailable: true,
      donationCount: 0,
      rating: 50,
      profilePicture: null,
      coverPhoto: null,
      bio: null,
      education: null,
      work: null,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async searchDonors(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let donors = Array.from(this.users.values()).filter(user => !user.isAdmin);
    
    if (filters.bloodGroup) {
      donors = donors.filter(donor => donor.bloodGroup === filters.bloodGroup);
    }
    
    if (filters.district) {
      donors = donors.filter(donor => donor.district === filters.district);
    }
    
    if (filters.isAvailable !== undefined) {
      donors = donors.filter(donor => donor.isAvailable === filters.isAvailable);
    }
    
    // Sort by rating and donation count
    donors.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.donationCount - a.donationCount;
    });
    
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    
    return donors.slice(offset, offset + limit);
  }

  async createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const id = this.currentEmergencyId++;
    const emergencyRequest: EmergencyRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.emergencyRequests.set(id, emergencyRequest);
    return emergencyRequest;
  }

  async getEmergencyRequests(): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined> {
    return this.emergencyRequests.get(id);
  }

  async updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyRequest | undefined> {
    const request = this.emergencyRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.emergencyRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    const newDonation: Donation = {
      ...donation,
      id,
      createdAt: new Date(),
    };
    this.donations.set(id, newDonation);
    
    // Update donor's donation count
    const donor = this.users.get(donation.donorId);
    if (donor) {
      const updatedDonor = { ...donor, donationCount: donor.donationCount + 1 };
      this.users.set(donor.id, updatedDonor);
    }
    
    return newDonation;
  }

  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const storage = new MemStorage();
