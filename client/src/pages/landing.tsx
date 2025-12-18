import { Link } from "wouter";
import { Shield, MapPin, Award, CheckCircle, ArrowRight, Zap, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiHedera } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
          <div className="flex items-center gap-2">
            <Link href="/verify">
              <Button variant="ghost" data-testid="link-verify">Verify Badge</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <SiHedera className="w-4 h-4" />
                Powered by Hedera Hashgraph
              </div>
              
              <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                Blockchain-Verified
                <span className="text-primary block">Proof of Attendance</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Issue tamper-proof, soulbound NFT badges for event attendance. 
                Verify presence with GPS, protect privacy with IPFS, and create 
                permanent records on Hedera.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/organizer/login">
                  <Button size="lg" className="gap-2" data-testid="button-organizer-cta">
                    I'm an Organizer
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/student/login">
                  <Button size="lg" variant="outline" data-testid="button-student-cta">
                    I'm a Student
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Soulbound NFTs
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  GPS Verified
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Privacy-First
                </div>
              </div>
            </div>
            
            {/* Right Column - Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl transform rotate-6 flex items-center justify-center">
                  <Award className="w-20 h-20 text-primary-foreground" />
                </div>
                <div className="absolute bottom-20 left-0 w-40 h-40 rounded-2xl bg-card border shadow-xl transform -rotate-6 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-20 w-36 h-36 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 shadow-xl flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  <line x1="30%" y1="60%" x2="70%" y2="20%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4" />
                  <line x1="20%" y1="70%" x2="60%" y2="85%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A secure, transparent system for verifying physical attendance using blockchain technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6 pt-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">
                  Organizer Control
                </h3>
                <p className="text-muted-foreground">
                  Event organizers control when attendance windows open and close. 
                  Create events, set venues with GPS coordinates, and manage badge distribution.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6 pt-8">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">
                  Location Verification
                </h3>
                <p className="text-muted-foreground">
                  Students must be physically present within the venue radius to claim badges. 
                  GPS coordinates are verified in real-time against the event location.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6 pt-8">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-2">
                  Soulbound NFTs
                </h3>
                <p className="text-muted-foreground">
                  Attendance badges are minted as non-transferable Hedera NFTs. 
                  Each badge is unique, permanent, and publicly verifiable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-semibold mb-6">
                Why Choose ProofPass?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Privacy Preserved</h4>
                    <p className="text-muted-foreground">
                      Personal information stored on IPFS, never on-chain. Only you control your data.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Instant Verification</h4>
                    <p className="text-muted-foreground">
                      Anyone can verify attendance badges publicly using the Hedera Mirror Node.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Permanent Records</h4>
                    <p className="text-muted-foreground">
                      Attendance records live forever on Hedera's immutable distributed ledger.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">Badge Verified</div>
                        <div className="text-sm text-muted-foreground">Blockchain Workshop 2025</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">0.0.1234567</div>
                      <div className="text-xs text-muted-foreground">Hedera NFT</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-muted-foreground">Issued By</div>
                      <div className="font-medium">IEEE PSG</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-muted-foreground">Date</div>
                      <div className="font-medium">Feb 17, 2025</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2">
                      <div className="text-muted-foreground">IPFS Metadata</div>
                      <div className="font-mono text-xs truncate">ipfs://bafybei...</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of attendance verification. Create your first event or register as a student today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/organizer/register">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-organizer-register">
                Create Organization
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/student/register">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground bg-transparent" data-testid="button-student-register">
                Register as Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-lg">ProofPass</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Secured by Hedera</span>
              <span>Stored on IPFS</span>
              <span>Built with Trust</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
