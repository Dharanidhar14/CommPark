import { IVehicleRepository, VehicleEntity, CreateVehicleData } from '../IVehicleRepository';

export class MemoryVehicleRepository implements IVehicleRepository {
  private vehicles: Map<string, VehicleEntity> = new Map();

  constructor(initialVehicles: VehicleEntity[] = []) {
    for (const v of initialVehicles) {
      this.vehicles.set(v.id, { ...v });
    }
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const v = this.vehicles.get(id);
    return v ? { ...v } : null;
  }

  async findByUserId(userId: string): Promise<VehicleEntity[]> {
    return Array.from(this.vehicles.values())
      .filter((v) => v.userId === userId)
      .map((v) => ({ ...v }));
  }

  async findByLicensePlate(plate: string): Promise<VehicleEntity | null> {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    for (const v of this.vehicles.values()) {
      if (v.licensePlate.replace(/\s+/g, '').toUpperCase() === cleanPlate) {
        return { ...v };
      }
    }
    return null;
  }

  async create(data: CreateVehicleData): Promise<VehicleEntity> {
    const id = `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    
    // If set as default, unset others for this user
    if (data.isDefault) {
      for (const [vId, v] of this.vehicles.entries()) {
        if (v.userId === data.userId && v.isDefault) {
          this.vehicles.set(vId, { ...v, isDefault: false });
        }
      }
    }

    const vehicle: VehicleEntity = {
      id,
      userId: data.userId,
      licensePlate: data.licensePlate.toUpperCase().trim(),
      make: data.make.trim(),
      model: data.model.trim(),
      color: data.color.trim(),
      type: data.type || 'SEDAN',
      isDefault: data.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.vehicles.set(id, vehicle);
    return { ...vehicle };
  }

  async update(id: string, updates: Partial<VehicleEntity>): Promise<VehicleEntity | null> {
    const existing = this.vehicles.get(id);
    if (!existing) return null;

    if (updates.isDefault && existing.userId) {
      for (const [vId, v] of this.vehicles.entries()) {
        if (v.userId === existing.userId && v.id !== id && v.isDefault) {
          this.vehicles.set(vId, { ...v, isDefault: false });
        }
      }
    }

    const updated: VehicleEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.vehicles.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  async setDefault(userId: string, vehicleId: string): Promise<void> {
    for (const [id, v] of this.vehicles.entries()) {
      if (v.userId === userId) {
        this.vehicles.set(id, { ...v, isDefault: id === vehicleId, updatedAt: new Date() });
      }
    }
  }
}
