import { Router } from "express";
import documentRouter from "./document";
import categoryReducer from "./category";
import commentReducer from "./comment";

const router = Router();

router.use("/document", documentRouter);
router.use("/category", categoryReducer);
router.use("/comment", commentReducer);

export default router;
