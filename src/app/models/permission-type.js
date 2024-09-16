import {createModel} from "./base";

export const PermissionType = createModel("PermissionType", "permission_types", {
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
    position: {
        type: Number,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false
    },
});
