export type UserRole = 'landlord' | 'buyer';
export type AccountType = 'personal' | 'business';
export type BuyerPreference = 'buy' | 'rent' | 'both';
export type ListingPurpose = 'sale' | 'rent';
export type PropertyType = 'land' | 'house' | 'apartment';

export type ListingStatus = 'draft' | 'submitted' | 'ai_review' | 'verified' | 'rejected' | 'needs_correction' | 'live' | 'sold' | 'rented';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered';
export type InquiryStatus = 'new' | 'read' | 'replied' | 'accepted' | 'rejected';
export type TransactionStage = 'awaiting_payment' | 'payment_received' | 'escrow_holding' | 'documents_completed' | 'ready_for_release' | 'funds_released';

export type RiskLevel = 'low' | 'moderate' | 'high';
export type RiskRecommendation = 'strong_buy' | 'good_rental' | 'moderate_risk' | 'high_risk';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountType?: AccountType;
  businessName?: string;
  buyerPreference?: BuyerPreference;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  type: PropertyType;
  purpose: ListingPurpose;
  price: number;
  state: string;
  city: string;
  address: string;
  description: string;
  plotSize?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  parking?: boolean;
  powerSupply?: string;
  waterSupply?: string;
  security?: string;
  condition?: string;
  yearBuilt?: string;
  amenities?: string[];
  images: string[];
  documents: DocumentInfo[];
  status: ListingStatus;
  riskReport?: RiskReport;
  views: number;
  saves: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentInfo {
  name: string;
  type: string;
  status: 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface RiskReport {
  overallScore: number;
  level: RiskLevel;
  recommendation: RiskRecommendation;
  floodRisk: number;
  powerReliability: number;
  developmentPotential: number;
  titleConfidence: number;
  rentalYield?: number;
  appreciationPotential: number;
  summary: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  buyerId: string;
  buyerName: string;
  intention: 'buy' | 'rent';
  message: string;
  contactMethod: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  landlordId: string;
  amount: number;
  message: string;
  timeline: string;
  status: OfferStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  landlordId: string;
  amount: number;
  stage: TransactionStage;
  offerId: string;
  createdAt: string;
  updatedAt: string;
}
