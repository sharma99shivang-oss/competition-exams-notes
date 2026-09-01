import Exam from '../models/Exam.js'; import Subject from '../models/Subject.js'; import Chapter from '../models/Chapter.js'; import User from '../models/User.js'; import Order from '../models/Order.js'; import Activity from '../models/Activity.js'; import { toAsset } from '../middleware/upload.js';
const models = { exams: Exam, subjects: Subject, chapters: Chapter }; const ok = (res, data, meta) => res.json({ success: true, data, ...(meta && { meta }) }); const parse = (v, fallback) => { try { return typeof v === 'string' ? JSON.parse(v) : v ?? fallback } catch { return fallback } }; const paging = req => ({ page: Math.max(1, Number(req.query.page) || 1), limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)) });
const assetFields = (body, files, key) => {
  if (files?.thumbnail?.[0]) body.thumbnail = toAsset(files.thumbnail[0]);
  if (files?.banner?.[0]) body.banner = toAsset(files.banner[0]);
  if (files?.image) body.image = toAsset(files.image);

  if (key === "chapters") {
    if (files?.samplePdf?.[0]) {
      body.samplePdf = toAsset(files.samplePdf[0]);
    }

    if (files?.fullPdf?.[0]) {
      body.fullPdf = toAsset(files.fullPdf[0]);
    }
    if (files?.sampleVideo?.[0]) body.sampleVideo = toAsset(files.sampleVideo[0]);

    if (files?.sampleImages) body.sampleImages = files.sampleImages.map(toAsset);
    if (files?.fullImages) body.fullImages = files.fullImages.map(toAsset);
    if (body.fullPdf?.bytes) body.pdfSize = body.fullPdf.bytes;
  }

  return body;
};

// ✅ assetFields yahan close ho gayi

