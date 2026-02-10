// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import View from "@/models/view.model";
// import User, { Role } from "@/models/user.model";
// import { authMiddleware, roleMiddleware } from "@/lib/auth";
// import Report from "@/models/report.model";

// export const viewsApi = new Hono();

// export const getViewsQuery: any = async (c: Context) => {
//   const page = parseInt(c.req.query("page")!) || 1;
//   const limit = parseInt(c.req.query("limit")!) || 10;
//   const skip = (page - 1) * limit;
//   const sortKey = c.req.query("sortKey") || "createdAt";
//   const sortOrder = c.req.query("sortOrder") || "desc";
//   const queryObj = {} as any;

//   const search = c.req.query("search");
//   if (search) {
//     // Create an OR condition
//     const searchRegex = { $regex: search, $options: "i" };

//     // 1. Search in users by name
//     const matchedUsers = await User.find({
//       $or: [
//         { firstName: searchRegex },
//         { lastName: searchRegex },
//         { email: searchRegex },
//       ],
//     }).select("_id");
//     const usersIds = matchedUsers.map((user) => user._id);

//     // 2. Search in reports by name
//     const matchedReports = await Report.find({ name: searchRegex }).select(
//       "_id"
//     );
//     const reportsIds = matchedReports.map((report) => report._id);
//     // 2. Build query with OR conditions
//     queryObj["$or"] = [
//       { userId: { $in: usersIds } },
//       { reportId: { $in: reportsIds } },
//     ];
//   }

//   const reportId = c.req.query("reportId");
//   if (reportId) {
//     queryObj["reportId"] = reportId;
//   }

//   const userId = c.req.query("userId");
//   if (userId) {
//     queryObj["userId"] = userId;
//   }

//   return {
//     page,
//     limit,
//     skip,
//     sortKey,
//     sortOrder,
//     queryObj,
//   };
// };

// viewsApi
//   // @description Get all categories
//   // @route GET /api/categories
//   // @access Private
//   .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//     try {
//       await dbConnect();
//       const { page, limit, skip, sortKey, sortOrder, queryObj } =
//         await getViewsQuery(c);
//       console.log("Page:", page);

//       const views = await View.find(queryObj)
//         .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit);

//       const total = await View.countDocuments(queryObj);
//       const pageCount = Math.ceil(total / limit);
//       const hasNextPage = page < pageCount;
//       const hasPrevPage = page > 1;

//       const pagination = {
//         pageIndex: page,
//         pageSize: limit,
//         total,
//         pageCount,
//         hasNextPage,
//         hasPrevPage,
//       };

//       return c.json(
//         {
//           success: true,
//           message: "Gruplar listelendi",
//           result: { records: views, pagination },
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get views error:", error);
//       return c.json(
//         { success: false, message: "Get views error", result: null },
//         { status: 500 }
//       );
//     }
//   })

//   .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//     try {
//       await dbConnect();
//       const views = await View.find({});

//       return c.json(
//         { success: true, message: "View listelendi", result: views },
//         200
//       );
//     } catch (error) {
//       console.error("Get views error:", error);
//       return c.json(
//         { success: false, message: "Get views error", result: null },
//         500
//       );
//     }
//   })

//   .post("/", authMiddleware, async (c) => {
//     try {
//       await dbConnect();
//       const user = c.get("user");
//       const body = await c.req.json();
//       const ip = c.req.header("x-forwarded-for");
//       const userAgent = c.req.header("user-agent");

//       // Check if view exists in last 3 Minutes
//       const existingView = await View.findOne({
//         userId: user._id,
//         reportId: body.reportId,
//         createdAt: { $gte: new Date(Date.now() - 3 * 60 * 1000) },
//       });
//       if (!existingView) {
//         const view = new View({
//           userId: user._id,
//           reportId: body.reportId,
//           ipAddress: ip,
//           userAgent,
//         });
//         await view.save();
//       }

//       return c.json(
//         { success: true, message: "Grup oluşturuldu", result: true },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Create view error:", error);
//       return c.json(
//         { success: false, message: "Create view error", result: null },
//         { status: 500 }
//       );
//     }
//   });
