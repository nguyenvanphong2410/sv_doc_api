import Joi from "joi";
import {MAX_STRING_SIZE, VALIDATE_PASSWORD_REGEX, VALIDATE_PHONE_REGEX} from "@/configs";
import {AsyncValidate, FileUpload} from "@/utils/types";
import {comparePassword} from "@/utils/helpers";
import { User } from "../models/user";

export const login = Joi.object({
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label("Email"),
    password: Joi.string().max(MAX_STRING_SIZE).required().label("Mật khẩu"),
});


const customValidateEmail = (value, helpers) =>
    new AsyncValidate(value, async function () {
        const user = await User.findOne({email: value, deleted: false});
        return !user ? value : helpers.message("{{#label}} đã được đăng ký.");
    });

export const register = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Họ và tên"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label("Email")
        .custom(customValidateEmail),
    password: Joi.string()
        .min(6)
        .max(50)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label("Mật khẩu")
        .messages({"string.pattern.base": "{{#label}} phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."}),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .required()
        .label("Số điện thoại")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const user = await User.findOne({phone: value, deleted: false});
                    return !user ? value : helpers.error("any.exists");
                }),
        ),
});

export const sendMailRegister = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Họ và tên"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label("Email")
        .custom(customValidateEmail),
});

export const updateProfile = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Họ và tên"),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow("")
        .label("Số điện thoại")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const user = await User.findOne({
                        phone: value,
                        deleted: false,
                        _id: {$ne: req.currentAccount._id},
                    });
                    return !user ? value : helpers.error("any.exists");
                }),
        ),
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
});

export const changePassword = Joi.object({
    password: Joi.string()
        .required()
        .label("Mật khẩu cũ")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, (req) =>
                    comparePassword(value, req.currentAccount.password)
                        ? value
                        : helpers.message("{#label} không chính xác."),
                ),
        ),
    new_password: Joi.string()
        .min(6)
        .max(50)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label("Mật khẩu mới")
        .messages({"string.pattern.base": "{{#label}} phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."})
        .invalid(Joi.ref("password")),
});

export const forgotPassword = Joi.object({
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label("Email")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const user = await User.findOne({email: value, deleted: false});
                    if (user) {
                        req.user = user;
                        return value;
                    }
                    return helpers.message("Tài khoản chưa được đăng ký.");
                }),
        ),
});

export const resetPassword = Joi.object({
    new_password: Joi.string()
        .min(6)
        .max(50)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label("Mật khẩu mới")
        .messages({"string.pattern.base": "{{#label}} phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."}),
});
