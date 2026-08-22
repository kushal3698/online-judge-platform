import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser, UserRole } from '../models/user.model';
import { ENV } from '../config/environment';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    problemsSolved: number;
    totalSubmissions: number;
  };
}

export class AuthService {
  async registerUser(input: SignupInput): Promise<AuthResponse> {
    const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      const error: any = new Error('Email is already registered.');
      error.statusCode = 400;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const newUser: IUser = await UserModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role || UserRole.USER
    });

    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        problemsSolved: newUser.problemsSolved,
        totalSubmissions: newUser.totalSubmissions
      }
    };
  }

  async loginUser(input: LoginInput): Promise<AuthResponse> {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions
      }
    };
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}
