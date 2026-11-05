import { PrismaClient, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { IVehicleRepository, VehicleEntity, CreateVehicleData, VehicleCategory } from '../IVehicleRepository';

export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<VehicleEntity | null> {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!v) return null;
    return {
      ...v,
      type: v.type as VehicleCategory,
    };
  }

  async findByUserId(userId: string): Promise<VehicleEntity[]> {
    const list = await this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((v) => ({
      ...v,
      type: v.type as VehicleCategory,
    }));
  }

  async findByLicensePlate(plate: string): Promise<VehicleEntity | null> {
    const v = await this.prisma.vehicle.findUnique({
      where: { licensePlate: plate.toUpperCase().trim() },
    });
    if (!v) return null;
    return {
      ...v,
      type: v.type as VehicleCategory,
    };
  }

  async create(data: CreateVehicleData): Promise<VehicleEntity> {
    if (data.isDefault) {
      await this.prisma.vehicle.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }

    const v = await this.prisma.vehicle.create({
      data: {
        userId: data.userId,
        licensePlate: data.licensePlate.toUpperCase().trim(),
        make: data.make.trim(),
        model: data.model.trim(),
        color: data.color.trim(),
        type: (data.type as PrismaVehicleCategory) || PrismaVehicleCategory.SEDAN,
        isDefault: data.isDefault ?? false,
      },
    });

    return {
      ...v,
      type: v.type as VehicleCategory,
    };
  }

  async update(id: string, updates: Partial<VehicleEntity>): Promise<VehicleEntity | null> {
    try {
      const existing = await this.prisma.vehicle.findUnique({ where: { id } });
      if (!existing) return null;

      if (updates.isDefault && existing.userId) {
        await this.prisma.vehicle.updateMany({
          where: { userId: existing.userId, NOT: { id } },
          data: { isDefault: false },
        });
      }

      const data: any = { ...updates };
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      const v = await this.prisma.vehicle.update({
        where: { id },
        data,
      });

      return {
        ...v,
        type: v.type as VehicleCategory,
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.vehicle.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async setDefault(userId: string, vehicleId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.vehicle.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { isDefault: true },
      }),
    ]);
  }
}
