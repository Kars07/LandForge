import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Grid3X3, List as ListIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties } from '@/lib/storage';
import PropertyCard from '@/components/shared/PropertyCard';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-info/10 text-info',
  ai_review: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  live: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const LandlordListings = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allProperties = getProperties().filter(p => p.landlordId === user?.id || p.landlordId === 'landlord-demo-001');
  const properties = allProperties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground font-body text-sm">{allProperties.length} properties total</p>
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {properties.length === 0 ? (
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
            <Link key={prop.id} to={`/landlord/listings/${prop.id}`}>
              <PropertyCard property={prop} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordListings;
