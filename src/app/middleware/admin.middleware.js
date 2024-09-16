import {isValidObjectId} from "mongoose";
import {responseError} from "@/utils/helpers";

import {PROTECTED} from "@/configs";
import { User } from "../models/user";

export const checkAdminId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const admin = await User.findOne({_id, deleted: false, protected: PROTECTED.UNPROTECTED});
        if (admin) {
            req.admin = admin;
            return next();
        }
    }

    return responseError(res, 404, "Quản trị viên không tồn tại hoặc đã bị xóa.");
};

export const checkDeleteAdminId = async function (req, res, next) {
    if (req.currentAccount._id.equals(req.params.id)) {
        return responseError(res, 400, "Không thể xóa bản thân.");
    }

    return next();
};
