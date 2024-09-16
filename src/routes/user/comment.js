import {Router} from "express";
import {asyncHandler} from "@/utils/handlers";
import {verifyToken, validate} from "@/app/middleware/common";
import * as commentController from "@/app/controllers/comment.controller";
import * as commentRequest from "@/app/requests/comment.request";
import * as commentMiddleware from "@/app/middleware/comment.middleware";

const router = Router();

router.use(asyncHandler(verifyToken));

router.get(
    "/by-id-doc/:id",
    asyncHandler(commentMiddleware.checkDocumentForComment),
    asyncHandler(commentController.getAllCommentByIdDoc),
);

router.post(
    "/:id",
    asyncHandler(commentMiddleware.checkDocumentForComment),
    asyncHandler(validate(commentRequest.createOrUpdateCommentRequest)),
    asyncHandler(commentController.createComment),
);

router.put(
    "/:id",
    asyncHandler(commentMiddleware.checkComment),
    asyncHandler(validate(commentRequest.createOrUpdateCommentRequest)),
    asyncHandler(commentController.updateComment),
);

router.delete(
    "/:id",
    asyncHandler(commentMiddleware.checkComment),
    asyncHandler(commentController.deleteComment),
);

export default router;
