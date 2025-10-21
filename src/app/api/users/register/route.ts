import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            email: user.email
        });

        return NextResponse.json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