const normalize = (key, req) => {
  const b = { ...req.body };

  if (key === "exams") {
    b.tags = parse(b.tags, []);
    b.seo = parse(b.seo, {});
    if (b.price !== undefined) b.price = Number(b.price || 0);
    if (b.discountPrice !== undefined && b.discountPrice !== '') b.discountPrice = Number(b.discountPrice);
    else if (b.discountPrice === '') delete b.discountPrice;
    if (b.isFeatured !== undefined) b.isFeatured = b.isFeatured === "true" || b.isFeatured === true;
    if (b.status === undefined) delete b.status;

    if (!b.slug && b.title) {
      b.slug = b.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }

  if (key === "subjects") {
    b.displayOrder = Number(b.displayOrder || 0);
    b.status = b.status || "published";

    if (!b.name?.trim()) throw new Error("Subject name is required");
    if (!b.exam) throw new Error("Please select an exam");
  }

  if (key === "chapters") {
    b.chapterNumber = Number(b.chapterNumber || 1);
    b.pagesCount = Number(b.pagesCount || 0);

    b.previewEnabled =
      b.previewEnabled === "true" || b.previewEnabled === true;

    b.published = b.published === "true" || b.published === true;

    b.isPremium = b.isPremium === "true" || b.isPremium === true;

    if (!b.title?.trim()) throw new Error("Chapter name is required");
    if (!b.subject) throw new Error("Please select subject");
  }

  return assetFields(
    b,
    req.files || (req.file ? { image: req.file } : {}),
    key
  );
};
const publicSafe = (key, doc) => { if (key !== 'chapters') return doc; const x = doc.toObject ? doc.toObject() : { ...doc }; delete x.fullPdf; delete x.fullImages; return x };
export const list = key => async (req, res, next) => {
  try {
    const { page, limit } = paging(req);

    const q = {};

    // User only sees published exams
    if (
      key === "exams" &&
      (!req.user || req.user.role !== "admin")
    ) {
      q.status = "published";
    }

    if (key === "subjects" && req.query.exam) {
      q.exam = req.query.exam;
    }

    if (key === "subjects" && req.query.status) {
      q.status = req.query.status;
    }

    if (req.query.subject && key === 'chapters') q.subject = req.query.subject; if (req.query.status) q.status = req.query.status; if (req.query.published !== undefined) q.published = req.query.published === 'true';

    if (req.query.q) {
      const regex = new RegExp(req.query.q, "i");

      if (key === "exams") {
        q.title = regex;
      } else if (key === "subjects") {
        q.name = regex;
      } else {
        q.title = regex;
      }
    }
    const [data, total] = await Promise.all([models[key].find(q).populate(key === 'subjects' ? 'exam' : key === 'chapters' ? 'subject' : key === "exams" ? "createdBy" : "", 'title name email').sort(key === 'subjects' ? { displayOrder: 1, createdAt: -1 } : key === 'chapters' ? { chapterNumber: 1, createdAt: -1 } : { createdAt: -1 }).skip((page - 1) * limit).limit(limit), models[key].countDocuments(q)]);

    const responseData =
      key === "chapters" && (!req.user || req.user.role !== "admin")
        ? data.map((item) => publicSafe(key, item))
        : data;

    ok(res, responseData, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e) { next(e) }
};

export const get = (key) => async (req, res, next) => {
  try {
    let query = models[key].findById(req.params.id);

    if (key === "subjects") {
      query = query.populate("exam", "title");
    }

    if (key === "chapters") {
      query = query.populate("subject", "name");
    }

    if (key === "exams") {
      query = query.populate("createdBy", "name email");
    }

    const doc = await query;

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    ok(res, publicSafe(key, doc));
  } catch (e) {
    next(e);
  }
};
export const getExamBySlug = async (req, res, next) => { try { const exam = await Exam.findOne({ slug: req.params.slug, status: 'published' }); if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' }); const subjects = await Subject.find({ exam: exam._id, status: 'published' }).sort({ displayOrder: 1, createdAt: -1 }); const ids = subjects.map(x => x._id); const chapters = await Chapter.find({ subject: { $in: ids }, published: true }).sort({ chapterNumber: 1, createdAt: 1 }); ok(res, { ...exam.toObject(), subjects: subjects.map(s => ({ ...s.toObject(), chapters: chapters.filter(c => String(c.subject) === String(s._id)).map(c => publicSafe('chapters', c)) })) }) } catch (e) { next(e) } };

export const create = (key) => async (req, res, next) => {
  try {
    const body = normalize(key, req);

    if (key === "exams") {
      body.createdBy = req.user._id;
    }

    const doc = await models[key].create(body);

    return res.status(201).json({
      success: true,
      message: `${key.slice(0, -1)} created successfully`,
      data: doc,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);

    if (err.name === "ValidationError") {
      return res.status(422).json({
        success: false,
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return next(err);
  }
};
export const update = key => async (req, res, next) => { try { const doc = await models[key].findByIdAndUpdate(req.params.id, normalize(key, req), { new: true, runValidators: true }); if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' }); ok(res, doc) } catch (e) { next(e) } };
export const remove = key => async (req, res, next) => { try { const doc = await models[key].findByIdAndDelete(req.params.id); if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' }); res.json({ success: true, message: 'Deleted' }) } catch (e) { next(e) } };
export const bulkChapter = async (req, res, next) => { try { const ids = req.body.ids || []; if (!ids.length) return res.status(422).json({ success: false, message: 'Select at least one chapter' }); if (req.body.action === 'delete') await Chapter.deleteMany({ _id: { $in: ids } }); else if (['publish', 'unpublish'].includes(req.body.action)) await Chapter.updateMany({ _id: { $in: ids } }, { $set: { published: req.body.action === 'publish' } }); else return res.status(422).json({ success: false, message: 'Unsupported bulk action' }); ok(res, { count: ids.length }) } catch (e) { next(e) } };
export const analytics = async (req, res, next) => { try { const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), month = new Date(now.getFullYear(), now.getMonth(), 1); const [exams, subjects, chapters, uploads, users, premiumUsers, orders, activity, revenueRows, topExams, recent] = await Promise.all([Exam.countDocuments(), Subject.countDocuments(), Chapter.countDocuments(), Chapter.countDocuments({ $or: [{ samplePdf: { $exists: true } }, { fullPdf: { $exists: true } }, { 'sampleImages.0': { $exists: true } }, { 'fullImages.0': { $exists: true } }] }), User.countDocuments(), Order.distinct('user', { status: 'paid' }), Order.countDocuments({ status: 'paid' }), Chapter.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, chapters: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 14 }, { $sort: { _id: 1 } }]), Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$total' } } }, { $sort: { _id: -1 } }, { $limit: 30 }, { $sort: { _id: 1 } }]), Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: '$exam', sales: { $sum: 1 }, revenue: { $sum: '$total' } } }, { $sort: { revenue: -1 } }, { $limit: 5 }, { $lookup: { from: 'exams', localField: '_id', foreignField: '_id', as: 'exam' } }]), Activity.find().populate('user exam chapter', 'name email title').sort('-createdAt').limit(8)]); const paid = await Order.find({ status: 'paid' }).select('total paidAt'); const total = paid.reduce((sum, x) => sum + x.total, 0), todayRevenue = paid.filter(x => x.paidAt >= today).reduce((sum, x) => sum + x.total, 0), monthRevenue = paid.filter(x => x.paidAt >= month).reduce((sum, x) => sum + x.total, 0); ok(res, { exams, subjects, chapters, uploads, users, premiumUsers: premiumUsers.length, orders, revenue: { today: todayRevenue, month: monthRevenue, overall: total }, activity: activity.map(x => ({ date: x._id, chapters: x.chapters })), revenueChart: revenueRows.map(x => ({ date: x._id, revenue: x.revenue })), topExams: topExams.map(x => ({ name: x.exam[0]?.title || 'Deleted exam', sales: x.sales, revenue: x.revenue })), recentActivity: recent.map(x => ({ id: x._id, type: x.type, user: x.user?.name || 'Learner', exam: x.exam?.title || x.chapter?.title || 'Notes', createdAt: x.createdAt })) }) } catch (e) { next(e) } };
export const search = key => async (req, res, next) => { try { const term = req.query.q?.trim(); if (!term) return ok(res, []); 
  const field =key === "exams"
    ? "title"
    : key === "subjects"
    ? "name"
    : "title";
     const data = await models[key].find({ [field]: new RegExp(term, 'i'), ...(key === 'exams' ? { status: 'published' } : key === 'subjects' ? { status: 'published' } : { published: true }) }).limit(20).populate(key === 'subjects' ? 'exam' : key === 'chapters' ? 'subject' : ''); ok(res, data) } catch (e) { next(e) } };
