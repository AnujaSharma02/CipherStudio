import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { S3Service } from '@/lib/s3';

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

        const { name, type, projectId, parentId, content } = await request.json();

        if (!name || !type || !projectId) {
            return NextResponse.json({ error: 'Name, type, and projectId are required' }, { status: 400 });
        }

        if (!['file', 'folder'].includes(type)) {
            return NextResponse.json({ error: 'Type must be either file or folder' }, { status: 400 });
        }

        const project = await Project.findOne({
            _id: projectId,
            userId: decoded.userId
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (parentId) {
            const parentFile = await File.findOne({
                _id: parentId,
                projectId,
                type: 'folder'
            });

            if (!parentFile) {
                return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
            }
        }

        const existingFile = await File.findOne({
            name,
            projectId,
            parentId: parentId || null
        });

        if (existingFile) {
            return NextResponse.json({ error: 'File or folder with this name already exists' }, { status: 400 });
        }

        const useS3 = process.env.USE_S3_STORAGE === 'true' && type === 'file' && content && content.length > 0;

        let s3Key: string | undefined;
        let fileContent: string | undefined;
        let storageType: 'database' | 's3' = 'database';

        if (useS3 && type === 'file') {
            try {
                const tempFileId = new Date().getTime().toString();
                s3Key = S3Service.generateKey(projectId, tempFileId, name);
                await S3Service.uploadFile(s3Key, content, 'text/plain');
                storageType = 's3';
            } catch (error) {
                console.error('S3 upload failed, falling back to database:', error);
                fileContent = content;
            }
        } else {
            fileContent = type === 'file' ? content : undefined;
        }

        let filePath = `/${name}`;
        if (parentId) {
            const parentFile = await File.findById(parentId);
            if (parentFile) {
                const parentPath = parentFile.path || `/${parentFile.name}`;
                filePath = `${parentPath}/${name}`;
            }
        }

        const file = new File({
            name,
            type,
            projectId,
            parentId: parentId || null,
            path: filePath,
            content: fileContent,
            s3Key: s3Key,
            size: type === 'file' ? (content?.length || 0) : 0,
            mimeType: type === 'file' ? 'text/plain' : undefined,
            storageType: storageType
        });

        try {
            const savedFile = await file.save();

            return NextResponse.json({
                message: 'File created successfully',
                file: savedFile
            }, { status: 201 });
        } catch (saveError) {
            console.error('Error saving file:', saveError);
            return NextResponse.json({
                error: 'Failed to save file',
                details: saveError instanceof Error ? saveError.message : 'Unknown error'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('File creation error:', error);
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
        const projectId = searchParams.get('projectId');
        const parentId = searchParams.get('parentId');

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const project = await Project.findOne({
            _id: projectId,
            userId: decoded.userId
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const query: { projectId: string; parentId?: string } = {
            projectId,
            ...(parentId !== null && parentId !== undefined && { parentId })
        };

        const files = await File.find(query).sort({ type: 1, name: 1 });

        const filesWithContent = await Promise.all(
            files.map(async (file) => {
                if (file.storageType === 's3' && file.s3Key && file.type === 'file') {
                    try {
                        const s3Content = await S3Service.getFile(file.s3Key);
                        file.content = s3Content;
                    } catch (error) {
                        console.error(`Failed to fetch S3 content for ${file.name}:`, error);
                        file.content = '';
                    }
                }
                return file;
            })
        );

        return NextResponse.json({ files: filesWithContent });
    } catch (error) {
        console.error('Files fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
