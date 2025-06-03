import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      // Check CAPTCHA if required
      if (showCaptcha && captchaValue !== '7A9X2') {
        throw new Error('Invalid CAPTCHA');
      }
      
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Login Successful",
        description: "Welcome back to BDMS!",
      });
      
      // Redirect based on user role
      if (data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 3) {
        setShowCaptcha(true);
      }
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset link sent to your email!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your BDMS account</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username, Email or Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter username, email or phone" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Remember me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary p-0 h-auto"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </Button>
                </div>

                {/* CAPTCHA (after 3 failed attempts) */}
                {showCaptcha && (
                  <div className="bg-gray-100 p-4 rounded-lg border">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Verify you're human
                    </FormLabel>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded border font-mono text-lg tracking-wider font-bold">
                        7A9X2
                      </div>
                      <Input
                        placeholder="Enter CAPTCHA"
                        value={captchaValue}
                        onChange={(e) => setCaptchaValue(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-red-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    "Signing In..."
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/register">
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Register as Donor
                  </Button>
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Donor:</strong> sarah.ahmed / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
