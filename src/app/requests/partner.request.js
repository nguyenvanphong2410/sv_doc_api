import Joi from "joi";
import {
    MAX_DESCRIPTION_SIZE,
    MAX_SIZE_NAME,
    MAX_STRING_ADDRESS,
    MAX_STRING_SIZE,
    VALIDATE_PHONE_REGEX,
} from "@/configs";
import {tryValidateOrDefault} from "@/utils/helpers";
import {AsyncValidate} from "@/utils/types";
import {Partner} from "../models/partner";
import _ from "lodash";

export const getListPartnerRequest = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ""),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(Joi.valid("created_at", "name"), "created_at"),
    sort_order: tryValidateOrDefault(Joi.valid("asc", "desc"), "desc"),
}).unknown(true);

export const createPartnerRequest = Joi.object({
    name: Joi.string().trim().max(MAX_SIZE_NAME).required().label("Họ và tên"),
    birth: Joi.date().allow(null, "").label("Ngày sinh"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .allow(null, "")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const type = _.upperCase(req.params.type);
                    const partner = await Partner.findOne({email: value, deleted: false, type});
                    return !partner ? value : helpers.error("any.exists");
                }),
        )
        .label("Email"),
    phone: Joi.string()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow(null, "")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const type = _.upperCase(req.params.type);
                    const partner = await Partner.findOne({phone: value, deleted: false, type});
                    return !partner ? value : helpers.error("any.exists");
                }),
        )
        .label("Số điện thoại"),
    address: Joi.string().max(MAX_STRING_ADDRESS).allow(null, "").label("Địa chỉ"),
    notes: Joi.string().max(MAX_DESCRIPTION_SIZE).allow(null, "").label("Ghi chú"),
    tax_code: Joi.string().max(MAX_STRING_SIZE).allow(null, "").label("Mã số thuế"),
    company: Joi.string().max(MAX_STRING_SIZE).allow(null, "").label("Công ty"),
});

export const updatePartnerRequest = Joi.object({
    name: Joi.string().trim().max(MAX_SIZE_NAME).required().label("Họ và tên"),
    birth: Joi.date().allow(null, "").label("Ngày sinh"),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .allow(null, "")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const currentPartner = req.partner;
                    const partner = await Partner.findOne({
                        email: value,
                        deleted: false,
                        type: currentPartner.type,
                        _id: {$ne: currentPartner._id},
                    });
                    return !partner ? value : helpers.error("any.exists");
                }),
        )
        .label("Email"),
    phone: Joi.string()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow(null, "")
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const currentPartner = req.partner;
                    const partner = await Partner.findOne({
                        phone: value,
                        deleted: false,
                        type: currentPartner.type,
                        _id: {$ne: currentPartner._id},
                    });
                    return !partner ? value : helpers.error("any.exists");
                }),
        )
        .label("Số điện thoại"),
    address: Joi.string().max(MAX_STRING_ADDRESS).allow(null, "").label("Địa chỉ"),
    notes: Joi.string().max(MAX_DESCRIPTION_SIZE).allow(null, "").label("Ghi chú"),
    tax_code: Joi.string().max(MAX_STRING_SIZE).allow(null, "").label("Mã số thuế"),
    company: Joi.string().max(MAX_STRING_SIZE).allow(null, "").label("Công ty"),
});
