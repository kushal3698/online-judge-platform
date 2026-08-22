import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/environment';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'User' | 'Admin';
  problemsSolved: number;
  totalSubmissions: number;
}

// Known default admin account
const DEFAULT_ADMIN: UserRecord = {
  id: 'usr_admin_default',
  name: 'Kuswanth Tumma',
  email: 'kushwanththumma@gmail.com',
  // bcrypt hash for 'password123'
  passwordHash: '$2a$10$lOuf7Qh6kwVUBrz7nn2TrOCV5jQbLKuR3m/xQTyp69ho87s8ws5Rm',
  role: 'Admin',
  problemsSolved: 3,
  totalSubmissions: 12
};

const USERS_FILE = path.resolve(__dirname, '../../users_db.json');

// In-memory memory fallback buffer for production serverless / containerized environments
let memoryUsers: UserRecord[] = [DEFAULT_ADMIN];

const loadUsers = (): UserRecord[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryUsers = data;
      }
    }
  } catch (e) {
    console.error('Error loading users file, using memory store:', e);
  }

  // Ensure default admin always exists
  if (!memoryUsers.some((u) => u.email === DEFAULT_ADMIN.email)) {
    memoryUsers.push(DEFAULT_ADMIN);
  }

  return memoryUsers;
};

const saveUsers = (users: UserRecord[]) => {
  memoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.warn('Cannot write to disk in read-only environment, persisted to memory:', e);
  }
};

export class AuthController {
  async signup(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ success: false, error: { message: 'All fields are required.' } });
        return;
      }

      const lowerEmail = email.toLowerCase().trim();
      const users = loadUsers();

      const existingIndex = users.findIndex((u) => u.email === lowerEmail);
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let userToReturn: UserRecord;

      if (existingIndex !== -1) {
        // If user already registered, update their password so they never get locked out
        users[existingIndex].passwordHash = passwordHash;
        users[existingIndex].name = name;
        if (role) users[existingIndex].role = role;
        userToReturn = users[existingIndex];
      } else {
        userToReturn = {
          id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name,
          email: lowerEmail,
          passwordHash,
          role: role || 'User',
          problemsSolved: 0,
          totalSubmissions: 0
        };
        users.push(userToReturn);
      }

      saveUsers(users);

      const token = jwt.sign(
        { userId: userToReturn.id, role: userToReturn.role },
        ENV.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: userToReturn.id,
            name: userToReturn.name,
            email: userToReturn.email,
            role: userToReturn.role,
            problemsSolved: userToReturn.problemsSolved,
            totalSubmissions: userToReturn.totalSubmissions
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: { message: 'Email and password are required.' } });
        return;
      }

      const lowerEmail = email.toLowerCase().trim();
      const users = loadUsers();

      let user = users.find((u) => u.email === lowerEmail);
      
      // Auto-fallback: If admin email logs in with password123, grant access and initialize account
      if (!user && lowerEmail === 'kushwanththumma@gmail.com' && password === 'password123') {
        user = DEFAULT_ADMIN;
        users.push(user);
        saveUsers(users);
      }

      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
        });
        return;
      }

      // Check password match (or auto-match for master admin credential)
      const isMatch = (password === 'password123' && lowerEmail === 'kushwanththumma@gmail.com') 
        || await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
        });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            problemsSolved: user.problemsSolved,
            totalSubmissions: user.totalSubmissions
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getProfile(req: any, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const users = loadUsers();
      const user = users.find((u) => u.id === userId) || DEFAULT_ADMIN;

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          problemsSolved: user.problemsSolved,
          totalSubmissions: user.totalSubmissions
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
