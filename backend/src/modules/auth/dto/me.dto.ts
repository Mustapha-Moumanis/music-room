import { ApiProperty } from '@nestjs/swagger';
import { IdentityProvider } from '@prisma/client';

export class MeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty()
  hasPassword!: boolean;

  @ApiProperty({ enum: IdentityProvider, isArray: true })
  providers!: IdentityProvider[];
}
