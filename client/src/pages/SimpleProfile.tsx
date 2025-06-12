import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  MapPin, 
  Heart, 
  Star, 
  Phone, 
  Mail,
  Shield,
  Award
} from "lucide-react";
import { formatDate, calculateDaysSinceLastDonation, isEligibleToDonate } from "@/lib/utils";

export default function SimpleProfile() {
  const { user } = useAuth();

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please login to view your profile</div>;
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getEligibilityStatus = () => {
    if (!user.isAvailable) return { label: 'Unavailable', color: 'bg-gray-500' };
    
    const eligible = isEligibleToDonate(user.lastDonation);
    if (eligible) return { label: 'Available to Donate', color: 'bg-green-500' };
    
    const daysRemaining = 120 - calculateDaysSinceLastDonation(user.lastDonation);
    return { label: `Available in ${daysRemaining} days`, color: 'bg-orange-500' };
  };

  const eligibilityStatus = getEligibilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div className="relative h-80 bg-gradient-to-r from-red-500 to-red-600">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Profile Picture */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={user.profilePicture || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl">
              {getUserInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      {user.fullName}
                      {user.isVerified && (
                        <Badge className="bg-red-100 text-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Donor ID: BDMS-{new Date().getFullYear()}-{String(user.id).padStart(4, '0')}
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
                      <div className="text-3xl font-bold text-red-600">{user.bloodGroup}</div>
                      <div className="text-sm text-gray-600">Blood Group</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{user.donationCount || 0}</div>
                      <div className="text-sm text-gray-600">Donations</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {((user.rating || 50) / 10).toFixed(1)}
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
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {user.bio || "Passionate blood donor committed to saving lives in our community."}
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
                  <span className="text-gray-700">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user.district}, {user.upazila}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Donation Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-lg font-semibold text-red-600">{user.bloodGroup}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-lg">{user.weight} kg</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Donation</label>
                    <p className="text-lg">{user.lastDonation ? formatDate(user.lastDonation) : 'Never'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Donations</label>
                    <p className="text-lg">{user.donationCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-lg">{formatDate(user.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-lg">{new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">District</label>
                    <p className="text-lg">{user.district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Upazila</label>
                    <p className="text-lg">{user.upazila}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Section */}
            {!user.isVerified && (
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