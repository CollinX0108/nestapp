import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('RolesGuard - Roles requeridos:', requiredRoles);

    if (!requiredRoles) {
      console.log('RolesGuard - No se requieren roles específicos');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard - Usuario:', user);

    if (!user || !user.role) {
      console.log('RolesGuard - No se encontró usuario o rol');
      throw new ForbiddenException('No se pudo verificar el rol del usuario');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    console.log(`RolesGuard - Usuario tiene el rol requerido: ${hasRole}`);

    if (!hasRole) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }

    return hasRole;
  }
}