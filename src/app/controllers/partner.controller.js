import { responseSuccess } from "@/utils/helpers";
import * as partnerService from "../services/partner.service";

export async function createPartner(req, res) {
    await partnerService.createPartner(req);
    return responseSuccess(res, null, 201);
}

export async function updatePartner(req, res) {
    await partnerService.updatePartner(req.partner, req.body);
    return responseSuccess(res, null, 201);
}

export async function getListPartnerByType(req, res) {
    return responseSuccess(res, await partnerService.getListPartnerByType(req));
}

export async function removePartner(req, res) {
    await partnerService.removePartner(req.partner);
    return responseSuccess(res);
}
