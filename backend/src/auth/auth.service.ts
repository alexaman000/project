import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, _id: user._id },
    };
  }

  async register(email: string, pass: string) {
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(pass, saltOrRounds);
    const user = await this.usersService.create(email, passwordHash);

    // Automatically log the user in after registration
    return this.login(user);
  }
}
