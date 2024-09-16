import {responseSuccess} from "@/utils/helpers";
import * as permissionTypeService from "@/app/services/permission.service";

export async function getListPermissionType(req, res) {
    return responseSuccess(res, await permissionTypeService.getListPermissionType(req.query));
}

export async function getPermission(req, res) {
    return responseSuccess(res, await permissionTypeService.getPermission(req));
}
