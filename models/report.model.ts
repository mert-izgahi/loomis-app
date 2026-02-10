import mongoose, { Document, Model } from "mongoose";
import { GroupDocumentType } from "./group.model";
import { CategoryDocumentType } from "./category.model";
import { remove as removeDiacritics } from "diacritics";
export enum ReportStatus {
    Pending = 'Pending',
    Draft = 'Draft',
    Published = 'Published'
}

export enum ReportType {
    Internal = 'Internal',
    External = 'External'
}

export interface ReportDocumentType extends Document {
    name: string;
    slug: string;
    reportPath?: string;
    description: string;
    normalizedName: string;
    normalizedDescription: string;
    isExists: boolean;
    categoryId: mongoose.Schema.Types.ObjectId;
    category: CategoryDocumentType;
    groupIds: mongoose.Schema.Types.ObjectId[];
    groups: GroupDocumentType[]
    // roles: Role[];
    isActive: boolean;
    status: ReportStatus;
    type: ReportType;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportModelType extends Model<ReportDocumentType> { }

const reportSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        normalizedName: { type: String },
        normalizedDescription: { type: String },
        reportPath: { type: String },
        description: { type: String, required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        groupIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Group", default: [] },
        // roles: { type: [String], required: true },
        isActive: { type: Boolean, default: true },
        status: { type: String, default: ReportStatus.Pending },
        type: { type: String, default: ReportType.Internal },
        link: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);



reportSchema.virtual("groups", {
    ref: "Group",
    localField: "groupIds",
    foreignField: "_id",
    justOne: false
})

reportSchema.virtual("category", {
    ref: "Category",
    localField: "categoryId",
    foreignField: "_id",
    justOne: true
})

reportSchema.pre("find", function (next) {
    this.populate("category");
    this.populate("groups");
    next();
})


reportSchema.pre("findOne", function (next) {
    this.populate("category");
    this.populate("groups");
    next();
})


reportSchema.pre("save", function (next) {
    this.normalizedName = removeDiacritics(this.name.toLowerCase());
    this.normalizedDescription = removeDiacritics(this.description.toLowerCase());
    next();
})
const createReportModel = (): ReportModelType => {
    if (mongoose.models && mongoose.models.Report) {
        return mongoose.models.Report as ReportModelType;
    }
    return mongoose.model<ReportDocumentType, ReportModelType>("Report", reportSchema);
}

const Report = createReportModel();

export default Report;
