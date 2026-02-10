// import { Context, Hono } from "hono";
// import dbConnect from "@/lib/mongoose";
// import { Role } from "@/models/user.model";
// import { authMiddleware, roleMiddleware } from "@/lib/auth";
// import Report, { ReportStatus, ReportType } from "@/models/report.model";
// import Category from "@/models/category.model";
// import { slugifyText } from "@/lib/utils";
// import fs from "fs";
// import path from "path";
// import { remove as removeDiacritics } from "diacritics";
// import View from "@/models/view.model";
// export const reportsApi = new Hono();


// export const getReportsQuery: any = async (c: Context) => {
//     const page = parseInt(c.req.query("page")!) || 1;
//     const limit = parseInt(c.req.query("limit")!) || 10;
//     const skip = (page - 1) * limit;
//     const sortKey = c.req.query("sortKey") || "createdAt";
//     const sortOrder = c.req.query("sortOrder") || "desc";
//     const queryObj = {} as any;

//     const search = c.req.query("search");
//     if (search) {
//         const normalizedSearch = removeDiacritics(search.toLocaleLowerCase());
//         // Create an OR condition
//         const searchRegex = { $regex: normalizedSearch, $options: "i" };

//         // 1. Search in categories by name
//         const matchedCategories = await Category.find({ normalizedName: searchRegex }).select("_id");
//         const categoryIds = matchedCategories.map(cat => cat._id);

//         // 2. Build query with OR conditions
//         queryObj["$or"] = [
//             { normalizedName: searchRegex },
//             { normalizedDescription: searchRegex },
//             { categoryId: { $in: categoryIds } }
//         ];
//     }

//     const categoryId = c.req.query("categoryId");
//     if (categoryId) {
//         queryObj["categoryId"] = categoryId;
//     }

//     const groupId = c.req.query("groupId");

//     if (groupId) {
//         queryObj["groupIds"] = { $in: [groupId] };
//     }


//     const status = c.req.query("status");
//     if (status) {
//         queryObj["status"] = status;
//     }

//     const type = c.req.query("type");
//     if (type) {
//         queryObj["type"] = type;
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

// reportsApi
//     // @description Get reports
//     // @route GET /api/reports
//     // @access Private Admin
//     .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { page, limit, skip, sortKey, sortOrder, queryObj } = await getReportsQuery(c);

//             const reports = await Report.find(queryObj!)
//                 .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 })
//                 .skip(skip)
//                 .limit(limit);

//             const records = reports.map(report => ({
//                 ...report.toObject(),
//                 isExists: report.type === ReportType.Internal ? fs.existsSync(report.reportPath) : true
//             }));

//             console.log("queryObj", queryObj);
//             console.log("records", records);

//             const total = await Report.countDocuments(queryObj);
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

//             return c.json({
//                 success: true, message: "Raporlar listelendi", result: {
//                     records, pagination
//                 }
//             }, { status: 200 });
//         } catch (error) {
//             console.error("Get reports error:", error);
//             return c.json({ success: false, message: "Get reports error", result: null }, { status: 500 });
//         }
//     })

//     .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const reports = await Report.find();
//             return c.json({ success: true, message: "Raporlar listelendi", result: reports }, { status: 200 });
//         } catch (error) {
//             console.error("Get users error:", error);
//             return c.json({ success: false, message: "Get users error", result: null }, { status: 500 });
//         }
//     })
//     // @desc Get Trending reports by views
//     // @route GET /api/profile/reports/trending
//     // @access Private
//     .get("/trending", authMiddleware, roleMiddleware([Role.Admin]), async (c: Context) => {
//         try {
//             await dbConnect();
//             const state = await View.aggregate([
//                 {
//                     $group: {
//                         _id: "$reportId",              // group by reportId
//                         viewCount: { $sum: 1 }         // count documents
//                     }
//                 },
//                 {
//                     $lookup: {                       // join with Report collection
//                         from: "reports",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "report"
//                     }
//                 },
//                 { $unwind: "$report" },            // flatten array
//                 {
//                     $project: {
//                         _id: 0,
//                         reportId: "$_id",
//                         viewCount: 1,
//                         report: {
//                             _id: "$report._id",
//                             name: "$report.name",        
//                             status: "$report.status",
//                             description:"$report.description",
//                             createdAt:"$report.createdAt",
//                         } // Fields of report
//                     }
//                 },
//                 { $sort: { viewCount: -1 } },      // optional: sort by views
//                 { $limit: 10 }                        // optional: limit to top 10
//             ]);
//             return c.json({ success: true, message: "Raporlar listelendi", result: state }, { status: 200 });
//         } catch (error) {
//             console.error("Get reports error:", error);
//             return c.json({ success: false, message: "Get reports error", result: null }, { status: 500 });
//         }
//     })
//     // @description Get reports
//     // @route GET /api/reports
//     // @access Private Admin
//     .get("/:id", authMiddleware, async (c) => {
//         try {
//             await dbConnect();
//             const user = c.get("user");
//             const { id } = c.req.param();
//             const report = await Report.findById(id);

