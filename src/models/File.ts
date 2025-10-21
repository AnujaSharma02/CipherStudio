import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
    name: string;
    type: 'file' | 'folder';
    projectId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    path?: string;
    content?: string;
    s3Key?: string;
    size: number;
    mimeType?: string;
    storageType: 'database' | 's3';
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
    name: {
        type: String,
        required: [true, 'File name is required'],
        trim: true,
        maxlength: [255, 'File name cannot exceed 255 characters']
    },
    type: {
        type: String,
        enum: {
            values: ['file', 'folder'],
            message: 'Type must be either file or folder'
        },
        required: [true, 'File type is required']
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required']
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    path: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    s3Key: {
        type: String,
        default: null
    },
    size: {
        type: Number,
        default: 0
    },
    mimeType: {
        type: String,
        default: null
    },
    storageType: {
        type: String,
        enum: ['database', 's3'],
        default: 'database'
    }
}, {
    timestamps: true
});

fileSchema.index({ projectId: 1, parentId: 1 });
fileSchema.index({ projectId: 1, name: 1 });

export default mongoose.models.File || mongoose.model<IFile>('File', fileSchema);
