import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginInputDto } from './dto/login.dto';
import { Role } from './role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Mock auth service
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
      };

      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        name: 'John',
        role: Role.VIEWER,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
      };

      const error = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginInputDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt_token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: Role.VIEWER,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginInputDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          role: Role.VIEWER,
        },
        {
          id: '2',
          email: 'user2@example.com',
          role: Role.ADMIN,
        },
      ];

      mockAuthService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = '1';
      const expectedUser = {
        id: userId,
        email: 'user@example.com',
        role: Role.VIEWER,
      };

      mockAuthService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(+userId);
      expect(result).toEqual(expectedUser);
    });

    it('should handle user not found', async () => {
      const userId = '999';
      const error = new Error('User not found');

      mockAuthService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(userId)).rejects.toThrow(error);
      expect(service.findOne).toHaveBeenCalledWith(+userId);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = '1';
      const expectedResult = { deleted: true };

      mockAuthService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(+userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle removal errors', async () => {
      const userId = '999';
      const error = new Error('User not found');

      mockAuthService.remove.mockRejectedValue(error);

      await expect(controller.remove(userId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(+userId);
    });
  });
});