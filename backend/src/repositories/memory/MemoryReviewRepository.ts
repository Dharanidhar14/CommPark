import {
  IReviewRepository,
  ReviewEntity,
} from '../IReviewRepository';

export class MemoryReviewRepository implements IReviewRepository {
  private reviews: Map<string, ReviewEntity> = new Map();

  constructor(initialReviews: ReviewEntity[] = []) {
    for (const r of initialReviews) {
      this.reviews.set(r.id, { ...r });
    }
  }

  async create(data: Omit<ReviewEntity, 'id' | 'createdAt'>): Promise<ReviewEntity> {
    // Prevent duplicate reviews for the same booking
    for (const existing of this.reviews.values()) {
      if (existing.bookingId === data.bookingId) {
        throw new Error('A review has already been submitted for this booking.');
      }
    }

    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const review: ReviewEntity = {
      ...data,
      id,
      createdAt: now,
    };
    this.reviews.set(id, review);
    return { ...review };
  }

  async findByBookingId(bookingId: string): Promise<ReviewEntity | null> {
    for (const r of this.reviews.values()) {
      if (r.bookingId === bookingId) {
        return { ...r };
      }
    }
    return null;
  }

  async findByListingId(listingId: string): Promise<ReviewEntity[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.listingId === listingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => ({ ...r }));
  }
}
