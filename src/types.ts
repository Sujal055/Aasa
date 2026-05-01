export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'NGO' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export type RescueStatus = 'REPORTED' | 'ASSIGNED' | 'RESCUED' | 'CARE' | 'RELEASED';

export interface AnimalRecord {
  id: string;
  aasaId: string;
  species: string;
  breed?: string;
  condition: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: RescueStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporterId: string;
  volunteerId?: string;
  ngoId?: string;
  healthHistory: HealthHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  aiAssessment?: string;
}

export interface HealthHistoryEntry {
  date: string;
  type: 'VACCINATION' | 'STERILIZATION' | 'TREATMENT' | 'CHECKUP';
  description: string;
  performedBy: string;
}

export interface SOSReport {
  id: string;
  animalInfo: Partial<AnimalRecord>;
  timestamp: string;
}
