import _ from "lodash";
import {Partner} from "../models/partner";
import {PARTNER_TYPE} from "@/configs";

export async function createPartner(req) {
    const data = req.body;
    const type = _.upperCase(req.params.type);

    const lastDocument = await Partner.findOne({type}).sort({code: -1});

    let newCode = `${type === PARTNER_TYPE.CUSTOMER ? "KH" : "NCC"}000001`;

    if (lastDocument) {
        const lastCode = lastDocument.code;
        const prefixLength = type === PARTNER_TYPE.CUSTOMER ? 2 : 3;
        const numberPart = parseInt(lastCode.slice(prefixLength), 10) + 1;
        newCode = `${type === PARTNER_TYPE.CUSTOMER ? "KH" : "NCC"}${numberPart.toString().padStart(6, "0")}`;
    }
    const partner = new Partner({
        ...data,
        code: newCode,
        type,
    });
    await partner.save();
    return partner;
}

export async function updatePartner(partner, {name, birth, email, phone, address, notes, tax_code, company}) {
    partner.name = name;
    partner.birth = birth;
    partner.email = email;
    partner.phone = phone;
    partner.address = address;
    partner.notes = notes;
    partner.tax_code = tax_code;
    partner.company = company;
    await partner.save();
    return partner;
}

export async function getListPartnerByType(req) {
    const {page, per_page, field, sort_order} = req.query;
    let {q} = req.query;
    const type = _.upperCase(req.params.type);

    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}, {code: q}, {phone: q}, {email: q}]}),
        deleted: false,
        type,
    };

    const partners = await Partner.find(filter)
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order});

    const total = await Partner.countDocuments(filter);
    return {total, page, per_page, partners};
}

export async function removePartner(partner) {
    partner.deleted = true;
    await partner.save();
}
