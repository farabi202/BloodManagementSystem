var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  donations: () => donations,
  donationsRelations: () => donationsRelations,
  emergencyRequests: () => emergencyRequests,
  emergencyRequestsRelations: () => emergencyRequestsRelations,
  insertDonationSchema: () => insertDonationSchema,
  insertEmergencyRequestSchema: () => insertEmergencyRequestSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  messages: () => messages,
  testimonials: () => testimonials,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  bloodGroup: text("blood_group").notNull(),
  weight: integer("weight").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  address: text("address").notNull(),
  lastDonation: text("last_donation"),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  donationCount: integer("donation_count").default(0),
  rating: integer("rating").default(5),
  // out of 5, stored as integer (50 = 5.0)
  profilePicture: text("profile_picture"),
  coverPhoto: text("cover_photo"),
  bio: text("bio"),
  education: text("education"),
  work: text("work"),
  currentCity: text("current_city"),
  hometown: text("hometown"),
  socialLinks: jsonb("social_links").default("{}"),
  bloodDonationHistory: jsonb("blood_donation_history").default("[]"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsRequired: integer("units_required").notNull(),
  hospitalName: text("hospital_name").notNull(),
  doctorName: text("doctor_name").notNull(),
  hospitalAddress: text("hospital_address").notNull(),
  requiredBy: text("required_by").notNull(),
  contactNumber: text("contact_number").notNull(),
  additionalInfo: text("additional_info"),
  isCritical: boolean("is_critical").default(false),
  status: text("status").default("pending"),
  // pending, approved, completed, cancelled
  requesterId: integer("requester_id").references(() => users.id),
  documents: jsonb("documents"),
  // array of document URLs
  createdAt: timestamp("created_at").defaultNow()
});
var donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").references(() => users.id).notNull(),
  recipientName: text("recipient_name").notNull(),
  hospitalName: text("hospital_name").notNull(),
  donationDate: text("donation_date").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsGiven: integer("units_given").notNull(),
  status: text("status").default("completed"),
  // completed, scheduled, cancelled
  notes: text("notes"),
  rating: integer("rating"),
  // recipient rating for donor
  testimonial: text("testimonial"),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  revieweeId: integer("reviewee_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  // 1-5 stars
  content: text("content").notNull(),
  mediaFiles: jsonb("media_files").default("[]"),
  // array of media URLs
  isReported: boolean("is_reported").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
  emergencyRequests: many(emergencyRequests)
}));
var donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id]
  })
}));
var emergencyRequestsRelations = relations(emergencyRequests, ({ one }) => ({
  requester: one(users, {
    fields: [emergencyRequests.requesterId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  donationCount: true,
  rating: true,
  isVerified: true,
  isAdmin: true,
  createdAt: true
}).extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms")
});
var loginSchema = z.object({
  identifier: z.string().min(1, "Username, email or phone is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});
var insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  requesterId: true,
  status: true,
  createdAt: true
});
var insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByPhone(phone) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || void 0;
  }
  async getUserByIdentifier(identifier) {
    const userList = await db.select().from(users);
    return userList.find(
      (user) => user.username === identifier || user.email === identifier || user.phone === identifier
    );
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
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
      isAdmin: false
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser || void 0;
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  async searchDonors(filters) {
    let query = db.select().from(users).where(eq(users.isAdmin, false));
    const allUsers = await query;
    let filteredUsers = allUsers;
    if (filters.bloodGroup) {
      filteredUsers = filteredUsers.filter((user) => user.bloodGroup === filters.bloodGroup);
    }
    if (filters.district) {
      filteredUsers = filteredUsers.filter((user) => user.district === filters.district);
    }
    if (filters.isAvailable !== void 0) {
      filteredUsers = filteredUsers.filter((user) => user.isAvailable === filters.isAvailable);
    }
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
  async getDonorCount(filters) {
    const allUsers = await db.select().from(users).where(eq(users.isAdmin, false));
    let filteredUsers = allUsers;
    if (filters.bloodGroup) {
      filteredUsers = filteredUsers.filter((user) => user.bloodGroup === filters.bloodGroup);
    }
    if (filters.district) {
      filteredUsers = filteredUsers.filter((user) => user.district === filters.district);
    }
    if (filters.isAvailable !== void 0) {
      filteredUsers = filteredUsers.filter((user) => user.isAvailable === filters.isAvailable);
    }
    return filteredUsers.length;
  }
  async createEmergencyRequest(request) {
    const [emergencyRequest] = await db.insert(emergencyRequests).values({
      ...request,
      requesterId: null,
      // Will need to be set when user auth is implemented
      status: "pending"
    }).returning();
    return emergencyRequest;
  }
  async getEmergencyRequests() {
    return db.select().from(emergencyRequests);
  }
  async getEmergencyRequestById(id) {
    const [request] = await db.select().from(emergencyRequests).where(eq(emergencyRequests.id, id));
    return request || void 0;
  }
  async updateEmergencyRequestStatus(id, status) {
    const [updatedRequest] = await db.update(emergencyRequests).set({ status }).where(eq(emergencyRequests.id, id)).returning();
    return updatedRequest || void 0;
  }
  async createDonation(donation) {
    const [newDonation] = await db.insert(donations).values({
      ...donation,
      status: donation.status || "completed",
      rating: donation.rating || null,
      notes: donation.notes || null,
      testimonial: donation.testimonial || null
    }).returning();
    const donor = await this.getUser(donation.donorId);
    if (donor) {
      await this.updateUser(donor.id, {
        donationCount: (donor.donationCount || 0) + 1
      });
    }
    return newDonation;
  }
  async getDonationsByDonor(donorId) {
    return db.select().from(donations).where(eq(donations.donorId, donorId));
  }
  async getAllDonations() {
    return db.select().from(donations);
  }
  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
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
      if (userData.password !== userData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const { confirmPassword, terms, ...userToCreate } = userData;
      const user = await storage.createUser(userToCreate);
      const donorId = `BDMS-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(user.id).padStart(4, "0")}`;
      const { password, ...userResponse } = user;
      res.status(201).json({
        user: userResponse,
        donorId,
        message: "Registration successful"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
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
      const { password: _, ...userResponse } = user;
      res.json({
        user: userResponse,
        message: "Login successful"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/donors/search", async (req, res) => {
    try {
      const { bloodGroup, district, isAvailable, page = 1, limit = 9 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const donors = await storage.searchDonors({
        bloodGroup,
        district,
        isAvailable: isAvailable === "true" ? true : void 0,
        limit: Number(limit),
        offset
      });
      const totalCount = await storage.getDonorCount({
        bloodGroup,
        district,
        isAvailable: isAvailable === "true" ? true : void 0
      });
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
  app2.get("/api/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/profile/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      if (updates.education && typeof updates.education === "string") {
        updates.education = updates.education;
      }
      if (updates.work && typeof updates.work === "string") {
        updates.work = updates.work;
      }
      if (updates.socialLinks && typeof updates.socialLinks === "object") {
        updates.socialLinks = updates.socialLinks;
      }
      if (updates.bloodDonationHistory && Array.isArray(updates.bloodDonationHistory)) {
        updates.bloodDonationHistory = updates.bloodDonationHistory;
      }
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userResponse } = updatedUser;
      res.json({ user: userResponse, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/emergency-requests", async (req, res) => {
    try {
      const requestData = insertEmergencyRequestSchema.parse(req.body);
      const emergencyRequest = await storage.createEmergencyRequest(requestData);
      res.status(201).json({
        request: emergencyRequest,
        message: "Emergency request submitted successfully"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Emergency request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/emergency-requests", async (req, res) => {
    try {
      const requests = await storage.getEmergencyRequests();
      res.json({ requests });
    } catch (error) {
      console.error("Get emergency requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/emergency-requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["pending", "approved", "completed", "cancelled"].includes(status)) {
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
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(Number(id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { password, id: _, isAdmin, ...allowedUpdates } = updates;
      const updatedUser = await storage.updateUser(Number(id), allowedUpdates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: __, ...userResponse } = updatedUser;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/donations", async (req, res) => {
    try {
      const { id } = req.params;
      const donations2 = await storage.getDonationsByDonor(Number(id));
      res.json({ donations: donations2 });
    } catch (error) {
      console.error("Get donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/donations", async (req, res) => {
    try {
      const donations2 = await storage.getAllDonations();
      res.json({ donations: donations2 });
    } catch (error) {
      console.error("Get all donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const donors = allUsers.filter((user) => !user.isAdmin);
      const activeDonors = donors.filter((donor) => donor.isAvailable);
      const emergencyRequests2 = await storage.getEmergencyRequests();
      const criticalRequests = emergencyRequests2.filter((req2) => req2.isCritical && req2.status === "pending");
      const stats = {
        totalDonors: donors.length,
        activeDonors: activeDonors.length,
        bloodRequests: emergencyRequests2.length,
        criticalAlerts: criticalRequests.length
      };
      res.json({ stats });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const donors = allUsers.filter((user) => !user.isAdmin);
      const donations2 = await storage.getAllDonations();
      const bloodGroupStats = donors.reduce((acc, donor) => {
        acc[donor.bloodGroup] = (acc[donor.bloodGroup] || 0) + 1;
        return acc;
      }, {});
      const monthlyDonations = [
        { month: "Jan", count: 850 },
        { month: "Feb", count: 920 },
        { month: "Mar", count: 780 },
        { month: "Apr", count: 1100 },
        { month: "May", count: 950 },
        { month: "Jun", count: 1250 }
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
