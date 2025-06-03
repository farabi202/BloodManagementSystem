import React from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, Phone, Eye } from 'lucide-react';
import { formatRating, isEligibleToDonate, calculateDaysSinceLastDonation } from '@/lib/utils';

interface DonorCardProps {
  donor: User;
  onContactClick: () => void;
  onViewProfile?: () => void;
}

export default function DonorCard({ donor, onContactClick, onViewProfile }: DonorCardProps) {
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvailabilityStatus = () => {
    if (!donor.isAvailable) return { label: 'Unavailable', variant: 'secondary' as const };
    
    const eligible = isEligibleToDonate(donor.lastDonation);
    if (eligible) return { label: 'Available', variant: 'default' as const };
    
    const daysRemaining = 120 - calculateDaysSinceLastDonation(donor.lastDonation);
    return { label: `${daysRemaining} days`, variant: 'outline' as const };
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={donor.profilePicture || undefined} alt={donor.fullName} />
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {getUserInitials(donor.fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{donor.fullName}</h3>
            <Badge 
              variant={availabilityStatus.variant}
              className={availabilityStatus.variant === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
            >
              {availabilityStatus.label}
            </Badge>
            {donor.isVerified && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <Heart className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            Age: {new Date().getFullYear() - new Date(donor.dateOfBirth).getFullYear()} • 
            {donor.district}, {donor.upazila}
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-bold text-primary text-lg">{donor.bloodGroup}</span>
            <span className="text-gray-600">
              <Heart className="w-4 h-4 inline mr-1 text-primary" />
              {donor.donationCount} donations
            </span>
            <div className="flex items-center">
              <div className="flex text-yellow-500 mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(donor.rating / 10) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600">{formatRating(donor.rating)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button
          onClick={onContactClick}
          className="flex-1 bg-primary text-white hover:bg-red-700 transition-colors text-sm"
          size="sm"
        >
          <Phone className="w-4 h-4 mr-2" />
          Get Contact
        </Button>
        {onViewProfile && (
          <Button
            onClick={onViewProfile}
            variant="outline"
            size="sm"
            className="px-4"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
