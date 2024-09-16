import {responseError, responseSuccess, getToken} from "@/utils/helpers";
import * as authService from "../services/auth.service";
import {changePasswordEmployee} from "../services/employee.service";

export async function register(req, res) {
    const newUser = await authService.register(req.body);
    const result = authService.authToken(newUser._id);
    return responseSuccess(res, result, 201, "Đăng ký thành công");
}

export async function login(req, res) {
    const validLogin = await authService.checkValidAdminLogin(req.body);

    if (validLogin) {
        return responseSuccess(res, authService.authToken(validLogin._id, validLogin.account_type));
    } else {
        return responseError(res, 400, "Email hoặc mật khẩu không chính xác");
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers);
    await authService.blockToken(token);
    return responseSuccess(res, null, 201);
}

export async function me(req, res) {
    return responseSuccess(res, await authService.profile(req.currentAccount));
}

export async function updateProfile(req, res) {
    await authService.updateProfile(req.currentAccount, req.body);
    return responseSuccess(res, null, 201);
}

export async function changePassword(req, res) {
    await changePasswordEmployee(req.currentAccount, req.body.new_password);
    return responseSuccess(res, null, 201);
}
