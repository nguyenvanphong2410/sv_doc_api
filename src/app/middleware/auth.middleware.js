import {TOKEN_TYPE} from "@/configs";
import {JsonWebTokenError, NotBeforeError, TokenExpiredError} from "jsonwebtoken";
import {responseError, validToken} from "@/utils/helpers";
import {forgotPasswordList} from "../services/auth.service";
import { User } from "../models/user";

export async function checkForgotPasswordToken(req, res, next) {
    const token = req.params.forgotPasswordToken;
    try {
        const data = validToken(TOKEN_TYPE.FORGOT_PASSWORD, token);
        const userToken = await forgotPasswordList.get(data.user_id);
        if (userToken === token) {
            const user = await User.findById(data.user_id);
            req.currentAccount = user;
            await forgotPasswordList.remove(data.user_id);
            return next();
        }
        throw new NotBeforeError();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            if (error instanceof TokenExpiredError) {
                return responseError(res, 401, "Liên kết đã hết hạn", {code: "TokenExpired"});
            } else if (error instanceof NotBeforeError) {
                return responseError(res, 401, "Liên kết không hoạt động", {code: "NotBefore"});
            } else {
                return responseError(res, 401, "Liên kết không hợp lệ", {code: "JsonWebToken"});
            }
        }

        return next(error);
    }
}
