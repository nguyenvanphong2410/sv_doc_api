import { PROTECTED } from "@/configs";
import { Category, Document, User } from "../models";

export async function getInfoDashboard() {
    const categories = await Category.find({
        deleted: false,
    });

    // Sử dụng aggregate để nhóm và đếm số lượng người dùng theo user_type và is_admin
    const userStats = await User.aggregate([
        { 
            $match: {
                deleted: false,
                protected: PROTECTED.UNPROTECTED
            }
        },
        { 
            $group: {
                _id: null,
                total_teacher: { $sum: { $cond: [{ $eq: ["$user_type", "TEACHER"] }, 1, 0] } },
                total_student: { $sum: { $cond: [{ $eq: ["$user_type", "STUDENT"] }, 1, 0] } },
                total_other: { $sum: { $cond: [{ $eq: ["$user_type", "OTHER"] }, 1, 0] } },
                total_admin: { $sum: { $cond: [{ $eq: ["$is_admin", true] }, 1, 0] } }
            }
        }
    ]);

    const docStats = await Document.aggregate([
        { 
            $match: {
                deleted: false,
            }
        },
        { 
            $group: {
                _id: null,
                total_doc_checked: { $sum: { $cond: [{ $eq: ["$doc_check", "CHECKED"] }, 1, 0] } },
                total_doc_pending: { $sum: { $cond: [{ $eq: ["$doc_check", "PENDING"] }, 1, 0] } },
                total_lock: { $sum: { $cond: [{ $eq: ["$status", "LOCK"] }, 1, 0] } },
            }
        }
    ]);

    const stats = userStats[0] || {
        total_teacher: 0,
        total_student: 0,
        total_other: 0,
        total_admin: 0
    };

    const statsDoc = docStats[0] || {
        total_teacher: 0,
        total_student: 0,
        total_other: 0,
        total_admin: 0
    };

    return {
        total_category: categories.length,
        ...statsDoc,
        ...stats
    };
}
