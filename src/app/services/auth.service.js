import moment from "moment";
import jwt from "jsonwebtoken";
import {ACCOUNT_TYPE, cache, JWT_EXPIRES_IN, LINK_STATIC_URL, TOKEN_TYPE, STATUS_ACTIVE, USER_TYPE} from "@/configs";
import {FileUpload} from "@/utils/types";
import {comparePassword, generatePassword, generateToken} from "@/utils/helpers";
import { User } from "../models/user";

export const tokenBlocklist = cache.create("token-block-list");
export const forgotPasswordList = cache.create("forgot-password-list");

export async function register({name, email, password, phone}) {
    const userRegister = new User({
        name,
        email,
        password: generatePassword(password),
        phone,
        is_admin: false,
        user_type: USER_TYPE.OTHER
    });
    return await userRegister.save();
}

export async function checkValidUserLogin({password}, user) {
    if (user) {
        const verified = comparePassword(password, user.password);
        if (verified) {
            user.account_type = ACCOUNT_TYPE.USER;
            return user;
        }
    }

    return false;
}

export async function checkValidAdminLogin({email, password}) {
    const admin = await User.findOne({
        email: email,
        deleted: false,
        status: STATUS_ACTIVE.UNLOCK,
    });

    if (admin) {
        const verified = comparePassword(password, admin.password);
        if (verified) {
            admin.account_type = ACCOUNT_TYPE.ADMIN;
            return admin;
        }
    }

    return false;
}

export function authToken(account_id, account_type) {
    const accessToken = generateToken(TOKEN_TYPE.AUTHORIZATION, {account_id, account_type}, JWT_EXPIRES_IN);
    const decode = jwt.decode(accessToken);
    const expireIn = decode.exp - decode.iat;
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: "Bearer Token",
    };
}

export async function blockToken(token) {
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp;
    const now = moment().unix();

    await tokenBlocklist.set(token, 1, expiresIn - now);
}

export async function profile(account) {
    let result;
    switch (account.account_type) {
        case ACCOUNT_TYPE.ADMIN:
            result = await User.aggregate([
                {
                    $match: {_id: account._id, deleted: false},
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "role_ids",
                        foreignField: "_id",
                        as: "roles",
                    },
                },
                {
                    $lookup: {
                        from: "permissions",
                        localField: "roles.permission_ids",
                        foreignField: "_id",
                        as: "permissions",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        deleted: 1,
                        phone: 1,
                        is_admin:1,
                        user_type:1,
                        avatar: {
                            $cond: {
                                if: {
                                    $or: [{$eq: ["$avatar", null]}, {$eq: ["$avatar", ""]}],
                                },
                                then: null,
                                else: {$concat: [LINK_STATIC_URL, "$avatar"]},
                            },
                        },
                        status: 1,
                        confirmed_at: 1,
                        permissions: "$permissions.code",
                    },
                },
            ]);
            result = result["0"] || null;
            break;
    }

    if (account.account_type === ACCOUNT_TYPE.USER) {
        result = {...result.toObject()};
    }

    return result;
}

export async function updateProfile(currentAccount, {name, phone, avatar}) {
    currentAccount.name = name;
    if (phone) {
        currentAccount.phone = phone;
    }
    if (avatar) {
        if (currentAccount.avatar) {
            FileUpload.remove(currentAccount.avatar);
        }
        currentAccount.avatar = avatar === "delete" ? "" : avatar.save("images/avatars");
    }

    return await currentAccount.save();
}
