export interface TripPreferences {
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  interests: string[];
}

export interface Trip {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  duration: string;
  destination: string;
  itinerary: string[];
  preferences: TripPreferences;
}
export interface GeneratedTrip {
  title: string;
  description: string;
  itinerary: string[];
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  startDate?: Date;
  endDate?: Date;
  imageUrl: string;
  likes?: number;
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: TripPreferences;
}

export interface SavedTrip extends GeneratedTrip {
  _id: string;
  userId: string;
}
