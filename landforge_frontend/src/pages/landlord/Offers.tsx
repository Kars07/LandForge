import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOffers } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  countered: 'bg-info/10 text-info',
};

const LandlordOffers = () => {
  const { user } = useAuth();
  const offers = getOffers().filter(o => o.landlordId === user?.id || o.landlordId === 'landlord-demo-001');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Offers Received</h1>
        <p className="text-muted-foreground font-body text-sm">{offers.length} offers</p>
      </div>

      {offers.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground font-body">No offers received yet</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => (
            <Card key={offer.id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{offer.buyerName}</span>
                    <Badge className={`text-xs ${statusColors[offer.status]}`}>{offer.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-body">Property: {offer.propertyTitle}</p>
                  <p className="text-lg font-bold text-primary font-display mt-1">₦{offer.amount.toLocaleString()}</p>
                  <p className="text-sm font-body text-foreground mt-1">{offer.message}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">Timeline: {offer.timeline} • {new Date(offer.createdAt).toLocaleDateString()}</p>
                </div>
                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={() => toast.success('Offer accepted!')}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info('Counter offer sent')}>Counter</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => toast.info('Offer rejected')}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordOffers;
