import { Document } from "mongoose";

export interface Post extends Document {
    author: string;
    description: string | null;
    postImage: string;
    likes: number;
    comments: Comment[];
    createdAt: Date;
}

export interface Comment {
    userId: string;
    comment: string;
    createdAt: Date;
}
