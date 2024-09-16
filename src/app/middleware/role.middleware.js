import {responseError} from "@/utils/helpers";
import { isValidObjectId } from "mongoose";
import { PROTECTED } from "@/configs/enum";
import { User, Permission, Role } from "../models";

export const checkRoleId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const role = await Role.findOne({_id, deleted: false});
        if (role.protected === PROTECTED.PROTECTED) {
            return responseError(res, 400, "Vai trò đã được bảo vệ");
        }
        if (role) {
            req.role = role;
            return next();
        }
    }

    return responseError(res, 404, "Vai trò không tồn tại hoặc đã bị xóa.");
};

export const checkPermissionId = async function (req, res, next) {
    const _id = req.params.permissionId;

    if (isValidObjectId(_id)) {
        const role = await Permission.findOne({_id, deleted: false});
        if (role) {
            return next();
        }
    }
    return responseError(res, 404, "Quyền hạn không tồn tại hoặc đã bị xóa.");

};

export const checkAdminId = async function (req, res, next) {
    const _id = req.params.adminId;

    if (isValidObjectId(_id)) {
        const role = await User.findOne({_id, deleted: false});
        if (role) {
            return next();
        }
    }
    return responseError(res, 404, "Tài khoản không tồn tại hoặc đã bị xóa.");

};
