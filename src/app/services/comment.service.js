import {LINK_STATIC_URL} from "@/configs";
import {Comment} from "../models/comments";
import {Document, User} from "../models";

export async function getAllCommentByIdDoc(documentId) {
    const document = await Document.findOne({_id: documentId, deleted: false});

    const comments = await Comment.find({document_id: documentId, deleted: false}).sort({created_at: -1});

    // Map bình luận với thông tin người tạo bình luận
    const commentsWithCreatorInfo = await Promise.all(
        comments.map(async (comment) => {
            const creator = await User.findOne({_id: comment.creator_id, deleted: false});
            return {
                _id: comment._id,
                creator_id: creator._id,
                name: creator ? creator.name : null,
                avatar: creator && creator.avatar ? LINK_STATIC_URL + creator.avatar : null,
                content: comment.content,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
            };
        }),
    );

    return {
        _id: document._id,
        name_doc: document.name,
        comment: commentsWithCreatorInfo,
    };
}

export async function createComment(idDoc, {content}, creator) {
    const comment = new Comment({
        document_id: idDoc,
        creator_id: creator._id,
        content: content,
    });

    await comment.save();

    return comment;
}

export async function updateComment(idDoc, {content}) {
    await Comment.findByIdAndUpdate(idDoc, {content: content}, {new: true});
}

export async function deleteComment(idDoc) {
    await Comment.findByIdAndUpdate(idDoc, {deleted: true}, {new: true});
}
