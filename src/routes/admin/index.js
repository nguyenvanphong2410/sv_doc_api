import { Router } from "express";
import authRouter from "./auth";
import employeeRouter from "./employee";
import documentRouter from "./document";
import categoryReducer from "./category";
import roleRouter from "./role";
import permissionRouter from "./permission";
import partnerRouter from "./partner";
import userTypeRouter from "./userType";
import dashboardRouter from "./dashboard";

const router = Router();

router.use("/auth", authRouter);
router.use("/employees", employeeRouter);
router.use("/document", documentRouter);
router.use("/category", categoryReducer);
router.use("/roles", roleRouter);
router.use("/permissions", permissionRouter);
router.use("/partner", partnerRouter);
router.use("/user-type", userTypeRouter);
router.use("/dashboard", dashboardRouter);

export default router;
