import {Role} from "@/app/models/role";
import { User } from "@/app/models/user";
import {PROTECTED, STATUS_ACTIVE, USER_TYPE} from "@/configs/enum";
import {generatePassword} from "@/utils/helpers";

export default async function () {
    let EMAIL = process.env.SUPER_ADMIN_EMAIL;
    let PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
    if (!EMAIL || !PASSWORD) {
        EMAIL = "admin@gmail.com";
        PASSWORD = "Admin@123";
        console.warn("---------------------------------------------------------------");
        console.warn('"Super Admin" is not configured. Using the default account:');
        console.warn(`Email: ${EMAIL}`);
        console.warn(`Password: ${PASSWORD}`);
        console.warn("---------------------------------------------------------------");
    }
    const role = await Role.findOne({name: "super_admin"});
    if (!role) {
        return console.warn('"Role" is not exist.');
    }
    const superAdmin = {
        name: "Super Admin",
        email: EMAIL,
        password: generatePassword(PASSWORD),
        role_ids: [role._id],
        status: STATUS_ACTIVE.UNLOCK,
        protected: PROTECTED.PROTECTED,
        is_admin: true,
        user_type: USER_TYPE.ADMIN
    };

    const admin = await User.findOneAndUpdate(
        {email: superAdmin.email},
        {$set: superAdmin},
        {upsert: true, new: true},
    );

    await Role.findOneAndUpdate({name: "super_admin"}, {$set: {admin_ids: [admin._id]}});
}
