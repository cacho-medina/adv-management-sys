import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CompleteProfileDto } from './dto/create-user.dto';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('complete-profile')
  createProfile(
    @Req() req: any,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    const { user } = req;
    return this.userService.completeProfile(user.id, completeProfileDto);
  }
  @Patch('change-password')
  changePassword(@Req() req: any, @Body() newPassword: string) {
    const { user } = req;
    return this.userService.changePassword(user.id, newPassword);
  }
  @Get('me')
  getProfile(@Req() req: any) {
    const { user } = req;
    return this.userService.getProfile(user.id);
  }

  @Post('accept-invitation')
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Req() req: any,
  ): Promise<{ message: string; business?: any }> {
    const { user } = req;
    return this.userService.acceptInvitation(user.id, acceptInvitationDto);
  }
}
