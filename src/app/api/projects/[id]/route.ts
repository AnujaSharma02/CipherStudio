import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const project = await Project.findById(id).populate('userId', 'username');
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            if (decoded && project.userId.toString() === decoded.userId) {
                return NextResponse.json({ project });
            }
        }

        if (!project.isPublic) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Project fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const project = await Project.findOneAndUpdate(
            { _id: id, userId: decoded.userId },
            { name, description, isPublic, tags },
            { new: true, runValidators: true }
        );

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('Project update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const project = await Project.findOneAndDelete({
            _id: id,
            userId: decoded.userId
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Project deletion error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
