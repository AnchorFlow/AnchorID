import { PartialType } from '@nestjs/swagger';
import { CreateIdentityProfileDto } from './create-identity-profile.dto';

export class UpdateIdentityProfileDto extends PartialType(CreateIdentityProfileDto) {}
