export interface PostPreferences {
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  interests: string[];
}

export interface PostComment {
  _id: string;
  text: string;
  user: {
    _id: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  image?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  price?: number;
  maxSeats?: number;
  bookedSeats?: number;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
  user?: {
    _id: string;
    email: string;
    avatar?: string;
  };
  likes: string[];
  comments: PostComment[];
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  destination?: string;
  duration: string;
  itinerary?: string[];
  preferences?: PostPreferences;
}

export interface GeneratedPost {
  title: string;
  description: string;
  itinerary?: string[];
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  startDate?: Date | string;
  endDate?: Date | string;
  imageUrl?: string;
  likes?: string[];
  comments?: PostComment[];
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: PostPreferences;
}

export interface SavedPost {
  _id: string;
  title: string;
  description: string;
  itinerary?: string[];
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt: Date;
  userId?: string;
  comments: PostComment[];
  likes: string[];
}

export interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
      errors?: { field: string; message: string }[];
    };
    status?: number;
  };
}
