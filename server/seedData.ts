import { db } from "./db";
import { users, donations, testimonials } from "@shared/schema";
import bcrypt from "bcrypt";

// Authentic Bangladesh data
const bangladeshiNames = {
  male: [
    "Mohammad Rahman", "Abdul Karim", "Md. Jahangir Alam", "Rafiqul Islam", "Aminul Haque",
    "Shahidul Islam", "Abdur Rahman", "Mohammad Ali", "Mizanur Rahman", "Kamrul Hasan",
    "Shamsul Alam", "Nazmul Huda", "Monirul Islam", "Golam Mostafa", "Anisur Rahman",
    "Delwar Hossain", "Nazrul Islam", "Mahbubur Rahman", "Sirajul Islam", "Fazlul Karim",
    "Habibur Rahman", "Nurul Islam", "Khalilur Rahman", "Sabbir Ahmed", "Tanvir Hasan",
    "Rakibul Islam", "Shamim Ahmed", "Arif Hossain", "Masum Billah", "Rashidul Hasan",
    "Omar Faruque", "Jakir Hossain", "Minhazul Abedin", "Sayedul Islam", "Rezaul Karim",
    "Abdus Salam", "Moklesur Rahman", "Saiful Islam", "Hasanul Banna", "Mahmudul Hasan",
    "Ruhul Amin", "Farukh Ahmed", "Nasir Uddin", "Lokman Hossain", "Shahriar Kabir",
    "Foysal Ahmed", "Imran Hossain", "Sajib Rahman", "Nasim Ahmed", "Raisul Islam"
  ],
  female: [
    "Fatema Begum", "Rashida Khatun", "Salma Akter", "Nasreen Sultana", "Rahima Begum",
    "Roksana Begum", "Kulsum Begum", "Jahanara Begum", "Marium Akter", "Shahida Begum",
    "Rabeya Khatun", "Bilkis Begum", "Sultana Razia", "Nurjahan Begum", "Masuda Begum",
    "Rokeya Begum", "Amena Khatun", "Hosne Ara", "Nazma Begum", "Feroza Begum",
    "Shirina Akter", "Nazreen Ahmed", "Taslima Begum", "Maksuda Khatun", "Rashida Akter",
    "Nasir Banu", "Kamrun Nahar", "Dilruba Yasmin", "Shahnaz Parvin", "Mahmuda Akter",
    "Rehana Parvin", "Sabina Yasmin", "Farida Yasmin", "Rohima Khatun", "Nasreen Akter",
    "Rashida Parvin", "Khaleda Begum", "Monowara Begum", "Jamila Khatun", "Rahela Khatun",
    "Laila Arjuman", "Maksuda Begum", "Shahana Begum", "Rafia Sultana", "Nasreen Jahan",
    "Shamsun Nahar", "Kohinoor Begum", "Rashida Sultana", "Nazma Akter", "Ruma Akter"
  ]
};

const bangladeshDistricts = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh",
  "Comilla", "Narayanganj", "Gazipur", "Bogra", "Jessore", "Dinajpur", "Kushtia", "Pabna",
  "Tangail", "Jamalpur", "Kishoreganj", "Faridpur", "Manikganj", "Gopalganj", "Madaripur",
  "Shariatpur", "Rajbari", "Munshiganj", "Brahmanbaria", "Chandpur", "Lakshmipur", "Noakhali",
  "Feni", "Cox's Bazar", "Bandarban", "Rangamati", "Khagrachhari", "Patuakhali", "Pirojpur",
  "Jhalokati", "Barguna", "Bhola", "Habiganj", "Moulvibazar", "Sunamganj", "Narsingdi",
  "Netrakona", "Sherpur", "Mymensingh", "Jaipurhat", "Chapainawabganj", "Natore", "Sirajganj",
  "Naogaon", "Joypurhat", "Thakurgaon", "Panchagarh", "Nilphamari", "Lalmonirhat", "Kurigram",
  "Gaibandha", "Satkhira", "Meherpur", "Narail", "Chuadanga", "Jhenaidah", "Magura"
];

