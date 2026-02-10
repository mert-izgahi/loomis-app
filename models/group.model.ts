import mongoose, { Document, Model } from "mongoose";
import { remove as removeDiacritics } from "diacritics";
export interface GroupDocumentType extends Document {
    name: string;
    description: string;
    memberIds: mongoose.Schema.Types.ObjectId[];
    normalizedName: string;
    normalizedDescription: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GroupModelType extends Model<GroupDocumentType> {}

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    normalizedName: {
        type: String,
    },
    normalizedDescription: {
        type: String,
    },
    memberIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        required: true,
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

groupSchema.pre("save", function (next) {
    this.normalizedName = removeDiacritics(this.name).toLowerCase();
    this.normalizedDescription = removeDiacritics(this.description).toLowerCase();
    next();
});

const createGroupModel = (): GroupModelType => {
    if(mongoose.models && mongoose.models.Group) {
        return mongoose.models.Group as GroupModelType;
    }
    return mongoose.model<GroupDocumentType, GroupModelType>("Group", groupSchema);
}

const Group = createGroupModel();
export default Group;