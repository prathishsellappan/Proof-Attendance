import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import type { Event, Registration } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  registrationCount?: number;
  userRegistration?: Registration | null;
  userRole: "organizer" | "student";
  onRegister?: () => void;
  onManage?: () => void;
}

export function EventCard({
  event,
  registrationCount = 0,
  userRegistration,
  userRole,
  onRegister,
  onManage,
}: EventCardProps) {
  const formattedDate = event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD";
  
  const getStatus = () => {
    if (userRegistration?.claimed) return "CLAIMED";
    if (userRegistration) return "REGISTERED";
    return event.attendanceStatus as "OPEN" | "CLOSED";
  };

  return (
    <Card className="group overflow-hidden hover-elevate" data-testid={`card-event-${event.id}`}>
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {event.badgeImageCID ? (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${event.badgeImageCID}`}
            alt={`${event.name} badge`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={getStatus()} size="sm" />
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-serif font-semibold text-lg line-clamp-2" data-testid="text-event-name">
          {event.name}
        </h3>
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-event-date">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span data-testid="text-registration-count">{registrationCount} registered</span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate" data-testid="text-event-venue">{event.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Clock className="h-4 w-4" />
            <span>Radius: {event.radius}m</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {userRole === "organizer" ? (
          <Link href={`/organizer/event/${event.id}`} className="w-full">
            <Button variant="outline" className="w-full" data-testid="button-manage-event">
              Manage Event
            </Button>
          </Link>
        ) : (
          <>
            {!userRegistration ? (
              <Button 
                onClick={onRegister} 
                className="w-full" 
                data-testid="button-register-event"
              >
                Register
              </Button>
            ) : userRegistration.claimed ? (
              <Link href={`/student/badge/${event.id}`} className="w-full">
                <Button variant="outline" className="w-full" data-testid="button-view-badge">
                  View Badge
                </Button>
              </Link>
            ) : event.attendanceStatus === "OPEN" ? (
              <Link href={`/student/event/${event.id}`} className="w-full">
                <Button className="w-full" data-testid="button-claim-badge">
                  Claim Badge
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full" disabled data-testid="button-waiting">
                Waiting for attendance
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
