// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import Category from "@/models/category.model";
// import { Role } from "@/models/user.model";
// import { authMiddleware, roleMiddleware } from "@/lib/auth";
// import Report from "@/models/report.model";
// import { remove as removeDiacritics } from "diacritics";

// export const categoriesApi = new Hono();


// const getCategoriesQuery = async (c: Context) => {
//     const page = parseInt(c.req.query("page")!) || 1;
//     const limit = parseInt(c.req.query("limit")!) || 10;
//     const skip = (page - 1) * limit;
//     const sortKey = c.req.query("sortKey") || "createdAt";
//     const sortOrder = c.req.query("sortOrder") || "desc";
//     const queryObj = {} as any;

//     const search = c.req.query("search");

//     if (search) {
//         const normalizedSearch = removeDiacritics(search.toLocaleLowerCase());
//         console.log(normalizedSearch);
        
//         // queryObj["$or"] = [
//         //     { normalizedName: { $regex: normalizedSearch, $options: "i" } },
//         //     { normalizedDescription: { $regex: normalizedSearch, $options: "i" } }
//         // ]

//         queryObj["normalizedName"] = { $regex: normalizedSearch, $options: "i" };
//     }

//     return {
//         page,
//         limit,
//         skip,
//         sortKey,
//         sortOrder,
//         queryObj
//     }
// }


// categoriesApi
//     // @description Get  categories
//     // @route GET /api/categories
//     // @access Private    
//     .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { page, limit, skip, sortKey, sortOrder, queryObj } = await getCategoriesQuery(c);
            
//             console.log(JSON.stringify(queryObj, null, 2));
//             const categories = await Category.find(queryObj)
//                 .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//                 .skip(skip)
//                 .limit(limit);


            

//             const total = await Category.countDocuments(queryObj);
//             const pageCount = Math.ceil(total / limit);
//             const hasNextPage = page < pageCount;
//             const hasPrevPage = page > 1;

//             const pagination = {
//                 pageIndex: page,
//                 pageSize: limit,
//                 total,
//                 pageCount,
//                 hasNextPage,
//                 hasPrevPage
//             }

//             return c.json({ success: true, message: "Kategoriler listelendi", result: { records: categories, pagination } }, { status: 200 });
//         } catch (error) {
//             console.error("Get categories error:", error);
//             return c.json({ success: false, message: "Get categories error", result: null }, { status: 500 });
//         }
//     })

//     // @description Get all categories
//     // @route GET /api/categories/all
//     // @access Public
//     .get("/all", async (c) => {
//         try {
//             await dbConnect();
//             const categories = await Category.find();
//             return c.json({ success: true, message: "Kategoriler listelendi", result: categories }, { status: 200 });
//         } catch (error) {
//             console.error("Get categories error:", error);
//             return c.json({ success: false, message: "Get categories error", result: null }, { status: 500 });
//         }
//     })

//     // @description Create category
//     // @route POST /api/categories
//     // @access Private
//     .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { name, description } = await c.req.json();

//             // Check if category already exists
//             const existingCategory = await Category.findOne({ name });
//             if (existingCategory) {
//                 return c.json({ success: false, message: "Kategori zaten mevcut", result: null }, { status: 400 });
//             }

//             await Category.create({ name, description });
//             return c.json({ success: true, message: "Kategori oluşturuldu", result: true }, { status: 200 });
//         } catch (error) {
//             console.error("Create category error:", error);
//             return c.json({ success: false, message: "Create category error", result: null }, { status: 500 });
//         }
//     })


//     // @description Delete category
//     // @route DELETE /api/categories/{id}
//     // @access Private
//     .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const category = await Category.findById(id);

//             const hasReports = await Report.exists({ categoryId: id });

//             if (category && hasReports) {
//                 return c.json({ success: false, message: "Kategori silinemez", result: null }, { status: 400 });
//             }
//             await Category.findByIdAndDelete(id);
//             return c.json({ success: true, message: "Kategori silindi", result: true }, { status: 200 });
//         } catch (error) {
//             console.error("Delete category error:", error);
//             return c.json({ success: false, message: "Delete category error", result: null }, { status: 500 });
//         }
//     })



//     // @description Update category
//     // @route PUT /api/categories/{id}
//     // @access Private
//     .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const { name, description } = await c.req.json();
//             await Category.findByIdAndUpdate(id, { name, description });
//             return c.json({ success: true, message: "Kategori güncellendi", result: true }, { status: 200 });
//         } catch (error) {
//             console.error("Update category error:", error);
//             return c.json({ success: false, message: "Update category error", result: null }, { status: 500 });
//         }
//     })


//     .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const category = await Category.findById(id);
//             return c.json({ success: true, message: "Kategori bilgileri", result: category }, { status: 200 });
//         } catch (error) {
//             console.error("Get category error:", error);
//             return c.json({ success: false, message: "Get category error", result: null }, { status: 500 });
//         }
//     });