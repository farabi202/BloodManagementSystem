import { db } from "./db";
import { users, donations } from "@shared/schema";
import bcrypt from "bcrypt";

const expandedBangladeshiNames = {
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
    "Foysal Ahmed", "Imran Hossain", "Sajib Rahman", "Nasim Ahmed", "Raisul Islam",
    "Tariqul Islam", "Morshed Alam", "Kamal Uddin", "Shafiqul Islam", "Billal Hossain",
    "Ziaur Rahman", "Mostafa Kamal", "Azizul Haque", "Firoz Ahmed", "Mamunur Rashid",
    "Jahidul Islam", "Mahfuzur Rahman", "Shahjahan Ali", "Moniruzzaman", "Alamgir Hossain",
    "Badrul Alam", "Selim Reza", "Ashraf Ali", "Mozammel Hoque", "Nurul Amin",
    "Sohel Rana", "Masud Rahman", "Kamrul Islam", "Shahed Ali", "Rafiq Ahmed",
    "Mizanur Rahman", "Lutfar Rahman", "Shamsur Rahman", "Abdur Razzak", "Iqbal Hossain"
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
    "Shamsun Nahar", "Kohinoor Begum", "Rashida Sultana", "Nazma Akter", "Ruma Akter",
    "Salina Begum", "Fahmida Khatun", "Rubina Akter", "Shahanaz Begum", "Lovely Akter",
    "Beauty Begum", "Shiuly Akter", "Rashida Rahman", "Selina Parvin", "Morium Begum",
    "Jesmin Akter", "Shahida Parvin", "Rashida Ahmed", "Nasreen Begum", "Saleha Begum",
    "Halima Khatun", "Rashida Islam", "Monira Begum", "Fatema Khatun", "Rashida Ali"
  ]
};

