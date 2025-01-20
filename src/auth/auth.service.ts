import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { LoginInputDto } from './dto/login.dto';
import { user } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    // private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerInputPayload: RegisterDto) {
    const { name, email, password } = registerInputPayload;
    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = this.generateTokens({
      userId: user.id,
      userRole: user.role,
    });
    return accessToken;
  }

  generateTokens(payload: { userId: string; userRole: string }) {
    return {
      accessToken: this.generateAccessToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES'),
    });
  }

  async login(loginInput: LoginInputDto) {
    const { email, password } = loginInput;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for Email Id : ${email}`);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('invalid email or password');
    }
    const accessToken = this.generateTokens({
      userId: user.id,
      userRole: user.role,
    });
    return accessToken;
  }

  async validateUser(userId: string): Promise<user> {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
