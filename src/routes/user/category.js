import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, 
    validate, 
    ensureRole} from "@/app/middleware/common";

// import * as categoryRequest from "@/app/requests/category.request";
import * as categoryController from "@/app/controllers/category.controller";
import {ACCOUNT_TYPE} from "@/configs";
import {checkCategoryId} from "@/app/middleware/category.middleware";
import {getListDocumentByCategoryIdRequest, getListDocumentRequest} from "@/app/requests/document.request";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/all",
    asyncHandler(categoryController.getAllCategory),
);

// router.get(
//     "/:id",
//     asyncHandler(categoryController.getDetailCategory),
// );

router.get(
    "/:id/document",
    asyncHandler(checkCategoryId),
    asyncHandler(validate(getListDocumentRequest)),
    asyncHandler(categoryController.getListDocumentByCategoryIdForUser),
);

router.get(
    "/document-by-category-id",
    asyncHandler(validate(getListDocumentByCategoryIdRequest)),
    asyncHandler(categoryController.getListDocumentByCategoryIdForUserNha),
);


export default router;
