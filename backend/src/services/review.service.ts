import { IReviewRepository, ReviewEntity } from '../repositories/IReviewRepository';
import { IBookingRepository } from '../repositories/IBookingRepository';
import { IParkingRepository } from '../repositories/IParkingRepository';
import { IUserRepository } from '../repositories/IUserRepository';

export interface CreateReviewDTO {
  bookingId: string;
  overallRating: number;
  parkingExperience?: number;
  accessExperience?: number;
  cleanlinessSuitability?: number;
  comment: string;
}

export class ReviewService {
  constructor(
    private reviewRepo: IReviewRepository,
    private bookingRepo: IBookingRepository,
    private parkingRepo: IParkingRepository,
    private userRepo: IUserRepository
  ) {}

  async createReview(userId: string, data: CreateReviewDTO): Promise<ReviewEntity> {
    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.customerId !== userId) {
      throw new Error('Unauthorized: only the booking customer can submit a review.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Reviews can only be submitted for completed parking sessions.');
    }

    const existing = await this.reviewRepo.findByBookingId(data.bookingId);
    if (existing) {
      throw new Error('You have already submitted a review for this booking.');
    }

    const user = await this.userRepo.findById(userId);

    const review = await this.reviewRepo.create({
      bookingId: booking.id,
      listingId: booking.listingId,
      userId,
      userName: user?.name || 'Verified Customer',
      overallRating: data.overallRating,
      parkingExperience: data.parkingExperience || data.overallRating,
      accessExperience: data.accessExperience || data.overallRating,
      cleanlinessSuitability: data.cleanlinessSuitability || data.overallRating,
      comment: data.comment.trim(),
      isDemoReview: false,
    });

    // Update listing rating average and count
    const allReviews = await this.reviewRepo.findByListingId(booking.listingId);
    const totalScore = allReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avgRating = Math.round((totalScore / allReviews.length) * 100) / 100;

    await this.parkingRepo.update(booking.listingId, {
      rating: avgRating,
      reviewCount: allReviews.length,
    });

    return review;
  }

  async getListingReviews(listingId: string): Promise<ReviewEntity[]> {
    return this.reviewRepo.findByListingId(listingId);
  }
}
