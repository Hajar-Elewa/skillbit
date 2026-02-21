import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
    //const roles = this.reflector.get(Roles, context.getHandler()); //reflector way to get the metadata
    const roles = this.reflector.get('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    console.log(request.user.role);
    if (!roles.includes(request.user.role)) {
    throw new UnauthorizedException('not allowed for you');
    }
    return true;
    }
}

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   async canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }
//     const request = context.switchToHttp().getRequest<AuthReq>(); //مفيش await عشان هو sync  و ليس async
//     const user = request.user;
//     if (!user) {
//       throw new ForbiddenException('User not found in request');
//     }
//     if (
//       !requiredRoles.includes(user.role) &&
//       user.role !== RoleEnum.SUPER_ADMIN
//     ) {
//       throw new ForbiddenException(
//         'You do not have permission to perform this action',
//       );
//     }
   
//     return true;
//   }
// }