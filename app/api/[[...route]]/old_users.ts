// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import User, { Role } from "@/models/user.model";
// import { authMiddleware, roleMiddleware } from "@/lib/auth";
// import Group from "@/models/group.model";
// import { ObjectId } from "mongoose";
// import { remove as removeDiacritics } from "diacritics";
// export const usersApi = new Hono();
// const getUsersQuery = async (c: Context) => {
//     const page = parseInt(c.req.query("page")!) || 1;
//     const limit = parseInt(c.req.query("limit")!) || 10;
//     const skip = (page - 1) * limit;
//     const sortKey = c.req.query("sortKey") || "createdAt";
//     const sortOrder = c.req.query("sortOrder") || "desc";
//     const queryObj = {} as any;
//     const all = c.req.query("all");
//     const search = c.req.query("search");
//     if (search) {
//         const normalizedSearch = removeDiacritics(search.toLocaleLowerCase());
//         // queryObj["normalizedFirstName"] = { $regex: normalizedSearch, $options: "i" };
//         // queryObj["normalizedLastName"] = { $regex: normalizedSearch, $options: "i" };
//         // queryObj["normalizedEmail"] = { $regex: normalizedSearch, $options: "i" };
//         queryObj["$or"] = [
//             { normalizedFirstName: { $regex: normalizedSearch, $options: "i" } },
//             { normalizedLastName: { $regex: normalizedSearch, $options: "i" } },
//             { email: { $regex: normalizedSearch, $options: "i" } },
//             { firstName: { $regex: normalizedSearch, $options: "i" } },
//             { lastName: { $regex: normalizedSearch, $options: "i" } },
//         ]
//     }

//     const role = c.req.query("role");
//     if (role) {
//         queryObj["role"] = role;
//     }

//     const isActive = c.req.query("isActive");


//     if (isActive) {
//         queryObj["isActive"] = isActive;
//     }

//     return {
//         page,
//         limit,
//         skip,
//         sortKey,
//         sortOrder,
//         isAll: all,
//         queryObj
//     }
// }

// usersApi
//     // @description Get users
//     // @route GET /api/users
//     // @access Private
//     .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { page, limit, skip, sortKey, sortOrder, queryObj, isAll } = await getUsersQuery(c);

//             if (isAll) {
//                 const users = await User.find({}).sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 });
//                 return c.json({ success: true, message: "Kullanıcı listelendi", result: users }, { status: 200 });
//             }


//             const users = await User.find({
//                 ...queryObj,
//             })
//                 .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//                 .skip(skip)
//                 .limit(limit);




//             const total = await User.countDocuments(queryObj);
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

//             return c.json({ success: true, message: "Kullanıcı listelendi", result: { records: users, pagination } }, { status: 200 });
//         } catch (error) {
//             console.error("Get users error:", error);
//             return c.json({ success: false, message: "Get users error", result: null }, { status: 500 });
//         }
//     })
//     // @desc Get All users
//     // @route GET /api/users
//     // @access Private
//     .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const users = await User.find();
//             return c.json({ success: true, message: "Kullanıcı listelendi", result: users }, { status: 200 });
//         } catch (error) {
//             console.error("Get users error:", error);
//             return c.json({ success: false, message: "Get users error", result: null }, { status: 500 });
//         }
//     })
//     // @description Get user by id
//     // @route GET /api/users/:id
//     // @access Private
//     .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const user = await User.findById(id);
//             if (!user) {
//                 return c.json({ success: false, message: "Kullanıcı bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Kullanıcı bilgileri", result: user }, { status: 200 });
//         } catch (error) {
//             console.error("Get user error:", error);
//             return c.json({ success: false, message: "Get user error", result: null }, { status: 500 });
//         }
//     })



//     // @description Delete user by id
//     // @route DELETE /api/users/:id
//     // @access Private
//     .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const user = await User.findByIdAndDelete(id);
//             if (!user) {
//                 return c.json({ success: false, message: "Kullanıcı bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Kullanıcı silindi", result: user }, { status: 200 });
//         } catch (error) {
//             console.error("Delete user error:", error);
//             return c.json({ success: false, message: "Delete user error", result: null }, { status: 500 });
//         }
//     })

//     .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { firstName, lastName, email, phone, role, groupIds, isActive, password } = await c.req.json();

//             // Check if email already exists
//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//                 return c.json({ success: false, message: "Email already exists", result: null }, { status: 400 });
//             }

//             const user = await User.create({ firstName, lastName, email, phone, role, groupIds, isActive });
//             user.password = password;
//             await user.save();

//             for (const groupId of groupIds) {
//                 const group = await Group.findById(groupId);
//                 if (group && !group.memberIds.includes(user._id as ObjectId)) {
//                     group.memberIds.push(user._id as ObjectId);
//                     await group.save();
//                 }
//             }
//             return c.json({ success: true, message: "Kullanıcı oluşturuldu", result: user }, { status: 200 });
//         } catch (error) {
//             console.error("Create user error:", error);
//             return c.json({ success: false, message: "Create user error", result: null }, { status: 500 });
//         }
//     })

//     .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const id = c.req.param("id");
//             const { firstName, lastName, email, phone, role, groupIds, isActive, password } = await c.req.json();

//             const existingUser = await User.findById(id);
//             // Check if email already exists
//             if (existingUser?.email !== email) {
//                 const existingUser = await User.findOne({ email });
//                 if (existingUser) {
//                     return c.json({ success: false, message: "Email already exists", result: null }, { status: 400 });
//                 }
//             }

//             const user = await User.findByIdAndUpdate(id, { firstName, lastName, email, phone, isActive, role, groupIds }, { new: true });

//             if (!user) {
//                 return c.json({ success: false, message: "Kullanıcı bulunamadı", result: null }, { status: 404 });
//             }

//             if (password) {
//                 user.password = password;
//                 await user.save();
//             }
//             return c.json({ success: true, message: "Kullanıcı güncellendi", result: user }, { status: 200 });
//         } catch (error) {
//             console.error("Update user error:", error);
//             return c.json({ success: false, message: "Update user error", result: null }, { status: 500 });
//         }
//     });



