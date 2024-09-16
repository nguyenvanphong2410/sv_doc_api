import {responseSuccess} from "@/utils/helpers";
import * as roleService from "@/app/services/role.service";

export async function createRole(req, res) {
    await roleService.createRole(req.body);
    return responseSuccess(res, null, 201);
}

export async function updateRole(req, res) {
    await roleService.updateRole(req.role, req.body);
    return responseSuccess(res, null, 201);
}

export async function getListRole(req, res) {
    return responseSuccess(res, await roleService.getListRole(req.query));
}

export async function removeRole(req, res) {
    await roleService.removeRole(req.role);
    return responseSuccess(res);
}

export async function updatePermissionForRole(req, res) {
    await roleService.updatePermissionForRole(req);
    return responseSuccess(res);
}

export async function getAllAdminHasRole(req, res) {
    return responseSuccess(res, await roleService.getAllAdminHasRole(req));
}

export async function getAllAdminWithoutRole(req, res) {
    return responseSuccess(res, await roleService.getAllAdminWithoutRole(req));
}

export async function updateRoleForAdmin(req, res) {
    await roleService.updateRoleForAdmin(req);
    return responseSuccess(res);
}

export async function removeRoleFromAdmin(req, res) {
    await roleService.removeRoleFromAdmin(req);
    return responseSuccess(res);
}

