// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import Group from "@/models/group.model";
// import { Role } from "@/models/user.model";
// import { authMiddleware, roleMiddleware } from "@/lib/auth";
// import { remove as removeDiacritics } from "diacritics";
// export const groupsApi = new Hono();

// const getGroupsQuery = async (c: Context) => {
//     const page = parseInt(c.req.query("page")!) || 1;
//     const limit = parseInt(c.req.query("limit")!) || 10;
//     const skip = (page - 1) * limit;
//     const sortKey = c.req.query("sortKey") || "createdAt";
//     const sortOrder = c.req.query("sortOrder") || "desc";
//     const queryObj = {} as any;

//     const search = c.req.query("search");
//     if (search) {
//         const normalizedSearch = removeDiacritics(search.toLocaleLowerCase());
//         queryObj["$or"] = [
//             { normalizedName: { $regex: normalizedSearch, $options: "i" } },
//             { normalizedDescription: { $regex: normalizedSearch, $options: "i" } }
//         ]
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

// groupsApi
//     // @description Get all categories
//     // @route GET /api/categories
//     // @access Private    
//     .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { page, limit, skip, sortKey, sortOrder, queryObj } = await getGroupsQuery(c);
//             console.log("Page:", page);

//             const groups = await Group.find(queryObj)
//                 .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//                 .skip(skip)
//                 .limit(limit);

//             const total = await Group.countDocuments(queryObj);
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

//             return c.json({ success: true, message: "Gruplar listelendi", result: { records: groups, pagination } }, { status: 200 });
//         } catch (error) {
//             console.error("Get groups error:", error);
//             return c.json({ success: false, message: "Get groups error", result: null }, { status: 500 });
//         }
//     })

//     // @desc Get all groups
//     // @route GET /api/groups
//     // @access Public
//     .get("/all", async (c) => {
//         try {
//             await dbConnect();
//             const groups = await Group.find();
//             return c.json({ success: true, message: "Gruplar listelendi", result: groups }, { status: 200 });
//         } catch (error) {
//             console.error("Get groups error:", error);
//             return c.json({ success: false, message: "Get groups error", result: null }, { status: 500 });
//         }
//     })


//     // @description Create category
//     // @route POST /api/categories
//     // @access Private
//     .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { name, description, memberIds, categoryId } = await c.req.json();

//             // Check if category already exists
//             const existingGroup = await Group.findOne({ name });
//             if (existingGroup) {
//                 return c.json({ success: false, message: "Grup zaten mevcut", result: null }, { status: 400 });
//             }

//             const group = await Group.create({ name, description, memberIds, categoryId });
//             return c.json({ success: true, message: "Grup oluşturuldu", result: group }, { status: 200 });
//         } catch (error) {
//             console.error("Create group error:", error);
//             return c.json({ success: false, message: "Create group error", result: null }, { status: 500 });
//         }
//     })

//     // @description Get category by id
//     // @route GET /api/categories/:id
//     // @access Private
//     .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const group = await Group.findById(id);
//             if (!group) {
//                 return c.json({ success: false, message: "Grup bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Grup bilgileri", result: group }, { status: 200 });
//         } catch (error) {
//             console.error("Get group error:", error);
//             return c.json({ success: false, message: "Get group error", result: null }, { status: 500 });
//         }
//     })

//     // @description Update category by id
//     // @route PUT /api/categories/:id
//     // @access Private
//     .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const { name, description, memberIds } = await c.req.json();
//             const group = await Group.findByIdAndUpdate(id, { name, description, memberIds }, { new: true });
//             if (!group) {
//                 return c.json({ success: false, message: "Grup bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Grup güncellendi", result: group }, { status: 200 });
//         } catch (error) {
//             console.error("Update group error:", error);
//             return c.json({ success: false, message: "Update group error", result: null }, { status: 500 });
//         }
//     })

//     // @description Delete category by id
//     // @route DELETE /api/categories/:id
//     // @access Private
//     .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");


//             const group = await Group.findById(id);
//             if (!group) {
//                 return c.json({ success: false, message: "Grup bulunamadı", result: null }, { status: 404 });
//             }

//             if (group.memberIds.length > 0) {
//                 return c.json({ success: false, message: "Grup üyeleri var", result: null }, { status: 400 });
//             }

//             await Group.findByIdAndDelete(id);

//             return c.json({ success: true, message: "Grup silindi", result: group }, { status: 200 });
//         } catch (error) {
//             console.error("Delete group error:", error);
//             return c.json({ success: false, message: "Delete group error", result: null }, { status: 500 });
//         }
//     });

