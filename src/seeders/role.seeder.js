import { Permission, Role } from "@/app/models";
import { PROTECTED } from "@/configs/enum";

export default async function () {
    const roleSuperAdmin = {
        name: "super_admin",
        description: "Quản trị hệ thống",
        protected: PROTECTED.PROTECTED,
        permission_ids: ["super-admin"],
    };
    try {
        const role = await Role.findOneAndUpdate(
            {
                name: roleSuperAdmin.name,
            },
            {
                $set: {
                    name: roleSuperAdmin.name,
                    description: roleSuperAdmin.description,
                    protected: roleSuperAdmin.protected,
                    parent_id: null,
                    permission_ids:
                        roleSuperAdmin.permission_ids?.length > 0
                            ? (
                                await Permission.find({
                                    code: {$in: roleSuperAdmin.permission_ids},
                                })
                            ).map((p) => p._id)
                            : roleSuperAdmin.permission_ids,
                },
            },
            {
                upsert: true,
                new: true,
            },
        );
        await Permission.updateMany(
            {
                _id: {$in: role.permission_ids},
                role_ids: {$ne: role._id},
            },
            {
                $addToSet: {role_ids: role._id},
            },
        );
    } catch (error) {
        console.error(error);
    }
}
