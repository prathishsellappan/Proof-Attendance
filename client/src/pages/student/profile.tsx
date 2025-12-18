import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { useAuth } from "@/contexts/auth-context";
import { studentProfileSchema, type StudentProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function StudentProfile() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const form = useForm<StudentProfile>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: user?.name || "",
      college: "",
      department: "",
      rollNo: "",
    },
  });

  const handleWalletConnect = async (walletId: string) => {
    try {
      await apiRequest("PATCH", "/api/student/wallet", { hederaAccountId: walletId });
      updateUser({ hederaAccountId: walletId });
      toast({
        title: "Wallet connected",
        description: "Your wallet has been linked to your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not connect wallet.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: StudentProfile) => {
    setIsLoading(true);
    try {
      await apiRequest("PATCH", "/api/student/profile", data);
      updateUser({ name: data.name });
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved to IPFS.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold" data-testid="text-page-title">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Your profile information is stored securely on IPFS
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hedera Wallet</CardTitle>
              <CardDescription>
                Your wallet address for receiving NFT badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect 
                walletId={user?.hederaAccountId} 
                onConnect={handleWalletConnect}
              />
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                This information is stored on IPFS and linked to your attendance badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            data-testid="input-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="college"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College/Institution</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="PSG College of Technology"
                            data-testid="input-college"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Computer Science"
                            data-testid="input-department"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="21CS123"
                            data-testid="input-rollno"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your unique student identifier
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isLoading}
                    data-testid="button-save-profile"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving to IPFS...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
