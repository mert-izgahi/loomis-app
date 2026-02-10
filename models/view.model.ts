import mongoose, { Document, Model } from "mongoose";
import { ReportDocumentType } from "./report.model";
import { UserDocumentType } from "./user.model";

export interface ViewDocumentType extends Document {
    reportId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    report: ReportDocumentType,
    user: UserDocumentType,
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ViewModelType extends Model<ViewDocumentType> { }

const viewSchema = new mongoose.Schema({
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
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

viewSchema.virtual("report", {
    ref: "Report",
    localField: "reportId",
    foreignField: "_id",
    justOne: true
})

viewSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true
})

viewSchema.pre("find", function (next) {
    this.populate("report");
    this.populate("user");
    next();
})

viewSchema.pre("findOne", function (next) {
    this.populate("report");
    this.populate("user");
    next();
})

export const createViewModel = (): ViewModelType => {
    if (mongoose.models && mongoose.models.View) {
        return mongoose.models.View as ViewModelType;
    }
    return mongoose.model<ViewModelType, ViewModelType>("View", viewSchema);
}

const View = createViewModel();
export default View;