const upazillas: Record<string, string[]> = {
  "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohammadpur", "Old Dhaka", "Wari", "Ramna", "Tejgaon"],
  "Chittagong": ["Pahartali", "Double Mooring", "Kotwali", "Panchlaish", "Halishahar", "Chandgaon", "Karnaphuli", "Banshkhali", "Boalkhali", "Chandanaish"],
  "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Bagha", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba"],
  "Khulna": ["Khalishpur", "Sonadanga", "Doulatpur", "Khan Jahan Ali", "Kotwali", "Batiaghata", "Dacope", "Dighalia", "Dumuria", "Koyra"],
  "Sylhet": ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat"]
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const hospitalNames = [
  "Dhaka Medical College Hospital", "Bangabandhu Sheikh Mujib Medical University", "Square Hospital",
  "Apollo Hospital Dhaka", "United Hospital", "Evercare Hospital Dhaka", "IBN SINA Hospital",
  "Popular Medical Centre", "Labaid Hospital", "Holy Family Red Crescent Medical College Hospital",
  "Birdem General Hospital", "National Institute of Cardiovascular Diseases", "Chittagong Medical College Hospital",
  "Rajshahi Medical College Hospital", "Khulna Medical College Hospital", "Sylhet MAG Osmani Medical College Hospital",
  "Rangpur Medical College Hospital", "Mymensingh Medical College Hospital", "Barisal Sher-E-Bangla Medical College Hospital",
  "Comilla Medical College Hospital", "Faridpur Medical College Hospital", "Dinajpur Medical College Hospital"
];

const companies = [
  "Grameenphone", "Robi Axiata", "Banglalink", "BRAC Bank", "Dutch-Bangla Bank", "City Bank",
  "Beximco Group", "Square Group", "Bashundhara Group", "Pran-RFL Group", "ACI Limited",
  "Unilever Bangladesh", "British American Tobacco Bangladesh", "Nestle Bangladesh",
  "Marico Bangladesh", "Reckitt Benckiser Bangladesh", "GSK Bangladesh", "Sanofi Bangladesh",
  "Standard Chartered Bank", "HSBC Bangladesh", "Citibank N.A.", "Eastern Bank Limited",
  "Prime Bank Limited", "Mutual Trust Bank", "South East Bank", "National Bank Limited",
  "Jamuna Bank Limited", "First Security Islami Bank", "Social Islami Bank Limited",
  "Al-Arafah Islami Bank Limited", "Exim Bank Limited", "Mercantile Bank Limited"
];

const universities = [
  "University of Dhaka", "Bangladesh University of Engineering and Technology", "Chittagong University",
  "Rajshahi University", "Jahangirnagar University", "Khulna University", "Sylhet Agricultural University",
  "Bangladesh Agricultural University", "Shahjalal University of Science and Technology", "Islamic University",
  "Begum Rokeya University", "Comilla University", "Patuakhali Science and Technology University",
  "Bangabandhu Sheikh Mujibur Rahman Agricultural University", "Mawlana Bhashani Science and Technology University",
  "Hajee Mohammad Danesh Science and Technology University", "Noakhali Science and Technology University",
  "Jessore University of Science and Technology", "Daffodil International University", "North South University",
  "BRAC University", "Independent University Bangladesh", "East West University", "American International University-Bangladesh",
  "United International University", "University of Liberal Arts Bangladesh", "Ahsanullah University of Science and Technology"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateBangladeshiPhone(): string {
  const prefixes = ["013", "014", "015", "016", "017", "018", "019"];
  const prefix = getRandomElement(prefixes);
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `+880${prefix}${suffix}`;
}

function generateUsername(name: string, id: number): string {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const shortName = cleanName.substring(0, 8);
  return `${shortName}${id}`;
}

function generateEmail(name: string, id: number): string {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  return `${cleanName}${id}@${getRandomElement(domains)}`;
}

function generatePastDate(yearsBack: number): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * yearsBack * 365 * 24 * 60 * 60 * 1000));
  return pastDate.toISOString().split('T')[0];
}

