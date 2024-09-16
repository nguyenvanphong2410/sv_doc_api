import {createModel} from "./base";

export const PermissionGroup = createModel("PermissionGroup", "permission_groups", {
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
        require: false,
        default: null,
    },
    parent_code: {
        type: String,
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false
    },
});