//             if (!report) {
//                 return c.json({ success: false, message: "Rapor bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Rapor bilgileri", result: report }, { status: 200 });
//         } catch (error) {
//             console.error("Get report error:", error);
//             return c.json({ success: false, message: "Get report error", result: null }, { status: 500 });
//         }
//     })

//     // @description Update report
//     // @route PUT /api/reports/:id
//     // @access Private Admin
//     .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { id } = c.req.param();
//             const body = await c.req.json();
//             const report = await Report.findByIdAndUpdate(id, body, { new: true });

//             if (!report) {
//                 return c.json({ success: false, message: "Rapor bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Rapor güncellendi", result: report }, { status: 200 });
//         } catch (error) {
//             console.error("Update report error:", error);
//             return c.json({ success: false, message: "Update report error", result: null }, { status: 500 });
//         }
//     })

//     // @description Update report status
//     // @route PATCH /api/reports/:id
//     // @access Private Admin
//     .patch("/:id/status", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { id } = c.req.param();
//             const { status } = await c.req.json();
//             const report = await Report.findByIdAndUpdate(id, { status });
//             if (!report) {
//                 return c.json({ success: false, message: "Rapor bulunamadı", result: null }, { status: 404 });
//             }
//             return c.json({ success: true, message: "Rapor güncellendi", result: report }, { status: 200 });
//         } catch (error) {
//             console.error("Update report error:", error);
//             return c.json({ success: false, message: "Update report error", result: null }, { status: 500 });
//         }
//     })

//     // @description Create report
//     // @route POST /api/reports
//     // @access Private Admin
//     .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
//         try {
//             await dbConnect();
//             const { name, description, categoryId, groupIds, roles, type, link } = await c.req.json();

//             // Check if name is unique
//             const existingReport = await Report.findOne({ name });
//             if (existingReport) {
//                 return c.json({ success: false, message: "Rapor adı zaten kullanılıyor", result: null }, { status: 400 });
//             }
//             const slug = slugifyText(name);

//             // If type is internal then create report folder
//             if (type === ReportType.Internal) {
//                 const reportPath = path.join(process.cwd(), "reports-list", slug);
//                 if (!fs.existsSync(reportPath)) {
//                     // Create report folder
//                     fs.mkdirSync(reportPath, { recursive: true });

//                     // Create client.tsx
//                     const clientPath = path.join(reportPath, "client.tsx");

//                     fs.writeFileSync(clientPath, `
//             import { AnimatedCardsContainer } from "@/components/shared/animated";
//             import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
//             import React from "react";
            
//             export default function Page() {
//                 return (
//                     <AnimatedCardsContainer className="bg-muted p-4 flex items-center justify-center h-64 rounded-md">
//                         <div className="max-w-xl flex flex-col gap-3 p-4">
//                             <h1 className="font-bold text-xl">
//                             ${name}
//                             </h1>
//                             <p className="text-xs">
//                                 ${description}
//                             </p>
            
//                             <Alert className="bg-red-100 shadow-none">
//                                 <AlertTitle>
//                                     Rapor Beklemede
//                                 </AlertTitle>
//                                 <AlertDescription>
//                                     Raport Üzerinde çalışmalar yapılyor tamamlandıkten sonra tekrar burdan görebilirsiniz
//                                 </AlertDescription>
//                             </Alert>
//                         </div>
//                     </AnimatedCardsContainer>
//                 );
//             }
//                     `);

//                     // Create query.ts
//                     const queryPath = path.join(reportPath, "api.ts");
//                     fs.writeFileSync(queryPath, `
//                     export const query = \`\`;
//                     `);
//                 }

//                 // Check if reportPath exists
//                 const existsReport = await Report.findOne({ reportPath });
//                 if (existsReport) {
//                     return c.json({ success: false, message: "Rapor adı zaten kullanılıyor", result: null }, { status: 400 });
//                 }

//                 const report = await Report.create({ name, description, categoryId, groupIds, roles, type, link, slug, reportPath });

//                 return c.json({ success: true, message: "Rapor oluşturuldu", result: report }, { status: 200 });
//             }

//             const report = await Report.create({ name, description, categoryId, groupIds, roles, type, link, slug });
//             return c.json({ success: true, message: "Rapor oluşturuldu", result: report }, { status: 200 });



//         } catch (error) {
//             console.error("Create report error:", error);
//             return c.json({ success: false, message: "Create report error", result: null }, { status: 500 });
//         }
//     })





// // // @description Increment report view count
// // // @route PATCH /api/reports/:id/increment-view
// // // @access Private User
// // .patch("/:id/create-view", authMiddleware, async (c) => {
// //     try {
// //         await dbConnect();
// //         const { id } = c.req.param();
// //         const report = await Report.findById(id);
// //         if (!report) {
// //             return c.json({ success: false, message: "Rapor bulunamadı", result: null }, { status: 404 });
// //         }
// //         if (report.status === "Published") {
// //             // TODO : ADD VIEW RECORD
// //             await report.save();
// //         }
// //         return c.json({ success: true, message: "Rapor görüntüleme sayısı artırıldı", result: report }, { status: 200 });
// //     } catch (error) {
// //         console.error("Increment report view count error:", error);
// //         return c.json({ success: false, message: "Increment report view count error", result: null }, { status: 500 });
// //     }
// // })