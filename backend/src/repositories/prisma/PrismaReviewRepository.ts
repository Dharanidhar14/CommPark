import { PrismaClient } from '@prisma/client';
import { IReviewRepository, ReviewEntity } from '../IReviewRepository';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(r: any): ReviewEntity {
    return {
      id: r.id,
      bookingId: r.bookingId,
      listingId: r.listingId,
      userId: r.userId,
      userName: r.user ? r.user.name : undefined,
      overallRating: r.overallRating,
      parkingExperience: r.parkingExperience,
      accessExperience: r.accessExperience,
      cleanlinessSuitability: r.cleanlinessSuitability,
      comment: r.comment,
      isDemoReview: r.isDemoReview,
      createdAt: r.createdAt,
    };
  }

  async create(data: Omit<ReviewEntity, 'id' | 'createdAt'>): Promise<ReviewEntity> {
    const { userName, ...dbData } = data;
    const r = await this.prisma.review.create({
      data: dbData,
      include: { user: { select: { name: true } } },
    });
    return this.mapToEntity(r);
  }

  async findByBookingId(bookingId: string): Promise<ReviewEntity | null> {
    const r = await this.prisma.review.findUnique({
      where: { bookingId },
      include: { user: { select: { name: true } } },
    });
    return r ? this.mapToEntity(r) : null;
  }

  async findByListingId(listingId: string): Promise<ReviewEntity[]> {
    const items = await this.prisma.review.findMany({
      where: { listingId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }
}
