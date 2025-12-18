import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Award, Calendar, User, LogOut, Wallet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/event-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, Registration } from "@shared/schema";

interface EventWithRegistration extends Event {
  registration?: Registration;
}

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();

  const { data: availableEvents, isLoading: availableLoading } = useQuery<EventWithRegistration[]>({
    queryKey: ["/api/student/events/available"],
  });

  const { data: myEvents, isLoading: myEventsLoading } = useQuery<EventWithRegistration[]>({
    queryKey: ["/api/student/events/registered"],
  });

  const { data: myBadges, isLoading: badgesLoading } = useQuery<EventWithRegistration[]>({
    queryKey: ["/api/student/badges"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/register`, {
        studentId: user?.id,
        studentAccountId: user?.hederaAccountId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/events/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/events/registered"] });
      toast({
        title: "Registered!",
        description: "You've successfully registered for this event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not register for event.",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg">ProofPass</span>
              <span className="text-muted-foreground text-sm ml-2">Student</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WalletConnect 
              walletId={user?.hederaAccountId} 
              onConnect={handleWalletConnect}
              compact
            />
            <Link href="/student/profile">
              <Button variant="ghost" size="icon" data-testid="button-profile">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold" data-testid="text-page-title">
            My Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse events and collect attendance badges
          </p>
        </div>

        {/* Wallet Warning */}
        {!user?.hederaAccountId && (
          <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Connect Your Wallet
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You need to connect a Hedera wallet to receive attendance badges as NFTs.
                </p>
              </div>
              <WalletConnect 
                walletId={null} 
                onConnect={handleWalletConnect}
                compact
              />
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-registered">
                    {myEvents?.length ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Registered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-badges">
                    {myBadges?.length ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available" data-testid="tab-available">
              Available Events
            </TabsTrigger>
            <TabsTrigger value="registered" data-testid="tab-registered">
              My Events
            </TabsTrigger>
            <TabsTrigger value="badges" data-testid="tab-badges">
              My Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {availableLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : availableEvents && availableEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userRole="student"
                    userRegistration={event.registration}
                    onRegister={() => registerMutation.mutate(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No events available</h3>
                  <p className="text-muted-foreground">
                    Check back later for upcoming events
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registered">
            {myEventsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myEvents && myEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userRole="student"
                    userRegistration={event.registration}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No registered events</h3>
                  <p className="text-muted-foreground">
                    Browse available events and register to attend
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="badges">
            {badgesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : myBadges && myBadges.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBadges.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userRole="student"
                    userRegistration={event.registration}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No badges yet</h3>
                  <p className="text-muted-foreground">
                    Attend events and claim your attendance badges
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
