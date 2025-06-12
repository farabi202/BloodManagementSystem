import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  MapPin, 
  Heart, 
  Star, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Camera,
  Shield,
  Plus,
  Award
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { formatDate, calculateDaysSinceLastDonation, isEligibleToDonate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  upazila: string;
  address: string;
  dateOfBirth: string;
  weight: number;
  lastDonation: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  donationCount: number;
  rating: number;
  profilePicture: string | null;
  coverPhoto: string | null;
  bio: string | null;
  education: string;
  work: string;
  currentCity: string;
  hometown: string;
  socialLinks: any;
  bloodDonationHistory: any[];
}

interface WorkEntry {
  company: string;
  position: string;
  city: string;
  description: string;
  fromDate: string;
  toDate: string | null;
  currentlyWorking: boolean;
}

interface EducationEntry {
  institution: string;
  course: string;
  description: string;
  fromDate: string;
  toDate: string;
  graduated: boolean;
  type: string;
}

interface DonationHistoryEntry {
  hospitalName: string;
  hospitalLocation: string;
  donationDate: string;
  donationType: string;
  notes?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [bioText, setBioText] = useState("");
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile", user?.id],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/profile/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setEditingSection(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading profile...</div>;
  }

  if (!user || !profileData) {
    return <div className="container mx-auto px-4 py-8">Profile not found</div>;
  }

  const profile: User = (profileData as any)?.user || user;
  const workHistory: WorkEntry[] = profile.work ? JSON.parse(profile.work) : [];
  const education: EducationEntry[] = profile.education ? JSON.parse(profile.education) : [];
  const donationHistory: DonationHistoryEntry[] = profile.bloodDonationHistory || [];

  const handleUpdateProfile = (section: string, data: any) => {
    updateProfileMutation.mutate({ [section]: data });
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getEligibilityStatus = () => {
    if (!profile.isAvailable) return { label: 'Unavailable', color: 'bg-gray-500' };
    
    const eligible = isEligibleToDonate(profile.lastDonation);
    if (eligible) return { label: 'Available to Donate', color: 'bg-green-500' };
    
    const daysRemaining = 120 - calculateDaysSinceLastDonation(profile.lastDonation);
    return { label: `Available in ${daysRemaining} days`, color: 'bg-orange-500' };
  };

  const eligibilityStatus = getEligibilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div className="relative h-80 bg-gradient-to-r from-red-500 to-red-600">
        {profile.coverPhoto && (
          <img 
            src={profile.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Profile Picture */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePicture || undefined} alt={profile.fullName} />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl">
                {getUserInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white text-gray-700 hover:bg-gray-100"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cover Photo Edit Button */}
        <Button
          size="sm"
          className="absolute bottom-4 right-4 bg-white text-gray-700 hover:bg-gray-100"
        >
          <Camera className="w-4 h-4 mr-2" />
          Edit Cover Photo
        </Button>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Profile Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      {profile.fullName}
                      {profile.isVerified && (
                        <Badge className="bg-red-100 text-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Donor ID: BDMS-{new Date().getFullYear()}-{String(profile.id).padStart(4, '0')}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${eligibilityStatus.color}`}>
                      {eligibilityStatus.label}
                    </span>
                  </div>

                  {/* Blood Group */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{profile.bloodGroup}</div>
                      <div className="text-sm text-gray-600">Blood Group</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{profile.donationCount}</div>
                      <div className="text-sm text-gray-600">Donations</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {(profile.rating / 10).toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Bio</CardTitle>
                <Dialog open={editingSection === 'bio'} onOpenChange={(open) => setEditingSection(open ? 'bio' : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setBioText(profile.bio || '')}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Bio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio (250 characters max)</Label>
                        <Textarea
                          id="bio"
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          maxLength={250}
                          rows={4}
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                          {bioText.length}/250
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleUpdateProfile('bio', bioText)}
                        disabled={updateProfileMutation.isPending}
                      >
                        Save Bio
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {profile.bio || "No bio added yet. Click edit to add your bio."}
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profile.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profile.district}, {profile.upazila}</span>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Social Links</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 ? (
                    Object.entries(profile.socialLinks).map(([platform, url]: [string, any]) => (
                      <div key={platform} className="flex items-center space-x-3">
                        {platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                        {platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                        {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-700" />}
                        {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                        {platform === 'github' && <Github className="w-4 h-4 text-gray-900" />}
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline capitalize"
                        >
                          {platform}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No social links added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Work History
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {workHistory.length > 0 ? (
                  <div className="space-y-4">
                    {workHistory.map((work, index) => (
                      <div key={index} className="border-l-2 border-red-200 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{work.position}</h3>
                            <p className="text-gray-700">{work.company}</p>
                            <p className="text-sm text-gray-500">{work.city}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(work.fromDate)} - {work.currentlyWorking ? 'Present' : formatDate(work.toDate || '')}
                            </p>
                          </div>
                          {work.currentlyWorking && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        {work.description && (
                          <p className="text-gray-600 text-sm mt-2">{work.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work history added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Education
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {education.length > 0 ? (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-red-200 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                            <p className="text-gray-700">{edu.course}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(edu.fromDate)} - {formatDate(edu.toDate)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{edu.type}</Badge>
                            {edu.graduated && <Badge variant="secondary">Graduated</Badge>}
                          </div>
                        </div>
                        {edu.description && (
                          <p className="text-gray-600 text-sm mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education history added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Blood Donation History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Blood Donation History
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {donationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {donationHistory.map((donation, index) => (
                      <div key={index} className="border-l-2 border-red-200 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{donation.hospitalName}</h3>
                            <p className="text-gray-700">{donation.hospitalLocation}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(donation.donationDate)}
                            </p>
                          </div>
                          <Badge variant="outline">{donation.donationType}</Badge>
                        </div>
                        {donation.notes && (
                          <p className="text-gray-600 text-sm mt-2">{donation.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No donation history recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Verification Section */}
            {!profile.isVerified && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-500" />
                    Profile Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Get your profile verified to build trust with the community and gain access to additional features.
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      Get Verified
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}