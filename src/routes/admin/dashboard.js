import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, ensureRole} from "@/app/middleware/common";

import * as dashboardController from "@/app/controllers/dashboard.controller";
import {ACCOUNT_TYPE} from "@/configs";
import * as ensurePermissionsMiddleware from "@/app/middleware/admin/ensure-permissions.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-admin")),
    asyncHandler(dashboardController.getInfoDashboard),
);

export default router;
