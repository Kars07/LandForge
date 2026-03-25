import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { generateId } from '@/lib/storage';
import { UserRole, AccountType, BuyerPreference } from '@/lib/types';
import { toast } from 'sonner';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'buyer';
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [buyerPreference, setBuyerPreference] = useState<BuyerPreference>('both');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', businessName: '' });
  const [showVerification, setShowVerification] = useState(false);

  const totalSteps = role === 'landlord' ? 3 : 3;

  const handleSubmit = () => {
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      toast.error('Please fill all fields');
      return;
    }
    setShowVerification(true);
    setTimeout(() => {
      signup({
        id: generateId(),
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role,
        accountType: role === 'landlord' ? accountType : undefined,
        businessName: role === 'landlord' && accountType === 'business' ? form.businessName : undefined,
        buyerPreference: role === 'buyer' ? buyerPreference : undefined,
        createdAt: new Date().toISOString(),
      });
      toast.success('Account created successfully!');
      navigate(role === 'landlord' ? '/landlord/dashboard' : '/buyer/dashboard');
    }, 1500);
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verification Email Sent</h2>
            <p className="text-sm text-muted-foreground font-body">Setting up your account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LandForge</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create your {role} account</h1>
          <p className="text-sm text-muted-foreground font-body">Step {step} of {totalSteps}</p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {role === 'landlord' && step === 1 && (
              <>
                <Label className="text-sm font-body">Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['personal', 'business'] as const).map(type => (
                    <Button
                      key={type}
                      variant={accountType === type ? 'default' : 'outline'}
                      className={accountType === type ? 'gradient-hero text-primary-foreground border-0' : ''}
                      onClick={() => setAccountType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {role === 'buyer' && step === 1 && (
              <>
                <Label className="text-sm font-body">What are you interested in?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([['buy', 'Buy'], ['rent', 'Rent'], ['both', 'Both']] as const).map(([val, label]) => (
                    <Button
                      key={val}
                      variant={buyerPreference === val ? 'default' : 'outline'}
                      className={buyerPreference === val ? 'gradient-hero text-primary-foreground border-0' : ''}
                      onClick={() => setBuyerPreference(val)}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {role === 'landlord' && accountType === 'business' && (
                  <div>
                    <Label className="text-sm font-body">Business Name</Label>
                    <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Your company name" className="mt-1" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-body">First Name</Label>
                    <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-body">Last Name</Label>
                    <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-body">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-body">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-body">Confirm Password</Label>
                  <Input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" className="mt-1" />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <h3 className="font-bold mb-2">Review Your Details</h3>
                <div className="text-sm text-muted-foreground font-body space-y-1">
                  <p>Role: <span className="text-foreground capitalize">{role}</span></p>
                  {role === 'landlord' && <p>Account: <span className="text-foreground capitalize">{accountType}</span></p>}
                  {role === 'buyer' && <p>Interest: <span className="text-foreground capitalize">{buyerPreference}</span></p>}
                  <p>Name: <span className="text-foreground">{form.firstName} {form.lastName}</span></p>
                  <p>Email: <span className="text-foreground">{form.email}</span></p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button className="flex-1 gradient-hero text-primary-foreground border-0" onClick={() => setStep(s => s + 1)}>
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button className="flex-1 gradient-hero text-primary-foreground border-0" onClick={handleSubmit}>
                  Create Account <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
