import Joi from "joi";
import {
    MAX_STRING_SIZE,
    MAX_SIZE_NAME,
    VALIDATE_PASSWORD_REGEX,
    VALIDATE_PHONE_REGEX,
    VALIDATE_NAME_REGEX,
    MAX_STRING_ADDRESS,
    STATUS_ACTIVE,
    USER_TYPE,
} from "@/configs";
import {AsyncValidate, FileUpload} from "@/utils/types";
import {tryValidateOrDefault} from "@/utils/helpers";
import {User} from "../models/user";

export const getListUserTypeRequest = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ""),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(Joi.valid("created_at", "name", "email", "status"), "created_at"),
    sort_order: tryValidateOrDefault(Joi.valid("asc", "desc"), "desc"),
}).unknown(true);

export const createUserTypeRequest = Joi.object({
    name: Joi.string().trim().max(MAX_SIZE_NAME).required().pattern(VALIDATE_NAME_REGEX).label("Họ và tên"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .email()
        .required()
        .label("Email")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const employee = await User.findOne({
                        email: value,
                        deleted: false,
                    });
                    return !employee ? value : helpers.error("any.exists");
                }),
        ),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow(null, "")
        .label("Số điện thoại")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const employee = await User.findOne({
                        phone: value,
                        deleted: false,
                    });
                    return !employee ? value : helpers.error("any.exists");
                }),
        ),
    password: Joi.string()
        .min(8)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .max(MAX_STRING_SIZE)
        .required()
        .label("Mật khẩu")
        .messages({
            "string.pattern.base": "Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.",
        }),
    avatar: Joi.object({
        originalname: Joi.string().trim().required().label("Tên ảnh"),
        mimetype: Joi.valid("image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp")
            .required()
            .label("Định dạng ảnh"),
        buffer: Joi.binary().required().label("Ảnh đại diện"),
    })
        .instance(FileUpload)
        .allow(null, "")
        .label("Ảnh đại diện")
        .required(),
    address: Joi.string().trim().max(MAX_STRING_ADDRESS).label("Địa chỉ"),
});

export const updateUserTypeRequest = Joi.object({
    name: Joi.string().trim().max(MAX_SIZE_NAME).required().pattern(VALIDATE_NAME_REGEX).label("Họ và tên"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .email()
        .required()
        .label("Email")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const employeeId = req.params.id;
                    const employee = await User.findOne({
                        email: value,
                        _id: {$ne: employeeId},
                        deleted: false,
                    });
                    return !employee ? value : helpers.error("any.exists");
                }),
        ),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow(null, "")
        .label("Số điện thoại")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const employeeId = req.params.id;
                    const employee = await User.findOne({
                        phone: value,
                        _id: {$ne: employeeId},
                        deleted: false,
                    });
                    return !employee ? value : helpers.error("any.exists");
                }),
        ),
    status: Joi.string()
        .valid(...Object.values(STATUS_ACTIVE))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
    avatar: Joi.object({
        originalname: Joi.string().trim().required().label("Tên ảnh"),
        mimetype: Joi.valid("image/jpeg", "image/png", "image/svg+xml", "image/webp")
            .required()
            .label("Định dạng ảnh"),
        buffer: Joi.binary().required().label("Ảnh đại diện"),
    })
        .allow("", "delete")
        .instance(FileUpload)
        .label("Ảnh đại diện"),
    user_type: Joi.string()
        .valid(...Object.values(USER_TYPE))
        .label("Nhóm người dùng")
        .messages({"any.only": "Nhóm người dùng không hợp lệ."}),
});

export const changePasswordUserTypeRequest = Joi.object({
    new_password: Joi.string()
        .min(8)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .max(MAX_STRING_SIZE)
        .required()
        .label("Mật khẩu mới")
        .messages({
            "string.pattern.base": "Mật khẩu mới phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.",
        }),
    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .label("Xác nhận mật khẩu")
        .messages({"any.only": "Mật khẩu xác nhận không trùng khớp."}),
});

export const changeStatusUserTypeRequest = Joi.object({
    status: Joi.string()
        .valid(...Object.values(STATUS_ACTIVE))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
});
