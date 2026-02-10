// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import { ObjectId } from "mongoose";
// import Report, { ReportStatus, ReportType } from "@/models/report.model";
// import User, { Role, UserDocumentType } from "@/models/user.model";
// import { authMiddleware } from "@/lib/auth";
// import fs from "fs";
// import Category from "@/models/category.model";
// import Group from "@/models/group.model";
// import { getReportsQuery } from "./reports";
// import View from "@/models/view.model";

// const getFavoriteReports = async (user: UserDocumentType) => {
//   const favoriteReportIds = user.favouriteReportIds;
//   const favoriteReports = await Report.find({
//     _id: { $in: favoriteReportIds },
//   });
//   const records = favoriteReports.map((report) => ({
//     ...report.toObject(),
//     isExists:
//       report.type === ReportType.Internal
//         ? fs.existsSync(report.reportPath)
//         : true,
//   }));
//   return records;
// };

// export const profileApi = new Hono()
//   .get("/", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const user = c.get("user");

//       if (!user) {
//         return c.json(
//           { success: false, message: "Kullanıcı bulunamadı", result: null },
//           { status: 401 }
//         );
//       }
//       return c.json(
//         { success: true, message: "Kullanıcı bilgileri", result: user },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get user error:", error);
//       return c.json(
//         { success: false, message: "Get user error", result: null },
//         { status: 500 }
//       );
//     }
//   })
//   .get("/reports/trending", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const user = c.get("user");
//       const userGroupIds = user.groupIds.map((id: any) => id.toString());

//       const trendingReports = await View.aggregate([
//         {
//           $group: {
//             _id: "$reportId", // group by reportId
//             viewCount: { $sum: 1 }, // count documents
//           },
//         },
//         {
//           $lookup: {
//             // join with Report collection
//             from: "reports",
//             localField: "_id",
//             foreignField: "_id",
//             as: "report",
//           },
//         },
//         { $unwind: "$report" }, // flatten array
//         {
//           $match: {
//             $or: [
//               // Report has no groups (accessible to everyone)
//               { "report.groupIds": { $size: 0 } },
//               // Report has groups that overlap with user's groups
//               {
//                 "report.groupIds": {
//                   $elemMatch: {
//                     $in: userGroupIds.map((id: string) => id.toString()),
//                   },
//                 },
//               },
//             ],
//             // Only show active and published reports
//             "report.isActive": true,
//             "report.status": "Published",
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             reportId: "$_id",
//             viewCount: 1,
//             report: {
//               _id: "$report._id",
//               name: "$report.name",
//               status: "$report.status",
//               description: "$report.description",
//               createdAt: "$report.createdAt",
//             }, // Fields of report
//           },
//         },
//         { $sort: { viewCount: -1 } }, // sort by views descending
//         { $limit: 10 }, // limit to top 10
//       ]);

//       return c.json(
//         {
//           success: true,
//           message: "Trending reports retrieved successfully",
//           result: trendingReports,
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get trending reports error:", error);
//       return c.json(
//         {
//           success: false,
//           message: "Failed to get trending reports",
//           result: null,
//         },
//         { status: 500 }
//       );
//     }
//   })
//   .put("/", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const currentUser = c.get("user");
//       const { name, email, phone } = await c.req.json();
//       const user = await User.findById(currentUser!.id);
//       if (!user) {
//         return c.json(
//           { success: false, message: "Kullanıcı bulunamadı", result: null },
//           { status: 401 }
//         );
//       }
//       user.name = name;
//       user.email = email;
//       user.phone = phone;
//       await user.save();
//       return c.json(
//         {
//           success: true,
//           message: "Kullanıcı bilgileri güncellendi",
//           result: user,
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Update user error:", error);
//       return c.json(
//         { success: false, message: "Update user error", result: null },
//         { status: 500 }
//       );
//     }
//   })
//   .get("/metrics", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const currentUser = c.get("user");
//       const user = await User.findById(currentUser!.id);
//       const currentUserRole = currentUser.role;
//       const currentUserGroupIds = currentUser.groupIds;

//       const favoriteReportIds = user!.favouriteReportIds;
//       const favoriteReportsCount = favoriteReportIds.length;

//       const query =
//         currentUserRole === Role.Admin
//           ? {} // admin can see all reports
//           : {
//               $or: [
//                 { groupIds: { $in: currentUserGroupIds } }, // report has at least one of user's groups
//                 { groupIds: { $size: 0 } }, // report has no groups
//               ],
//               status: ReportStatus.Published,
//             };

//       const reportsCount = await Report.find(query).countDocuments();

