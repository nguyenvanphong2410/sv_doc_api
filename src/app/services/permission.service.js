
import {PermissionType} from "../models/permission-type";
import {PermissionGroup} from "../models/permission-group";
import {Permission} from "../models/permission";
import { Role } from "../models/role";

export async function getListPermissionType() {
    const permissionType = await PermissionType.find(
        {},
        {created_at: 0, updated_at: 0},
    ).sort({position: 1});

    return {permission_types: permissionType};
}

export async function getPermission(req) {
    const id = req.params.id;

    const role = await Role.findById(id).lean();
    const groups = await PermissionGroup.find({}, {created_at: 0, updated_at: 0}).lean();
    const permissions = await Permission.find({}, {created_at: 0, updated_at: 0}).lean();
    const permissionTypes = await PermissionType.find({}, {created_at: 0, updated_at: 0}).lean();

    const data = await findGroups(groups, null, permissions, permissionTypes, role);

    return {permissions: data};
}

async function findGroups(groups, parent_code, permissions, types, role) {
    const children = groups.filter((group) => group.parent_code === parent_code);
    for (const child of children) {
        const permissionsOfChild = permissions.filter((item) => item.permission_group_code === child.code);
        if (permissionsOfChild.length > 0) {
            const permissionTypeCodes = [
                ...new Set(permissions.map((permission) => permission.permission_type_code)),
            ];
            const permissionTypes = types
                .filter((item) => permissionTypeCodes.includes(item.code))
                .sort(function (a, b) {
                    return a.position - b.position;
                });
            const permissionsByType = [];

            for (const type of permissionTypes) {
                permissionsByType[type.position - 1] = permissionsOfChild.find(
                    (permission) => permission.permission_type_code === type.code,
                );
            }

            for (const permission of permissionsByType) {
                if (permission) {
                    if (role.name === "super_admin") {
                        permission.active = true;
                    } else {
                        permission.active = role.permission_ids.some(
                            (permissionId) => permissionId.toHexString() === permission._id.toHexString(),
                        );
                    }
                }
            }

            child.permissions = permissionsByType;
        }

        child.children = await findGroups(groups, child.code, permissions, types, role);
    }

    return children;
}
