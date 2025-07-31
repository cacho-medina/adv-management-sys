import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* @Post('create-employee')
  async createEmployee(@Body() newEmployee: CreateEmployeeDto) {
    return this.userService.createEmployee(newEmployee);
  } */
}
