import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DonationTrendChart } from '@/components/Charts';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Users, 
  Calendar, 
  Edit, 
  Settings, 
  Camera, 
  Star,
  UserPen,
  Bell,
  Shield,
  Download,
  Plus,
  MapPin,
  Building,
  GraduationCap,
  Award,
  ExternalLink
} from 'lucide-react';
import { formatRating, isEligibleToDonate, calculateDaysSinceLastDonation } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  interface WorkEntry {
    company: string;
    position: string;
    city: string;
    description: string;
    fromDate: string;
    toDate: string;
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

  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    currentCity: user?.currentCity || '',
    hometown: user?.hometown || '',
    work: [] as WorkEntry[],
    education: [] as EducationEntry[],
    socialLinks: {} as Record<string, string>
  });

  const { data: donations = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/donations`],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'profile' | 'cover' }) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('type', type);
      
      const response = await fetch(`/api/users/${user?.id}/upload-photo`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload photo');
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: `${variables.type === 'profile' ? 'Profile' : 'Cover'} photo updated successfully` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    }
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const daysSinceLastDonation = calculateDaysSinceLastDonation(user.lastDonation);
  const nextEligibleDays = Math.max(0, 120 - daysSinceLastDonation);
  const isEligible = isEligibleToDonate(user.lastDonation);

  const handleFileUpload = (type: 'profile' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadPhotoMutation.mutate({ file, type });
      }
    };
    input.click();
  };

  const addWorkEntry = () => {
    setProfileData(prev => ({
      ...prev,
      work: [...prev.work, {
        company: '',
        position: '',
        city: '',
        description: '',
        fromDate: '',
        toDate: '',
        currentlyWorking: false
      }]
    }));
  };

  const addEducationEntry = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        course: '',
        description: '',
        fromDate: '',
        toDate: '',
        graduated: false,
        type: 'university'
      }]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          {/* Cover Photo */}
          <div 
            className="h-48 bg-gradient-to-r from-primary to-red-700 relative bg-cover bg-center"
            style={{
              backgroundImage: user.coverPhoto ? `url(${user.coverPhoto})` : undefined
            }}
          >
            <Button 
              variant="secondary" 
              size="sm"
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => handleFileUpload('cover')}
              disabled={uploadPhotoMutation.isPending}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploadPhotoMutation.isPending ? 'Uploading...' : 'Change Cover'}
            </Button>
          </div>
          
          {/* Profile Info */}
          <CardContent className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.profilePicture || undefined} alt={user.fullName} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                    {getUserInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0 bg-primary hover:bg-red-700"
                  onClick={() => handleFileUpload('profile')}
                  disabled={uploadPhotoMutation.isPending}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 flex-grow">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                  {user.isVerified && (
                    <Badge className="bg-red-100 text-red-800">
                      <Heart className="w-3 h-3 mr-1" />
                      Verified Donor
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  Blood Group: <span className="font-semibold text-primary">{user.bloodGroup}</span> • {user.district}, Bangladesh
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    <Heart className="w-4 h-4 inline mr-1 text-primary" />
                    {user.donationCount} Donations
                  </span>
                  <span>
                    <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                    {formatRating(user.rating)} Rating
                  </span>
                  <Badge variant={isEligible ? "default" : "secondary"} className={isEligible ? "bg-green-100 text-green-800" : ""}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {isEligible ? 'Available' : `${nextEligibleDays} days`}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Button className="bg-primary text-white hover:bg-red-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Donations</p>
                      <p className="text-2xl font-bold text-primary">{user.donationCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Lives Saved</p>
                      <p className="text-2xl font-bold text-green-600">{user.donationCount * 3}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Next Eligible</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {isEligible ? 'Now' : `${nextEligibleDays} days`}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length > 0 ? (
                  <div className="space-y-4">
                    {donations.slice(0, 3).map((donation: any) => (
                      <div key={donation.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">
                            {donation.recipientName} - {donation.hospitalName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {donation.bloodGroup} • {donation.donationDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">Completed</p>
                          <p className="text-xs text-gray-500">{donation.donationDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No donations yet</p>
                    <p className="text-sm text-gray-400">Your donation history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Testimonials</CardTitle>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 mb-2">
                    "Dr. Sarah was incredibly responsive during our emergency. Her quick action helped save my father's life. Forever grateful!"
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">- Karim Rahman</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Personal Info</span>
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Medical Details</span>
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verification</span>
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Photo</span>
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="w-full" />
                  <p className="text-sm text-green-600 mt-2 font-medium">100% Complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <UserPen className="w-4 h-4 mr-3 text-primary" />
                    Update Availability
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-3 text-blue-600" />
                    Notification Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-3 text-green-600" />
                    Privacy Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-3 text-gray-600" />
                    Download Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>

        
          </div>
        </div>
      </div>
    </div>
  );
}
