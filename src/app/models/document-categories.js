import {createModel, ObjectId} from "./base";

export const DocumentCategory = createModel("DocumentCategory", "document_categories", {
    document_id:  {
        type: ObjectId,
        ref: "Document",
        required: true,
    },
    category_id: {
        type: ObjectId,
        ref: "Category",
        required: true,
    },
});
