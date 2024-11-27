import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {
    verifyToken,
    validate,
    upload
} from "@/app/middleware/common";

import * as documentRequest from "@/app/requests/document.request";
import * as documentController from "@/app/controllers/document.controller";
// import * as documentMiddleware from "@/app/middleware/document.middleware";
import * as documentMiddleware from "@/app/middleware/document.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));

router.get(
    "/",
    asyncHandler(validate(documentRequest.getListDocumentRequest)),
    asyncHandler(documentController.getListDocumentForUser),
);

router.get(
    "/:id",
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(documentController.getDetailDocumentForUser),
);

router.get(
    "/:id/view-quantity",
    asyncHandler(documentController.getListDocumentView),
);

router.get(
    "/my-doc-pending/:id",
    asyncHandler(documentMiddleware.checkIdMyDoc),
    asyncHandler(validate(documentRequest.getListDocumentRequest)),
    asyncHandler(documentController.getListMyDocPending),
);

router.get(
    "/my-doc-checked/:id",
    asyncHandler(documentMiddleware.checkIdMyDoc),
    asyncHandler(validate(documentRequest.getListDocumentRequest)),
    asyncHandler(documentController.getListMyDocChecked),
);


router.get(
    "/my-doc-lock/:id",
    asyncHandler(documentMiddleware.checkIdMyDoc),
    asyncHandler(validate(documentRequest.getListDocumentRequest)),
    asyncHandler(documentController.getListMyDocLock),
);

router.post(
    "/",
    asyncHandler(upload),
    asyncHandler(validate(documentRequest.createDocumentRequest)),
    asyncHandler(documentController.createDocumentForUser),
);

router.patch(
    "/update-view/:id",
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(documentController.updateViewDocument),
);

router.put(
    "/update-my-doc/:id",
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(upload),
    asyncHandler(validate(documentRequest.updateDocumentRequest)),
    asyncHandler(documentController.updateDocument),
);

router.delete(
    "/delete-my-doc/:id",
    asyncHandler(documentMiddleware.checkDocument),
    asyncHandler(documentController.deleteDocument),
);

export default router;
