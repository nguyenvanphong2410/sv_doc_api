import Joi from "joi";
import {MAX_SIZE_NAME} from "@/configs";
import {tryValidateOrDefault} from "@/utils/helpers";
import {AsyncValidate} from "@/utils/types";
import {Category} from "../models/category";

export const getListCategoryRequest = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ""),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(Joi.valid("created_at", "name"), "created_at"),
    sort_order: tryValidateOrDefault(Joi.valid("asc", "desc"), "desc"),
}).unknown(true);

export const createCategoryRequest = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_SIZE_NAME)
        .required()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const category = await Category.findOne({name: value, deleted: false});
                    return !category ? value : helpers.error("any.exists");
                }),
        )
        .label("Tên danh mục"),
    desc: Joi.string().trim().allow(null, "").label("Mô tả"),
});

export const updateCategoryRequest = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_SIZE_NAME)
        .required()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const id = req.params.id;
                    const category = await Category.findOne({name: value, deleted: false, _id: {$ne: id}});
                    return !category ? value : helpers.error("any.exists");
                }),
        )
        .label("Tên danh mục"),
    desc: Joi.string().trim().allow(null, "").label("Mô tả danh mục"),
});
