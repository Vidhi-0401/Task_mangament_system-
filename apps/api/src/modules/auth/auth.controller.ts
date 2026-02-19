import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@tm/auth';
import { LoginDto, RegisterDto } from './dtos';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /**
   * Dev-friendly register.
   * Tradeoff: In production this should be invite-only or admin-created.
   * Guardrail: If users already exist (e.g., from seed), registration is disabled.
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.devRegister(dto);
  }
}
