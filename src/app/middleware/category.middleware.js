import {responseError} from "@/utils/helpers";
import {isValidObjectId} from "mongoose";
import {Category} from "../models/category";

export const checkCategoryId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const category = await Category.findOne({_id, deleted: false});
        if (category) {
            req.category = category;
            return next();
        }
    }
    return responseError(res, 404, "Danh mục không tồn tại hoặc đã bị xóa.");
};
