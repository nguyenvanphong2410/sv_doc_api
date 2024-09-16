import { responseError } from "@/utils/helpers";

export const ensurePermissions = (...listPermission) => (req, res, next) => {
    let flag = false;

    if (req.permissions.includes("super-admin")) {
        next();
    } else {
        listPermission.forEach( (item) => {
            if (req.permissions.includes(item)) {
                flag = true;
            }
        });
        if (flag) {
            next();
        } else {
            return responseError(res, 404, "Bạn không có quyền truy cập chức năng này.");
        }
    }
};
