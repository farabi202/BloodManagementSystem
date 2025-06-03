import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DonorCard from '@/components/DonorCard';
import ContactModal from '@/components/ContactModal';
import EmergencyModal from '@/components/EmergencyModal';
import { Search as SearchIcon, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const districts = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
];

export default function Search() {
  const [filters, setFilters] = useState({
    bloodGroup: '',
    district: '',
    isAvailable: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('nearest');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  const itemsPerPage = 9;

  const { data: donorsData, isLoading } = useQuery({
    queryKey: ['/api/donors/search', { ...filters, page: currentPage, limit: itemsPerPage }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }),
        ...(filters.district && { district: filters.district }),
        ...(filters.isAvailable && { isAvailable: filters.isAvailable }),
      });
      
      const response = await fetch(`/api/donors/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch donors');
      return response.json();
    },
  });

  const donors = donorsData?.donors || [];
  const totalDonors = 247; // This would come from the API in a real implementation

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      district: '',
      isAvailable: '',
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalDonors / itemsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    );

    // Page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={i === currentPage ? "bg-primary text-white" : ""}
        >
          {i}
        </Button>
      );
    }

    // Show ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="px-2 text-gray-500">...</span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Blood Donors</h1>
                <p className="text-gray-600">Search for available blood donors in your area</p>
              </div>
              <Button 
                onClick={() => setEmergencyModalOpen(true)}
                className="bg-primary text-white hover:bg-red-700 transition-colors font-semibold"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <Select value={filters.bloodGroup} onValueChange={(value) => handleFilterChange('bloodGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Blood Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Blood Groups</SelectItem>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <Select value={filters.district} onValueChange={(value) => handleFilterChange('district', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Districts</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <Select value={filters.isAvailable} onValueChange={(value) => handleFilterChange('isAvailable', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Donors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Donors</SelectItem>
                    <SelectItem value="true">Available Now</SelectItem>
                    <SelectItem value="false">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button className="bg-primary text-white hover:bg-red-700 transition-colors flex-1">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.bloodGroup || filters.district || filters.isAvailable) && (
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.bloodGroup && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Blood Group: {filters.bloodGroup}
                  </Badge>
                )}
                {filters.district && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    District: {filters.district}
                  </Badge>
                )}
                {filters.isAvailable && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {filters.isAvailable === 'true' ? 'Available' : 'Not Available'}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {isLoading ? (
                'Searching...'
              ) : (
                <>Found <span className="font-semibold">{totalDonors} donors</span> matching your criteria</>
              )}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest First</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="donations">Most Donations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Donor Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </Card>
            ))}
          </div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {donors.map((donor: any) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                onContactClick={() => setContactModalOpen(true)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No donors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search filters or search in a different area.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && donors.length > 0 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              {renderPaginationButtons()}
            </nav>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContactModal 
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
      />
      
      <EmergencyModal 
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
      />
    </div>
  );
}
