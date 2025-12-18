import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

type StatusType = "OPEN" | "CLOSED" | "CLAIMED" | "REGISTERED" | "PENDING" | "VERIFIED" | "ERROR";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "default";
}

const statusConfig: Record<StatusType, { label: string; className: string; icon: React.ReactNode }> = {
  OPEN: {
    label: "Open",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: <Clock className="h-3 w-3" />,
  },
  CLOSED: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
    icon: <XCircle className="h-3 w-3" />,
  },
  CLAIMED: {
    label: "Claimed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  REGISTERED: {
    label: "Registered",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  VERIFIED: {
    label: "Verified",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  ERROR: {
    label: "Error",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === "sm" ? "text-xs px-2 py-0.5" : ""} gap-1`}
      data-testid={`status-${status.toLowerCase()}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
