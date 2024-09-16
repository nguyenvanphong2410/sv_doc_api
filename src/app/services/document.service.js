import _ from "lodash";
import {LINK_STATIC_URL, STATUS_ACTIVE, STATUS_DOC_CHECK} from "@/configs";
import {FileUpload} from "@/utils/types";
import {ObjectId, Document, User} from "../models";
import {Category} from "../models/category";
import {DocumentCategory} from "../models/document-categories";
import mongoose from "mongoose";
import {Comment} from "../models/comments";

export async function getListDocument({q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;
    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        deleted: false,
    };
    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
            {
                $lookup: {
                    from: "users", // truy vấn đến collection "users"
                    localField: "creator_id", // trường creator_id trong Document
                    foreignField: "_id", // trường _id trong User
                    as: "creator_info", // kết quả sẽ nằm trong trường creator_info
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;

        // Lấy thông tin người tạo
        const creator = document.creator_info?.[0] || {}; // Lấy thông tin người tạo từ creator_info
        document.creator = {
            _id: creator._id,
            name: creator.name,
            avatar: creator.avatar ? LINK_STATIC_URL + creator.avatar : null, // Giả sử user có trường 'avatar' trong schema
            email: creator.email,
        };

        const {document_categories, creator_info, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getListDocumentByCategoryId(categoryId, {q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;
    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        deleted: false,
    };
    query
        .match(filter)
        .lookup({
            from: "document_categories",
            localField: "_id",
            foreignField: "document_id",
            as: "document_categories",
        })
        .unwind("$document_categories")
        .match({"document_categories.category_id": new ObjectId(categoryId)});

    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );
    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);
        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getDetailDocument(documentId) {
    const document = await Document.findOne({_id: documentId, deleted: false});

    const crt = await User.findOne({_id: document.creator_id, deleted: false});

    document.file_record = LINK_STATIC_URL + document.file_record;
    document.images = document.images.map((img) => LINK_STATIC_URL + img);

    return {
        ...document.toObject(),
        creator: crt._id
            ? {
                _id: crt._id,
                name: crt.name,
                email: crt.email,
                avatar: crt.avatar ? LINK_STATIC_URL + crt.avatar : null,
            }
            : null,
    };
}

export async function createDocument(
    {images, image_featured, category_id, file_record, ...data},
    creator_id,
) {
    const lastDocument = await Document.findOne().sort({code: -1});

    let newCode = "TL000001";

    if (lastDocument) {
        const lastCode = lastDocument.code;
        const numberPart = parseInt(lastCode.slice(2), 10) + 1;
        newCode = `TL${numberPart.toString().padStart(6, "0")}`;
    }

    images = await Promise.all(images.map((img) => img.save("images/documents")));

    if (file_record) {
        file_record = await file_record.save("file_record");
    }

    const document = new Document({
        ...data,
        code: newCode,
        images,
        image_featured: images.length > 0 && _.isNumber(image_featured) ? image_featured : null,
        file_record,
        creator_id: creator_id._id,
    });

    const newDocument = await document.save();

    if (_.isArray(category_id)) {
        await Promise.all(
            category_id.map((item) => {
                const documentCategory = new DocumentCategory({
                    document_id: newDocument._id,
                    category_id: item,
                });
                return documentCategory.save();
            }),
        );
    }

    return document;
}

export async function updateDocument(
    document,
    {
        name,
        description,
        images,
        image_featured,
        category_id,
        author,
        publisher,
        publication_time,
        file_record,
        name_file,
        status,
        doc_check,
    },
    creator,
) {
    console.log("🌈 ~ creator:", creator);
    const keepImages = document.images.filter((img) => images.includes(img));
    const removeImages = document.images.filter((img) => !images.includes(img));
    images = images.filter((img) => img instanceof FileUpload).map((img) => img.save("images/documents"));
    if (file_record && typeof file_record !== "string") {
        document.file_record = await file_record.save("file_record");
    }
    const newImages = await Promise.all(images);

    for (const img of removeImages) {
        FileUpload.remove(img);
    }

    document.name = name;
    document.description = description;
    document.images = [...keepImages, ...newImages];
    document.image_featured =
        document.images.length > 0 && _.isNumber(image_featured) ? image_featured : null;
    document.author = author;
    document.publisher = publisher;
    document.publication_time = publication_time;
    document.name_file = name_file;

    if (!category_id || _.isEmpty(category_id)) {
        await DocumentCategory.deleteMany({
            document_id: document._id,
        });
    }

    if (_.isArray(category_id) && category_id.length > 0) {
        const promises = category_id.map((id) =>
            DocumentCategory.findOneAndUpdate(
                {
                    document_id: document._id,
                    category_id: id,
                },
                {
                    document_id: document._id,
                    category_id: id,
                },
                {upsert: true, new: true},
            ),
        );
        await Promise.all([
            ...promises,
            DocumentCategory.deleteMany({
                document_id: document._id,
                category_id: {$nin: category_id},
            }),
        ]);
    }

    const newDocument = await document.save();
    console.log("🌈 ~ newDocument:", newDocument);

    return document;
}

export async function deleteDocument(document) {
    for (const img of document.images) {
        FileUpload.remove(img);
    }
    FileUpload.remove(document.file_record);
    document.deleted = true;
    await document.save();
    return await DocumentCategory.deleteMany({
        document_id: document._id,
    });
}

export async function changeStatusDocument(document, status) {
    if (status) {
        document.status = status;
    }

    await document.save();
}

export async function changeDocCheckDocument(document, doc_check) {
    console.log("🌈 ~ changeDocCheckDocument ~ doc_check:", doc_check);

    if (doc_check) {
        document.doc_check = doc_check;
    }

    await document.save();
}

//ForUser
export async function getListDocumentForUser({q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;
    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        doc_check: STATUS_DOC_CHECK.CHECKED,
        status: STATUS_ACTIVE.UNLOCK,
        deleted: false,
    };
    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getListDocumentByCategoryIdForUser(categoryId, {q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;
    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        doc_check: STATUS_DOC_CHECK.CHECKED,
        status: STATUS_ACTIVE.UNLOCK,
        deleted: false,
    };
    query
        .match(filter)
        .lookup({
            from: "document_categories",
            localField: "_id",
            foreignField: "document_id",
            as: "document_categories",
        })
        .unwind("$document_categories")
        .match({"document_categories.category_id": new ObjectId(categoryId)});

    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );
    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);
        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getListDocumentByCategoryIdForUserNha(idsCategory) {
    console.log("🌈 ~ getListDocumentByCategoryIdForUserNha ~ idsCategory:", idsCategory);

    if (!Array.isArray(idsCategory)) {
        idsCategory = [idsCategory];
    }

    const query = Document.aggregate();
    query
        .lookup({
            from: "document_categories",
            localField: "_id",
            foreignField: "document_id",
            as: "document_categories",
        })
        .unwind("$document_categories")
        .match({
            "document_categories.category_id": {$in: idsCategory.map((id) => new ObjectId(id))},
            doc_check: STATUS_DOC_CHECK.CHECKED,
            status: STATUS_ACTIVE.UNLOCK,
            deleted: false,
        });

    const documents = await query.exec();

    const uniqueDocuments = [];
    const seenIds = new Set();

    for (const document of documents) {
        if (!seenIds.has(document._id.toString())) {
            seenIds.add(document._id.toString());
            uniqueDocuments.push(document);
        }
    }

    return uniqueDocuments.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.file_record = LINK_STATIC_URL + document.file_record;
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        return document;
    });
}

export async function getListDocumentPendingForUser({q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: "i"} : null;
    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        doc_check: STATUS_DOC_CHECK.CHECKED,
        status: STATUS_ACTIVE.UNLOCK,
        deleted: false,
    };
    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getDetailDocumentForUser(documentId) {
    // Truy vấn tài liệu theo documentId
    const document = await Document.findOne({_id: documentId, deleted: false});

    // Truy vấn người tạo tài liệu (creator)
    const crt = await User.findOne({_id: document.creator_id, deleted: false});

    // Truy vấn danh mục tài liệu liên quan
    const documentCategories = await DocumentCategory.find({document_id: document._id});

    // Lấy danh sách category_id từ documentCategories
    const categoryIds = documentCategories.map((dc) => dc.category_id);

    // Truy vấn thông tin các danh mục từ Category collection
    const categories = await Category.find({_id: {$in: categoryIds}});

    // Truy vấn bình luận liên quan đến tài liệu
    const comments = await Comment.find({document_id: documentId, deleted: false});

    // Map bình luận với thông tin người tạo bình luận
    const commentsWithCreatorInfo = await Promise.all(
        comments.map(async (comment) => {
            const creator = await User.findOne({_id: comment.creator_id, deleted: false});
            return {
                _id: comment._id,
                name: creator ? creator.name : null,
                avatar: creator && creator.avatar ? LINK_STATIC_URL + creator.avatar : null,
                content: comment.content,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
            };
        }),
    );

    // Thêm đường dẫn tĩnh cho file_record và images
    document.file_record = LINK_STATIC_URL + document.file_record;
    document.images = document.images.map((img) => LINK_STATIC_URL + img);

    // Trả về kết quả với thông tin tài liệu, người tạo, danh mục và bình luận
    return {
        ...document.toObject(),
        creator: crt
            ? {
                _id: crt._id,
                name: crt.name,
                email: crt.email,
                avatar: crt.avatar ? LINK_STATIC_URL + crt.avatar : null,
            }
            : null,
        categories: categories.map((cat) => ({
            _id: cat._id,
            name: cat.name,
        })),
        comment: commentsWithCreatorInfo,
    };
}

export async function createDocumentForUser(
    {images, image_featured, category_id, file_record, ...data},
    creator_id,
) {
    const lastDocument = await Document.findOne().sort({code: -1});

    let newCode = "TL000001";

    if (lastDocument) {
        const lastCode = lastDocument.code;
        const numberPart = parseInt(lastCode.slice(2), 10) + 1;
        newCode = `TL${numberPart.toString().padStart(6, "0")}`;
    }

    images = await Promise.all(images.map((img) => img.save("images/documents")));
    if (file_record) {
        file_record = await file_record.save("file_record");
    }
    const document = new Document({
        ...data,
        code: newCode,
        images,
        image_featured: images.length > 0 && _.isNumber(image_featured) ? image_featured : null,
        file_record,
        creator_id: creator_id._id,
    });
    const newDocument = await document.save();

    if (_.isArray(category_id)) {
        await Promise.all(
            category_id.map((item) => {
                const documentCategory = new DocumentCategory({
                    document_id: newDocument._id,
                    category_id: item,
                });
                return documentCategory.save();
            }),
        );
    }

    return document;
}

export async function getListMyDocPending(userId, {q, page, per_page, field, sort_order}) {
    console.log("🌈 ~ getListMyDocPending ~ userId:", userId);
    q = q ? {$regex: q, $options: "i"} : null;

    const query = Document.aggregate();
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),

        creator_id: new mongoose.Types.ObjectId(userId), // Sử dụng ObjectId để tìm theo creator_id
        deleted: false,
        doc_check: STATUS_DOC_CHECK.PENDING,
    };

    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getListMyDocChecked(userId, {q, page, per_page, field, sort_order}) {
    const query = Document.aggregate();
    q = q ? {$regex: q, $options: "i"} : null;
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        creator_id: new mongoose.Types.ObjectId(userId), // Sử dụng ObjectId để tìm theo creator_id
        deleted: false,
        doc_check: STATUS_DOC_CHECK.CHECKED,
    };

    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function getListMyDocLock(userId, {q, page, per_page, field, sort_order}) {
    const query = Document.aggregate();
    q = q ? {$regex: q, $options: "i"} : null;
    const filter = {
        ...(q && {$or: [{name: q}, {code: q}]}),
        creator_id: new mongoose.Types.ObjectId(userId), // Sử dụng ObjectId để tìm theo creator_id
        deleted: false,
        status: STATUS_ACTIVE.LOCK,
    };

    query.match(filter);
    query.sort({[field]: sort_order}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$skip: (page - 1) * per_page},
            {$limit: per_page},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        page: _.isNumber(per_page) ? page : 1,
        per_page: _.isNumber(per_page) ? per_page : total,
        documents: documents,
    };
}

