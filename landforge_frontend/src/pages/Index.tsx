import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Brain, CheckCircle, MapPin, Star, Heart, ChevronRight, Building2, Users, TrendingUp, FileCheck, Globe, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import heroBg from '@/assets/hero-bg.jpg';
import { FEATURES, HOW_IT_WORKS, STATS, TRUST_POINTS } from '@/lib/constants';
import { getProperties } from '@/lib/storage';
import { Property } from '@/lib/types';
import PropertyCard from '@/components/shared/PropertyCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const LandingPage = () => {
  const properties = getProperties().filter(p => p.status === 'live').slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LandForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#properties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Properties</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth/select-role">
              <Button size="sm" className="gradient-hero text-primary-foreground border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Nigerian luxury estate" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 font-body">
              <Shield className="w-3 h-3 mr-1" /> Trusted by 10,000+ investors
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-background">
              Securely Buy & Rent Verified Property in Nigeria
            </h1>
            <p className="text-lg md:text-xl mb-8 text-background/80 font-body max-w-xl">
              LandForge helps landlords list with confidence and helps investors make fraud-free property decisions using AI insights and secure verification.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/auth/select-role">
                <Button size="lg" className="gradient-gold text-accent-foreground border-0 font-semibold text-base px-8 shadow-hero">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#properties">
                <Button size="lg" variant="outline" className="bg-background/10 border-background/30 text-background hover:bg-background/20">
                  Explore Listings
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-background/70 text-sm font-body">
              <span className="flex items-center gap-1"><Brain className="w-4 h-4 text-accent" /> AI-powered checks</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-accent" /> Blockchain-backed titles</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-accent" /> Diaspora-friendly</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-accent font-display">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70 font-body mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20 font-body">The Problem</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Property Fraud is Rampant in Nigeria</h2>
            <p className="text-muted-foreground font-body text-lg mb-10">
              Fake documents, hidden land disputes, unreliable agents, and zero transparency make property investment risky — especially for diaspora buyers.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Fake Documents', 'Hidden Land Risks', 'Unreliable Agents', 'Diaspora Difficulty', 'No Central System', 'Double Sales'].map((item, i) => (
              <motion.div key={item} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="bg-destructive/5 border-destructive/10">
                  <CardContent className="p-4 text-sm font-body text-destructive font-medium">{item}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-body">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Secure, Transparent</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 text-primary-foreground font-display text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                {i < 3 && <ChevronRight className="hidden md:block mx-auto mt-4 text-accent w-6 h-6" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 font-body">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Invest Safely</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div key={feat.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full hover:shadow-elevated transition-shadow border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{feat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords / Buyers */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="h-full border-primary/20 bg-card">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Landlords</h3>
                  <ul className="space-y-3 font-body text-sm text-muted-foreground">
                    {['List property with full details', 'Upload title documents securely', 'Receive verified buyer interest', 'Manage offers and negotiations', 'Track listing performance'].map(item => (
                      <li key={item} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                  <Link to="/auth/select-role" className="mt-6 inline-block">
                    <Button className="gradient-hero text-primary-foreground border-0 mt-4">Join as Landlord <ArrowRight className="ml-2 w-4 h-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="h-full border-accent/20 bg-card">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Buyers & Investors</h3>
                  <ul className="space-y-3 font-body text-sm text-muted-foreground">
                    {['Browse verified properties by location', 'Inspect AI-powered risk reports', 'Save and compare listings', 'Make secure offers directly', 'Complete purchase or rental seamlessly'].map(item => (
                      <li key={item} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                  <Link to="/auth/select-role" className="mt-6 inline-block">
                    <Button className="gradient-gold text-accent-foreground border-0 mt-4">Join as Buyer <ArrowRight className="ml-2 w-4 h-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-body">Featured</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Verified Properties</h2>
            <p className="text-muted-foreground font-body mt-2">Explore our latest verified listings from across Nigeria</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {properties.map((prop, i) => (
              <motion.div key={prop.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <PropertyCard property={prop} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/auth/select-role">
              <Button size="lg" className="gradient-hero text-primary-foreground border-0">
                View All Properties <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">Why Choose LandForge?</h2>
            <p className="text-primary-foreground/70 font-body mt-2">Built on trust, transparency, and technology</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map((point, i) => (
              <motion.div key={point.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="bg-primary-foreground/10 border-primary-foreground/10 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-primary-foreground">{point.title}</h3>
                    <p className="text-sm text-primary-foreground/70 font-body">{point.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Invest with Confidence?</h2>
            <p className="text-lg text-muted-foreground font-body mb-10">
              Join thousands of landlords and investors using LandForge to make secure, verified property transactions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth/select-role">
                <Button size="lg" className="gradient-hero text-primary-foreground border-0 px-8 shadow-hero">
                  Join as Landlord <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth/select-role">
                <Button size="lg" className="gradient-gold text-accent-foreground border-0 px-8">
                  Join as Buyer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-background">LandForge</span>
              </div>
              <p className="text-sm text-background/60 font-body">
                The trusted platform for buying, renting, and listing verified property in Nigeria.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-background mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-background/60 font-body">
                <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-background transition-colors">How it Works</a></li>
                <li><a href="#properties" className="hover:text-background transition-colors">Properties</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-background mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-background/60 font-body">
                <li><span className="cursor-default">About</span></li>
                <li><span className="cursor-default">Contact</span></li>
                <li><span className="cursor-default">Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-background mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/60 font-body">
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 pt-6 text-center text-sm text-background/40 font-body">
            © {new Date().getFullYear()} LandForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
