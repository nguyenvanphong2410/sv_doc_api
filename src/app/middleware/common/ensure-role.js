import {responseError} from "@/utils/helpers";

export const ensureRole = (type) => (req, res, next) => {
    if (req.currentAccount.account_type === type) {
        return next();
    }
    return responseError(res, 403, "Không có quyền truy cập.");
};
