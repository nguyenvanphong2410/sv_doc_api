import {PROTECTED} from "@/configs/enum";
import {ObjectId, createModel} from "./base";

export const Role = createModel("Role", "roles", {
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: null,
    },
    protected: {
        type: String,
        required: true,
        enum: [...Object.values(PROTECTED)],
        default: PROTECTED.UNPROTECTED,
    },
    parent_id: {
        type: ObjectId,
        ref: "Role",
        required: false,
        default: null,
    },
    permission_ids: [
        {
            type: ObjectId,
            ref: "Permission",
        },
    ],
    admin_ids: [
        {
            type: ObjectId,
            ref: "Admin",
        },
    ],
    deleted: {
        type: Boolean,
        default: false
    },
});
