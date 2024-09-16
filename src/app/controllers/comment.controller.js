import {responseSuccess} from "@/utils/helpers";
import * as commentService from "../services/comment.service";

//For Userr
export async function getAllCommentByIdDoc(req, res) {
    await responseSuccess(res, await commentService.getAllCommentByIdDoc(req.params.id));
}

export async function createComment(req, res) {
    await commentService.createComment(req.params.id,req.body, req.currentAccount);
    return responseSuccess(res, null, 201);
}

export async function updateComment(req, res) {
    await commentService.updateComment(req.params.id, req.body);
    return responseSuccess(res, null, 201);
}

export async function deleteComment(req, res) {
    await commentService.deleteComment(req.params.id);
    return responseSuccess(res, null, 201);
}