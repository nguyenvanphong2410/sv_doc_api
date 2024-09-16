import {isValidObjectId} from "mongoose";
import {responseError} from "@/utils/helpers";
import {PROTECTED, USER_TYPE} from "@/configs";
import { User } from "../models/user";

export const checkUserTypeId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const userType = await User.findOne({
            _id, deleted: false, 
            is_admin: false, 
            user_type: USER_TYPE.OTHER,
            protected: PROTECTED.UNPROTECTED
        });
        if (userType) {
            req.userType = userType;
            return next();
        }
    }

    return responseError(res, 404, "Người dùng không tồn tại hoặc đã bị xóa.");
};

export const checkDeleteUserTypeId = async function (req, res, next) {
    if (req.currentAccount._id.equals(req.params.id)) {
        return responseError(res, 400, "Không thể xóa bản thân.");
    }

    return next();
};


//TEACHER
export const checkTeacherId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const userType = await User.findOne({
            _id, deleted: false, 
            is_admin: false, 
            user_type: USER_TYPE.TEACHER,
            protected: PROTECTED.UNPROTECTED
        });
        if (userType) {
            req.userType = userType;
            return next();
        }
    }

    return responseError(res, 404, "Người dùng không tồn tại hoặc đã bị xóa.");
};

export const checkDeleteTeacherId = async function (req, res, next) {
    if (req.currentAccount._id.equals(req.params.id)) {
        return responseError(res, 400, "Không thể xóa bản thân.");
    }

    return next();
};

//STUDENT
export const checkStudentId = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const userType = await User.findOne({
            _id, deleted: false, 
            is_admin: false, 
            user_type: USER_TYPE.STUDENT,
            protected: PROTECTED.UNPROTECTED
        });
        if (userType) {
            req.userType = userType;
            return next();
        }
    }

    return responseError(res, 404, "Người dùng không tồn tại hoặc đã bị xóa.");
};

export const checkDeleteStudentId = async function (req, res, next) {
    if (req.currentAccount._id.equals(req.params.id)) {
        return responseError(res, 400, "Không thể xóa bản thân.");
    }

    return next();
};

