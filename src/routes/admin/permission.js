import {Router} from "express";

import * as permissionTypeController from "@/app/controllers/permission.controller";
import * as permissionMiddleware from "@/app/middleware/permission.middleware";

import {asyncHandler} from "@/utils/handlers";
import {ensureRole, verifyToken} from "@/app/middleware/common";
import { ACCOUNT_TYPE } from "@/configs/enum";

import * as ensurePermissionsMiddleware from "@/app/middleware/admin/ensure-permissions.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));
router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/types",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-permission")),
    asyncHandler(permissionTypeController.getListPermissionType)
);

router.get(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-permission")),
    asyncHandler(permissionMiddleware.checkRoleId),
    asyncHandler(permissionTypeController.getPermission)
);

export default router;
