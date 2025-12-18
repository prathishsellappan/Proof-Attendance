import { useState } from "react";
import { Wallet, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  walletId?: string | null;
  onConnect: (walletId: string) => void;
  compact?: boolean;
}

export function WalletConnect({ walletId, onConnect, compact = false }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (walletType: "hashpack" | "blade") => {
    setIsConnecting(true);
    
    // Simulate wallet connection - in production, this would use actual wallet SDKs
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate a mock Hedera account ID for demo
    const mockAccountId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;
    
    onConnect(mockAccountId);
    setIsConnecting(false);
    setIsOpen(false);
    
    toast({
      title: "Wallet Connected",
      description: `Connected to ${mockAccountId}`,
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
            Choose a Hedera wallet to connect and receive your attendance badges.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-16 justify-start gap-4"
            onClick={() => handleConnect("hashpack")}
            disabled={isConnecting}
            data-testid="button-connect-hashpack"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">HashPack</div>
              <div className="text-sm text-muted-foreground">Popular Hedera wallet</div>
            </div>
            {isConnecting && (
              <div className="ml-auto animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            )}
          </Button>
          <Button
            variant="outline"
            className="h-16 justify-start gap-4"
            onClick={() => handleConnect("blade")}
            disabled={isConnecting}
            data-testid="button-connect-blade"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Blade Wallet</div>
              <div className="text-sm text-muted-foreground">Fast & secure</div>
            </div>
            {isConnecting && (
              <div className="ml-auto animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <span>New to Hedera?</span>
          <a
            href="https://hedera.com/wallets"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Get a wallet
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
