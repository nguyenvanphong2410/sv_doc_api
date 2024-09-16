import {PARTNER_TYPE} from "@/configs";
import {ensurePermissions} from "./admin/ensure-permissions.middleware";
import { responseError } from "@/utils/helpers";
import { isValidObjectId } from "mongoose";
import { Partner } from "../models/partner";
import _ from "lodash";

export const checkPermissionListPartner = async function (req, res, next) {
    const type = _.upperCase(req.params.type);
    switch (type) {
        case PARTNER_TYPE.CUSTOMER:
            return ensurePermissions("list-customer")(req, res, next);
        case PARTNER_TYPE.SUPPLIER:
            return ensurePermissions("list-supplier")(req, res, next);
    }
    return responseError(res, 403, "Không có quyền thực hiện hành động này."); 
};

export const checkPermissionCreatePartner = async function (req, res, next) {
    const type = _.upperCase(req.params.type);
    switch (type) {
        case PARTNER_TYPE.CUSTOMER:
            return ensurePermissions("add-customer")(req, res, next);
        case PARTNER_TYPE.SUPPLIER:
            return ensurePermissions("add-supplier")(req, res, next);
    }
    return responseError(res, 403, "Không có quyền thực hiện hành động này."); 
};

export const checkPermissionUpdatePartner = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const partner = await Partner.findOne({_id, deleted: false});
        if (partner) {
            req.partner = partner;
            switch (partner.type) {
                case PARTNER_TYPE.CUSTOMER:
                    return ensurePermissions("edit-customer")(req, res, next);
                case PARTNER_TYPE.SUPPLIER:
                    return ensurePermissions("edit-supplier")(req, res, next);
            }
        }
    }
    return responseError(res, 404, "Đối tác không tồn tại hoặc đã bị xóa.");
};

export const checkPermissionDeletePartner = async function (req, res, next) {
    const _id = req.params.id;

    if (isValidObjectId(_id)) {
        const partner = await Partner.findOne({_id, deleted: false});
        if (partner) {
            req.partner = partner;
            switch (partner.type) {
                case PARTNER_TYPE.CUSTOMER:
                    return ensurePermissions("delete-customer")(req, res, next);
                case PARTNER_TYPE.SUPPLIER:
                    return ensurePermissions("delete-supplier")(req, res, next);
            }
        }
    }
    return responseError(res, 404, "Đối tác không tồn tại hoặc đã bị xóa.");
};
