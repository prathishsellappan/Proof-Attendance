import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, CheckCircle, XCircle, ExternalLink, Copy, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { SiHedera } from "react-icons/si";

interface VerificationResult {
  verified: boolean;
  tokenId?: string;
  serial?: string;
  owner?: string;
  eventName?: string;
  issuer?: string;
  date?: string;
  badgeImageCID?: string;
  metadataCID?: string;
  error?: string;
}

export default function Verify() {
  const [tokenId, setTokenId] = useState("");
  const [serial, setSerial] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!tokenId || !serial) {
      toast({
        title: "Missing information",
        description: "Please enter both Token ID and Serial Number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?tokenId=${tokenId}&serial=${serial}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        verified: false,
        error: "Could not verify badge. Please check the details and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-xl">ProofPass</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-page-title">
            Verify Attendance Badge
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter the NFT details to verify an attendance badge on the Hedera blockchain
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Badge Details
            </CardTitle>
            <CardDescription>
              Enter the Hedera Token ID and Serial Number from the badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  placeholder="0.0.1234567"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  data-testid="input-token-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  placeholder="1"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  data-testid="input-serial"
                />
              </div>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleVerify}
              disabled={isVerifying}
              data-testid="button-verify"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Verify Badge
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <Card className={result.verified ? "border-green-500" : "border-red-500"}>
            <CardContent className="pt-6">
              {result.verified ? (
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="flex items-center gap-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-green-800 dark:text-green-200" data-testid="text-verified">
                        Verified Attendance
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        This badge is authentic and recorded on the Hedera blockchain
                      </p>
                    </div>
                  </div>

                  {/* Badge Preview */}
                  {result.badgeImageCID && (
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800">
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${result.badgeImageCID}`}
                          alt="Badge"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid gap-4">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium">{result.eventName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Issuer</span>
                      <span className="font-medium">{result.issuer || "N/A"}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{result.date || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Owner</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{result.owner || "N/A"}</span>
                        {result.owner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(result.owner!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Token ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{result.tokenId}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(result.tokenId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Serial</span>
                      <span className="font-mono text-sm">{result.serial}</span>
                    </div>
                  </div>

                  {/* Blockchain Link */}
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <SiHedera className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`https://hashscan.io/testnet/token/${result.tokenId}/${result.serial}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1"
                    >
                      View on HashScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Soulbound Notice */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Soulbound NFT:</strong> This badge is non-transferable and permanently bound to the owner's wallet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Error State */}
                  <div className="flex items-center gap-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-red-800 dark:text-red-200" data-testid="text-not-verified">
                        Verification Failed
                      </h3>
                      <p className="text-red-700 dark:text-red-300">
                        {result.error || "Could not verify this badge. It may not exist or the details are incorrect."}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Please double-check the Token ID and Serial Number and try again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center text-muted-foreground">
          <h3 className="font-semibold mb-2">How to find badge details?</h3>
          <p className="text-sm">
            Token ID and Serial Number can be found on the badge holder's wallet or on the event organizer's dashboard.
            You can also scan the QR code on the badge if available.
          </p>
        </div>
      </main>
    </div>
  );
}
