import {PARTNER_TYPE} from "@/configs/enum";
import {createModel} from "./base";

export const Partner = createModel(
    "Partner",
    "partners",
    {
        type: {
            type: String,
            enum: [...Object.values(PARTNER_TYPE)],
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        birth: {
            type: Date,
            default: null,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        phone: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            default: null,
        },
        notes: {
            type: String,
            default: null,
        },
        tax_code: {
            type: String,
            default: null,
        },
        accounts_payable: {
            type: Number,
            default: null,
        },
        company: {
            type: String,
            default: null,
        },
        deleted: {type: Boolean, default: false},
    },
);
