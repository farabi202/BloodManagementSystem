import { users, emergencyRequests, donations, type User, type InsertUser, type EmergencyRequest, type InsertEmergencyRequest, type Donation, type InsertDonation } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
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
  
  getDonorCount(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
  }): Promise<number>;
  
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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const userList = await db.select().from(users);
    return userList.find(user => 
      user.username === identifier || user.email === identifier || user.phone === identifier
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        lastDonation: insertUser.lastDonation || null,
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
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async searchDonors(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.isAdmin, false));
    
    // Apply filters - would need to build dynamic where clauses for a real implementation
    const allUsers = await query;
    let filteredUsers = allUsers;
    
    if (filters.bloodGroup) {
      filteredUsers = filteredUsers.filter(user => user.bloodGroup === filters.bloodGroup);
    }
    
    if (filters.district) {
      filteredUsers = filteredUsers.filter(user => user.district === filters.district);
    }
    
    if (filters.isAvailable !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isAvailable === filters.isAvailable);
    }
    
    // Sort by rating and donation count
    filteredUsers.sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      const aDonations = a.donationCount || 0;
      const bDonations = b.donationCount || 0;
      
      if (bRating !== aRating) return bRating - aRating;
      return bDonations - aDonations;
    });
    
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    
    return filteredUsers.slice(offset, offset + limit);
  }

  async getDonorCount(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
  }): Promise<number> {
    const allUsers = await db.select().from(users).where(eq(users.isAdmin, false));
    let filteredUsers = allUsers;
    
    if (filters.bloodGroup) {
      filteredUsers = filteredUsers.filter(user => user.bloodGroup === filters.bloodGroup);
    }
    
    if (filters.district) {
      filteredUsers = filteredUsers.filter(user => user.district === filters.district);
    }
    
    if (filters.isAvailable !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isAvailable === filters.isAvailable);
    }
    
    return filteredUsers.length;
  }

  async createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const [emergencyRequest] = await db
      .insert(emergencyRequests)
      .values({
        ...request,
        requesterId: null, // Will need to be set when user auth is implemented
        status: "pending",
      })
      .returning();
    return emergencyRequest;
  }

  async getEmergencyRequests(): Promise<EmergencyRequest[]> {
    return db.select().from(emergencyRequests);
  }

  async getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined> {
    const [request] = await db.select().from(emergencyRequests).where(eq(emergencyRequests.id, id));
    return request || undefined;
  }

  async updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyRequest | undefined> {
    const [updatedRequest] = await db
      .update(emergencyRequests)
      .set({ status })
      .where(eq(emergencyRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db
      .insert(donations)
      .values({
        ...donation,
        status: donation.status || "completed",
        rating: donation.rating || null,
        notes: donation.notes || null,
        testimonial: donation.testimonial || null,
      })
      .returning();
    
    // Update donor's donation count
    const donor = await this.getUser(donation.donorId);
    if (donor) {
      await this.updateUser(donor.id, { 
        donationCount: (donor.donationCount || 0) + 1 
      });
    }
    
    return newDonation;
  }

  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    return db.select().from(donations).where(eq(donations.donorId, donorId));
  }

  async getAllDonations(): Promise<Donation[]> {
    return db.select().from(donations);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const storage = new DatabaseStorage();
