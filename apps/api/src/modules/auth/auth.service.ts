import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '@tm/data';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return { accessToken: await this.jwt.signAsync(payload) };
  }

  async devRegister(dto: RegisterDto) {
    const count = await this.users.count();
    if (count > 0) {
      throw new BadRequestException('Registration disabled after initial seed. Use SEED_ON_BOOT for demo users.');
    }

    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: Role.Owner,
      organizationId: dto.organizationId,
    });

    await this.users.save(user);

    return { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId };
  }
}
