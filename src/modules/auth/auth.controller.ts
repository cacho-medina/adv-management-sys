import { Controller, Post, Query, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDto, LoginDto } from './dto/create-auth.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('create-account')
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.authService.createAccount(createAccountDto);
  }

  @Public()
  @Post('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    return this.authService.confirmEmail(token, res);
  }

  @Public()
  @Post('resend-verification')
  async resendVerificationEmail(@Body() email: { email: string }) {
    console.log(email);
    return this.authService.resendVerificationEmail(email.email);
  }

  @Public()
  @Post('forgot-password')
  async requestReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Public()
  @Post('reset-password')
  async reset(
    @Body() dto: { token: string; newPassword: string; repeatPassword: string },
  ) {
    return this.authService.resetPassword(
      dto.token,
      dto.newPassword,
      dto.repeatPassword,
    );
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }
}