//       const categoriesCount = await Category.countDocuments();
//       const groupsCount = await Group.countDocuments();
//       const usersCount = await User.countDocuments();
//       const newReports = await Report.find(query)
//         .sort({ createdAt: -1 })
//         .limit(3);

//       const newReportsRecords = newReports.map((report) => ({
//         ...report.toObject(),
//         isExists:
//           report.type === ReportType.Internal
//             ? fs.existsSync(report.reportPath)
//             : true,
//       }));

//       return c.json(
//         {
//           success: true,
//           message: "Kullanıcı metrikleri",
//           result: {
//             favoriteReportsCount,
//             reportsCount,
//             categoriesCount,
//             groupsCount,
//             usersCount,
//             newReports: newReportsRecords,
//             newReportsCount: newReportsRecords.length,
//           },
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get user error:", error);
//       return c.json(
//         { success: false, message: "Get user error", result: null },
//         { status: 500 }
//       );
//     }
//   })
//   .patch("/toggle-favorite-report", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const currentUser = c.get("user");
//       const user = await User.findById(currentUser!.id);
//       const { id } = await c.req.json();
//       const userFavorites = user!.favouriteReportIds;

//       if (userFavorites.includes(id)) {
//         userFavorites.splice(userFavorites.indexOf(id), 1);
//       } else {
//         userFavorites.push(id);
//       }

//       user!.favouriteReportIds = userFavorites;

//       await user!.save();

//       return c.json(
//         { success: true, message: "Kullanıcı favorileri", result: user },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get user error:", error);
//       return c.json(
//         { success: false, message: "Get user error", result: null },
//         { status: 500 }
//       );
//     }
//   })

//   .get("/favorite-reports", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const currentUser = c.get("user");
//       const user = await User.findById(currentUser!.id);
//       const records = await getFavoriteReports(user!);
//       return c.json(
//         { success: true, message: "Kullanıcı favorileri", result: records },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get user error:", error);
//       return c.json(
//         { success: false, message: "Get user error", result: null },
//         { status: 500 }
//       );
//     }
//   })

//   .get("/reports", authMiddleware, async (c: Context) => {
//     try {
//       await dbConnect();
//       const user = await c.get("user");
//       const currentUser = await User.findById(user.id);
//       if (!currentUser) {
//         return c.json(
//           { success: false, message: "Kullanıcı bulunamadı", result: null },
//           { status: 401 }
//         );
//       }

//       const { page, limit, skip, sortKey, sortOrder, queryObj } =
//         await getReportsQuery(c);

//       const currentUserGroupIds = currentUser.groupIds.map((id) =>
//         id.toString()
//       );

//       // Default filters
//       queryObj["status"] = ReportStatus.Published;

//       // Admins can see everything
//       if (currentUser.role === Role.Admin) {
//         delete queryObj["status"]; // optional: allow Admins to also see Draft/Pending
//         // leave groupIds untouched (admin sees all groups)
//       } else {
//         const queryGroupIds = queryObj["groupIds"]?.$in?.map((id: string) =>
//           id.toString()
//         );
//         if (queryGroupIds && queryGroupIds.length > 0) {
//           // Intersection between user's and requested groups
//           const allowedGroupIds = currentUserGroupIds.filter((id) =>
//             queryGroupIds.includes(id)
//           );
//           queryObj["groupIds"] = { $in: allowedGroupIds };
//         } else {
//           // User can see reports in their groups OR reports with no groups
//           queryObj["$or"] = [
//             { groupIds: { $in: currentUserGroupIds } },
//             { groupIds: { $size: 0 } },
//           ];
//         }
//       }

//       const reports = await Report.find(queryObj)
//         .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//         .skip(skip)
//         .limit(limit);
//       console.log(reports);
//       const records = reports.map((report) => ({
//         ...report.toObject(),
//         isExists:
//           report.type === ReportType.Internal
//             ? fs.existsSync(report.reportPath)
//             : true,
//       }));

//       const total = await Report.countDocuments(queryObj);
//       const pageCount = Math.ceil(total / limit);

//       return c.json(
//         {
//           success: true,
//           message: "Raporlar listelendi",
//           result: {
//             records,
//             pagination: {
//               pageIndex: page,
//               pageSize: limit,
//               total,
//               pageCount,
//               hasNextPage: page < pageCount,
//               hasPrevPage: page > 1,
//             },
//           },
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Get reports error:", error);
//       return c.json(
//         { success: false, message: "Get reports error", result: null },
//         { status: 500 }
//       );
//     }
//   });
