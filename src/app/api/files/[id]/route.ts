import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File, { IFile } from '@/models/File';
import { IProject } from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Access token required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const file = await File.findById(id).populate('projectId');
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const project = file.projectId as IProject;
        if (project.userId.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ file });
    } catch (error) {
        console.error('File fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Access token required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const { name, content, path } = await request.json();

        const file = await File.findById(id).populate('projectId');
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const project = file.projectId as IProject;
        if (project.userId.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const updateData: Partial<IFile> = {};
        if (name) {
            updateData.name = name;
        }
        if (path) {
            updateData.path = path;
        } else if (name) {
            if (file.parentId) {
                const parentFile = await File.findById(file.parentId);
                if (parentFile) {
                    updateData.path = `${parentFile.path}/${name}`;
                } else {
                    updateData.path = `/${name}`;
                }
            } else {
                updateData.path = `/${name}`;
            }
        }
        if (content !== undefined && file.type === 'file') {
            updateData.content = content;
            updateData.size = content.length;
        }

        const updatedFile = await File.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'File updated successfully',
            file: updatedFile
        });
    } catch (error) {
        console.error('File update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Access token required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
        }

        const file = await File.findById(id).populate('projectId');
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const project = file.projectId as IProject;
        if (project.userId.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        if (file.type === 'folder') {
            const childFiles = await File.find({ parentId: id });
            if (childFiles.length > 0) {
                return NextResponse.json({ error: 'Cannot delete folder with files' }, { status: 400 });
            }
        }

        await File.findByIdAndDelete(id);

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('File deletion error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
