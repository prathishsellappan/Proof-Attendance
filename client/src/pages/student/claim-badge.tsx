import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, Award, MapPin, Clock, Loader2, Wallet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { LocationIndicator } from "@/components/location-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, Registration } from "@shared/schema";
import { format } from "date-fns";

interface ClaimRequirement {
  id: string;
  label: string;
  met: boolean;
  checking?: boolean;
}

export default function ClaimBadge() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [locationVerified, setLocationVerified] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [mintingStep, setMintingStep] = useState<number>(0);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  const { data: registration } = useQuery<Registration>({
    queryKey: ["/api/events", id, "registration", user?.id],
  });

  const handleLocationVerified = (isWithin: boolean, distance: number, coords: { lat: number; long: number }) => {
    setLocationVerified(isWithin);
    if (isWithin) {
      setUserLocation(coords);
    }
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      setIsClaiming(true);
      setMintingStep(1);
      
      // Simulate minting steps
      await new Promise(r => setTimeout(r, 1000));
      setMintingStep(2);
      
      const res = await apiRequest("POST", `/api/events/${id}/claim`, {
        studentId: user?.id,
        location: userLocation,
        walletSignature: "simulated_signature",
      });
      
      setMintingStep(3);
      await new Promise(r => setTimeout(r, 500));
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/events/registered"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/badges"] });
      toast({
        title: "Badge Claimed!",
        description: "Your attendance NFT has been minted and transferred to your wallet.",
      });
      navigate("/student/dashboard");
    },
    onError: (error: any) => {
      setIsClaiming(false);
      setMintingStep(0);
      toast({
        title: "Claim failed",
        description: error.message || "Could not claim badge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const requirements: ClaimRequirement[] = [
    {
      id: "attendance",
      label: "Attendance window is open",
      met: event?.attendanceStatus === "OPEN",
    },
    {
      id: "registered",
      label: "You are registered for this event",
      met: !!registration,
    },
    {
      id: "wallet",
      label: "Wallet is connected",
      met: !!user?.hederaAccountId,
    },
    {
      id: "location",
      label: "You are within venue radius",
      met: locationVerified,
    },
    {
      id: "unclaimed",
      label: "Badge not already claimed",
      met: !registration?.claimed,
    },
  ];

  const allRequirementsMet = requirements.every(r => r.met);

  const mintingSteps = [
    { step: 1, label: "Uploading metadata to IPFS" },
    { step: 2, label: "Minting NFT on Hedera" },
    { step: 3, label: "Transferring to your wallet" },
  ];

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-6 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Event not found</p>
            <Link href="/student/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Event Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0">
                {event.badgeImageCID ? (
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${event.badgeImageCID}`}
                    alt="Badge"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-10 h-10 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-bold" data-testid="text-event-name">
                    {event.name}
                  </h1>
                  <StatusBadge status={event.attendanceStatus as "OPEN" | "CLOSED"} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD"}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.venueName || "Venue"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.radius}m radius
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minting Progress */}
        {isClaiming && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Minting Your Badge
              </CardTitle>
              <CardDescription>
                Please wait while we create your attendance NFT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mintingSteps.map((step) => (
                  <div key={step.step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      mintingStep > step.step 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : mintingStep === step.step 
                          ? "bg-primary/10" 
                          : "bg-muted"
                    }`}>
                      {mintingStep > step.step ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : mintingStep === step.step ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{step.step}</span>
                      )}
                    </div>
                    <span className={mintingStep >= step.step ? "text-foreground" : "text-muted-foreground"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements Checklist */}
        {!isClaiming && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Claim Requirements</CardTitle>
              <CardDescription>
                All requirements must be met to claim your badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    req.met 
                      ? "bg-green-50 dark:bg-green-900/20" 
                      : "bg-muted"
                  }`}
                >
                  {req.checking ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : req.met ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={req.met ? "text-green-800 dark:text-green-200" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Location Verification */}
        {!isClaiming && event.attendanceStatus === "OPEN" && !locationVerified && (
          <div className="mb-6">
            <LocationIndicator
              targetLat={event.venueLat}
              targetLong={event.venueLong}
              radius={event.radius}
              onLocationVerified={handleLocationVerified}
            />
          </div>
        )}

        {/* Claim Button */}
        {!isClaiming && (
          <Button
            size="lg"
            className="w-full gap-2"
            disabled={!allRequirementsMet}
            onClick={() => claimMutation.mutate()}
            data-testid="button-claim-badge"
          >
            <Award className="w-5 h-5" />
            Claim Badge
          </Button>
        )}

        {/* Wallet Not Connected Warning */}
        {!user?.hederaAccountId && !isClaiming && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-3">
            <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Wallet not connected
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please connect your Hedera wallet from the dashboard to receive your NFT badge.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
