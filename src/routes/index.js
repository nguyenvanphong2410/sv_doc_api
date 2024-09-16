import adminRouter from "./admin";
import userRouter from "./user";

export default function route(app) {
    app.use("/admin", adminRouter);
    app.use("/user", userRouter);
}
