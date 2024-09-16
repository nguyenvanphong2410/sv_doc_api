import {ObjectId, createModel} from "./base";

export const Permission = createModel("Permission", "permissions", {
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: false,
        default: null,
    },
    permission_group_code: {
        type: String,
        required: false,
        default: null,
    },
    permission_type_code: {
        type: String,
        required: false,
        default: null,
    },
    role_ids: [
        {
            type: ObjectId,
            ref: "Role",
        },
    ],
    deleted: {
        type: Boolean,
        default: false
    },
});
