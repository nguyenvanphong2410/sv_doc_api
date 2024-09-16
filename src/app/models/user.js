
import { PROTECTED, STATUS_ACTIVE, USER_TYPE } from "@/configs/enum";
import {ObjectId, createModel} from "./base";

export const User = createModel(
    "User",
    "users",
    {
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        phone: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            required: true,
        },
        role_ids: {
            type: [{type: ObjectId, ref: "Role"}],
            default: [],
        },
        status: {
            type: String,
            enum: [...Object.values(STATUS_ACTIVE)],
            default: STATUS_ACTIVE.UNLOCK,
        },
        protected: {
            type: String,
            required: true,
            enum: [...Object.values(PROTECTED)],
            default: PROTECTED.UNPROTECTED,
        },

        is_admin: {
            type: Boolean, 
            required: true,
            default: false,
        },
        user_type: {
            type: String,
            required: true,
            enum: [...Object.values(USER_TYPE)],
            default: USER_TYPE.OTHER,
        },

        deleted: {type: Boolean, default: false},
    },
    {
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                // eslint-disable-next-line no-unused-vars
                const {password, ...result} = ret;
                return result;
            },
        },
        virtuals: {
            roles: {
                options: {
                    ref: "Role",
                    localField: "role_ids",
                    foreignField: "_id",
                },
            },
        },
    },
);
