import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, validate, upload, ensureRole} from "@/app/middleware/common";

import * as documentRequest from "@/app/requests/document.request";
import * as documentController from "@/app/controllers/document.controller";
import * as documentMiddleware from "@/app/middleware/document.middleware";

import * as ensurePermissionsMiddleware from "@/app/middleware/admin/ensure-permissions.middleware";
import {ACCOUNT_TYPE} from "@/configs";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("list-document")),
    asyncHandler(validate(documentRequest.getListDocumentRequest)),
    asyncHandler(documentController.getListDocument),
);

router.get(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("detail-document")),
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(documentController.getDetailDocument),
);

router.post(
    "/",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("add-document")),
    asyncHandler(upload),
    asyncHandler(validate(documentRequest.createDocumentRequest)),
    asyncHandler(documentController.createDocument),
);

router.put(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-document")),
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(upload),
    asyncHandler(validate(documentRequest.updateDocumentRequest)),
    asyncHandler(documentController.updateDocument),
);

router.delete(
    "/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("delete-document")),
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(documentController.deleteDocument),
);

router.put("/update-status/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-document")),
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(validate(documentRequest.changeStatusDocumentRequest)),
    asyncHandler(documentController.changeStatusDocument),
);

router.put("/update-doc-check/:id",
    asyncHandler(ensurePermissionsMiddleware.ensurePermissions("edit-document")),
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(validate(documentRequest.changeDocCheckRequest)),
    asyncHandler(documentController.changeDocCheckDocument),
);

export default router;
