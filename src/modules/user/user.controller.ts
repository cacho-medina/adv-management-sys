import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateOwnerDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* @Post('create-employee')
  async createEmployee(@Body() newEmployee: CreateEmployeeDto) {
    return this.userService.createEmployee(newEmployee);
  } */

  @Post('create-profile')
  async createOwnerProfile(@Body() newOwner: CreateOwnerDto) {
    return this.userService.createOwnerProfile(newOwner);
  }
}
