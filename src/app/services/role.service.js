

import { Permission } from "../models/permission";
import mongoose from "mongoose";
import { Role } from "../models/role";
import { capitalizeFirstLetter } from "@/utils/helpers/algorithm.helper";
import { PROTECTED } from "@/configs/enum";
import { LINK_STATIC_URL } from "@/configs";
import { User } from "../models/user";

export async function createRole({name, description, parent_id}) {
    const role = new Role({
        name: capitalizeFirstLetter(name),
        description: capitalizeFirstLetter(description),
        protected: PROTECTED.UNPROTECTED,
        permission_ids: [],
        parent_id: parent_id || null,
    });

    await role.save();
    return role;
}

export async function updateRole(role, {name, description, parent_id}) {
    role.name = capitalizeFirstLetter(name);
    role.parent_id = parent_id || null;
    role.description = capitalizeFirstLetter(description);
    await role.save();
    return updateRole;
}

export async function getListRole() {
    const roles = await Role.find({deleted: false})
        .sort({is_protected: -1, created_at: 1})
        .select({
            permission_ids: 0,
            created_at: 0,
            updated_at: 0,
            admin_ids: 0,
        })
        .lean();

    const data = await findRoles(roles, null);

    return {roles: data};
}

export async function removeRole(role) {
    const id = role._id;

    await deleteRoleAndChildren(id);
}

export async function updatePermissionForRole(req) {
    const roleId = req.params.id;
    const permissionId = req.params.permissionId;

    const role = req.role;

    const permission = await Permission.findById(permissionId);

    // Cập nhật lại permission_ids cho role
    const hasPermission = role.permission_ids.includes(permissionId);

    if (hasPermission) {
        role.permission_ids = role.permission_ids.filter(id => id.toString() !== permissionId.toString());
    } else {
        role.permission_ids.push(permissionId);
    }

    // Cập nhật role_ids cho permission
    const permissionRoleIdIndex = permission.role_ids.findIndex(
        (id) => id.toString() === roleId.toString()
    );

    if (hasPermission && permissionRoleIdIndex > -1) {
        permission.role_ids.splice(permissionRoleIdIndex, 1);
    } else if (!hasPermission && permissionRoleIdIndex === -1) {
        permission.role_ids.push(roleId);
    }

    await Promise.all([
        role.save(),
        permission.save(),
    ]);
}

export async function getAllAdminHasRole(req) {
    const id = req.params.id;

    const data = await User.find(
        {
            deleted: false,
            is_admin: true,
            role_ids: {$in: new mongoose.Types.ObjectId(id)},
        }, {
            password: 0,
            updated_at: 0,
            deleted: 0,
            created_at: 0,
            phone: 0,
            role_ids: 0,
            status: 0,
            protected: 0,
        }).sort({
        createdAt: -1
    });

    const newDataAdmins = data.map((admin) => {
        if (admin.avatar) {
            admin.avatar = LINK_STATIC_URL + admin.avatar;
        }
        return admin;
    });

    return {admins: newDataAdmins};
}

export async function getAllAdminWithoutRole(req) {
    const id = req.params.id;
    const email = req.email;
    const match = {deleted: false};
    let {q, page, page_size} = req.query;

    q = q?.trim() ? new RegExp(q.trim(), "i") : null;
    page = page && parseInt(page) > 0 ? parseInt(page) : 1;
    page_size = page_size ? parseInt(page_size) : 20;

    if (q !== null) {
        match.$or = [
            {name: {$regex: q}},
            {email: {$regex: q}}
        ];
    }

    const query = {
        email: {$ne: email},
        role_ids: {$ne: new mongoose.Types.ObjectId(id)},
        deleted: false,
        is_admin: true,
        protected: PROTECTED.UNPROTECTED,
        ...match
    };

    const projection = {
        password: 0,
        updated_at: 0,
        deleted: 0,
        created_at: 0,
        phone: 0,
        role_ids: 0,
        status: 0,
        protected: 0,
    };

    const options = { skip: (page - 1) * page_size, limit: page_size };

    const admins = await User.find(query, projection, options).sort({created_at: -1});
    const newDataAdmins = admins.map((admin) => {
        if (admin.avatar) {
            admin.avatar = LINK_STATIC_URL + admin.avatar;
        }
        return admin;
    });

    return {admins: newDataAdmins};
}

export async function updateRoleForAdmin(req) {
    const id = req.params.id;
    const adminIds = req.body.admin_ids;
    const role = req.role;

    await User.updateMany(
        {_id: {$in: adminIds}},
        {$addToSet: {role_ids: new mongoose.Types.ObjectId(id)}}
    );

    const uniqueAdminIds = adminIds.filter((id) => !role.admin_ids.includes(id));
    role.admin_ids = role.admin_ids.concat(uniqueAdminIds);
    await role.save();
}

export async function removeRoleFromAdmin(req) {
    const adminId = req.params.adminId;
    const roleId = req.params.id;

    await User.updateOne(
        {_id: new mongoose.Types.ObjectId(adminId)},
        {$pull: {role_ids: new mongoose.Types.ObjectId(roleId)}}
    );

    await Role.findOneAndUpdate(
        {_id: roleId},
        {$pull: {admin_ids: adminId}},
        {new: true}
    );
}

const findRoles = async (roles, parent_id) => {
    const children = roles.filter((role) => {
        return role.parent_id ? role.parent_id.equals(parent_id) : !parent_id ? true : false;
    });

    for (const child of children) {
        child.children = await findRoles(roles, child._id);
    }
    return children;
};

const deleteRoleAndChildren = async (id) => {
    const childRoles = await Role.find({ parent_id: id });

    if (childRoles.length > 0) {
        for (const childRole of childRoles) {
            await deleteRoleAndChildren(childRole._id);
        }
    }

    const roleIdsToDelete = [id, ...childRoles.map(childRole => childRole._id)];

    await User.updateMany(
        { role_ids: { $in: roleIdsToDelete } },
        { $pull: { role_ids: { $in: roleIdsToDelete } } }
    );

    await Role.updateOne({ _id: id }, { deleted: true });
};
