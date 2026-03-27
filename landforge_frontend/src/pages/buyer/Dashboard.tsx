import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, MapPin, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiProperties } from '@/lib/apiClient';
import PropertyCard from '@/components/shared/PropertyCard';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiProperties.list({ status: 'active' })
      .then(data => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Total Available', value: properties.length, icon: Building2, color: 'text-primary' },
    { label: 'For Rent', value: properties.filter(p => p.purpose === 'rent').length, icon: Home, color: 'text-info' },
    { label: 'For Sale', value: properties.filter(p => p.purpose === 'sale').length, icon: MapPin, color: 'text-success' },
  ];

  const recentListings = properties.slice(0, 6);
  const normalise = (p: any) => ({ ...p, id: p._id || p.id });

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
                <Search className="w-4 h-4 mr-2" /> Search Real Estate
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-body mb-1">{stat.label}</div>
                <div className="text-2xl font-bold font-display">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-2" /> : stat.value}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Properties from Backend */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Listings</h2>
          <Link to="/buyer/properties"><Button variant="ghost" size="sm" className="text-primary font-body">Browse All →</Button></Link>
        </div>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recentListings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground font-body">
              No live properties available at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map(prop => (
              <Link key={prop._id} to={`/buyer/properties/${prop._id}`}>
                <PropertyCard property={normalise(prop)} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
