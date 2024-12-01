import { responseSuccess } from "@/utils/helpers";
import * as documentService from "../services/document.service";

export async function getListDocument(req, res) {
    return responseSuccess(res, await documentService.getListDocument(req.query));
}

export async function getDetailDocument(req, res) {
    await responseSuccess(res, await documentService.getDetailDocument(req.params.id));
}

export async function createDocument(req, res) {
    await documentService.createDocument(req.body, req.currentAccount);
    return responseSuccess(res, null, 201);
}

export async function updateDocument(req, res) {
    await documentService.updateDocument(req.document, req.body, req.currentAccount);
    return responseSuccess(res, null, 201);
}

export async function deleteDocument(req, res) {
    await documentService.deleteDocument(req.document);
    return responseSuccess(res);
}

export async function changeStatusDocument(req, res) {
    await documentService.changeStatusDocument(req.document, req.body.status);
    return responseSuccess(res, null, 201);
}

export async function changeDocCheckDocument(req, res) {
    await documentService.changeDocCheckDocument(req.document, req.body.doc_check);
    return responseSuccess(res, null, 201);
}


//ForUser
export async function getListDocumentForUser(req, res) {
    return responseSuccess(res, await documentService.getListDocumentForUser(req.query));
}

export async function getListDocumentPendingForUser(req, res) {
    return responseSuccess(res, await documentService.getListDocumentPendingForUser(req.query));
}

export async function createDocumentForUser(req, res) {
    await documentService.createDocumentForUser(req.body, req.currentAccount);
    return responseSuccess(res, null, 201);
}

export async function getDetailDocumentForUser(req, res) {
    await responseSuccess(res, await documentService.getDetailDocumentForUser(req.params.id));
}

export async function getListMyDocPending(req, res) {
    await responseSuccess(res, await documentService.getListMyDocPending(req.params.id, req.query));
}

export async function getListMyDocChecked(req, res) {
    await responseSuccess(res, await documentService.getListMyDocChecked(req.params.id, req.query));
}

export async function getListMyDocLock(req, res) {
    await responseSuccess(res, await documentService.getListMyDocLock(req.params.id, req.query));
}

export async function updateViewDocument(req, res) {
    await documentService.updateViewDocument(req.params.id);
    return responseSuccess(res, null, 201);
}

export async function getListDocumentView(req, res) {
    return responseSuccess(res, await documentService.getListDocumentView());
}
