export type VehicleCategory =
  | 'SEDAN'
  | 'SUV'
  | 'EV'
  | 'HATCHBACK'
  | 'MOTORCYCLE'
  | 'VAN';

export interface VehicleEntity {
  id: string;
  userId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: VehicleCategory;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleData {
  userId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type?: VehicleCategory;
  isDefault?: boolean;
}

export interface IVehicleRepository {
  findById(id: string): Promise<VehicleEntity | null>;
  findByUserId(userId: string): Promise<VehicleEntity[]>;
  findByLicensePlate(plate: string): Promise<VehicleEntity | null>;
  create(data: CreateVehicleData): Promise<VehicleEntity>;
  update(id: string, updates: Partial<VehicleEntity>): Promise<VehicleEntity | null>;
  delete(id: string): Promise<boolean>;
  setDefault(userId: string, vehicleId: string): Promise<void>;
}
