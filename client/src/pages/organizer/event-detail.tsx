import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Play, Square, Users, Award, MapPin, Calendar, Clock, Copy, ExternalLink, Loader2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, Registration, Student } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RegistrationWithStudent extends Registration {
  student?: Student;
}

export default function OrganizerEventDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<RegistrationWithStudent[]>({
    queryKey: ["/api/events", id, "registrations"],
  });

  const toggleAttendance = async () => {
    if (!event) return;
    setIsToggling(true);
    try {
      const newStatus = event.attendanceStatus === "OPEN" ? "CLOSED" : "OPEN";
      await apiRequest("PATCH", `/api/events/${id}/attendance`, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      toast({
        title: newStatus === "OPEN" ? "Attendance Started" : "Attendance Stopped",
        description: newStatus === "OPEN"
          ? "Students can now claim their badges."
          : "Badge claiming is now disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update attendance status.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const downloadCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast({ title: "No Data", description: "No registrations to download.", variant: "destructive" });
      return;
    }

    const headers = ["Student Name", "Email", "College", "Roll No", "Wallet Address", "Registration Date", "Status", "NFT Serial"];

    const rows = registrations.map(reg => [
      reg.student?.name || "N/A",
      reg.student?.email || "N/A",
      reg.student?.college || "N/A",
      reg.student?.rollNo || "N/A",
      reg.studentAccountId || "N/A",
      reg.registeredAt ? format(new Date(reg.registeredAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
      reg.claimed ? "CLAIMED" : "REGISTERED",
      reg.nftSerial || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event?.name.replace(/\s+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
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
            <Link href="/organizer/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const claimedCount = registrations?.filter(r => r.claimed).length ?? 0;
  const registeredCount = registrations?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/organizer/dashboard">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-3xl font-bold" data-testid="text-event-name">
                {event.name}
              </h1>
              <StatusBadge status={event.attendanceStatus as "OPEN" | "CLOSED"} />
            </div>
            {event.description && (
              <p className="text-muted-foreground max-w-2xl">{event.description}</p>
            )}
          </div>
          <Button
            size="lg"
            variant={event.attendanceStatus === "OPEN" ? "destructive" : "default"}
            className="gap-2"
            onClick={toggleAttendance}
            disabled={isToggling}
            data-testid="button-toggle-attendance"
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : event.attendanceStatus === "OPEN" ? (
              <>
                <Square className="w-4 h-4" />
                Stop Attendance
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Attendance
              </>
            )}
          </Button>
        </div>

        {/* Attendance Status Banner */}
        {event.attendanceStatus === "OPEN" && (
          <div className="mb-8 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Attendance Window is OPEN
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Students within {event.radius}m of the venue can claim their badges now.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-registered">{registeredCount}</p>
                    <p className="text-sm text-muted-foreground">Registered</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-claimed">{claimedCount}</p>
                    <p className="text-sm text-muted-foreground">Badges Claimed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registrations Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Registrations</CardTitle>
                  <CardDescription>
                    Students who registered for this event
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Student Registrations</DialogTitle>
                        <DialogDescription>
                          Detailed list of all students registered for {event.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Wallet Status</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations && registrations.length > 0 ? (
                            registrations.map((reg) => (
                              <TableRow key={reg.id}>
                                <TableCell className="font-medium">
                                  {reg.student?.name || "N/A"}
                                </TableCell>
                                <TableCell>{reg.student?.email || "N/A"}</TableCell>
                                <TableCell>{reg.student?.college || "N/A"}</TableCell>
                                <TableCell>{reg.student?.rollNo || "N/A"}</TableCell>
                                <TableCell>
                                  {reg.studentAccountId ? (
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs">
                                        {reg.studentAccountId.substring(0, 10)}...
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4"
                                        onClick={() => copyToClipboard(reg.studentAccountId!)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">No Wallet</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge
                                    status={reg.claimed ? "CLAIMED" : "REGISTERED"}
                                    size="sm"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No registrations found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" className="gap-2" onClick={downloadCSV}>
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {registrationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : registrations && registrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet ID</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.slice(0, 5).map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {reg.studentAccountId || "N/A"}
                              </span>
                              {reg.studentAccountId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(reg.studentAccountId!)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {reg.registeredAt ? format(new Date(reg.registeredAt), "MMM d, HH:mm") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={reg.claimed ? "CLAIMED" : "REGISTERED"}
                              size="sm"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations yet
                  </div>
                )}
                {registrations && registrations.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground mt-4">Showing recent 5 registrations. Click "View All" to see everyone.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date ? format(new Date(event.date), "MMMM d, yyyy") : "TBD"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venueName || "Not specified"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {event.venueLat.toFixed(4)}, {event.venueLong.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Radius</p>
                    <p className="text-sm text-muted-foreground">{event.radius}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badge Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Badge Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {event.badgeImageCID ? (
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${event.badgeImageCID}`}
                      alt="Badge"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Award className="w-16 h-16 text-primary/40" />
                  </div>
                )}
                {event.badgeImageCID && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {event.badgeImageCID}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(event.badgeImageCID!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
