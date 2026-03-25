import { Link } from 'react-router-dom';
import { Plus, FileText, MessageSquare, HandCoins, Building2, Clock, CheckCircle, AlertCircle, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getInquiries, getOffers, getTransactions } from '@/lib/storage';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-info/10 text-info',
  ai_review: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  live: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  sold: 'bg-accent/10 text-accent',
  rented: 'bg-accent/10 text-accent',
};

const LandlordDashboard = () => {
  const { user } = useAuth();
  const properties = getProperties().filter(p => p.landlordId === user?.id || p.landlordId === 'landlord-demo-001');
  const inquiries = getInquiries();
  const offers = getOffers().filter(o => o.landlordId === user?.id || o.landlordId === 'landlord-demo-001');
  const transactions = getTransactions().filter(t => t.landlordId === user?.id || t.landlordId === 'landlord-demo-001');

  const stats = [
    { label: 'Total Listings', value: properties.length, icon: Building2, color: 'text-primary' },
    { label: 'Active Listings', value: properties.filter(p => p.status === 'live').length, icon: CheckCircle, color: 'text-success' },
    { label: 'Pending Review', value: properties.filter(p => ['submitted', 'ai_review'].includes(p.status)).length, icon: Clock, color: 'text-warning' },
    { label: 'Total Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-info' },
    { label: 'Offers Received', value: offers.length, icon: HandCoins, color: 'text-accent' },
    { label: 'Transactions', value: transactions.length, icon: TrendingUp, color: 'text-primary' },
  ];

  const activities = [
    { text: 'Lekki Apartment listing created', time: '2 hours ago', type: 'create' },
    { text: 'Document review pending', time: '5 hours ago', type: 'pending' },
    { text: 'New offer received from buyer', time: '1 day ago', type: 'offer' },
    { text: 'Property marked verified', time: '2 days ago', type: 'verified' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground font-body text-sm">Here's what's happening with your properties</p>
        </div>
        <div className="flex gap-2">
          <Link to="/landlord/listings/new">
            <Button className="gradient-hero text-primary-foreground border-0">
              <Plus className="w-4 h-4 mr-2" /> Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground font-body">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/landlord/listings/new"><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add New Property</Button></Link>
          <Link to="/landlord/inquiries"><Button variant="outline" size="sm"><MessageSquare className="w-4 h-4 mr-1" /> View Inquiries</Button></Link>
          <Link to="/landlord/offers"><Button variant="outline" size="sm"><HandCoins className="w-4 h-4 mr-1" /> Manage Offers</Button></Link>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.type === 'verified' ? 'bg-success' : act.type === 'offer' ? 'bg-accent' : act.type === 'pending' ? 'bg-warning' : 'bg-primary'}`} />
                <div>
                  <p className="font-body text-foreground">{act.text}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Listing Status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Listing Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {properties.slice(0, 5).map(prop => (
              <Link key={prop.id} to={`/landlord/listings/${prop.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <img src={prop.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" width={40} height={40} />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{prop.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{prop.city}, {prop.state}</p>
                  </div>
                </div>
                <Badge className={`text-xs font-body capitalize ${statusColors[prop.status] || ''}`}>
                  {prop.status.replace('_', ' ')}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandlordDashboard;
