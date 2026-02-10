import mongoose, { Document, Model } from "mongoose";

export interface SettingsDocumentType extends Document {
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SettingsModelType extends Model<SettingsDocumentType> { }

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

const createSettingsModel = (connection: mongoose.Connection): SettingsModelType => {
    if(connection.models && connection.models.Settings) {
        return connection.models.Settings as SettingsModelType;
    }
    return connection.model<SettingsDocumentType, SettingsModelType>("Settings", settingsSchema);
};

const Settings = createSettingsModel(mongoose.connection);
export default Settings;