import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({
            status: 'OK',
            message: 'CipherStudio Backend is running',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
