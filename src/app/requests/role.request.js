import { AsyncValidate } from "@/utils/types";
import Joi from "joi";
import { Role } from "../models/role";
import { MAX_DESCRIPTION_SIZE, MAX_NAME_ROLE_SIZE } from "@/configs";

export const createRole = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .max(MAX_NAME_ROLE_SIZE)
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const roleId = req.params.id;
                    const role = await Role.findOne({
                        name: value,
                        _id: {$ne: roleId},
                        deleted: false
                    });
                    return !role ? value : helpers.error("any.exists");
                }),
        )
        .invalid(
            "super_admin",
            "super admin",
            "Super Admin",
            "Super admin",
            "super Admin",
        )
        .label("Tên quyền")
        .messages({
            "any.invalid": "{{#label}} không hợp lệ"
        }),
    description: Joi.string()
        .trim()
        .allow(null, "")
        .max(MAX_DESCRIPTION_SIZE)
        .label("Mô tả"),
    parent_id: Joi.string()
        .trim()
        .allow(null, "")
        .label("Quyền cha"),
});

export const updateRole = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .max(MAX_NAME_ROLE_SIZE)
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const roleId = req.params.id;
                    const role = await Role.findOne({
                        name: value,
                        _id: {$ne: roleId},
                        deleted: false
                    });
                    return !role ? value : helpers.error("any.exists");
                }),
        )
        .invalid(
            "super_admin",
            "super admin",
            "Super Admin",
            "Super admin",
            "super Admin",
        )
        .label("Tên quyền")
        .messages({
            "any.invalid": "{{#label}} không hợp lệ"
        }),
    description: Joi.string()
        .trim()
        .allow(null, "")
        .max(MAX_DESCRIPTION_SIZE)
        .label("Mô tả"),
    parent_id: Joi.string()
        .trim()
        .allow(null, "")
        .label("Quyền cha"),
});

export const updateRoleAdmin = Joi.object({
    admin_ids: Joi.array()
        .min(1)
        .required()
        .label("Tài khoản")
        .messages({
            "any.required": "{{#label}} không được để trống",
            "array.min": "{{#label}} không được để trống"
        })
});
