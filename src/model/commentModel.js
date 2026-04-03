import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 3
        },
        userId: {
            type: String,
            required: true
        },
        bookId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Comment", commentSchema)