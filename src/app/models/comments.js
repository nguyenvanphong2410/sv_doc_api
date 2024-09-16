import {createModel} from "./base";

export const Comment = createModel("Comment", "comments", {
    document_id: {
        type: String,
        required: false,
    },
    creator_id: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
});