export async function updateViewDocument(idDoc) {
    const updatedViewPost = await Document.findByIdAndUpdate(
        {_id: idDoc},
        {$inc: {view_quantity: 1}},
        {new: true},
    );
    console.log("updatedViewPost", updatedViewPost.view);

    return updatedViewPost;
}

export async function getListDocumentView() {
    const query = Document.aggregate();
    const filter = {
        doc_check: STATUS_DOC_CHECK.CHECKED,
        status: STATUS_ACTIVE.UNLOCK,
        deleted: false,
    };
    query.match(filter);
    query.sort({view_quantity: -1}).facet({
        metadata: [{$count: "total"}],
        data: [
            {$limit: 20},
            {
                $lookup: {
                    from: "document_categories",
                    localField: "_id",
                    foreignField: "document_id",
                    as: "document_categories",
                },
            },
        ],
    });

    const [result] = await query.exec();

    const total = _.isEmpty(result.metadata) ? 0 : result.metadata[0].total;

    const categoryIds = _.flatMap(result.data, (document) =>
        document.document_categories.map((pc) => pc.category_id),
    );

    const uniqueCategoryIds = _.uniq(categoryIds);

    const categories = await Category.find({_id: {$in: uniqueCategoryIds}});

    const categoryMap = _.keyBy(categories, "_id");

    const documents = result.data.map((document) => {
        document.images_src = document.images.map((img) => LINK_STATIC_URL + img);
        document.image_featured =
            _.isNumber(document.image_featured) && document.images_src[document.image_featured];
        document.categories = document.document_categories.map((pc) => categoryMap[pc.category_id] || {});
        document.file_record = LINK_STATIC_URL + document.file_record;
        const {document_categories, ...result} = document;
        result.category_id = document_categories.map((item) => item.category_id);

        return result;
    });

    return {
        total,
        documents: documents,
    };
}
