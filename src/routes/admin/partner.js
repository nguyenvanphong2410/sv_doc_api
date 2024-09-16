import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, validate, ensureRole} from "@/app/middleware/common";

import * as partnerRequest from "@/app/requests/partner.request";
import * as partnerController from "@/app/controllers/partner.controller";
import * as partnerMiddleware from "@/app/middleware/partner.middleware";

import {ACCOUNT_TYPE} from "@/configs";

const router = Router();

router.use(asyncHandler(verifyToken));

router.use(asyncHandler(ensureRole(ACCOUNT_TYPE.ADMIN)));

router.get(
    "/:type(customer|supplier)",
    asyncHandler(partnerMiddleware.checkPermissionListPartner),
    asyncHandler(validate(partnerRequest.getListPartnerRequest)),
    asyncHandler(partnerController.getListPartnerByType),
);

router.post(
    "/:type(customer|supplier)",
    asyncHandler(partnerMiddleware.checkPermissionCreatePartner),
    asyncHandler(validate(partnerRequest.createPartnerRequest)),
    asyncHandler(partnerController.createPartner),
);

router.put(
    "/:id",
    asyncHandler(partnerMiddleware.checkPermissionUpdatePartner),
    asyncHandler(validate(partnerRequest.updatePartnerRequest)),
    asyncHandler(partnerController.updatePartner),
);

router.delete(
    "/:id",
    asyncHandler(partnerMiddleware.checkPermissionDeletePartner),
    asyncHandler(partnerController.removePartner),
);

export default router;
