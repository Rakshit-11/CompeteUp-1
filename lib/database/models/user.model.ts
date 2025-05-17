import { Schema, model, models, Model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  photo: string;
  collegeName?: string;
  degree?: string;
  specialization?: string;
  graduationStartYear?: number;
  graduationEndYear?: number;
  phoneNumber?: string;
  hasCompletedProfile: boolean;
  events: Schema.Types.ObjectId[];
  orders: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  photo: { type: String, required: true },
  collegeName: { type: String, required: false, default: null },
  degree: { type: String, required: false, default: null },
  specialization: { type: String, required: false, default: null },
  graduationStartYear: { type: Number, required: false, default: null },
  graduationEndYear: { type: Number, required: false, default: null },
  phoneNumber: { type: String, required: false, default: null },
  hasCompletedProfile: { type: Boolean, default: false },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
}, {
  strict: true,
  timestamps: true,
  strictQuery: true
});

const User: Model<IUser> = models?.User || model<IUser>('User', UserSchema);

export default User;