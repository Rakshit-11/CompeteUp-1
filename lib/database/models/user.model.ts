import { Schema, model, models } from "mongoose";
import { unknown } from "zod";

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: {type: String, required: false, default: unknown },
  photo: { type: String, required: true },
})

const User = models.User || model('User', UserSchema);

export default User;