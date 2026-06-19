import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedAnchor } from '../guards/api-key.guard';

export const CurrentAnchor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedAnchor => {
    const request = ctx.switchToHttp().getRequest();
    return request.anchor;
  },
);
