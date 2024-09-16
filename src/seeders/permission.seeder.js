import { Permission, PermissionGroup, PermissionType } from "@/app/models";


const permission_types = {
    list: {
        name: "Truy cập",
        code: "list",
        position: 1,
    },
    detail: {
        name: "Xem chi tiết",
        code: "detail",
        position: 2,
    },
    add: {
        name: "Tạo mới",
        code: "add",
        position: 3,
    },
    edit: {
        name: "Chỉnh sửa",
        code: "edit",
        position: 4,
    },
    remove: {
        name: "Xóa",
        code: "delete",
        position: 5,
    },
};

const {list, add, edit, remove, detail} = permission_types;

const permission_groups = [
    {
        name: "Tổng quan",
        code: "admin-management",
        description: "",
        actor: "admin",
        children: [],
        types: {
            [list.code]: {
                name: "Xem tổng quan",
                description: "Xem thống kê tổng quan",
            },
        },
    },
    {
        name: "Quản lý tài liệu",
        code: "document-management",
        description: "",
        actor: "document",
        types: {
            [list.code]: {
                name: "Xem danh sách tài liệu",
                description: "Xem danh sách tài liệu",
            },
            [detail.code]: {
                name: "Xem chi tiết tài liệu",
                description: "Xem chi tiết tài liệu",
            },
            [add.code]: {
                name: "Thêm mới tài liệu",
                description: "Thêm mới tài liệu",
            },
            [edit.code]: {
                name: "Chỉnh sửa thông tin tài liệu",
                description: "Chỉnh sửa thông tin tài liệu",
            },
            [remove.code]: {
                name: "Xóa tài liệu",
                description: "Xóa tài liệu",
            },
        },
    },
    {
        name: "Quản lý danh mục",
        code: "category-management",
        description: "",
        actor: "category",
        types: {
            [list.code]: {
                name: "Xem danh sách danh mục",
                description: "Xem danh sách danh mục",
            },
            [add.code]: {
                name: "Thêm mới danh mục",
                description: "Thêm mới danh mục",
            },
            [edit.code]: {
                name: "Chỉnh sửa thông tin danh mục",
                description: "Chỉnh sửa thông tin danh mục",
            },
            [remove.code]: {
                name: "Xóa danh mục",
                description: "Xóa danh mục",
            },
        },
    },
    {
        name: "Quản lý tài khoản",
        code: "employee-management",
        description: "",
        actor: "employee",
        types: {
            [list.code]: {
                name: "Xem danh sách tài khoản",
                description: "Xem danh sách tài khoản",
            },
            [add.code]: {
                name: "Thêm mới tài khoản",
                description: "Thêm mới tài khoản",
            },
            [edit.code]: {
                name: "Chỉnh sửa thông tin tài khoản",
                description: "Chỉnh sửa thông tin tài khoản",
            },
            [remove.code]: {
                name: "Xóa tài khoản",
                description: "Xóa tài khoản",
            },
        },
        children: [
            {
                name: "Đổi mật khẩu tài khoản",
                code: "reset-password-employee",
                description: "Thay đổi mật khẩu tài khoản",
                children: [],
                actor: "reset-password-employee",
                types: {
                    [edit.code]: {
                        name: "Đổi mật khẩu tài khoản",
                        description: "Thay đổi mật khẩu tài khoản",
                    },
                },
            },
        ],
    },
    {
        name: "Quản lý vai trò",
        code: "role-management",
        actor: "role",
        description: "",
        types: {
            [list.code]: {
                name: "Xem danh sách vai trò người dùng",
                description: "Xem danh sách vai trò người dùng",
            },
            [add.code]: {
                name: "Thêm mới vai trò người dùng",
                description: "Thêm mới vai trò người dùng",
            },
            [edit.code]: {
                name: "Chỉnh sửa vai trò người dùng",
                description: "Chỉnh sửa vai trò người dùng",
            },
            [remove.code]: {
                name: "Xóa vai trò người dùng",
                description: "Xóa vai trò người dùng",
            },
        },
        children: [
            {
                name: "Quản lý quyền hạn",
                code: "permission-management",
                description: "",
                children: [],
                actor: "permission",
                types: {
                    [list.code]: {
                        name: "Xem danh sách quyền hạn của vai trò người dùng",
                        description: "Xem danh sách quyền hạn của vai trò người dùng",
                    },
                    [edit.code]: {
                        name: "Chỉnh sửa quyền hạn của vai trò người dùng",
                        description: "Chỉnh sửa quyền hạn của vai trò người dùng",
                    },
                },
            },
        ],
    },
];

async function handlePermissionAndPermissionGroup(data, parent_code = null) {
    for (const permission_group of data) {
        await PermissionGroup.findOneAndUpdate(
            {code: permission_group.code},
            {
                $set: {
                    code: permission_group.code,
                    name: permission_group.name,
                    description: permission_group.description,
                    parent_code: parent_code,
                },
            },
            {upsert: true, new: true},
        );
        for (const type_key of Object.keys(permission_group.types)) {
            await Permission.findOneAndUpdate(
                {code: `${type_key}-${permission_group.actor}`},
                {
                    $set: {
                        code: `${type_key}-${permission_group.actor}`,
                        name: permission_group.types[type_key].name,
                        description: permission_group.types[type_key].description,
                        permission_group_code: permission_group.code,
                        permission_type_code: type_key,
                    },
                },
                {upsert: true, new: true},
            );
        }
        if (permission_group.children?.length > 0) {
            await handlePermissionAndPermissionGroup(permission_group.children, permission_group.code);
        }
    }
}

export default async function () {
    try {
        // Quyền Quản trị cấp cao
        const super_admin_permission = {
            code: "super-admin",
            name: "Toàn bộ quyền",
            permission_group_code: null,
            permission_type_code: null,
            description: "Có toàn quyền sử dụng hệ thống",
        };
        await Permission.findOneAndUpdate(
            {code: super_admin_permission.code},
            {$set: {...super_admin_permission}},
            {upsert: true, new: true},
        );

        // Permission Types
        for (const key of Object.keys(permission_types)) {
            await PermissionType.findOneAndUpdate(
                {code: permission_types[key].code},
                {
                    $set: {
                        name: permission_types[key].name,
                        code: permission_types[key].code,
                        position: permission_types[key].position,
                    },
                },
                {upsert: true, new: true},
            );
        }

        // Permission Groups
        await handlePermissionAndPermissionGroup(permission_groups);
    } catch (error) {
        console.error(error);
    }
}
