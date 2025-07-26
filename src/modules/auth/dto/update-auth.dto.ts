import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAccountDto) {}
