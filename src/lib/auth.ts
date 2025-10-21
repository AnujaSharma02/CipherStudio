import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';

export interface AuthUser {
    userId: string;
    username: string;
    email: string;
}

export interface NextApiRequestWithUser extends NextApiRequest {
    user: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: AuthUser): string => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): AuthUser | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch {
        return null;
    }
};

export const authenticateToken = async (
    req: NextApiRequestWithUser,
    res: NextApiResponse,
    next: () => void
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(403).json({ error: 'User not found' });
            return;
        }

        req.user = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
