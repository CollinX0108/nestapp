import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenBlacklistService {
  private blacklist: Set<string> = new Set();

  constructor(private jwtService: JwtService) {}

  addToBlacklist(token: string): void {
    this.blacklist.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  removeExpiredTokens(): void {
    for (const token of this.blacklist) {
      try {
        const decoded = this.jwtService.verify(token);
        if (Date.now() >= decoded.exp * 1000) {
          this.blacklist.delete(token);
        }
      } catch (error) {
        // Token is invalid or expired, remove it from blacklist
        this.blacklist.delete(token);
      }
    }
  }
}