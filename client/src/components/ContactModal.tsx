import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // If user is authenticated, show contact details or booking form
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Donor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Contact details for this donor will be available here.</p>
              <p className="text-sm text-gray-500 mt-2">This feature is currently under development.</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Donor</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 text-sm">
              Please login to view donor contact details and make requests.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-primary text-white hover:bg-red-700" onClick={() => onOpenChange(false)}>
                <LogIn className="w-4 h-4 mr-2" />
                Login to Continue
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Account
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
