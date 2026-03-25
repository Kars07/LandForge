import { Property, Inquiry, Offer, Transaction, RiskReport } from './types';

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop',
];

function makeRisk(): RiskReport {
  const score = Math.floor(Math.random() * 40) + 60;
  return {
    overallScore: score,
    level: score >= 80 ? 'low' : score >= 60 ? 'moderate' : 'high',
    recommendation: score >= 85 ? 'strong_buy' : score >= 75 ? 'good_rental' : score >= 60 ? 'moderate_risk' : 'high_risk',
    floodRisk: Math.floor(Math.random() * 30) + 10,
    powerReliability: Math.floor(Math.random() * 40) + 50,
    developmentPotential: Math.floor(Math.random() * 40) + 50,
    titleConfidence: Math.floor(Math.random() * 20) + 80,
    rentalYield: +(Math.random() * 8 + 4).toFixed(1),
    appreciationPotential: Math.floor(Math.random() * 30) + 50,
    summary: score >= 80
      ? 'This property appears suitable for long-term investment based on area growth potential and relatively low environmental risk.'
      : score >= 60
      ? 'This property shows moderate investment potential. Some risk factors need consideration before proceeding.'
      : 'Caution advised. Multiple risk factors identified that require thorough investigation.',
  };
}

const NIGERIAN_STATES = ['Lagos', 'Abuja', 'Rivers', 'Ogun', 'Enugu', 'Kaduna'];
const CITIES: Record<string, string[]> = {
  Lagos: ['Lekki', 'Victoria Island', 'Ikoyi', 'Ajah', 'Ikeja'],
  Abuja: ['Maitama', 'Wuse', 'Asokoro', 'Gwarinpa', 'Jabi'],
  Rivers: ['Port Harcourt', 'Obio-Akpor'],
  Ogun: ['Abeokuta', 'Sagamu'],
  Enugu: ['Enugu', 'Nsukka'],
  Kaduna: ['Kaduna', 'Zaria'],
};

const MOCK_LANDLORD_ID = 'landlord-demo-001';
const MOCK_BUYER_ID = 'buyer-demo-001';

