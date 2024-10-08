import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Almacenamos el contexto para usarlo en handleRequest
    (this as any).context = context;
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    const context = (this as any).context;
    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('No se ha iniciado sesión');
    }

    if (err || !user) {
      throw new UnauthorizedException('Token no válido o expirado');
    }

    return user;
  }

  private extractJwtFromRequest(request): string | null {
    if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
      return request.headers.authorization.split(' ')[1];
    }
    return null;
  }
}