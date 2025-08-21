import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { OmitType } from '@nestjs/mapped-types';

/*

✅ UpdateClientDto :

- Basado en CreateClientDto pero excluyendo businessId
- Todos los campos opcionales para actualizaciones parciales

*/

export class UpdateClientDto extends PartialType(
  OmitType(CreateClientDto, ['businessId'] as const),
) {}
