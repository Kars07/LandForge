import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInquiries, getProperties } from '@/lib/storage';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  new: 'bg-info/10 text-info',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-success/10 text-success',
  accepted: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const LandlordInquiries = () => {
  const inquiries = getInquiries();
  const properties = getProperties();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground font-body text-sm">{inquiries.length} inquiries received</p>
      </div>

      {inquiries.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground font-body">No inquiries yet</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inq => {
            const prop = properties.find(p => p.id === inq.propertyId);
            return (
              <Card key={inq.id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{inq.buyerName}</span>
                      <Badge className={`text-xs ${statusColors[inq.status]}`}>{inq.status}</Badge>
                      <Badge variant="secondary" className="text-xs font-body capitalize">{inq.intention}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-1">Property: {prop?.title || 'Unknown'}</p>
                    <p className="text-sm font-body text-foreground">{inq.message}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">via {inq.contactMethod} • {new Date(inq.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success('Marked as read')}>Read</Button>
                    <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={() => toast.success('Reply sent')}>Reply</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LandlordInquiries;
