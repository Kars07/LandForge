import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getSavedProperties, toggleSaveProperty } from '@/lib/storage';
import PropertyCard from '@/components/shared/PropertyCard';

const BuyerSaved = () => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(getSavedProperties(user?.id || ''));
  const allProperties = getProperties();
  const savedProperties = allProperties.filter(p => savedIds.includes(p.id));

  const handleUnsave = (propId: string) => {
    const updated = toggleSaveProperty(user?.id || '', propId);
    setSavedIds(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Saved Properties</h1>
        <p className="text-muted-foreground font-body text-sm">{savedProperties.length} saved</p>
      </div>

      {savedProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground font-body mb-4">You haven't saved any properties yet</p>
            <Link to="/buyer/properties">
              <Button className="gradient-hero text-primary-foreground border-0">Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map(prop => (
            <Link key={prop.id} to={`/buyer/properties/${prop.id}`}>
              <PropertyCard property={prop} showActions onSave={() => handleUnsave(prop.id)} isSaved={true} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerSaved;
