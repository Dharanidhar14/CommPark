import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { IUserRepository, UserEntity, Role } from '../repositories/IUserRepository';
import { IWalletRepository } from '../repositories/IWalletRepository';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  activeRole: Role;
  eligibleRoles: Role[];
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone: string;
  city?: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<{ user: UserEntity; token: string }>;
  login(data: LoginDTO): Promise<{ user: UserEntity; token: string }>;
  verifyToken(token: string): Promise<AuthUserPayload>;
  hashPassword(password: string): Promise<string>;
  comparePassword(plain: string, hash: string): Promise<boolean>;
}

export class JwtAuthService implements IAuthService {
  constructor(
    private userRepo: IUserRepository,
    private walletRepo: IWalletRepository
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  generateToken(user: UserEntity): string {
    const payload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      activeRole: user.activeRole,
      eligibleRoles: user.eligibleRoles,
    };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  async register(data: RegisterDTO): Promise<{ user: UserEntity; token: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(data.password);
    const assignedRole: Role = data.role || 'CUSTOMER';

    const user = await this.userRepo.create({
      email: data.email,
      passwordHash,
      name: data.name,
      phone: data.phone,
      city: data.city || 'Bengaluru',
      activeRole: assignedRole,
      eligibleRoles: [assignedRole],
    });

    // Create wallet for new user
    await this.walletRepo.createWallet(user.id);

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(data: LoginDTO): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await this.comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async verifyToken(token: string): Promise<AuthUserPayload> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      return decoded;
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }
}
