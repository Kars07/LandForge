import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    const success = login(email, password);
    if (success) {
      const user = JSON.parse(localStorage.getItem('landforge_user') || '{}');
      toast.success('Welcome back!');
      navigate(user.role === 'landlord' ? '/landlord/dashboard' : '/buyer/dashboard');
    } else {
      toast.error('Invalid credentials. Please sign up first.');
    }
  };

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
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground font-body">Log in to your LandForge account</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm font-body">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-body">Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-body text-muted-foreground">
                <input type="checkbox" className="rounded border-border" /> Remember me
              </label>
              <span className="text-primary font-body cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <Button className="w-full gradient-hero text-primary-foreground border-0" size="lg" onClick={handleLogin}>
              Log in <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Don't have an account? <Link to="/auth/select-role" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
