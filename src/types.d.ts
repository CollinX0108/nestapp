import { Role } from './users/role.enum';

declare global {
  namespace Express {
    interface User {
      userId: number;
      username: string;
      role: Role;
    }
    
    interface Request {
      user?: User;
    }
  }
}