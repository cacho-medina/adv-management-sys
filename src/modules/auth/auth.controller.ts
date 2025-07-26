import { Controller, Post, Query, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDto, LoginDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create-account')
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    const user = await this.authService.createAccount(createAccountDto);
    return {
      message: 'Cuenta creada correctamente',
      user,
    };
  }

  @Post('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('resend-verification')
  async resendVerificationEmail(@Body() email: { email: string }) {
    return this.authService.resendVerificationEmail(email.email);
  }

  @Post('forgot-password')
  async requestReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

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

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

/* @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    
  } */

/**
 * Callback de Google OAuth
 * Procesa la respuesta de Google y autentica al usuario
 */
/* @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.processOAuthLogin(user);

    // Redirigir al frontend con el token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.access_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

    res.redirect(redirectUrl);
  }

  

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard, EmailConfirmedGuard)
  getProtectedRoute(@Req() req: Request) {
    return {
      message: 'Ruta protegida - Email verificado',
      user: req.user,
    };
  }

   */
