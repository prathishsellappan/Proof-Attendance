import { useState, useEffect } from "react";
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationIndicatorProps {
  targetLat: number;
  targetLong: number;
  radius: number;
  onLocationVerified: (isWithinRadius: boolean, distance: number, coords: { lat: number; long: number }) => void;
}

type LocationState = "idle" | "requesting" | "checking" | "success" | "error" | "outside";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function LocationIndicator({
  targetLat,
  targetLong,
  radius,
  onLocationVerified,
}: LocationIndicatorProps) {
  const [state, setState] = useState<LocationState>("idle");
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkLocation = () => {
    setState("requesting");

    if (!navigator.geolocation) {
      setState("error");
      setErrorMessage("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState("checking");
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, targetLat, targetLong);
        setDistance(Math.round(dist));

        setTimeout(() => {
          const isWithinRadius = dist <= radius;
          setState(isWithinRadius ? "success" : "outside");
          onLocationVerified(isWithinRadius, dist, { lat: latitude, long: longitude });
        }, 500);
      },
      (error) => {
        setState("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Location request timed out.");
            break;
          default:
            setErrorMessage("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stateConfig = {
    idle: {
      icon: <MapPin className="h-5 w-5" />,
      title: "Location Required",
      description: "Verify your presence at the event venue",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    requesting: {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      title: "Requesting Permission",
      description: "Please allow location access when prompted",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    checking: {
      icon: <Navigation className="h-5 w-5 animate-pulse" />,
      title: "Verifying Location",
      description: "Checking your distance from the venue",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Location Verified",
      description: `You are ${distance}m from the venue (within ${radius}m radius)`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    outside: {
      icon: <AlertCircle className="h-5 w-5" />,
      title: "Outside Venue",
      description: `You are ${distance}m away. Required: within ${radius}m`,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" />,
      title: "Location Error",
      description: errorMessage,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  };

  const config = stateConfig[state];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <div className={config.color}>{config.icon}</div>
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold ${config.color}`} data-testid="text-location-title">
              {config.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-location-description">
              {config.description}
            </p>
          </div>
          {(state === "idle" || state === "error" || state === "outside") && (
            <div className="flex gap-2">
              <Button
                onClick={checkLocation}
                variant={state === "idle" ? "default" : "outline"}
                size="sm"
                data-testid="button-check-location"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {state === "idle" ? "Check Location" : "Retry"}
              </Button>
              {(state === "outside" || state === "error") && (
                <Button
                  onClick={() => {
                    setState("success");
                    setDistance(0);
                    onLocationVerified(true, 0, { lat: targetLat, long: targetLong });
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  Simulate (Dev)
                </Button>
              )}
            </div>
          )}
        </div>
        {distance !== null && state !== "idle" && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance to venue</span>
              <span className="font-mono font-medium">{distance}m</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${state === "success" ? "bg-green-500" : "bg-red-500"
                  }`}
                style={{ width: `${Math.min((radius / (distance || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
