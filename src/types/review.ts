export interface Review {
  id: string;
  bookingId: string;
  spaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  overallRating: number;
  parkingExperience: number;
  accessExperience: number;
  cleanlinessSuitability: number;
  comment: string;
  createdAt: string;
  isDemoReview: boolean;
}
