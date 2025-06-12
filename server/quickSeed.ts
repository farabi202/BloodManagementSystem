import { db } from "./db";
import { users, donations } from "@shared/schema";
import bcrypt from "bcrypt";

const bangladeshiNames = {
  male: [
    "Mohammad Rahman", "Abdul Karim", "Md. Jahangir Alam", "Rafiqul Islam", "Aminul Haque",
    "Shahidul Islam", "Abdur Rahman", "Mohammad Ali", "Mizanur Rahman", "Kamrul Hasan",
    "Shamsul Alam", "Nazmul Huda", "Monirul Islam", "Golam Mostafa", "Anisur Rahman",
    "Delwar Hossain", "Nazrul Islam", "Mahbubur Rahman", "Sirajul Islam", "Fazlul Karim"
  ],
  female: [
    "Fatema Begum", "Rashida Khatun", "Salma Akter", "Nasreen Sultana", "Rahima Begum",
    "Roksana Begum", "Kulsum Begum", "Jahanara Begum", "Marium Akter", "Shahida Begum",
    "Rabeya Khatun", "Bilkis Begum", "Sultana Razia", "Nurjahan Begum", "Masuda Begum",
    "Rokeya Begum", "Amena Khatun", "Hosne Ara", "Nazma Begum", "Feroza Begum"
  ]
};

const districts = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Barisal", "Rangpur", "Mymensingh"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePastDate(daysBack: number): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
  return pastDate.toISOString().split('T')[0];
}

export async function quickSeed() {
  console.log("Quick seeding 200 demo users...");
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const users_data = [];
  
  // Add admin first
  users_data.push({
    username: "admin",
    email: "admin@bdms.com",
    phone: "+8801700000000",
    password: adminPassword,
    fullName: "System Administrator",
    dateOfBirth: "1990-01-01",
    bloodGroup: "O+",
    weight: 70,
    district: "Dhaka",
    upazila: "Dhanmondi",
    address: "BDMS Headquarters, Dhanmondi, Dhaka",
    lastDonation: null,
    isVerified: true,
    isAvailable: false,
    donationCount: 0,
    rating: 50,
    profilePicture: null,
    coverPhoto: null,
    bio: "System Administrator for Blood Donation Management System",
    education: "[]",
    work: "[]",
    currentCity: "Dhaka",
    hometown: "Dhaka",
    socialLinks: {},
    bloodDonationHistory: [],
    isAdmin: true
  });
  
  // Generate 200 demo users
  for (let i = 1; i <= 200; i++) {
    const isMale = Math.random() > 0.5;
    const fullName = getRandomElement(isMale ? bangladeshiNames.male : bangladeshiNames.female);
    const district = getRandomElement(districts);
    const bloodGroup = getRandomElement(bloodGroups);
    
    const birthYear = new Date().getFullYear() - (18 + Math.floor(Math.random() * 42));
    const birthDate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    const lastDonationDays = Math.floor(Math.random() * 365);
    const lastDonation = lastDonationDays < 120 ? generatePastDate(120) : null;
    const isEligible = !lastDonation || lastDonationDays >= 120;
    
    const donationCount = Math.floor(Math.random() * 15);
    
    users_data.push({
      username: `${fullName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 8)}${i}`,
      email: `${fullName.toLowerCase().replace(/[^a-z]/g, '')}${i}@gmail.com`,
      phone: `+88017${String(Math.floor(10000000 + Math.random() * 90000000))}`,
      password: hashedPassword,
      fullName,
      dateOfBirth: birthDate,
      bloodGroup,
      weight: 50 + Math.floor(Math.random() * 50),
      district,
      upazila: `${district} Sadar`,
      address: `House ${Math.floor(Math.random() * 999) + 1}, ${district}`,
      lastDonation,
      isVerified: Math.random() > 0.7,
      isAvailable: isEligible && Math.random() > 0.2,
      donationCount,
      rating: Math.floor(Math.random() * 20) + 30,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      coverPhoto: null,
      bio: `Hi, I'm ${fullName.split(' ')[0]}. Passionate blood donor from ${district}. Committed to saving lives through donation.`,
      education: JSON.stringify([{
        institution: `${district} University`,
        course: "Computer Science",
        description: "Graduated with good results",
        fromDate: "2015-01-01",
        toDate: "2019-12-31",
        graduated: true,
        type: "University"
      }]),
      work: JSON.stringify([{
        company: "Tech Bangladesh Ltd",
        position: "Software Engineer",
        city: district,
        description: "Working as a software developer",
        fromDate: "2020-01-01",
        toDate: null,
        currentlyWorking: true
      }]),
      currentCity: district,
      hometown: district,
      socialLinks: { facebook: `https://facebook.com/user${i}` },
      bloodDonationHistory: [],
      isAdmin: false
    });
  }
  
  console.log("Inserting users...");
  const insertedUsers = await db.insert(users).values(users_data).returning({ id: users.id });
  
  console.log("Creating sample donations...");
  const donations_data = [];
  
  for (let i = 0; i < insertedUsers.length - 1; i++) { // Skip admin
    const user = users_data[i + 1];
    const donationCount = user.donationCount;
    
    for (let j = 0; j < Math.min(donationCount, 3); j++) {
      donations_data.push({
        donorId: insertedUsers[i + 1].id,
        recipientName: getRandomElement([...bangladeshiNames.male, ...bangladeshiNames.female]),
        hospitalName: `${user.district} Medical College Hospital`,
        donationDate: generatePastDate(365),
        bloodGroup: user.bloodGroup,
        unitsGiven: Math.floor(Math.random() * 2) + 1,
        status: "completed",
        notes: "Donation completed successfully",
        rating: Math.floor(Math.random() * 2) + 4,
        testimonial: "Great donor, very cooperative"
      });
    }
  }
  
  if (donations_data.length > 0) {
    await db.insert(donations).values(donations_data);
  }
  
  console.log(`✅ Quick seed completed! Created ${users_data.length} users and ${donations_data.length} donations`);
}