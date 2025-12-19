import { useState } from "react";
import { Wallet, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  walletId?: string | null;
  onConnect: (walletId: string) => void;
  compact?: boolean;
}

export function WalletConnect({ walletId, onConnect, compact = false }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualId, setManualId] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleConnect = () => {
    // Basic validation for Hedera Account ID (0.0.x)
    const hederaIdRegex = /^0\.0\.\d+$/;

    if (!hederaIdRegex.test(manualId)) {
      toast({
        title: "Invalid ID",
        description: "Please enter a valid Hedera Account ID (e.g., 0.0.12345)",
        variant: "destructive",
      });
      return;
    }

    onConnect(manualId);
    setIsOpen(false);
    setManualId("");

    toast({
      title: "Wallet Connected",
      description: `Connected to ${manualId}`,
    });
  };

  const copyToClipboard = async () => {
    if (walletId) {
      await navigator.clipboard.writeText(walletId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  if (walletId) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" data-testid="text-wallet-address">
            {truncateAddress(walletId)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyToClipboard}
            data-testid="button-copy-wallet"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setManualId(walletId);
            setIsOpen(true);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={compact ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          data-testid="button-connect-wallet"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Enter your Hedera Account ID to connect your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet-id">Hedera Account ID</Label>
            <Input
              id="wallet-id"
              placeholder="0.0.123456"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              data-testid="input-wallet-id"
            />
            <p className="text-xs text-muted-foreground">
              Enter your account ID from HashPack, Blade, or other Hedera wallets.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <a
              href="https://hedera.com/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Need a wallet?
            </a>
          </div>
          <Button onClick={handleConnect} data-testid="button-confirm-wallet">
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
