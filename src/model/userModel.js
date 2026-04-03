import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3
        },
        surname: {
            type: String,
            required: true,
            minlength: 3
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'user'],
            default: 'user'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("User", userSchema)