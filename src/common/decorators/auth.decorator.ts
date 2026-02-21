import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './role.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';

export function Auth(...roles: string[]) {
    return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RoleGuard));
}

Auth('user', 'admin'); 
// [ ] >> 'user', 'admin' >> [ ] >> 'user', 'admin' >> ... >> 'user', 'admin' 