function generateBio(name: string): string {
  const templates = [
    `Hi, I'm ${name.split(' ')[0]}. I believe in saving lives through blood donation. Together we can make a difference.`,
    `${name.split(' ')[0]} here! Proud blood donor helping my community. Every drop counts in saving precious lives.`,
    `Passionate about helping others through blood donation. ${name.split(' ')[0]} - making a positive impact one donation at a time.`,
    `Regular blood donor from Bangladesh. Committed to supporting emergency cases and helping fellow humans in need.`,
    `Blood donation enthusiast. ${name.split(' ')[0]} believes in the power of giving back to society through this noble cause.`
  ];
  return getRandomElement(templates);
}

function generateWorkHistory(): object[] {
  const work = [];
  const numJobs = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numJobs; i++) {
    const company = getRandomElement(companies);
    const positions = ["Software Engineer", "Manager", "Analyst", "Executive", "Coordinator", "Specialist", "Officer"];
    const cities = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet"];
    
    work.push({
      company,
      position: getRandomElement(positions),
      city: getRandomElement(cities),
      description: `Working as a dedicated professional at ${company}, contributing to organizational growth and development.`,
      fromDate: generatePastDate(5),
      toDate: i === 0 ? null : generatePastDate(2),
      currentlyWorking: i === 0
    });
  }
  
  return work;
}

function generateEducation(): object[] {
  const education = [];
  const hasUniversity = Math.random() > 0.3;
  
  if (hasUniversity) {
    const university = getRandomElement(universities);
    const courses = ["Computer Science", "Business Administration", "Engineering", "Medicine", "Economics", "Literature"];
    
    education.push({
      institution: university,
      course: getRandomElement(courses),
      description: `Graduated from ${university} with excellent academic performance.`,
      fromDate: generatePastDate(8),
      toDate: generatePastDate(4),
      graduated: true,
      type: "University"
    });
  }
  
  // Add high school
  education.push({
    institution: "Local High School",
    course: "Science/Commerce/Arts",
    description: "Completed secondary education with good results.",
    fromDate: generatePastDate(12),
    toDate: generatePastDate(8),
    graduated: true,
    type: "High School"
  });
  
  return education;
}

function generateDonationHistory(): object[] {
  const history = [];
  const donationCount = Math.floor(Math.random() * 15) + 1;
  
  for (let i = 0; i < donationCount; i++) {
    const hospital = getRandomElement(hospitalNames);
    const types = ["Blood", "Platelet", "Others"];
    
    history.push({
      hospitalName: hospital,
      hospitalLocation: `${getRandomElement(bangladeshDistricts)}, Bangladesh`,
      donationDate: generatePastDate(3),
      donationType: getRandomElement(types),
      notes: "Successful donation completed without any complications."
    });
  }
  
  return history;
}

function generateSocialLinks(): object {
  const hasLinks = Math.random() > 0.5;
  if (!hasLinks) return {};
  
  const links: any = {};
  const platforms = ["facebook", "twitter", "linkedin", "instagram"];
  const numLinks = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numLinks; i++) {
    const platform = platforms[i % platforms.length];
    links[platform] = `https://${platform}.com/user${Math.floor(Math.random() * 10000)}`;
  }
  
  return links;
}

