import {createModel} from "./base";

export const Category = createModel("Category", "categories", {
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        default: null,
    },
    position: {
        type: Number,
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
});
