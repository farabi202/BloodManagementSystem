import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, Heart, Users, Award, MapPin, Clock } from 'lucide-react';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

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
                  className="bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 hover:border-red-700 font-semibold"
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
      <div className="py-16 bg-gradient-to-r from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                <AnimatedCounter end={25000} />+
              </div>
              <div className="text-gray-600 font-medium">Registered Donors</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                <AnimatedCounter end={8500} />+
              </div>
              <div className="text-gray-600 font-medium">Lives Saved</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                <AnimatedCounter end={64} />
              </div>
              <div className="text-gray-600 font-medium">Districts Covered</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-600 font-medium">Emergency Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How PulseCare Works</h2>
            <p className="text-lg text-gray-600">Simple steps to save lives</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-red-600 transition-colors duration-300">Register</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Create your profile with medical information and availability
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-600 transition-colors duration-300">Match</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Our system finds compatible donors based on location and blood type
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-green-600 transition-colors duration-300">Donate</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PulseCare?</h2>
            <p className="text-lg text-gray-600">Your trusted partner in blood donation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-blue-600 transition-colors duration-300">Verified Donors</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 pb-4">All donors undergo thorough verification process</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-green-600 transition-colors duration-300">Quick Response</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 pb-4">Emergency requests get immediate attention</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-yellow-600 transition-colors duration-300">Nationwide</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 pb-4">Coverage across all 64 districts of Bangladesh</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-purple-600 transition-colors duration-300">Trusted Platform</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 pb-4">Thousands of successful blood donations</p>
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
                className="bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 hover:border-red-700 font-semibold"
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
