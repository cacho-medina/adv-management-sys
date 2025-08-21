import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsUUID()
  businessId: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'DNI debe tener exactamente 8 dígitos numéricos',
  })
  dni?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[+]?[0-9\s\-()]+$/, {
    message: 'Formato de teléfono inválido',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;
}
