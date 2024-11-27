import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {
    verifyToken,
    validate,
    upload,
    ensureRole
} from "@/app/middleware/common";

import * as userTypeRequest from "@/app/requests/userType.request";
import * as userTypeController from "@/app/controllers/userType.controller";
import { ACCOUNT_TYPE } from "@/configs";
import * as ensurePermissionsMiddleware from "@/app/middleware/admin/ensure-permissions.middleware";

import * as userTypeMiddleware from "@/app/middleware/userType.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

//OTHER
router.get(
    "/other",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-management-other")),
    asyncHandler(validate(userTypeRequest.getListUserTypeRequest)),
    asyncHandler(userTypeController.getListUserType)
);

router.post(
    "/other",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("add-management-other")),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.createUserTypeRequest)),
    asyncHandler(userTypeController.createUserType)
);

router.put(
    "/other/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-other")),
    asyncHandler(userTypeMiddleware.checkUserTypeId),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.updateUserTypeRequest)),
    asyncHandler(userTypeController.updateUserType),
);

router.delete(
    "/other/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("delete-management-other")),
    asyncHandler(userTypeMiddleware.checkUserTypeId),
    asyncHandler(userTypeMiddleware.checkDeleteUserTypeId),
    asyncHandler(userTypeController.deleteUserType)
);

router.patch(
    "/other/reset-password/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-reset-password-other")),
    asyncHandler(userTypeMiddleware.checkUserTypeId),
    asyncHandler(validate(userTypeRequest.changePasswordUserTypeRequest)),
    asyncHandler(userTypeController.changePasswordUserType),
);

router.put("/other/update-status/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-other")),
    asyncHandler(userTypeMiddleware.checkUserTypeId),
    asyncHandler(validate(userTypeRequest.changeStatusUserTypeRequest)),
    asyncHandler(userTypeController.changeStatusUserType),
);

//TEACHER
router.get(
    "/teacher",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-management-teacher")),
    asyncHandler(validate(userTypeRequest.getListUserTypeRequest)),
    asyncHandler(userTypeController.getListTeacher)
);

router.post(
    "/teacher",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("add-management-teacher")),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.createUserTypeRequest)),
    asyncHandler(userTypeController.createTeacher)
);

router.put(
    "/teacher/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-teacher")),
    asyncHandler(userTypeMiddleware.checkTeacherId),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.updateUserTypeRequest)),
    asyncHandler(userTypeController.updateTeacher),
);

router.delete(
    "/teacher/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("delete-management-teacher")),
    asyncHandler(userTypeMiddleware.checkTeacherId),
    asyncHandler(userTypeMiddleware.checkDeleteTeacherId),
    asyncHandler(userTypeController.deleteTeacher)
);

router.patch(
    "/teacher/reset-password/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-reset-password-teacher")),
    asyncHandler(userTypeMiddleware.checkTeacherId),
    asyncHandler(validate(userTypeRequest.changePasswordUserTypeRequest)),
    asyncHandler(userTypeController.changePasswordTeacher),
);

router.put("/teacher/update-status/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-teacher")),
    asyncHandler(userTypeMiddleware.checkTeacherId),
    asyncHandler(validate(userTypeRequest.changeStatusUserTypeRequest)),
    asyncHandler(userTypeController.changeStatusTeacher),
);

//STUDENT
router.get(
    "/student",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-management-student")),
    asyncHandler(validate(userTypeRequest.getListUserTypeRequest)),
    asyncHandler(userTypeController.getListStudent)
);

router.post(
    "/student",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("add-management-student")),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.createUserTypeRequest)),
    asyncHandler(userTypeController.createStudent)
);

router.put(
    "/student/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-student")),
    asyncHandler(userTypeMiddleware.checkStudentId),
    asyncHandler(upload),
    asyncHandler(validate(userTypeRequest.updateUserTypeRequest)),
    asyncHandler(userTypeController.updateStudent),
);

router.delete(
    "/student/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("delete-management-student")),
    asyncHandler(userTypeMiddleware.checkStudentId),
    asyncHandler(userTypeMiddleware.checkDeleteStudentId),
    asyncHandler(userTypeController.deleteStudent)
);

router.patch(
    "/student/reset-password/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-reset-password-student")),
    asyncHandler(userTypeMiddleware.checkStudentId),
    asyncHandler(validate(userTypeRequest.changePasswordUserTypeRequest)),
    asyncHandler(userTypeController.changePasswordStudent),
);

router.put("/student/update-status/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-management-student")),
    asyncHandler(userTypeMiddleware.checkStudentId),
    asyncHandler(validate(userTypeRequest.changeStatusUserTypeRequest)),
    asyncHandler(userTypeController.changeStatusStudent),
);
export default router;
