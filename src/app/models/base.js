import {Schema, Types, model} from "mongoose";

export function createModel(name, collection, definition, options) {
    const schema = new Schema(definition, {
        timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
        versionKey: false,
        id: false,
        ...(options ? options : {}),
    });

    return model(name, schema, collection);
}

export const {ObjectId} = Types;
export const {Mixed} = Schema.Types;