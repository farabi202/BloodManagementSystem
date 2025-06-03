import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEmergencyRequestSchema, type InsertEmergencyRequest } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Upload, X } from 'lucide-react';

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertEmergencyRequest>({
    resolver: zodResolver(insertEmergencyRequestSchema),
    defaultValues: {
      patientName: '',
      patientAge: 0,
      bloodGroup: '',
      unitsRequired: 1,
      hospitalName: '',
      doctorName: '',
      hospitalAddress: '',
      requiredBy: '',
      contactNumber: '',
      additionalInfo: '',
      isCritical: false,
      documents: null,
    },
  });

  const createEmergencyRequestMutation = useMutation({
    mutationFn: async (data: InsertEmergencyRequest) => {
      return apiRequest('POST', '/api/emergency-requests', data);
    },
    onSuccess: () => {
      toast({
        title: "Emergency Request Submitted",
        description: "Your emergency blood request has been submitted successfully. Donors will be notified immediately.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-requests'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit emergency request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmergencyRequest) => {
    createEmergencyRequestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Emergency Blood Request
          </DialogTitle>
          <DialogDescription>
            Submit urgent blood requirement details. This will notify matching donors immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Patient age"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group Needed *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitsRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Required *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10"
                          placeholder="Number of units"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hospital Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Hospital Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hospitalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hospital name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter doctor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hospitalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Address *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter complete hospital address"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Urgency and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requiredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required By *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+880 1XXXXXXXXX"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <FormLabel>Medical Documents</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary cursor-pointer">Upload files</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, PDF up to 10MB each</p>
              </div>
            </div>

            {/* Additional Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional medical details or special requirements..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Critical Emergency Checkbox */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <FormField
                control={form.control}
                name="isCritical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-red-900">
                        Mark as Critical Emergency
                      </FormLabel>
                      <p className="text-xs text-red-700">
                        Check this if blood is needed within 24 hours. This will trigger immediate notifications to all matching donors in your area.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-red-700"
                disabled={createEmergencyRequestMutation.isPending}
              >
                {createEmergencyRequestMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Emergency Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
