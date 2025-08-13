import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CompleteProfileDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('complete-profile')
  createProfile(
    @Req() req: any,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    const { user } = req;
    return this.userService.completeProfile(user.id, completeProfileDto);
  }
}
