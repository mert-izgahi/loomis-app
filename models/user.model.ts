// models/user.model.ts
import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { remove as removeDiacritics } from "diacritics";

export enum Role {
    Admin = 'Admin',
    User = 'User'
}


export interface UserDocumentType extends Document {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    normalizedFirstName: string;
    normalizedLastName: string;
    password?: string;
    phone?: string;
    role: Role;
    isActive: boolean;
    groupIds: mongoose.Schema.Types.ObjectId[];
    favouriteReportIds: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

export interface UserModelType extends Model<UserDocumentType> {
    findByCredentials(email: string, password: string): Promise<UserDocumentType | null>;
    findByEmail(email: string): Promise<UserDocumentType | null>;
    softDeleteById(id: string): Promise<UserDocumentType | null>;
}

const userSchema = new mongoose.Schema<UserDocumentType, UserModelType>({
    firstName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    normalizedFirstName: {
        type: String
    },
    normalizedLastName: {
        type: String
    },
    
    phone: {
        type: String,
        trim: true,
        match: [/^\+?(\d{1,3})?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, 'Please enter a valid phone number']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: [Role.Admin, Role.User],
        default: Role.User
    },
    groupIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Group',
        default: []
    },
    favouriteReportIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Report',
        default: []
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    toObject: {
        virtuals: true
    }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        try {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error: any) {
            return next(error);
        }
    }

    this.normalizedFirstName = removeDiacritics(this.firstName.toLowerCase());
    this.normalizedLastName = removeDiacritics(this.lastName.toLowerCase());
    next();
});

userSchema.virtual("name").get(function () {
    return `${this.firstName} ${this.lastName}`;
});



// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

// Static methods
userSchema.statics.findByEmail = async function (email: string): Promise<UserDocumentType | null> {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByCredentials = async function (email: string, password: string): Promise<UserDocumentType | null> {
    const user = await this.findByEmail(email);
    if (!user || !await user.comparePassword(password)) {
        return null;
    }
    return user;
};

userSchema.statics.softDeleteById = async function (id: string): Promise<UserDocumentType | null> {
    return this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// Safe model creation that handles both server and client side rendering
function createUserModel(): UserModelType {
    // Check if the model already exists
    if (mongoose.models && mongoose.models.User) {
        return mongoose.models.User as UserModelType;
    }

    // Create new model if it doesn't exist
    return mongoose.model<UserDocumentType, UserModelType>("User", userSchema);
}

const User = createUserModel();

export default User;