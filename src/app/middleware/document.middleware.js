import {isValidObjectId} from "mongoose";
import {responseError} from "@/utils/helpers";

import {Category} from "../models/category";
import {Document} from "../models/document";
import {User} from "../models";
import {PROTECTED} from "@/configs";

export const checkDocument = async function (req, res, next) {
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

export const checkCategory = async function (req, res, next) {
    const categoryIds = req.body.category_id;

    if (!Array.isArray(categoryIds) || categoryIds?.some((id) => !isValidObjectId(id))) {
        return responseError(res, 400, "Danh mục không hợp lệ.");
    }

    const categories = await Category.find({
        _id: {$in: categoryIds},
        deleted: false,
    });

    if (categories.length !== categoryIds.length) {
        return responseError(res, 404, "Danh mục không tồn tại.");
    }

    return next();
};

export const checkIdMyDoc = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const user = await User.findOne({
            _id,
            deleted: false,
            // is_admin: false,
            protected: PROTECTED.UNPROTECTED,
        });
        if (user) {
            req.user = user;
            return next();
        }
    }

    return responseError(res, 404, "Người dùng không tồn tại hoặc đã bị xóa.");
};
