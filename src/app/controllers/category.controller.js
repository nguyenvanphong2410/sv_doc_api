import {responseSuccess} from "@/utils/helpers";
import * as categoryService from "../services/category.service";
import * as documentService from "../services/document.service";

export async function getListCategory(req, res) {
    return responseSuccess(res, await categoryService.getListCategory(req.query));
}

export async function getAllCategory(req, res) {
    return responseSuccess(res, await categoryService.getAllCategory(req.query));
}

export async function getDetailCategory(req, res) {
    await responseSuccess(res, await categoryService.getDetailCategory(req.params.id));
}

export async function getListDocumentByCategoryId(req, res) {
    await responseSuccess(res, await documentService.getListDocumentByCategoryId(req.params.id, req.query));
}

export async function createCategory(req, res) {
    await categoryService.createCategory(req.body);
    return responseSuccess(res, null, 201);
}

export async function updateCategory(req, res) {
    await categoryService.updateCategory(req.params.id, req.body);
    return responseSuccess(res, null, 201);
}

export async function deleteCategory(req, res) {
    await categoryService.deleteCategory(req.category);
    return responseSuccess(res);
}

//For Userr
export async function getListDocumentByCategoryIdForUser(req, res) {
    await responseSuccess(res, await documentService.getListDocumentByCategoryIdForUser(req.params.id, req.query));
}

export async function getListDocumentByCategoryIdForUserNha(req, res) {
    await responseSuccess(res, await documentService.getListDocumentByCategoryIdForUserNha(req.query.idsCategory));
}