export async function seedDemoData() {
  console.log("Starting demo data seeding...");
  
  const users_data = [];
  const donations_data = [];
  const testimonials_data = [];
  
  // Generate 1000 demo users
  for (let i = 1; i <= 1000; i++) {
    const isMale = Math.random() > 0.5;
    const fullName = getRandomElement(isMale ? bangladeshiNames.male : bangladeshiNames.female);
    const district = getRandomElement(bangladeshDistricts);
    const upazilla = getRandomElement(upazillas[district] || upazillas["Dhaka"]) as string;
    const bloodGroup = getRandomElement(bloodGroups);
    
    // Generate birth date (18-60 years old)
    const birthYear = new Date().getFullYear() - (18 + Math.floor(Math.random() * 42));
    const birthDate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    const lastDonationDays = Math.floor(Math.random() * 365);
    const lastDonation = lastDonationDays < 120 ? generatePastDate(1) : null;
    const isEligible = !lastDonation || lastDonationDays >= 120;
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const user = {
      username: generateUsername(fullName, i),
      email: generateEmail(fullName, i),
      phone: generateBangladeshiPhone(),
      password: hashedPassword,
      fullName,
      dateOfBirth: birthDate,
      bloodGroup,
      weight: 50 + Math.floor(Math.random() * 50), // 50-100 kg
      district,
      upazila: upazilla,
      address: `House ${Math.floor(Math.random() * 999) + 1}, Road ${Math.floor(Math.random() * 50) + 1}, ${upazilla}, ${district}`,
      lastDonation,
      isVerified: Math.random() > 0.7, // 30% verified
      isAvailable: isEligible && Math.random() > 0.2, // 80% available if eligible
      donationCount: Math.floor(Math.random() * 20),
      rating: Math.floor(Math.random() * 20) + 30, // 30-50 (3.0-5.0 stars)
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      coverPhoto: null as string | null,
      bio: generateBio(fullName),
      education: JSON.stringify(generateEducation()),
      work: JSON.stringify(generateWorkHistory()),
      currentCity: district,
      hometown: getRandomElement(bangladeshDistricts),
      socialLinks: generateSocialLinks(),
      bloodDonationHistory: generateDonationHistory(),
      isAdmin: false
    };
    
    users_data.push(user);
    
    // Generate donation records for each user
    const donationCount = user.donationCount;
    for (let j = 0; j < donationCount; j++) {
      const donation = {
        donorId: i, // Will be updated after user insertion
        recipientName: getRandomElement([...bangladeshiNames.male, ...bangladeshiNames.female]),
        hospitalName: getRandomElement(hospitalNames),
        donationDate: generatePastDate(2),
        bloodGroup: user.bloodGroup,
        unitsGiven: Math.floor(Math.random() * 2) + 1, // 1-2 units
        status: "completed",
        notes: "Donation completed successfully without any complications.",
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
        testimonial: Math.random() > 0.7 ? "Great donor, very cooperative and helpful during the donation process." : null
      };
      
      donations_data.push(donation);
    }
  }
  
  // Add admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
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
  
  console.log("Inserting users...");
  
  // Insert users in batches
  const batchSize = 100;
  const userIds = [];
  
  for (let i = 0; i < users_data.length; i += batchSize) {
    const batch = users_data.slice(i, i + batchSize);
    const insertedUsers = await db.insert(users).values(batch).returning({ id: users.id });
    userIds.push(...insertedUsers.map(u => u.id));
  }
  
  console.log("Inserting donations...");
  
  // Update donation records with actual user IDs and insert
  let donationIndex = 0;
  for (let i = 0; i < 1000; i++) { // Only for demo users, not admin
    const user = users_data[i];
    const donationCount = user.donationCount;
    
    for (let j = 0; j < donationCount; j++) {
      if (donationIndex < donations_data.length) {
        donations_data[donationIndex].donorId = userIds[i];
        donationIndex++;
      }
    }
  }
  
  // Insert donations in batches
  if (donations_data.length > 0) {
    for (let i = 0; i < donations_data.length; i += batchSize) {
      const batch = donations_data.slice(i, i + batchSize);
      await db.insert(donations).values(batch);
    }
  }
  
  console.log("Demo data seeding completed!");
  console.log(`Inserted ${users_data.length} users and ${donations_data.length} donations`);
}