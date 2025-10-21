import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    userId: mongoose.Types.ObjectId;
    isPublic: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
