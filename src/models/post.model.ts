import { model, Schema } from "mongoose";
import * as schema from "../schema/post.schema";

const CommentSchema = new Schema<schema.Comment>({
    userId: { type: String, ref: "User", required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: null },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<schema.Post>({
    author: { type: String, ref: "User", required: true },
    description: { type: String, default: null },
    postImage: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: [CommentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
});

const PostModel = model<schema.Post>("Post", PostSchema);

export default PostModel;
