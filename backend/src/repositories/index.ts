import { env } from '../config/env';
import { prisma } from '../prisma';
import { logger } from '../config/logger';

import { IUserRepository } from './IUserRepository';
import { IVehicleRepository } from './IVehicleRepository';
import { IParkingRepository } from './IParkingRepository';
import { IBookingRepository } from './IBookingRepository';
import { IWalletRepository } from './IWalletRepository';
import { ICommunityRepository } from './ICommunityRepository';
import { ISecurityRepository } from './ISecurityRepository';
import { IReviewRepository } from './IReviewRepository';
import { ISupportRepository } from './ISupportRepository';
import { IAuditRepository } from './IAuditRepository';

import { MemoryUserRepository } from './memory/MemoryUserRepository';
import { MemoryVehicleRepository } from './memory/MemoryVehicleRepository';
import { MemoryParkingRepository } from './memory/MemoryParkingRepository';
import { MemoryBookingRepository } from './memory/MemoryBookingRepository';
import { MemoryWalletRepository } from './memory/MemoryWalletRepository';
import { MemoryCommunityRepository } from './memory/MemoryCommunityRepository';
import { MemorySecurityRepository } from './memory/MemorySecurityRepository';
import { MemoryReviewRepository } from './memory/MemoryReviewRepository';
import { MemorySupportRepository } from './memory/MemorySupportRepository';
import { MemoryAuditRepository } from './memory/MemoryAuditRepository';
import { createInitialSeedData } from './memory/seedData';

import { PrismaUserRepository } from './prisma/PrismaUserRepository';
import { PrismaVehicleRepository } from './prisma/PrismaVehicleRepository';
import { PrismaParkingRepository } from './prisma/PrismaParkingRepository';
import { PrismaBookingRepository } from './prisma/PrismaBookingRepository';
import { PrismaWalletRepository } from './prisma/PrismaWalletRepository';
import { PrismaCommunityRepository } from './prisma/PrismaCommunityRepository';
import { PrismaSecurityRepository } from './prisma/PrismaSecurityRepository';
import { PrismaReviewRepository } from './prisma/PrismaReviewRepository';
import { PrismaSupportRepository } from './prisma/PrismaSupportRepository';
import { PrismaAuditRepository } from './prisma/PrismaAuditRepository';

export interface RepositoryContainer {
  userRepository: IUserRepository;
  vehicleRepository: IVehicleRepository;
  parkingRepository: IParkingRepository;
  bookingRepository: IBookingRepository;
  walletRepository: IWalletRepository;
  communityRepository: ICommunityRepository;
  securityRepository: ISecurityRepository;
  reviewRepository: IReviewRepository;
  supportRepository: ISupportRepository;
  auditRepository: IAuditRepository;
}

export function createRepositories(forceMemory: boolean = false): RepositoryContainer {
  const useMemory = forceMemory || env.USE_MEMORY_DB === true;

  if (useMemory) {
    logger.info('Initializing In-Memory Repositories with standard Bengaluru seeds');
    const seeds = createInitialSeedData();
    return {
      userRepository: new MemoryUserRepository(seeds.users),
      vehicleRepository: new MemoryVehicleRepository(seeds.vehicles),
      parkingRepository: new MemoryParkingRepository(seeds.listings),
      bookingRepository: new MemoryBookingRepository(seeds.bookings),
      walletRepository: new MemoryWalletRepository(seeds.wallets, seeds.transactions),
      communityRepository: new MemoryCommunityRepository(seeds.communities, seeds.approvals, seeds.memberships),
      securityRepository: new MemorySecurityRepository(),
      reviewRepository: new MemoryReviewRepository(seeds.reviews),
      supportRepository: new MemorySupportRepository(seeds.tickets),
      auditRepository: new MemoryAuditRepository(seeds.auditLogs),
    };
  }

  logger.info('Initializing Prisma PostgreSQL Repositories');
  return {
    userRepository: new PrismaUserRepository(prisma),
    vehicleRepository: new PrismaVehicleRepository(prisma),
    parkingRepository: new PrismaParkingRepository(prisma),
    bookingRepository: new PrismaBookingRepository(prisma),
    walletRepository: new PrismaWalletRepository(prisma),
    communityRepository: new PrismaCommunityRepository(prisma),
    securityRepository: new PrismaSecurityRepository(prisma),
    reviewRepository: new PrismaReviewRepository(prisma),
    supportRepository: new PrismaSupportRepository(prisma),
    auditRepository: new PrismaAuditRepository(prisma),
  };
}

export const repositories = createRepositories();
