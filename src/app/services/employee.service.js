import {ADMIN_ROLE, LINK_STATIC_URL, STATUS_ACTIVE, USER_TYPE} from "@/configs";
import {generatePassword} from "@/utils/helpers";
import {FileUpload} from "@/utils/types";
import { User } from "../models/user";

export async function createEmployee(req) {
    const {password, ...data} = req.body;
    if (req.body.avatar instanceof FileUpload) {
        req.body.avatar = req.body.avatar.save("images/avatars");
    }
    const employee = new User({
        ...data,
        password: generatePassword(password),
        role: ADMIN_ROLE.ADMIN,
        status: STATUS_ACTIVE.UNLOCK,
        is_admin: true,
        user_type: USER_TYPE.ADMIN
    });
    await employee.save();
    return employee;
}

export async function getListEmployee({q, page, per_page, field, sort_order}, currentAccount) {
    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
        deleted: false,
        is_admin: true,
        _id: {$ne: currentAccount._id},
    };

    const employees = (
        await User.find(filter, {password: 0})
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field]: sort_order})
    ).map((employee) => {
        if (employee.avatar) {
            employee.avatar = LINK_STATIC_URL + employee.avatar;
        }
        return employee;
    });

    const total = await User.countDocuments(filter);
    return {total, page, per_page, employees};
}

export async function getDetailEmployee(employeeId) {
    const employee = await User.findById(employeeId, {password: 0});
    employee.avatar = LINK_STATIC_URL + employee.avatar;
    return employee;
}

export async function updateEmployee(req) {
    const employee = req.admin;
    const {name, email, phone, status} = req.body;

    if (req.body.avatar) {
        if (employee.avatar) {
            FileUpload.remove(employee.avatar);
        }
        employee.avatar = req.body.avatar === "delete" ? "" : req.body.avatar.save("images/avatars");
    }

    employee.name = name;
    employee.email = email;
    employee.phone = phone;
    employee.status = status;
    await employee.save();
    return employee;
}

export async function changePasswordEmployee(employee, new_password) {
    employee.password = generatePassword(new_password);
    await employee.save();
    return employee;
}

export async function deleteEmployee(employee) {
    if (employee.avatar) {
        FileUpload.remove(employee.avatar);
    }
    employee.deleted = true;
    await employee.save();
}

export async function changeStatusEmployee(employee, status) {
    employee.status = status;
    await employee.save();
}
