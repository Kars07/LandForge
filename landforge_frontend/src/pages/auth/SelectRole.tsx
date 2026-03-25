import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SelectRole = () => {
  const [selected, setSelected] = useState<'landlord' | 'buyer' | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LandForge</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">How would you like to use LandForge?</h1>
          <p className="text-muted-foreground font-body">Choose your role to get started</p>
        </div>

        <div className="grid gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all ${selected === 'landlord' ? 'ring-2 ring-primary border-primary shadow-elevated' : 'hover:shadow-card'}`}
            onClick={() => setSelected('landlord')}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">I want to list properties</h3>
                <p className="text-sm text-muted-foreground font-body">List, manage, and sell or rent your properties with verified tools.</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${selected === 'buyer' ? 'ring-2 ring-accent border-accent shadow-elevated' : 'hover:shadow-card'}`}
            onClick={() => setSelected('buyer')}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">I want to buy or rent properties</h3>
                <p className="text-sm text-muted-foreground font-body">Browse verified listings with AI insights and make secure offers.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          className="w-full gradient-hero text-primary-foreground border-0"
          size="lg"
          disabled={!selected}
          onClick={() => navigate(`/auth/signup?role=${selected}`)}
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SelectRole;
