import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Access token required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const { name, description, isPublic, tags } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        const project = new Project({
            name,
            description: description || '',
            userId: decoded.userId,
            isPublic: isPublic || false,
            tags: tags || []
        });

        await project.save();

        return NextResponse.json({
            message: 'Project created successfully',
            project
        }, { status: 201 });
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Access token required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const search = searchParams.get('search');
        const skip = (page - 1) * limit;

        const query: { userId: string; $or?: Array<{ name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string }; tags?: { $in: RegExp[] } }> } = { userId: decoded.userId };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const projects = await Project.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username');

        const total = await Project.countDocuments(query);

        return NextResponse.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Projects fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
