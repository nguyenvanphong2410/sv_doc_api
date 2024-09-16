import {Category} from "../models/category";
import {DocumentCategory} from "../models/document-categories";

export async function createCategory({name, desc}) {
    const maxPositionCategory = await Category.findOne().sort({position: -1});

    const newPosition = maxPositionCategory ? maxPositionCategory.position + 1 : 0;

    const category = new Category({
        name,
        desc,
        position: newPosition,
    });

    await category.save();

    return category;
}

export async function getListCategory({q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;

    const filter = {
        ...(q && {$or: [{name: q}]}),
        deleted: false,
    };

    const categories = await Category.find(filter)
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order});

    const total = await Category.countDocuments(filter);
    return {total, page, per_page, categories};
}

export async function getAllCategory() {
    const categories = await Category.find({
        deleted: false,
    });
    return {categories};
}

export async function getDetailCategory(categoryId) {
    const category = await Category.findById(categoryId);
    return category;
}

export async function updateCategory(id, {name, desc}) {
    const categoryUpdate = await Category.findOneAndUpdate({_id: id}, {name: name, desc: desc});
    return categoryUpdate;
}

export async function deleteCategory(category) {
    category.deleted = true;
    await category.save();
    return await DocumentCategory.deleteMany({category_id: category._id});
}
