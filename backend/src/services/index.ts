import { repositories, RepositoryContainer } from '../repositories';
import { JwtAuthService, IAuthService } from './auth.service';
import { ParkingService } from './parking.service';
import { BookingService } from './booking.service';
import { WalletService } from './wallet.service';
import { CommunityService } from './community.service';
import { SecurityService } from './security.service';
import { ReviewService } from './review.service';
import { SupportService } from './support.service';
import { VehicleService } from './vehicle.service';

export interface ServiceContainer {
  authService: IAuthService;
  parkingService: ParkingService;
  bookingService: BookingService;
  walletService: WalletService;
  communityService: CommunityService;
  securityService: SecurityService;
  reviewService: ReviewService;
  supportService: SupportService;
  vehicleService: VehicleService;
}

export function createServices(repos: RepositoryContainer = repositories): ServiceContainer {
  const authService = new JwtAuthService(repos.userRepository, repos.walletRepository);
  const walletService = new WalletService(repos.walletRepository);
  const vehicleService = new VehicleService(repos.vehicleRepository, repos.bookingRepository);
  const parkingService = new ParkingService(
    repos.parkingRepository,
    repos.communityRepository,
    repos.bookingRepository
  );
  const bookingService = new BookingService(
    repos.bookingRepository,
    repos.parkingRepository,
    repos.vehicleRepository,
    walletService
  );
  const communityService = new CommunityService(
    repos.communityRepository,
    repos.parkingRepository,
    repos.auditRepository,
    repos.userRepository
  );
  const securityService = new SecurityService(
    repos.securityRepository,
    repos.bookingRepository,
    repos.vehicleRepository,
    walletService,
    bookingService
  );
  const reviewService = new ReviewService(
    repos.reviewRepository,
    repos.bookingRepository,
    repos.parkingRepository,
    repos.userRepository
  );
  const supportService = new SupportService(repos.supportRepository);

  return {
    authService,
    parkingService,
    bookingService,
    walletService,
    communityService,
    securityService,
    reviewService,
    supportService,
    vehicleService,
  };
}

export const services = createServices();
