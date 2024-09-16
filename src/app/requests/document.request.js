import Joi from "joi";
import {MAX_SIZE_NAME, MAX_STRING_SIZE, DOCUMENT_STATUS, STATUS_DOC_CHECK} from "@/configs";
import {AsyncValidate, FileUpload} from "@/utils/types";
import {Document} from "../models";
import {tryValidateOrDefault} from "@/utils/helpers";
import _ from "lodash";
import {Category} from "../models/category";

export const getListDocumentRequest = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ""),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(
        Joi.valid("created_at", "name", "quantity", "sale_price", "wholesale_price"),
        "created_at",
    ),
    sort_order: tryValidateOrDefault(Joi.valid("asc", "desc"), "desc"),
}).unknown(true);

export const getListDocumentByCategoryIdRequest = Joi.object({
    idsCategory: Joi.any().label("Các danh mục")
}).unknown(true);

export const createDocumentRequest = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_SIZE_NAME)
        .required()
        .label("Tên tài liệu")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const employee = await Document.findOne({
                        name: value,
                        deleted: false,
                    });
                    return !employee ? value : helpers.error("any.exists");
                }),
        ),
    images: Joi.array()
        .single()
        .items(
            Joi.object({
                originalname: Joi.string().trim().required().label("Tên ảnh"),
                mimetype: Joi.valid("image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp")
                    .required()
                    .label("Định dạng ảnh"),
                buffer: Joi.binary()
                    .required()
                    .label("Kích thước ảnh")
                    .max(10000000)
                    .messages({"binary.max": "{{#label}} không được vượt quá 10mb."}),
            })
                .instance(FileUpload)
                .allow(null, "")
                .label("Ảnh mô tả"),
        )
        .default([])
        .max(3)
        .label("Ảnh mô tả"),
    image_featured: Joi.number()
        .integer()
        .min(0)
        .allow(null, "")
        .label("Ảnh nổi bật")
        .custom((value, helpers) => {
            const images = helpers.prefs.context.data.images;
            if (_.isArray(images) && images.length > 0) {
                return value < images.length ? value : helpers.error("any.invalid");
            } else {
                return value;
            }
        }),
    category_id: Joi.array().items(
        Joi.string()
            .custom(
                (value, helpers) =>
                    new AsyncValidate(value, async function () {
                        if (_.isArray(value)) {
                            let check = true;
                            for (const item of value) {
                                const category = await Category.findOne({
                                    _id: item,
                                    deleted: false,
                                });
                                if (!category) {
                                    check = false;
                                    break;
                                }
                            }
                            return check ? value : helpers.error("any.not-exists");
                        }
                        return value;
                    }),
            )
            .label("Danh mục"),
    ),
    description: Joi.string().allow(null, "").label("Mô tả"),
    file_record: Joi.any().required().label("File tài liệu"),
    publisher: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Nhà xuất bản"),
    author: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Tác giả"),
    publication_time: Joi.any().allow(null, "").label("Thời gian sáng tác"),
    name_file: Joi.string().trim().label("Tên file"),
});

export const updateDocumentRequest = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_SIZE_NAME)
        .required()
        .label("Tên tài liệu")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const documentId = req.params.id;
                    const document = await Document.findOne({
                        name: value,
                        _id: {$ne: documentId},
                        deleted: false,
                    });
                    return !document ? value : helpers.error("any.exists");
                }),
        ),
    images: Joi.array()
        .single()
        .items(
            Joi.object({
                originalname: Joi.string().trim().required().label("Tên ảnh"),
                mimetype: Joi.valid("image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp")
                    .required()
                    .label("Định dạng ảnh"),
                buffer: Joi.binary()
                    .required()
                    .label("Kích thước ảnh")
                    .max(10000000)
                    .messages({"binary.max": "{{#label}} không vượt quá 10mb."}),
            })
                .instance(FileUpload)
                .allow(null, "")
                .label("Ảnh mô tả phòng"),
            Joi.string().trim(),
        )
        .max(3)
        .default([])
        .label("Ảnh mô tả phòng"),
    image_featured: Joi.number()
        .integer()
        .min(0)
        .allow(null, "")
        .label("Ảnh nổi bật")
        .custom((value, helpers) => {
            const images = helpers.prefs.context.data.images;
            if (_.isArray(images) && images.length > 0) {
                return value < images.length ? value : helpers.error("any.invalid");
            } else {
                return value;
            }
        }),
    category_id: Joi.array().items(
        Joi.string()
            .custom(
                (value, helpers) =>
                    new AsyncValidate(value, async function () {
                        const category = await Category.findOne({
                            _id: value,
                            deleted: false,
                        });
                        return category ? value : helpers.error("any.not-exists");
                    }),
            )
            .label("Danh mục"),
    ),
    description: Joi.string().allow(null, "").label("Mô tả"),
    file_record: Joi.any().required().label("File tài liệu"),
    publisher: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Nhà xuất bản"),
    author: Joi.string().trim().max(MAX_STRING_SIZE).required().label("Tác giả"),
    publication_time: Joi.any().allow(null, "").label("Thời gian sáng tác"),
    name_file: Joi.string().trim().label("Tên file"),
    status: Joi.string()
        .valid(...Object.values(DOCUMENT_STATUS))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
    doc_check: Joi.string()
        .valid(...Object.values(STATUS_DOC_CHECK))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
});

export const changeStatusDocumentRequest = Joi.object({
    status: Joi.string()
        .valid(...Object.values(DOCUMENT_STATUS))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
});

export const changeDocCheckRequest = Joi.object({
    doc_check: Joi.string()
        .valid(...Object.values(STATUS_DOC_CHECK))
        .label("Trạng thái")
        .messages({"any.only": "Trạng thái không hợp lệ."}),
});