const allBangladeshDistricts = [
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
  "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
  "Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  "Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati",
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
  "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj",
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
  "Jamalpur", "Mymensingh", "Netrakona", "Sherpur"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const companies = [
  "Grameenphone", "Robi Axiata", "Banglalink", "BRAC Bank", "Dutch-Bangla Bank", "City Bank",
  "Beximco Group", "Square Group", "Bashundhara Group", "Pran-RFL Group", "ACI Limited",
  "Unilever Bangladesh", "British American Tobacco Bangladesh", "Nestle Bangladesh",
  "Marico Bangladesh", "Reckitt Benckiser Bangladesh", "GSK Bangladesh", "Sanofi Bangladesh",
  "Standard Chartered Bank", "HSBC Bangladesh", "Citibank N.A.", "Eastern Bank Limited",
  "Prime Bank Limited", "Mutual Trust Bank", "South East Bank", "National Bank Limited",
  "Jamuna Bank Limited", "First Security Islami Bank", "Social Islami Bank Limited",
  "Al-Arafah Islami Bank Limited", "Exim Bank Limited", "Mercantile Bank Limited",
  "Walton Group", "Edison Group", "PHP Group", "Envoy Group", "Ha-Meem Group",
  "Square Pharmaceuticals", "Incepta Pharmaceuticals", "Beximco Pharmaceuticals"
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
  "United International University", "University of Liberal Arts Bangladesh", "Ahsanullah University of Science and Technology",
  "Bangladesh University", "Northern University Bangladesh", "Southeast University", "Southern University Bangladesh"
];

const hospitalNames = [
  "Dhaka Medical College Hospital", "Bangabandhu Sheikh Mujib Medical University", "Square Hospital",
  "Apollo Hospital Dhaka", "United Hospital", "Evercare Hospital Dhaka", "IBN SINA Hospital",
  "Popular Medical Centre", "Labaid Hospital", "Holy Family Red Crescent Medical College Hospital",
  "Birdem General Hospital", "National Institute of Cardiovascular Diseases", "Chittagong Medical College Hospital",
  "Rajshahi Medical College Hospital", "Khulna Medical College Hospital", "Sylhet MAG Osmani Medical College Hospital",
  "Rangpur Medical College Hospital", "Mymensingh Medical College Hospital", "Barisal Sher-E-Bangla Medical College Hospital",
  "Comilla Medical College Hospital", "Faridpur Medical College Hospital", "Dinajpur Medical College Hospital",
  "Ad-din Women's Medical College Hospital", "Anwer Khan Modern Medical College Hospital", "Delta Medical College Hospital"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePastDate(daysBack: number): string {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
  return pastDate.toISOString().split('T')[0];
}

function generateWorkHistory(district: string): object[] {
  const work = [];
  const numJobs = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numJobs; i++) {
    const company = getRandomElement(companies);
    const positions = ["Software Engineer", "Manager", "Analyst", "Executive", "Coordinator", "Specialist", "Officer", "Assistant", "Developer", "Consultant"];
    
    work.push({
      company,
      position: getRandomElement(positions),
      city: district,
      description: `Working as a dedicated professional at ${company}, contributing to organizational growth and development.`,
      fromDate: generatePastDate(365 * (i + 2)),
      toDate: i === 0 ? null : generatePastDate(365),
      currentlyWorking: i === 0
    });
  }
  
  return work;
}

function generateEducation(): object[] {
  const education = [];
  const hasUniversity = Math.random() > 0.4;
  
  if (hasUniversity) {
    const university = getRandomElement(universities);
    const courses = ["Computer Science", "Business Administration", "Engineering", "Medicine", "Economics", "Literature", "Physics", "Chemistry", "Mathematics", "English"];
    
    education.push({
      institution: university,
      course: getRandomElement(courses),
      description: `Graduated from ${university} with excellent academic performance and gained valuable knowledge.`,
      fromDate: generatePastDate(365 * 8),
      toDate: generatePastDate(365 * 4),
      graduated: true,
      type: "University"
    });
  }
  
  // Add college/high school
  const schoolTypes = ["College", "High School"];
  const schoolType = getRandomElement(schoolTypes);
  education.push({
    institution: `Local ${schoolType}`,
    course: schoolType === "College" ? "Higher Secondary Certificate" : "Secondary School Certificate",
    description: `Completed ${schoolType.toLowerCase()} education with good results and proper foundation.`,
    fromDate: generatePastDate(365 * 12),
    toDate: generatePastDate(365 * 8),
    graduated: true,
    type: schoolType
  });
  
  return education;
}

function generateDonationHistory(): object[] {
  const history = [];
  const donationCount = Math.floor(Math.random() * 12) + 1;
  
  for (let i = 0; i < donationCount; i++) {
    const hospital = getRandomElement(hospitalNames);
    const types = ["Blood", "Platelet", "Others"];
    
    history.push({
      hospitalName: hospital,
      hospitalLocation: `${getRandomElement(allBangladeshDistricts)}, Bangladesh`,
      donationDate: generatePastDate(365 * 3),
      donationType: getRandomElement(types),
      notes: "Successful donation completed without any complications. Patient recovered well."
    });
  }
  
  return history;
}

export async function completeSeed() {
  console.log("Adding remaining 800 demo users to complete 1000 total...");
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users_data = [];
  const donations_data = [];
  
  // Get current user count
  const existingUsers = await db.select().from(users);
  const startId = existingUsers.length + 1;
  
  // Generate 800 more users (to reach 1000 total)
  for (let i = startId; i <= 1000; i++) {
    const isMale = Math.random() > 0.5;
    const fullName = getRandomElement(isMale ? expandedBangladeshiNames.male : expandedBangladeshiNames.female);
    const district = getRandomElement(allBangladeshDistricts);
    const bloodGroup = getRandomElement(bloodGroups);
    
    const birthYear = new Date().getFullYear() - (18 + Math.floor(Math.random() * 42));
    const birthDate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    const lastDonationDays = Math.floor(Math.random() * 365);
    const lastDonation = lastDonationDays < 120 ? generatePastDate(120) : null;
    const isEligible = !lastDonation || lastDonationDays >= 120;
    
    const donationCount = Math.floor(Math.random() * 20);
    
    const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 8);
    
    users_data.push({
      username: `${cleanName}${i}`,
      email: `${cleanName}${i}@${getRandomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])}`,
      phone: `+88017${String(Math.floor(10000000 + Math.random() * 90000000))}`,
      password: hashedPassword,
      fullName,
      dateOfBirth: birthDate,
      bloodGroup,
      weight: 50 + Math.floor(Math.random() * 50),
      district,
      upazila: `${district} Sadar`,
      address: `House ${Math.floor(Math.random() * 999) + 1}, Road ${Math.floor(Math.random() * 50) + 1}, ${district}`,
      lastDonation,
      isVerified: Math.random() > 0.75,
      isAvailable: isEligible && Math.random() > 0.15,
      donationCount,
      rating: Math.floor(Math.random() * 20) + 30,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      coverPhoto: null,
      bio: `Hello! I'm ${fullName.split(' ')[0]}, a dedicated blood donor from ${district}. I believe in the power of blood donation to save lives and support our community in times of need.`,
      education: JSON.stringify(generateEducation()),
      work: JSON.stringify(generateWorkHistory(district)),
      currentCity: district,
      hometown: getRandomElement(allBangladeshDistricts),
      socialLinks: { 
        facebook: Math.random() > 0.6 ? `https://facebook.com/user${i}` : undefined,
        linkedin: Math.random() > 0.8 ? `https://linkedin.com/in/user${i}` : undefined 
      },
      bloodDonationHistory: generateDonationHistory(),
      isAdmin: false
    });
    
    // Generate donation records
    for (let j = 0; j < Math.min(donationCount, 4); j++) {
      donations_data.push({
        donorId: 0, // Will be updated after insertion
        recipientName: getRandomElement([...expandedBangladeshiNames.male, ...expandedBangladeshiNames.female]),
        hospitalName: getRandomElement(hospitalNames),
        donationDate: generatePastDate(365 * 2),
        bloodGroup: bloodGroup,
        unitsGiven: Math.floor(Math.random() * 2) + 1,
        status: "completed",
        notes: "Donation completed successfully without any complications.",
        rating: Math.floor(Math.random() * 2) + 4,
        testimonial: Math.random() > 0.7 ? "Excellent donor! Very cooperative and helpful throughout the process." : null
      });
    }
  }
  
  console.log(`Inserting ${users_data.length} new users...`);
  
  // Insert users in batches
  const batchSize = 50;
  const newUserIds = [];
  
  for (let i = 0; i < users_data.length; i += batchSize) {
    const batch = users_data.slice(i, i + batchSize);
    const insertedUsers = await db.insert(users).values(batch).returning({ id: users.id });
    newUserIds.push(...insertedUsers.map(u => u.id));
  }
  
  console.log(`Inserting ${donations_data.length} donation records...`);
  
  // Update donation records with actual user IDs
  let donationIndex = 0;
  for (let i = 0; i < users_data.length; i++) {
    const user = users_data[i];
    const userDonationCount = Math.min(user.donationCount, 4);
    
    for (let j = 0; j < userDonationCount; j++) {
      if (donationIndex < donations_data.length) {
        donations_data[donationIndex].donorId = newUserIds[i];
        donationIndex++;
      }
    }
  }
  
  // Insert donations in batches
  if (donations_data.length > 0) {
    for (let i = 0; i < donations_data.length; i += batchSize) {
      const batch = donations_data.slice(i, i + batchSize).filter(d => d.donorId > 0);
      if (batch.length > 0) {
        await db.insert(donations).values(batch);
      }
    }
  }
  
  const finalUserCount = await db.select().from(users);
  console.log(`✅ Complete seed finished! Total users in database: ${finalUserCount.length}`);
  console.log(`Added ${users_data.length} new users and ${donations_data.filter(d => d.donorId > 0).length} donations`);
}