import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Eye, Heart, MessageSquare, Edit, Shield, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';
import { apiProperties } from '@/lib/apiClient';
import { agentService } from '@/lib/agentService';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-info/10 text-info',
  ai_review: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  live: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const LandlordListingDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiProperties.get(id)
      .then(data => setProperty({ ...data, id: data._id }))
      .catch(() => setProperty(null))
      .finally(() => setPropertyLoading(false));
  }, [id]);

  if (propertyLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-body">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-body">Property not found</p>
        <Link to="/landlord/listings"><Button variant="outline" className="mt-4">Back to Listings</Button></Link>
      </div>
    );
  }

  const formatPrice = (p: number) => p >= 1000000 ? `₦${(p / 1000000).toFixed(1)}M` : `₦${p.toLocaleString()}`;

  const fetchAreaIntelligence = async () => {
    setIsFetching(true);
    toast.info('🧠 Generating Deep Area Intelligence report...', { duration: 8000 });
    try {
      const location = `${property.address || ''}, ${property.city}, ${property.state}`.replace(/^,\s*/, '');
      const insight = await agentService.getAreaIntelligence(location);
      setAiInsight(insight);
      toast.success('Area Intelligence report generated!');
    } catch (e: any) {
      toast.error('Failed to generate report: ' + e.message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/landlord/listings"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <Badge className={`capitalize ${statusColors[property.status] || ''}`}>{property.status.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="w-3 h-3" />{property.address}</p>
        </div>
        <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Views', value: property.views, icon: Eye },
          { label: 'Saves', value: property.saves, icon: Heart },
          { label: 'Inquiries', value: property.inquiryCount, icon: MessageSquare },
          { label: 'Price', value: formatPrice(property.price), icon: Shield },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="w-5 h-5 text-primary" />
              <div><p className="text-xs text-muted-foreground font-body">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="font-body">Overview</TabsTrigger>
          <TabsTrigger value="gallery" className="font-body">Gallery</TabsTrigger>
          <TabsTrigger value="documents" className="font-body">Documents</TabsTrigger>
          <TabsTrigger value="ai-report" className="font-body">AI Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-body text-muted-foreground">{property.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-body">
                {property.bedrooms !== undefined && <div><span className="text-muted-foreground">Bedrooms:</span> <span className="font-medium">{property.bedrooms}</span></div>}
                {property.bathrooms !== undefined && <div><span className="text-muted-foreground">Bathrooms:</span> <span className="font-medium">{property.bathrooms}</span></div>}
                {property.plotSize && <div><span className="text-muted-foreground">Plot Size:</span> <span className="font-medium">{property.plotSize}</span></div>}
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium capitalize">{property.type}</span></div>
                <div><span className="text-muted-foreground">Purpose:</span> <span className="font-medium capitalize">{property.purpose}</span></div>
                {property.powerSupply && <div><span className="text-muted-foreground">Power:</span> <span className="font-medium">{property.powerSupply}</span></div>}
                {property.waterSupply && <div><span className="text-muted-foreground">Water:</span> <span className="font-medium">{property.waterSupply}</span></div>}
                {property.security && <div><span className="text-muted-foreground">Security:</span> <span className="font-medium">{property.security}</span></div>}
                {property.condition && <div><span className="text-muted-foreground">Condition:</span> <span className="font-medium">{property.condition}</span></div>}
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <div><p className="text-sm text-muted-foreground mb-2">Amenities:</p><div className="flex flex-wrap gap-2">{(property.amenities || []).map((a: string) => <Badge key={a} variant="secondary" className="font-body text-xs">{a}</Badge>)}</div></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(property.images || []).map((img: string, i: number) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" loading="lazy" width={400} height={267} /></div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              {(property.documents || []).map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm font-body">{doc.name}</span>
                  <Badge className={doc.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'} variant="secondary">{doc.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-report" className="mt-4 space-y-4">
          {/* Static Risk Report */}
          {property.riskReport ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-display ${property.riskReport.level === 'low' ? 'bg-success/10 text-success' : property.riskReport.level === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                    {property.riskReport.overallScore}
                  </div>
                  <div>
                    <Badge className={`capitalize ${property.riskReport.level === 'low' ? 'bg-success/10 text-success' : property.riskReport.level === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{property.riskReport.recommendation.replace('_', ' ')}</Badge>
                    <p className="text-sm text-muted-foreground font-body mt-1">Overall Risk Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Flood Risk', value: property.riskReport.floodRisk, invert: true },
                    { label: 'Power Reliability', value: property.riskReport.powerReliability },
                    { label: 'Dev. Potential', value: property.riskReport.developmentPotential },
                    { label: 'Title Confidence', value: property.riskReport.titleConfidence },
                    { label: 'Rental Yield', value: property.riskReport.rentalYield, suffix: '%' },
                    { label: 'Appreciation', value: property.riskReport.appreciationPotential },
                  ].map(metric => (
                    <div key={metric.label} className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground font-body">{metric.label}</p>
                      <p className="text-xl font-bold font-display">{metric.value}{metric.suffix || '/100'}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-body text-muted-foreground">{property.riskReport.summary}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-6 text-center text-muted-foreground font-body text-sm">Static risk report not yet available for this listing.</CardContent></Card>
          )}

          {/* Live AI Area Intelligence */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Deep Area Intelligence (AI-Powered)
                </span>
                <Button variant="outline" size="sm" onClick={fetchAreaIntelligence} disabled={isFetching}>
                  {isFetching ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Generating...</> : 'Generate Report'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsight ? (
                <div className="p-4 rounded-lg bg-muted text-sm font-body whitespace-pre-wrap leading-relaxed">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-body text-center py-4">
                  Click "Generate Report" to get an AI-powered area intelligence analysis for <strong>{property.city}, {property.state}</strong> — covering flood risk, security, infrastructure and more.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandlordListingDetail;
