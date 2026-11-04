import { create } from 'zustand';
import { Review } from '../types/review';

interface ReviewState {
  reviews: Review[];

  // Actions
  addReview: (
    data: Omit<Review, 'id' | 'createdAt' | 'isDemoReview'>
  ) => Review;
  hasReviewedBooking: (bookingId: string) => boolean;
  getReviewForBooking: (bookingId: string) => Review | undefined;
  getReviewsForSpace: (spaceId: string) => Review[];
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_01',
    bookingId: 'bk_prev_blr_4410',
    spaceId: 'space_03',
    userId: 'usr_aditya_01',
    userName: 'Aditya Sharma',
    overallRating: 5,
    parkingExperience: 5,
    accessExperience: 5,
    cleanlinessSuitability: 5,
    comment: 'Super easy access right by 100 Feet Road! Keypad code worked instantly on arrival. Clean, well-lit driveway.',
    createdAt: '03 Nov 2026',
    isDemoReview: true,
  },
  {
    id: 'rev_02',
    bookingId: 'bk_mock_rev_02',
    spaceId: 'space_01',
    userId: 'usr_priya_m',
    userName: 'Priya Mukherjee',
    overallRating: 5,
    parkingExperience: 5,
    accessExperience: 4,
    cleanlinessSuitability: 5,
    comment: 'Security guards at Gate 2 were very helpful and scanned my QR code without delay. Basement bay is wide enough for my SUV.',
    createdAt: '01 Nov 2026',
    isDemoReview: true,
  },
  {
    id: 'rev_03',
    bookingId: 'bk_mock_rev_03',
    spaceId: 'space_01',
    userId: 'usr_karan_s',
    userName: 'Karan Shenoy',
    overallRating: 4,
    parkingExperience: 4,
    accessExperience: 4,
    cleanlinessSuitability: 5,
    comment: 'Great covered spot in Indiranagar. Remember to follow 10 km/h speed limit on the internal basement ramp.',
    createdAt: '28 Oct 2026',
    isDemoReview: true,
  },
  {
    id: 'rev_04',
    bookingId: 'bk_mock_rev_04',
    spaceId: 'space_06',
    userId: 'usr_neha_p',
    userName: 'Neha Patel',
    overallRating: 5,
    parkingExperience: 5,
    accessExperience: 5,
    cleanlinessSuitability: 5,
    comment: 'Fantastic driveway spot in Bandra. Host was very communicative and portico gate was opened promptly.',
    createdAt: '27 Oct 2026',
    isDemoReview: true,
  },
];

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: INITIAL_REVIEWS,

  addReview: (data) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      createdAt: 'Today',
      isDemoReview: true,
      ...data,
    };

    set((state) => ({
      reviews: [newRev, ...state.reviews],
    }));

    return newRev;
  },

  hasReviewedBooking: (bookingId: string) => {
    return get().reviews.some((r) => r.bookingId === bookingId);
  },

  getReviewForBooking: (bookingId: string) => {
    return get().reviews.find((r) => r.bookingId === bookingId);
  },

  getReviewsForSpace: (spaceId: string) => {
    return get().reviews.filter((r) => r.spaceId === spaceId);
  },
}));
