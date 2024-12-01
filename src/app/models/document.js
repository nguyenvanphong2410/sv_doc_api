import {STATUS_ACTIVE, STATUS_DOC_CHECK} from "@/configs";
import {createModel} from "./base";

export const Document = createModel("Document", "documents", {
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
        default: [],
    },
    image_featured: {
        type: Number,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    author: {
        type: String,
        default: null,
    },
    publisher: {
        type: String,
        default: null,
    },
    publication_time: {
        type: Date,
        default: null,
    },
    name_file: {
        type: String,
        // required: true,
    },
    file_record: {
        type: String,
        default: null,
    },
    creator_id: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        enum: [...Object.values(STATUS_ACTIVE)],
        default: STATUS_ACTIVE.UNLOCK,
    },
    view_quantity: {
        type: Number,
        default: 0,
    },
    doc_check: {
        type: String,
        enum: [...Object.values(STATUS_DOC_CHECK)],
        default: STATUS_DOC_CHECK.PENDING,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    chapters: {
        type: [
            {
                name: {
                    type: String,
                    // required: true,
                },
                name_file_chapter: {
                    type: String,
                    // required: true,
                },
                file_chapter: {
                    type: String,
                    // required: true,
                },
            },
        ],
        default: [],
    },
    type_save: {
        type: String,
        require: true,
        note: "Loại upload",
    },
});
