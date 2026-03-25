import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/lib/types';

const riskColors = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
};

const formatPrice = (price: number, purpose: string) => {
  if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M${purpose === 'rent' ? '/yr' : ''}`;
  if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K${purpose === 'rent' ? '/yr' : ''}`;
  return `₦${price}`;
};

interface Props {
  property: Property;
  showActions?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
}

const PropertyCard = ({ property, showActions, onSave, isSaved }: Props) => {
  return (
    <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 group border-border h-full">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={600}
          height={400}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground border-0 text-xs font-body capitalize">
            {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
          {property.riskReport && (
            <Badge className={`text-xs font-body border ${riskColors[property.riskReport.level]}`}>
              {property.riskReport.level === 'low' ? <Shield className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
              {property.riskReport.level} risk
            </Badge>
          )}
        </div>
        {property.status === 'live' && (
          <Badge className="absolute top-3 right-3 bg-success/90 text-primary-foreground border-0 text-xs font-body">
            Verified
          </Badge>
        )}
        {showActions && onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(); }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
          </button>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-foreground line-clamp-1">{property.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {property.city}, {property.state}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary font-display">
            {formatPrice(property.price, property.purpose)}
          </span>
          <span className="text-xs text-muted-foreground font-body capitalize">{property.type}</span>
        </div>
        {property.bedrooms !== undefined && (
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-body">
            <span>{property.bedrooms} bed</span>
            <span>{property.bathrooms} bath</span>
            {property.plotSize && <span>{property.plotSize}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
