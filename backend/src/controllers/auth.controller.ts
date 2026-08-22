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

const USERS_FILE = path.resolve(__dirname, '../../users_db.json');

const loadUsers = (): UserRecord[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading users file:', e);
  }
  return [];
};

const saveUsers = (users: UserRecord[]) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving users file:', e);
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
        // If user already registered, update their password so they never get stuck with "Invalid password"
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
        { expiresIn: '24h' }
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

      const user = users.find((u) => u.email === lowerEmail);
      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
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
        { expiresIn: '24h' }
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
      const user = users.find((u) => u.id === userId);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found.' } });
        return;
      }

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
