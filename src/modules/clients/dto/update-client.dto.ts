import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsUUID } from 'class-validator';

/*

✅ UpdateClientDto :

- Basado en CreateClientDto pero excluyendo businessId
- Todos los campos opcionales para actualizaciones parciales

*/

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsUUID()
  id: string;
}
