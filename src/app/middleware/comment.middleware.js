import {isValidObjectId} from "mongoose";
import {responseError} from "@/utils/helpers";

import {Document} from "../models/document";
import { Comment } from "../models/comments";

export const checkDocumentForComment = async function (req, res, next) {
    const _id = req.params.id;

    if (!isValidObjectId(_id)) {
        return responseError(res, 400, "Tài liệu không hợp lệ.");
    }

    const document = await Document.findOne({_id, deleted: false});

    if (!document) {
        return responseError(res, 404, "Tài liệu không tồn tại hoặc đã bị xóa.");
    }

    req.document = document;

    return next();
};

export const checkComment = async function (req, res, next) {
    const _id = req.params.id;

    if (!isValidObjectId(_id)) {
        return responseError(res, 400, "Bình luận không hợp lệ.");
    }

    const comment = await Comment.findOne({_id, deleted: false});

    if (!comment) {
        return responseError(res, 404, "Bình luận không tồn tại hoặc đã bị xóa.");
    }

    req.comment = comment;
    return next();
};