export function generateMockProperties(): Property[] {
  const titles = [
    '3 Bedroom Luxury Apartment', 'Prime Land in Lekki Phase 2', '5 Bedroom Detached Duplex',
    '2 Bedroom Serviced Flat', 'Commercial Plot Ikoyi', '4 Bedroom Semi-Detached',
    'Waterfront Estate Land', 'Studio Apartment Victoria Island', '3 Bedroom Bungalow',
    'Executive 4 Bed Penthouse', '1 Bedroom Mini Flat', 'Residential Plot Ajah',
  ];

  return titles.map((title, i) => {
    const state = NIGERIAN_STATES[i % NIGERIAN_STATES.length];
    const cityList = CITIES[state] || ['City'];
    const city = cityList[i % cityList.length];
    const isLand = title.toLowerCase().includes('land') || title.toLowerCase().includes('plot');
    const type = isLand ? 'land' as const : title.toLowerCase().includes('apartment') || title.toLowerCase().includes('flat') || title.toLowerCase().includes('studio') ? 'apartment' as const : 'house' as const;
    const purpose = i % 3 === 0 ? 'rent' as const : 'sale' as const;
    const statuses: Property['status'][] = ['live', 'live', 'live', 'verified', 'live', 'live', 'submitted', 'live', 'live', 'live', 'live', 'draft'];

    return {
      id: `prop-${i + 1}`,
      landlordId: i < 6 ? MOCK_LANDLORD_ID : `landlord-${i}`,
      title,
      type,
      purpose,
      price: purpose === 'rent'
        ? [500000, 1200000, 2500000, 800000][i % 4]
        : [15000000, 45000000, 85000000, 120000000, 25000000, 65000000][i % 6],
      state,
      city,
      address: `${i + 10} ${city} Avenue, ${state}`,
      description: `Beautiful ${title.toLowerCase()} located in the heart of ${city}, ${state}. Well-designed with modern finishes, excellent infrastructure, and close proximity to key amenities.`,
      plotSize: isLand ? `${(i + 3) * 100}sqm` : undefined,
      bedrooms: isLand ? undefined : [1, 2, 3, 4, 5][i % 5],
      bathrooms: isLand ? undefined : [1, 2, 2, 3, 4][i % 5],
      furnished: !isLand && i % 2 === 0,
      parking: !isLand,
      powerSupply: ['24hr Inverter', 'Estate Generator', 'Solar + Grid', 'Grid Only'][i % 4],
      waterSupply: ['Borehole', 'Estate Supply', 'Municipal'][i % 3],
      security: ['24hr Guard', 'Gated Estate', 'CCTV + Guard', 'Basic'][i % 4],
      condition: ['Excellent', 'Good', 'New', 'Renovated'][i % 4],
      yearBuilt: `${2018 + (i % 6)}`,
      amenities: ['Swimming Pool', 'Gym', 'Garden', 'Playground', 'CCTV', 'Generator'].slice(0, (i % 4) + 2),
      images: [PROPERTY_IMAGES[i % PROPERTY_IMAGES.length], PROPERTY_IMAGES[(i + 1) % PROPERTY_IMAGES.length], PROPERTY_IMAGES[(i + 2) % PROPERTY_IMAGES.length]],
      documents: [
        { name: 'Certificate of Occupancy', type: 'c-of-o', status: i % 3 === 0 ? 'verified' : 'uploaded', uploadedAt: new Date().toISOString() },
        { name: 'Survey Plan', type: 'survey', status: 'uploaded', uploadedAt: new Date().toISOString() },
      ],
      status: statuses[i % statuses.length],
      riskReport: statuses[i % statuses.length] === 'live' || statuses[i % statuses.length] === 'verified' ? makeRisk() : undefined,
      views: Math.floor(Math.random() * 500) + 50,
      saves: Math.floor(Math.random() * 80) + 5,
      inquiryCount: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateMockInquiries(): Inquiry[] {
  return [
    { id: 'inq-1', propertyId: 'prop-1', buyerId: MOCK_BUYER_ID, buyerName: 'Chika Obi', intention: 'rent', message: 'I am interested in renting this apartment. Is it still available?', contactMethod: 'email', status: 'new', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'inq-2', propertyId: 'prop-3', buyerId: 'buyer-2', buyerName: 'Emeka Johnson', intention: 'buy', message: 'I would like to schedule a viewing for this property.', contactMethod: 'phone', status: 'read', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'inq-3', propertyId: 'prop-5', buyerId: 'buyer-3', buyerName: 'Aisha Mohammed', intention: 'buy', message: 'What is the title status of this property? Is the C of O available?', contactMethod: 'email', status: 'replied', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  ];
}

export function generateMockOffers(): Offer[] {
  return [
    { id: 'off-1', propertyId: 'prop-3', propertyTitle: '5 Bedroom Detached Duplex', buyerId: MOCK_BUYER_ID, buyerName: 'Chika Obi', landlordId: MOCK_LANDLORD_ID, amount: 80000000, message: 'I would like to make an offer on this property.', timeline: '30 days', status: 'pending', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'off-2', propertyId: 'prop-6', propertyTitle: '4 Bedroom Semi-Detached', buyerId: 'buyer-2', buyerName: 'Emeka Johnson', landlordId: MOCK_LANDLORD_ID, amount: 60000000, message: 'Serious buyer, ready to proceed.', timeline: '14 days', status: 'accepted', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  ];
}

export function generateMockTransactions(): Transaction[] {
  return [
    { id: 'tx-1', propertyId: 'prop-6', propertyTitle: '4 Bedroom Semi-Detached', buyerId: 'buyer-2', buyerName: 'Emeka Johnson', landlordId: MOCK_LANDLORD_ID, amount: 60000000, stage: 'escrow_holding', offerId: 'off-2', createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
  ];
}

export function initMockData() {
  const INIT_KEY = 'landforge_initialized';
  if (localStorage.getItem(INIT_KEY)) return;

  const props = generateMockProperties();
  localStorage.setItem('landforge_properties', JSON.stringify(props));
  localStorage.setItem('landforge_inquiries', JSON.stringify(generateMockInquiries()));
  localStorage.setItem('landforge_offers', JSON.stringify(generateMockOffers()));
  localStorage.setItem('landforge_transactions', JSON.stringify(generateMockTransactions()));
  localStorage.setItem(INIT_KEY, 'true');
}
