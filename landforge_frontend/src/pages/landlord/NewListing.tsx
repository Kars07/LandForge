import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { addProperty, generateId } from '@/lib/storage';
import { PropertyType, ListingPurpose } from '@/lib/types';
import { toast } from 'sonner';

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
];

const STATES = ['Lagos', 'Abuja', 'Rivers', 'Ogun', 'Enugu', 'Kaduna'];

const NewListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: '', type: 'house' as PropertyType, purpose: 'sale' as ListingPurpose,
    price: '', state: '', city: '', address: '', description: '',
    plotSize: '', bedrooms: '', bathrooms: '', furnished: false, parking: false,
    powerSupply: '', waterSupply: '', security: '', condition: '', yearBuilt: '',
    amenities: [] as string[],
  });

  const [images] = useState(MOCK_IMAGES);
  const [documents, setDocuments] = useState<string[]>([]);

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.state) {
      toast.error('Please fill in required fields');
      return;
    }

    addProperty({
      id: generateId(),
      landlordId: user?.id || 'landlord-demo-001',
      title: form.title,
      type: form.type,
      purpose: form.purpose,
      price: parseInt(form.price) || 0,
      state: form.state,
      city: form.city,
      address: form.address,
      description: form.description,
      plotSize: form.plotSize || undefined,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
      furnished: form.furnished,
      parking: form.parking,
      powerSupply: form.powerSupply || undefined,
      waterSupply: form.waterSupply || undefined,
      security: form.security || undefined,
      condition: form.condition || undefined,
      yearBuilt: form.yearBuilt || undefined,
      amenities: form.amenities,
      images,
      documents: documents.map(d => ({ name: d, type: 'document', status: 'uploaded' as const, uploadedAt: new Date().toISOString() })),
      status: 'submitted',
      views: 0,
      saves: 0,
      inquiryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast.success('Property submitted for verification!');
    navigate('/landlord/listings');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground font-body text-sm">Step {step} of 5</p>
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 1 && (
            <>
              <CardTitle className="text-lg mb-4">Property Basics</CardTitle>
              <div><Label className="font-body text-sm">Property Title *</Label><Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. 3 Bedroom Luxury Apartment" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Property Type</Label><Select value={form.type} onValueChange={v => update('type', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="house">House</SelectItem><SelectItem value="apartment">Apartment</SelectItem><SelectItem value="land">Land</SelectItem></SelectContent></Select></div>
                <div><Label className="font-body text-sm">Listing Purpose</Label><Select value={form.purpose} onValueChange={v => update('purpose', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sale">For Sale</SelectItem><SelectItem value="rent">For Rent</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label className="font-body text-sm">Price (₦) *</Label><Input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="50000000" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">State *</Label><Select value={form.state} onValueChange={v => update('state', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="font-body text-sm">City/Area</Label><Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Lekki" className="mt-1" /></div>
              </div>
              <div><Label className="font-body text-sm">Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full address" className="mt-1" /></div>
              <div><Label className="font-body text-sm">Description</Label><Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the property..." className="mt-1" rows={3} /></div>
            </>
          )}

          {step === 2 && (
            <>
              <CardTitle className="text-lg mb-4">Property Details</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Plot Size</Label><Input value={form.plotSize} onChange={e => update('plotSize', e.target.value)} placeholder="e.g. 500sqm" className="mt-1" /></div>
                <div><Label className="font-body text-sm">Year Built</Label><Input value={form.yearBuilt} onChange={e => update('yearBuilt', e.target.value)} placeholder="2023" className="mt-1" /></div>
              </div>
              {form.type !== 'land' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="font-body text-sm">Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} className="mt-1" /></div>
                  <div><Label className="font-body text-sm">Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} className="mt-1" /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Power Supply</Label><Input value={form.powerSupply} onChange={e => update('powerSupply', e.target.value)} placeholder="24hr Inverter" className="mt-1" /></div>
                <div><Label className="font-body text-sm">Water Supply</Label><Input value={form.waterSupply} onChange={e => update('waterSupply', e.target.value)} placeholder="Borehole" className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-sm">Security</Label><Input value={form.security} onChange={e => update('security', e.target.value)} placeholder="24hr Guard" className="mt-1" /></div>
                <div><Label className="font-body text-sm">Condition</Label><Select value={form.condition} onValueChange={v => update('condition', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="New">New</SelectItem><SelectItem value="Renovated">Renovated</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={form.furnished} onChange={e => update('furnished', e.target.checked)} className="rounded" /> Furnished</label>
                <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={form.parking} onChange={e => update('parking', e.target.checked)} className="rounded" /> Parking</label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <CardTitle className="text-lg mb-4">Media Upload</CardTitle>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-body mb-2">Drag and drop images or click to upload</p>
                <Button variant="outline" size="sm">Choose Files</Button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" width={200} height={133} />
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-body">Cover</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-body">Mock images will be used for demo purposes</p>
            </>
          )}

          {step === 4 && (
            <>
              <CardTitle className="text-lg mb-4">Document Upload</CardTitle>
              {['Certificate of Occupancy', 'Survey Plan', 'Deed of Assignment', 'Title Document'].map(doc => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm font-body">{doc}</span>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (!documents.includes(doc)) setDocuments(d => [...d, doc]);
                    toast.success(`${doc} uploaded`);
                  }}>
                    {documents.includes(doc) ? '✓ Uploaded' : 'Upload'}
                  </Button>
                </div>
              ))}
            </>
          )}

          {step === 5 && (
            <>
              <CardTitle className="text-lg mb-4">Review & Submit</CardTitle>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Title</span><span className="font-medium">{form.title || '—'}</span></div>
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{form.type}</span></div>
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Purpose</span><span className="font-medium capitalize">{form.purpose === 'sale' ? 'For Sale' : 'For Rent'}</span></div>
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Price</span><span className="font-medium">₦{parseInt(form.price || '0').toLocaleString()}</span></div>
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Location</span><span className="font-medium">{form.city}, {form.state}</span></div>
                <div className="flex justify-between py-1 border-b border-border"><span className="text-muted-foreground">Images</span><span className="font-medium">{images.length} uploaded</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Documents</span><span className="font-medium">{documents.length} uploaded</span></div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1"><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>}
            {step < 5 ? (
              <Button className="flex-1 gradient-hero text-primary-foreground border-0" onClick={() => setStep(s => s + 1)}>Next <ArrowRight className="ml-2 w-4 h-4" /></Button>
            ) : (
              <Button className="flex-1 gradient-hero text-primary-foreground border-0" onClick={handleSubmit}>Submit for Verification <ArrowRight className="ml-2 w-4 h-4" /></Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewListing;
