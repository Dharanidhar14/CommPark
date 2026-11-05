export interface ReviewEntity {
  id: string;
  bookingId: string;
  listingId: string;
  userId: string;
  userName?: string;
  overallRating: number;
  parkingExperience: number;
  accessExperience: number;
  cleanlinessSuitability: number;
  comment: string;
  isDemoReview: boolean;
  createdAt: Date;
}

export interface IReviewRepository {
  create(data: Omit<ReviewEntity, 'id' | 'createdAt'>): Promise<ReviewEntity>;
  findByBookingId(bookingId: string): Promise<ReviewEntity | null>;
  findByListingId(listingId: string): Promise<ReviewEntity[]>;
}
