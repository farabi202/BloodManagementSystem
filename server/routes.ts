import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertEmergencyRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingUserByPhone = await storage.getUserByPhone(userData.phone);
      if (existingUserByPhone) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Validate password confirmation
      if (userData.password !== userData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      // Remove confirmPassword and terms before creating user
      const { confirmPassword, terms, ...userToCreate } = userData;
      
      const user = await storage.createUser(userToCreate);
      
      // Generate donor ID
      const donorId = `BDMS-${new Date().getFullYear()}-${String(user.id).padStart(4, '0')}`;
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      res.status(201).json({ 
        user: userResponse, 
        donorId,
        message: "Registration successful" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password, rememberMe } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        user: userResponse,
        message: "Login successful" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donor search routes
  app.get("/api/donors/search", async (req, res) => {
    try {
      const { bloodGroup, district, isAvailable, page = 1, limit = 9 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const donors = await storage.searchDonors({
        bloodGroup: bloodGroup as string,
        district: district as string,
        isAvailable: isAvailable === 'true' ? true : undefined,
        limit: Number(limit),
        offset: offset,
      });
      
      // Get total count with the same filters
      const totalCount = await storage.getDonorCount({
        bloodGroup: bloodGroup as string,
        district: district as string,
        isAvailable: isAvailable === 'true' ? true : undefined,
      });
      
      // Remove passwords from response
      const donorsResponse = donors.map(({ password, ...donor }) => donor);
      
      res.json({ 
        donors: donorsResponse, 
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      });
    } catch (error) {
      console.error("Donor search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile routes
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Convert JSON strings back to JSON for storage
      if (updates.education && typeof updates.education === 'string') {
        updates.education = updates.education;
      }
      if (updates.work && typeof updates.work === 'string') {
        updates.work = updates.work;
      }
      if (updates.socialLinks && typeof updates.socialLinks === 'object') {
        updates.socialLinks = updates.socialLinks;
      }
      if (updates.bloodDonationHistory && Array.isArray(updates.bloodDonationHistory)) {
        updates.bloodDonationHistory = updates.bloodDonationHistory;
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = updatedUser;
      
      res.json({ user: userResponse, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Emergency request routes
  app.post("/api/emergency-requests", async (req, res) => {
    try {
      const requestData = insertEmergencyRequestSchema.parse(req.body);
      
      const emergencyRequest = await storage.createEmergencyRequest(requestData);
      
      res.status(201).json({ 
        request: emergencyRequest,
        message: "Emergency request submitted successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Emergency request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/emergency-requests", async (req, res) => {
    try {
      const requests = await storage.getEmergencyRequests();
      res.json({ requests });
    } catch (error) {
      console.error("Get emergency requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/emergency-requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateEmergencyRequestStatus(Number(id), status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      res.json({ request: updatedRequest });
    } catch (error) {
      console.error("Update emergency request status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(Number(id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { password, id: _, isAdmin, ...allowedUpdates } = updates;
      
      const updatedUser = await storage.updateUser(Number(id), allowedUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: __, ...userResponse } = updatedUser;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donation routes
  app.get("/api/users/:id/donations", async (req, res) => {
    try {
      const { id } = req.params;
      const donations = await storage.getDonationsByDonor(Number(id));
      res.json({ donations });
    } catch (error) {
      console.error("Get donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/donations", async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json({ donations });
    } catch (error) {
      console.error("Get all donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin stats routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const donors = allUsers.filter(user => !user.isAdmin);
      const activeDonors = donors.filter(donor => donor.isAvailable);
      const emergencyRequests = await storage.getEmergencyRequests();
      const criticalRequests = emergencyRequests.filter(req => req.isCritical && req.status === 'pending');
      
      const stats = {
        totalDonors: donors.length,
        activeDonors: activeDonors.length,
        bloodRequests: emergencyRequests.length,
        criticalAlerts: criticalRequests.length,
      };
      
      res.json({ stats });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const donors = allUsers.filter(user => !user.isAdmin);
      const donations = await storage.getAllDonations();
      
      // Blood group distribution
      const bloodGroupStats = donors.reduce((acc, donor) => {
        acc[donor.bloodGroup] = (acc[donor.bloodGroup] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Monthly donations (mock data for demo)
      const monthlyDonations = [
        { month: 'Jan', count: 850 },
        { month: 'Feb', count: 920 },
        { month: 'Mar', count: 780 },
        { month: 'Apr', count: 1100 },
        { month: 'May', count: 950 },
        { month: 'Jun', count: 1250 },
      ];
      
      res.json({ 
        bloodGroupStats,
        monthlyDonations 
      });
    } catch (error) {
      console.error("Get admin analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
