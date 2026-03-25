import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, HandCoins, Home, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getOffers, getSavedProperties } from '@/lib/storage';
import PropertyCard from '@/components/shared/PropertyCard';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const properties = getProperties().filter(p => p.status === 'live');
  const offers = getOffers().filter(o => o.buyerId === user?.id || o.buyerId === 'buyer-demo-001');
  const saved = getSavedProperties(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Saved Properties', value: saved.length, icon: Heart, color: 'text-destructive' },
    { label: 'Active Offers', value: offers.filter(o => o.status === 'pending').length, icon: HandCoins, color: 'text-accent' },
    { label: 'Available Rentals', value: properties.filter(p => p.purpose === 'rent').length, icon: Home, color: 'text-info' },
    { label: 'Recommended', value: properties.length, icon: TrendingUp, color: 'text-primary' },
  ];

  const featured = properties.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground font-body text-sm">Find your next property investment</p>
      </div>

      {/* Search Hero */}
      <Card className="gradient-hero overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-primary-foreground mb-4 font-display">Find Verified Properties</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location, type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-0"
              />
            </div>
            <Link to="/buyer/properties">
              <Button className="gradient-gold text-accent-foreground border-0 w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Featured */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recommended Properties</h2>
          <Link to="/buyer/properties"><Button variant="ghost" size="sm" className="text-primary font-body">View All →</Button></Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(prop => (
            <Link key={prop.id} to={`/buyer/properties/${prop.id}`}>
              <PropertyCard property={prop} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
