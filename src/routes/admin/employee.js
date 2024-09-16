import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, validate, upload, ensureRole} from "@/app/middleware/common";

import * as employeeRequest from "@/app/requests/employee.request";
import * as adminMiddleware from "@/app/middleware/admin.middleware";
import * as employeeController from "@/app/controllers/employee.controller";
import { ACCOUNT_TYPE } from "@/configs";
import * as ensurePermissionsMiddleware from "@/app/middleware/admin/ensure-permissions.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-employee")),
    asyncHandler(validate(employeeRequest.getListEmployeeRequest)),
    asyncHandler(employeeController.getListEmployee)
);

router.post(
    "/",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("add-employee")),
    asyncHandler(upload),
    asyncHandler(validate(employeeRequest.createEmployeeRequest)),
    asyncHandler(employeeController.createEmployee)
);

router.put(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-employee")),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(upload),
    asyncHandler(validate(employeeRequest.updateEmployeeRequest)),
    asyncHandler(employeeController.updateEmployee),
);

router.delete(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("delete-employee")),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(adminMiddleware.checkDeleteAdminId),
    asyncHandler(employeeController.deleteEmployee)
);

router.patch(
    "/reset-password/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-reset-password-employee")),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(validate(employeeRequest.changePasswordEmployeeRequest)),
    asyncHandler(employeeController.changePasswordEmployee),
);

router.put("/update-status/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-employee")),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(validate(employeeRequest.changeStatusEmployeeRequest)),
    asyncHandler(employeeController.changeStatusEmployee),
);

export default router;
