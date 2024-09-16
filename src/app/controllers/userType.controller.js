import {responseSuccess} from "@/utils/helpers";
import * as userTypeService from "../services/userType.service";

export async function getListUserType(req, res) {
    return responseSuccess(res, await userTypeService.getListUserType(req.query, req.currentAccount));
}

export async function createUserType(req, res) {
    await userTypeService.createUserType(req);
    return responseSuccess(res, null, 201);
}

export async function updateUserType(req, res) {
    await userTypeService.updateUserType(req);
    return responseSuccess(res, null, 201);
}

export async function deleteUserType(req, res) {
    await userTypeService.deleteUserType(req.userType);
    return responseSuccess(res);
}

export async function changePasswordUserType(req, res) {
    await userTypeService.changePasswordUserType(req.userType, req.body.new_password);
    return responseSuccess(res, null, 201);
}

export async function changeStatusUserType(req, res) {
    await userTypeService.changeStatusUserType(req.userType, req.body.status);
    return responseSuccess(res, null, 201);
}

//TEACHER
export async function getListTeacher(req, res) {
    return responseSuccess(res, await userTypeService.getListTeacher(req.query, req.currentAccount));
}

export async function createTeacher(req, res) {
    await userTypeService.createTeacher(req);
    return responseSuccess(res, null, 201);
}

export async function updateTeacher(req, res) {
    await userTypeService.updateTeacher(req);
    return responseSuccess(res, null, 201);
}

export async function deleteTeacher(req, res) {
    await userTypeService.deleteTeacher(req.userType);
    return responseSuccess(res);
}

export async function changePasswordTeacher(req, res) {
    await userTypeService.changePasswordTeacher(req.userType, req.body.new_password);
    return responseSuccess(res, null, 201);
}

export async function changeStatusTeacher(req, res) {
    await userTypeService.changeStatusTeacher(req.userType, req.body.status);
    return responseSuccess(res, null, 201);
}

//STUDENT
export async function getListStudent(req, res) {
    return responseSuccess(res, await userTypeService.getListStudent(req.query, req.currentAccount));
}

export async function createStudent(req, res) {
    await userTypeService.createStudent(req);
    return responseSuccess(res, null, 201);
}

export async function updateStudent(req, res) {
    await userTypeService.updateStudent(req);
    return responseSuccess(res, null, 201);
}

export async function deleteStudent(req, res) {
    await userTypeService.deleteStudent(req.userType);
    return responseSuccess(res);
}

export async function changePasswordStudent(req, res) {
    await userTypeService.changePasswordStudent(req.userType, req.body.new_password);
    return responseSuccess(res, null, 201);
}

export async function changeStatusStudent(req, res) {
    await userTypeService.changeStatusStudent(req.userType, req.body.status);
    return responseSuccess(res, null, 201);
}

