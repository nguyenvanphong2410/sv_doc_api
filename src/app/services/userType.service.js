import {LINK_STATIC_URL, STATUS_ACTIVE, USER_TYPE} from "@/configs";
import {generatePassword} from "@/utils/helpers";
import {FileUpload} from "@/utils/types";
import { User } from "../models/user";

export async function getListUserType({q, page, per_page, field, sort_order}, currentAccount) {
    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
        deleted: false,
        is_admin: false,
        _id: {$ne: currentAccount._id},
        user_type: USER_TYPE.OTHER,
    };

    const usersType = (
        await User.find(filter, {password: 0})
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field]: sort_order})
    ).map((userType) => {
        if (userType.avatar) {
            userType.avatar = LINK_STATIC_URL + userType.avatar;
        }
        return userType;
    });

    const total = await User.countDocuments(filter);
    return {total, page, per_page, usersType};
}

export async function createUserType(req) {
    const {password, ...data} = req.body;
    if (req.body.avatar instanceof FileUpload) {
        req.body.avatar = req.body.avatar.save("images/avatars");
    }
    const userType = new User({
        ...data,
        password: generatePassword(password),
        status: STATUS_ACTIVE.UNLOCK,
        is_admin: false,
        user_type: req.body.user_type
    });
    await userType.save();
    return userType;
}

export async function updateUserType(req) {
    const userType = req.userType;
    const {name, email, phone, status, user_type} = req.body;

    if (req.body.avatar) {
        if (userType.avatar) {
            FileUpload.remove(userType.avatar);
        }
        userType.avatar = req.body.avatar === "delete" ? "" : req.body.avatar.save("images/avatars");
    }

    userType.name = name;
    userType.email = email;
    userType.phone = phone;
    userType.status = status;
    userType.user_type = user_type;

    await userType.save();
    return userType;
}

export async function changePasswordUserType(userType, new_password) {
    userType.password = generatePassword(new_password);
    await userType.save();
    return userType;
}

export async function deleteUserType(userType) {
    if (userType.avatar) {
        FileUpload.remove(userType.avatar);
    }
    userType.deleted = true;
    await userType.save();
}

export async function changeStatusUserType(userType, status) {
    userType.status = status;
    await userType.save();
}


//TEACHER
export async function getListTeacher({q, page, per_page, field, sort_order}, currentAccount) {
    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
        deleted: false,
        is_admin: false,
        _id: {$ne: currentAccount._id},
        user_type: USER_TYPE.TEACHER,
    };

    const teachers = (
        await User.find(filter, {password: 0})
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field]: sort_order})
    ).map((userType) => {
        if (userType.avatar) {
            userType.avatar = LINK_STATIC_URL + userType.avatar;
        }
        return userType;
    });

    const total = await User.countDocuments(filter);
    return {total, page, per_page, teachers};
}

export async function createTeacher(req) {
    const {password, ...data} = req.body;
    if (req.body.avatar instanceof FileUpload) {
        req.body.avatar = req.body.avatar.save("images/avatars");
    }
    const userType = new User({
        ...data,
        password: generatePassword(password),
        status: STATUS_ACTIVE.UNLOCK,
        is_admin: false,
        user_type: USER_TYPE.TEACHER,
    });
    await userType.save();
    return userType;
}

export async function updateTeacher(req) {
    const userType = req.userType;
    const {name, email, phone, status, user_type} = req.body;

    if (req.body.avatar) {
        if (userType.avatar) {
            FileUpload.remove(userType.avatar);
        }
        userType.avatar = req.body.avatar === "delete" ? "" : req.body.avatar.save("images/avatars");
    }

    userType.name = name;
    userType.email = email;
    userType.phone = phone;
    userType.status = status;
    userType.user_type = user_type;
    await userType.save();
    return userType;
}

export async function changePasswordTeacher(userType, new_password) {
    userType.password = generatePassword(new_password);
    await userType.save();
    return userType;
}

export async function deleteTeacher(userType) {
    if (userType.avatar) {
        FileUpload.remove(userType.avatar);
    }
    userType.deleted = true;
    await userType.save();
}

export async function changeStatusTeacher(userType, status) {
    userType.status = status;
    await userType.save();
}

//STUDENT
export async function getListStudent({q, page, per_page, field, sort_order}, currentAccount) {
    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
        deleted: false,
        is_admin: false,
        _id: {$ne: currentAccount._id},
        user_type: USER_TYPE.STUDENT,
    };

    const students = (
        await User.find(filter, {password: 0})
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field]: sort_order})
    ).map((userType) => {
        if (userType.avatar) {
            userType.avatar = LINK_STATIC_URL + userType.avatar;
        }
        return userType;
    });

    const total = await User.countDocuments(filter);
    return {total, page, per_page, students};
}

export async function createStudent(req) {
    const {password, ...data} = req.body;
    if (req.body.avatar instanceof FileUpload) {
        req.body.avatar = req.body.avatar.save("images/avatars");
    }
    const userType = new User({
        ...data,
        password: generatePassword(password),
        status: STATUS_ACTIVE.UNLOCK,
        is_admin: false,
        user_type: USER_TYPE.STUDENT,
    });
    await userType.save();
    return userType;
}

export async function updateStudent(req) {
    const userType = req.userType;
    const {name, email, phone, status, user_type} = req.body;

    if (req.body.avatar) {
        if (userType.avatar) {
            FileUpload.remove(userType.avatar);
        }
        userType.avatar = req.body.avatar === "delete" ? "" : req.body.avatar.save("images/avatars");
    }

    userType.name = name;
    userType.email = email;
    userType.phone = phone;
    userType.status = status;
    userType.user_type = user_type;
    
    await userType.save();
    return userType;
}

export async function changePasswordStudent(userType, new_password) {
    userType.password = generatePassword(new_password);
    await userType.save();
    return userType;
}

export async function deleteStudent(userType) {
    if (userType.avatar) {
        FileUpload.remove(userType.avatar);
    }
    userType.deleted = true;
    await userType.save();
}

export async function changeStatusStudent(userType, status) {
    userType.status = status;
    await userType.save();
}