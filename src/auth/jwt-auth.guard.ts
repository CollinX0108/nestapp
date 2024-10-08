import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard - Intentando activar');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    console.log('JwtAuthGuard - Manejando solicitud', { err, user, info, status });
    if (err || !user) {
      console.log('JwtAuthGuard - Error o usuario no encontrado');
    }
    return super.handleRequest(err, user, info, context, status);
  }
}