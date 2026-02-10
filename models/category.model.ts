import mongoose, { Document, Model } from "mongoose";
import { remove as removeDiacritics } from "diacritics";

export interface CategoryDocumentType extends Document {
    name: string;
    description: string;
    normalizedName: string;
    normalizedDescription: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryModelType extends Model<CategoryDocumentType> { }

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,

    },
    toObject: {
        virtuals: true
    }
});

categorySchema.pre("save", function (next) {
    this.normalizedName = removeDiacritics(this.name.toLowerCase());
    this.normalizedDescription = removeDiacritics(this.description.toLowerCase());
    next();
});

const createCategoryModel = (): CategoryModelType => {
    if (mongoose.models && mongoose.models.Category) {
        return mongoose.models.Category as CategoryModelType;
    }
    return mongoose.model<CategoryDocumentType, CategoryModelType>("Category", categorySchema);
}


const Category = createCategoryModel();

export default Category;