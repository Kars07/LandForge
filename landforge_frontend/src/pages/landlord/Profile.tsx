import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LandlordProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Profile & Settings</h1>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">First Name</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1" /></div>
            <div><Label className="font-body text-sm">Last Name</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1" /></div>
          </div>
          <div><Label className="font-body text-sm">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" /></div>
          <div><Label className="font-body text-sm">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234..." className="mt-1" /></div>
          <div><Label className="font-body text-sm">Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1" /></div>
          <Button className="gradient-hero text-primary-foreground border-0" onClick={() => toast.success('Profile updated!')}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm font-body">
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div>
          {user?.accountType && <div className="flex justify-between"><span className="text-muted-foreground">Account Type</span><span className="capitalize">{user.accountType}</span></div>}
          {user?.businessName && <div className="flex justify-between"><span className="text-muted-foreground">Business Name</span><span>{user.businessName}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">KYC Status</span><Badge className="bg-warning/10 text-warning">Pending</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Member Since</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label className="font-body text-sm">Current Password</Label><Input type="password" className="mt-1" /></div>
          <div><Label className="font-body text-sm">New Password</Label><Input type="password" className="mt-1" /></div>
          <Button variant="outline" onClick={() => toast.success('Password updated!')}>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordProfile;
