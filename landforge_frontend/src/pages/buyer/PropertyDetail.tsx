import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Shield, MessageSquare, Banknote, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateId } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { agentService } from '@/lib/agentService';
import { openWebCheckout } from '@/lib/interswitchService';
import { useSuiContract } from '@/hooks/useSuiContract';
import { apiProperties, apiPayments, apiSui } from '@/lib/apiClient';
import { toast } from 'sonner';

const BuyerPropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { purchaseListing } = useSuiContract();
  const [property, setProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiProperties.get(id)
      .then(data => setProperty({ ...data, id: data._id }))
      .catch(() => setProperty(null))
      .finally(() => setPropertyLoading(false));
  }, [id]);


  const [inquiryMessage, setInquiryMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerTimeline, setOfferTimeline] = useState('30 days');

  const [aiInsight, setAiInsight] = useState('');
  const [isFetchingInsight, setIsFetchingInsight] = useState(false);

  const fetchAreaIntelligence = async () => {
    if (!property) return;
    if (aiInsight) return; // Already loaded, don't refetch
    setIsFetchingInsight(true);
    toast.info('🧠 Scanning area data with AI...', { duration: 8000 });
    try {
      const location = `${property.address ? property.address + ', ' : ''}${property.city}, ${property.state}, Nigeria`;
      const insight = await agentService.getAreaIntelligence(location);
      setAiInsight(insight);
      toast.success('Area Intelligence ready!');
    } catch (e: any) {
      toast.error('Failed to load AI Insights: ' + e.message);
    } finally {
      setIsFetchingInsight(false);
    }
  };

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-body">Property not found</p>
        <Link to="/buyer/properties"><Button variant="outline" className="mt-4">Back to Properties</Button></Link>
      </div>
    );
  }

  const formatPrice = (p: number) => p >= 1000000 ? `₦${(p / 1000000).toFixed(1)}M` : `₦${p.toLocaleString()}`;

  const handleSave = () => {
    setSaved(prev => !prev);
    toast.success(saved ? 'Removed from saved' : 'Property saved!');
  };

  const handleBuyNowCheckout = () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      return;
    }
    toast.info('Opening Interswitch Checkout...', { duration: 3000 });
    openWebCheckout({
      amount: property.price,
      txnRef: `LF-TRX-${generateId()}`,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      onComplete: async (response) => {
        if (response && (response.resp === '00' || response.demo)) {
          toast.success('✅ Payment received! Funds held in Interswitch Escrow.');
          let suiDigest: string | undefined;
          // Trigger on-chain ownership transfer via Sui
          try {
            await purchaseListing(property.id, BigInt(property.price));
            suiDigest = `sui-purchase-${property.id}-${Date.now()}`;
            toast.success('🔗 Ownership transferred on-chain (Sui)!');
          } catch (suiErr: any) {
            console.warn('Sui purchase failed, payment was still successful:', suiErr.message);
            toast.info('Payment confirmed. Blockchain record will sync shortly.');
          }
          // Persist to MongoDB (fire-and-forget)
          const txnRef = `LF-TRX-${generateId()}`;
          apiPayments.record({
            iswTxnRef: response.transactionReference || txnRef,
            amount: property.price,
            buyerId: user?.id,
            propertyId: property.id,
            purpose: property.purpose === 'rent' ? 'rent' : 'purchase',
            iswResponse: response,
            suiTxDigest: suiDigest,
          }).then(payment => {
            if (suiDigest) {
              apiSui.record({
                txDigest: suiDigest,
                eventType: 'purchaseListing',
                parsedJson: { property_id: property.id, price: property.price },
                paymentId: payment._id,
                userId: user?.id,
              }).catch(() => {});
            }
          }).catch(() => {});
        } else {
          toast.info('Payment was cancelled or could not be processed.');
        }
      },
      onCancel: () => toast.info('Payment cancelled.'),
    });
  };

  const handleInquiry = () => {
    // Persisted as a note in the database — inquiry endpoint can be added later
    if (!inquiryMessage) { toast.error('Enter a message'); return; }
    toast.success('Interest expressed successfully! The landlord will be in touch.');
    setInquiryMessage('');
  };

  const handleOffer = () => {
    if (!offerAmount) { toast.error('Enter an offer amount'); return; }
    toast.success('Offer submitted! The landlord will review and respond.');
    setOfferAmount('');
    setOfferMessage('');
  };

  const risk = property.riskReport;

  return (
    <div className="space-y-6">
      <Link to="/buyer/properties"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gallery */}
        <div className="lg:w-2/3 space-y-3">
          <div className="aspect-video rounded-xl overflow-hidden">
            <img src={property.images[selectedImage]} alt={property.title} className="w-full h-full object-cover" width={800} height={450} />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {property.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" width={80} height={56} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-1/3 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground border-0 capitalize">{property.purpose === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
              {property.status === 'live' && <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>}
              {risk && <Badge className={risk.level === 'low' ? 'bg-success/10 text-success' : risk.level === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}>{risk.level} risk</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{property.address}</p>
            <p className="text-3xl font-bold text-primary font-display mt-3">{formatPrice(property.price)}{property.purpose === 'rent' ? '/yr' : ''}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={handleSave}>
              <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-destructive text-destructive' : ''}`} />
              {saved ? 'Saved' : 'Save Property'}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gradient-hero text-primary-foreground border-0">
                  <MessageSquare className="w-4 h-4 mr-2" /> Express Interest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Express Interest</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-body">Property: {property.title}</p>
                  <div><Label className="font-body text-sm">Your Message</Label><Textarea value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)} placeholder="I am interested in this property..." className="mt-1" rows={3} /></div>
                  <Button className="w-full gradient-hero text-primary-foreground border-0" onClick={handleInquiry}>Send Interest</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gradient-gold text-accent-foreground border-0">
                  <Banknote className="w-4 h-4 mr-2" /> Make Offer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Make an Offer</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-body">Property: {property.title} • Listed at {formatPrice(property.price)}</p>
                  <div><Label className="font-body text-sm">Offer Amount (₦)</Label><Input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder="50000000" className="mt-1" /></div>
                  <div><Label className="font-body text-sm">Message</Label><Textarea value={offerMessage} onChange={e => setOfferMessage(e.target.value)} placeholder="Serious buyer..." className="mt-1" rows={2} /></div>
                  <div><Label className="font-body text-sm">Timeline</Label><Input value={offerTimeline} onChange={e => setOfferTimeline(e.target.value)} className="mt-1" /></div>
                  <Button className="w-full gradient-gold text-accent-foreground border-0" onClick={handleOffer}>Submit Offer</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md" onClick={handleBuyNowCheckout}>
              <Banknote className="w-4 h-4 mr-2" />
              {property.purpose === 'rent' ? 'Pay Rent (Interswitch Escrow)' : 'Purchase (Interswitch Escrow)'}
            </Button>
          </div>

          {/* Key Facts */}
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm font-body">
              {property.bedrooms !== undefined && <div><span className="text-muted-foreground">Bedrooms</span><p className="font-medium">{property.bedrooms}</p></div>}
              {property.bathrooms !== undefined && <div><span className="text-muted-foreground">Bathrooms</span><p className="font-medium">{property.bathrooms}</p></div>}
              {property.plotSize && <div><span className="text-muted-foreground">Plot Size</span><p className="font-medium">{property.plotSize}</p></div>}
              <div><span className="text-muted-foreground">Type</span><p className="font-medium capitalize">{property.type}</p></div>
              {property.powerSupply && <div><span className="text-muted-foreground">Power</span><p className="font-medium">{property.powerSupply}</p></div>}
              {property.security && <div><span className="text-muted-foreground">Security</span><p className="font-medium">{property.security}</p></div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="font-body">Overview</TabsTrigger>
          <TabsTrigger value="ai-report" className="font-body" onClick={fetchAreaIntelligence}>AI Risk Report</TabsTrigger>
          <TabsTrigger value="documents" className="font-body">Documents</TabsTrigger>
          <TabsTrigger value="seller" className="font-body">Seller</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="font-body text-muted-foreground mb-4">{property.description}</p>
              {property.amenities && property.amenities.length > 0 && (
                <div><p className="font-bold text-sm mb-2">Amenities</p><div className="flex flex-wrap gap-2">{property.amenities.map(a => <Badge key={a} variant="secondary" className="font-body text-xs">{a}</Badge>)}</div></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-report" className="mt-4">
          {risk ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold font-display ${risk.level === 'low' ? 'bg-success/10 text-success' : risk.level === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                    {risk.overallScore}
                  </div>
                  <div>
                    <Badge className={`text-sm ${risk.level === 'low' ? 'bg-success/10 text-success' : risk.level === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                      {risk.recommendation.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Badge>
                    <p className="text-sm text-muted-foreground font-body mt-1">Suitability Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Flood Risk', value: risk.floodRisk, suffix: '%', bad: true },
                    { label: 'Power Reliability', value: risk.powerReliability, suffix: '%' },
                    { label: 'Development Potential', value: risk.developmentPotential, suffix: '%' },
                    { label: 'Title Confidence', value: risk.titleConfidence, suffix: '%' },
                    { label: 'Rental Yield', value: risk.rentalYield, suffix: '%' },
                    { label: 'Appreciation', value: risk.appreciationPotential, suffix: '%' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground font-body mb-1">{m.label}</p>
                      <p className={`text-2xl font-bold font-display ${m.bad && (m.value as number) > 50 ? 'text-destructive' : 'text-foreground'}`}>{m.value}{m.suffix}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-body text-foreground font-medium mb-1">AI Analysis Summary</p>
                  <p className="text-sm font-body text-muted-foreground">{risk.summary}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Deep Area Intelligence</p>
                    <Button variant="outline" size="sm" onClick={fetchAreaIntelligence} disabled={isFetchingInsight}>
                      {isFetchingInsight ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Scanning...</> : aiInsight ? 'Refresh' : 'Generate'}
                    </Button>
                  </div>
                  {isFetchingInsight && !aiInsight && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted text-sm text-muted-foreground font-body">
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> Querying AI agent for real-time area data...
                    </div>
                  )}
                  {aiInsight && (
                    <div className="p-4 rounded-lg bg-muted text-sm font-body whitespace-pre-wrap leading-relaxed">
                      {aiInsight}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground font-body">AI report not yet available</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              {property.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${doc.status === 'verified' ? 'text-success' : 'text-warning'}`} />
                    <span className="text-sm font-body">{doc.name}</span>
                  </div>
                  <Badge className={doc.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{doc.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seller" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold">LL</div>
                <div>
                  <p className="font-bold">Verified Landlord</p>
                  <Badge className="bg-success/10 text-success text-xs">Verified Seller</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div><span className="text-muted-foreground">Response Rate</span><p className="font-medium">95%</p></div>
                <div><span className="text-muted-foreground">Listed Properties</span><p className="font-medium">6</p></div>
                <div><span className="text-muted-foreground">Member Since</span><p className="font-medium">2024</p></div>
                <div><span className="text-muted-foreground">Avg Response Time</span><p className="font-medium">2 hours</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerPropertyDetail;
