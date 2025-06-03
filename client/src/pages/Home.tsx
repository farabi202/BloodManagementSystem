import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, Heart, Users, Award, MapPin, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-red-700 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Save Lives Through Blood Donation
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with blood donors and seekers across Bangladesh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register as Donor
                </Button>
              </Link>
              <Link href="/search">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Donors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">25,000+</div>
              <div className="text-gray-600">Registered Donors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8,500+</div>
              <div className="text-gray-600">Lives Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">64</div>
              <div className="text-gray-600">Districts Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Emergency Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How BDMS Works</h2>
            <p className="text-lg text-gray-600">Simple steps to save lives</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Register</h3>
              <p className="text-gray-600">
                Create your profile with medical information and availability
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Match</h3>
              <p className="text-gray-600">
                Our system finds compatible donors based on location and blood type
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Donate</h3>
              <p className="text-gray-600">
                Connect with recipients and donate blood to save lives
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose BDMS Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BDMS?</h2>
            <p className="text-lg text-gray-600">Your trusted partner in blood donation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Verified Donors</h3>
              <p className="text-sm text-gray-600">All donors undergo thorough verification process</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-sm text-gray-600">Emergency requests get immediate attention</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Nationwide</h3>
              <p className="text-sm text-gray-600">Coverage across all 64 districts of Bangladesh</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Trusted Platform</h3>
              <p className="text-sm text-gray-600">Thousands of successful blood donations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Save Lives?</h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of heroes who are making a difference every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
                <Heart className="w-5 h-5 mr-2" />
                Become a Donor
              </Button>
            </Link>
            <Link href="/search">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Blood Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
