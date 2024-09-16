
import {responseError} from "@/utils/helpers";
import { isValidObjectId } from "mongoose";
import { Role } from "../models/role";

export const checkRoleId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const role = await Role.findOne({_id, deleted: false});
        if (role) {
            return next();
        }
    }
    return responseError(res, 404, "Vai trò không tồn tại hoặc đã bị xóa.");
};
