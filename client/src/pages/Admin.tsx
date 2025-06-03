import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BloodGroupChart, MonthlyDonationsChart } from '@/components/Charts';
import { 
  Users, 
  UserCheck, 
  Heart, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Award,
  Eye
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/analytics'],
  });

  const { data: emergencyRequestsData } = useQuery({
    queryKey: ['/api/emergency-requests'],
  });

  const { data: donorsData } = useQuery({
    queryKey: ['/api/donors/search', { limit: 50 }],
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  const stats = statsData?.stats || {
    totalDonors: 0,
    activeDonors: 0,
    bloodRequests: 0,
    criticalAlerts: 0,
  };

  const analytics = analyticsData || {
    bloodGroupStats: {},
    monthlyDonations: [],
  };

  const emergencyRequests = emergencyRequestsData?.requests || [];
  const donors = donorsData?.donors || [];

  // Get top donors this month (mock logic for demo)
  const topDonors = donors
    .filter((donor: any) => donor.donationCount > 0)
    .sort((a: any, b: any) => b.donationCount - a.donationCount)
    .slice(0, 3);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage blood donation system and monitor activities</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Donors</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDonors.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <p className="text-green-600 text-sm">+12% from last month</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Donors</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeDonors.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <p className="text-green-600 text-sm">+8% from last month</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Blood Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.bloodRequests.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                    <p className="text-red-600 text-sm">+18% from last month</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Critical Alerts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.criticalAlerts}</p>
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mr-1" />
                    <p className="text-orange-600 text-sm">Requires attention</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Blood Group Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Group Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.bloodGroupStats).length > 0 ? (
                <BloodGroupChart data={analytics.bloodGroupStats} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Donations */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.monthlyDonations.length > 0 ? (
                <MonthlyDonationsChart data={analytics.monthlyDonations} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Emergency Requests */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Emergency Requests</CardTitle>
                <Button variant="link" className="text-primary p-0 h-auto">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {emergencyRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emergencyRequests.slice(0, 5).map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{request.patientName}</p>
                              <p className="text-xs text-gray-600">{request.hospitalName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {request.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={request.status === 'pending' ? 'outline' : 'default'}
                              className={
                                request.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : request.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' ? (
                              <Button variant="link" className="text-primary p-0 h-auto text-xs">
                                Approve
                              </Button>
                            ) : (
                              <Button variant="link" className="text-blue-600 p-0 h-auto text-xs">
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emergency requests</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registered Donors */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Registered Donors</CardTitle>
                <Button variant="link" className="text-primary p-0 h-auto">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {donors.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.slice(0, 5).map((donor: any) => (
                        <TableRow key={donor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={donor.profilePicture || undefined} alt={donor.fullName} />
                                <AvatarFallback>{getUserInitials(donor.fullName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{donor.fullName}</p>
                                <p className="text-xs text-gray-600">{donor.donationCount} donations</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {donor.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{donor.district}</span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={donor.isVerified ? 'default' : 'outline'}
                              className={
                                donor.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {donor.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="text-blue-600 p-0 h-auto text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No donors registered</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
