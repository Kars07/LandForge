import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiProperties } from '@/lib/apiClient';
import PropertyCard from '@/components/shared/PropertyCard';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-info/10 text-info',
  ai_review: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  active: 'bg-success/10 text-success',
  live: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  sold: 'bg-accent/10 text-accent',
};

const LandlordListings = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiProperties.list({ landlordId: user.id })
      .then(data => setAllProperties(data))
      .catch(() => setAllProperties([]))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const properties = allProperties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const normalise = (p: any) => ({ ...p, id: p._id || p.id });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground font-body text-sm">{isLoading ? 'Loading...' : `${allProperties.length} properties total`}</p>
        </div>
        <Link to="/landlord/listings/new">
          <Button className="gradient-hero text-primary-foreground border-0">
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="sold">Sold / Rented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground font-body mb-4">No listings found</p>
            <Link to="/landlord/listings/new">
              <Button className="gradient-hero text-primary-foreground border-0">
                <Plus className="w-4 h-4 mr-2" /> Add New Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(prop => (
            <Link key={prop._id} to={`/landlord/listings/${prop._id}`}>
              <PropertyCard property={normalise(prop)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordListings;
