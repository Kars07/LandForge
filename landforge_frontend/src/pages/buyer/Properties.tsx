import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getSavedProperties, toggleSaveProperty } from '@/lib/storage';
import PropertyCard from '@/components/shared/PropertyCard';

const BuyerProperties = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [saved, setSaved] = useState(getSavedProperties(user?.id || ''));

  const allProperties = getProperties().filter(p => p.status === 'live' || p.status === 'verified');
  let properties = allProperties.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase()) && !p.state.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (purposeFilter !== 'all' && p.purpose !== purposeFilter) return false;
    if (stateFilter !== 'all' && p.state !== stateFilter) return false;
    return true;
  });

  properties.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'low_risk') return (a.riskReport?.overallScore || 0) - (b.riskReport?.overallScore || 0);
    return 0;
  });

  const handleSave = (propId: string) => {
    const updated = toggleSaveProperty(user?.id || '', propId);
    setSaved(updated);
  };

  const states = [...new Set(allProperties.map(p => p.state))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Browse Properties</h1>
          <p className="text-muted-foreground font-body text-sm">{properties.length} properties found</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search location, title..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_low">Lowest Price</SelectItem>
            <SelectItem value="price_high">Highest Price</SelectItem>
            <SelectItem value="low_risk">Lowest Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Purpose" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {properties.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground font-body">No properties match your filters</p></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(prop => (
            <Link key={prop.id} to={`/buyer/properties/${prop.id}`}>
              <PropertyCard property={prop} showActions onSave={() => handleSave(prop.id)} isSaved={saved.includes(prop.id)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerProperties;
