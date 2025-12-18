import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { registerOrganizerSchema, type RegisterOrganizer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function OrganizerRegister() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<RegisterOrganizer>({
    resolver: zodResolver(registerOrganizerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      hederaAccountId: "",
    },
  });

  const handleWalletConnect = (walletId: string) => {
    form.setValue("hederaAccountId", walletId);
  };

  const onSubmit = async (data: RegisterOrganizer) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/organizer/register", data);
      const user = await res.json();
      login({ ...user, role: "organizer" });
      toast({
        title: "Account created!",
        description: "Welcome to ProofPass. Let's create your first event.",
      });
      navigate("/organizer/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Create Organizer Account</CardTitle>
              <CardDescription className="mt-2">
                Start issuing blockchain-verified attendance badges for your events
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="IEEE PSG, ACM Chapter, etc."
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@organization.com"
                          data-testid="input-email"
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
                        <Input
                          type="password"
                          placeholder="At least 6 characters"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Hedera Wallet (Optional)</FormLabel>
                  <div className="flex items-center gap-2">
                    {form.watch("hederaAccountId") ? (
                      <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                        {form.watch("hederaAccountId")}
                      </div>
                    ) : (
                      <WalletConnect
                        walletId={form.watch("hederaAccountId")}
                        onConnect={handleWalletConnect}
                        compact
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet to receive NFT minting fees (optional for testnet)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/organizer/login">
                <span className="text-primary underline cursor-pointer" data-testid="link-login">
                  Sign in
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
