import {
  IVehicleRepository,
  VehicleEntity,
  CreateVehicleData,
} from '../repositories/IVehicleRepository';
import { IBookingRepository } from '../repositories/IBookingRepository';

export class VehicleService {
  constructor(
    private vehicleRepo: IVehicleRepository,
    private bookingRepo: IBookingRepository
  ) {}

  async getUserVehicles(userId: string): Promise<VehicleEntity[]> {
    return this.vehicleRepo.findByUserId(userId);
  }

  async addVehicle(userId: string, data: Omit<CreateVehicleData, 'userId'>): Promise<VehicleEntity> {
    const existingPlate = await this.vehicleRepo.findByLicensePlate(data.licensePlate);
    if (existingPlate) {
      throw new Error('A vehicle with this registration plate is already registered in CommunityPark.');
    }

    const userVehicles = await this.vehicleRepo.findByUserId(userId);
    const isFirstVehicle = userVehicles.length === 0;

    return this.vehicleRepo.create({
      ...data,
      userId,
      isDefault: data.isDefault !== undefined ? data.isDefault : isFirstVehicle,
    });
  }

  async updateVehicle(
    userId: string,
    vehicleId: string,
    updates: Partial<VehicleEntity>
  ): Promise<VehicleEntity> {
    const existing = await this.vehicleRepo.findById(vehicleId);
    if (!existing) {
      throw new Error('Vehicle not found.');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized to update this vehicle.');
    }

    const updated = await this.vehicleRepo.update(vehicleId, updates);
    if (!updated) {
      throw new Error('Failed to update vehicle.');
    }
    return updated;
  }

  async deleteVehicle(userId: string, vehicleId: string): Promise<boolean> {
    const existing = await this.vehicleRepo.findById(vehicleId);
    if (!existing) {
      throw new Error('Vehicle not found.');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized to delete this vehicle.');
    }

    // Check for active or upcoming bookings with this vehicle
    const userBookings = await this.bookingRepo.findByCustomerId(userId);
    const hasActiveBooking = userBookings.some(
      (b) =>
        b.vehicleId === vehicleId &&
        (b.status === 'UPCOMING' || b.status === 'ACTIVE')
    );

    if (hasActiveBooking) {
      throw new Error(
        'Cannot remove vehicle linked to an active or upcoming parking reservation. Please complete or cancel the reservation first.'
      );
    }

    return this.vehicleRepo.delete(vehicleId);
  }

  async setDefaultVehicle(userId: string, vehicleId: string): Promise<void> {
    const existing = await this.vehicleRepo.findById(vehicleId);
    if (!existing || existing.userId !== userId) {
      throw new Error('Vehicle not found or unauthorized.');
    }
    await this.vehicleRepo.setDefault(userId, vehicleId);
  }
}
