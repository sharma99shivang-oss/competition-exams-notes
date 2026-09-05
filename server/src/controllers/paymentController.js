import crypto from 'crypto'; import Razorpay from 'razorpay'; import Order from '../models/Order.js'; import Exam from '../models/Exam.js'; import Chapter from '../models/Chapter.js'; import Coupon from '../models/Coupon.js'; import Activity from '../models/Activity.js'; import cloudinary from '../config/cloudinary.js';
const ok = (res, data) => res.json({ success: true, data }); const client = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }); const owned = (user, exam) => Order.exists({ user, exam, status: 'paid' });
const price = async (examId, code) => { const exam = await Exam.findById(examId); if (!exam || exam.status !== 'published') throw Object.assign(new Error('Exam is unavailable'), { statusCode: 404 }); let amount = exam.discountPrice ?? exam.price, discount = 0, coupon = null; if (code) { coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' }); if (!coupon || coupon.expiresAt && coupon.expiresAt < new Date() || coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw Object.assign(new Error('Coupon is not valid'), { statusCode: 422 }); if (amount < coupon.minOrderAmount) throw Object.assign(new Error('Order does not meet coupon minimum'), { statusCode: 422 }); discount = coupon.type === 'percent' ? amount * coupon.value / 100 : coupon.value; if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount); amount = Math.max(0, amount - discount) } return { exam, amount: Math.round(amount * 100) / 100, discount, coupon } };
export const createOrder = async (req, res, next) => {
    try {
        const { examId, couponCode } = req.body;

        if (await owned(req.user._id, examId)) {
            return res.status(409).json({
                success: false,
                message: "You already own this exam",
            });
        }

        const p = await price(examId, couponCode);

        let gatewayOrder = null;

        if (p.amount > 0) {
            gatewayOrder = await client().orders.create({
                amount: Math.round(p.amount * 100), // paisa
                currency: "INR",
                receipt: `exam_${Date.now()}`,
                notes: {
                    examId,
                    userId: String(req.user._id),
                },
            });
        }

        const order = await Order.create({
            user: req.user._id,
            exam: p.exam._id,
            exams: [{ exam: p.exam._id, price: p.amount }],
            amount: p.amount,
            total: p.amount,
            discount: p.discount,
            coupon: p.coupon?.code,
            razorpayOrderId: gatewayOrder?.id,
            status: p.amount > 0 ? "pending" : "paid",
            paidAt: p.amount > 0 ? undefined : new Date(),
        });

        return res.json({
            success: true,
            message: "Payment order created",
            data: {
                orderId: gatewayOrder.id,
                amount: gatewayOrder.amount,
                currency: gatewayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                exam: {
                    id: p.exam._id,
                    title: p.exam.title,
                },
                orderDbId: order._id,
            },
        });
    } catch (err) {
        next(err);
    }
};
export const verify = async (req, res, next) => { try { const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex'); if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature || ''))) return res.status(400).json({ success: false, message: 'Invalid payment signature' }); const order = await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id, status: 'pending' }, { $set: { status: 'paid', paymentId: razorpay_payment_id, signature: razorpay_signature, paidAt: new Date() } }, { new: true }); if (!order) return res.status(404).json({ success: false, message: 'Order is not pending' }); if (order.coupon) await Coupon.updateOne({ code: order.coupon }, { $inc: { usedCount: 1 } }); await Activity.create({ user: order.user, exam: order.exam, type: 'purchase' }); ok(res, { order, invoice: { number: `INV-${order._id}`, issuedAt: order.paidAt } }) } catch (e) { next(e) } };
export const webhook = async (req, res, next) => { try { const signature = req.headers['x-razorpay-signature']; const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(req.body).digest('hex'); if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return res.status(400).json({ success: false, message: 'Invalid webhook signature' }); const event = JSON.parse(req.body.toString()); const payment = event.payload?.payment?.entity; if (event.event === 'payment.captured' && payment) { const order = await Order.findOneAndUpdate({ razorpayOrderId: payment.order_id, status: 'pending' }, { $set: { status: 'paid', paymentId: payment.id, paidAt: new Date() } }, { new: true }); if (order) await Activity.create({ user: order.user, exam: order.exam, type: 'purchase' }) } if (event.event === 'payment.failed' && payment) await Order.updateOne({ razorpayOrderId: payment.order_id, status: 'pending' }, { $set: { status: 'failed' } }); ok(res, { received: true }) } catch (e) { next(e) } };
export const accessChapter = async (req, res, next) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate({
            path: "subject",
            populate: { path: "exam" },
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found",
            });
        }

        const full = await owned(req.user._id, chapter.subject.exam._id);
        const file = full ? chapter.fullPdf : chapter.samplePdf;

        if (!file?.url) {
            return res.status(404).json({
                success: false,
                message: full
                    ? "Full PDF not uploaded"
                    : "Sample preview not available",
            });
        }

        // ✅ IMPORTANT: Cloudinary ka original URL hi use karo
        let url = file.url;

        // if (!file.url.startsWith("/uploads/")) {
        //     url = file.url.replace("/raw/upload/", "/image/upload/");
        // }

        await Activity.create({
            user: req.user._id,
            exam: chapter.subject.exam._id,
            chapter: chapter._id,
            type: full ? "download" : "view",
            meta: { preview: !full },
        });

        return res.json({
            success: true,
            data: {
                url,
                preview: !full,
                allowDownload: full,
            },
        });
    } catch (e) {
        next(e);
    }
};
export const myPurchases = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            status: "paid",
        })
            .populate("exam")
            .sort("-paidAt");

        const ids = orders.map((o) => o.exam?._id).filter(Boolean);

        const [recent, downloads] = await Promise.all([
            Activity.find({ user: req.user._id, type: "view" })
                .populate("chapter exam")
                .sort("-createdAt")
                .limit(8),

            Activity.find({ user: req.user._id, type: "download" })
                .populate("chapter exam")
                .sort("-createdAt")
                .limit(30),
        ]);

        // ✅ Add 1 year validity to every order
        const ordersWithValidity = orders.map((order) => {
            const purchaseDate = order.paidAt || order.createdAt;

            const validTill = new Date(purchaseDate);
            validTill.setFullYear(validTill.getFullYear() + 1);

            return {
                _id: order._id,
                total: order.total,
                amount: order.amount,
                discount: order.discount,
                status: order.status,
                purchaseDate,
                validTill,
                isActive: validTill > new Date(),
                exam: order.exam,
            };
        });

        ok(res, {
            orders: ordersWithValidity,
            exams: orders.map((o) => o.exam),
            recent,
            downloads,
            ownedExamIds: ids,
        });
    } catch (e) {
        next(e);
    }
};
export const reports = async (req, res, next) => { try { const [orders, top, downloads, users] = await Promise.all([Order.find({ status: 'paid' }).populate('user exam').sort('-paidAt'), Activity.aggregate([{ $match: { type: 'purchase' } }, { $group: { _id: '$exam', purchases: { $sum: 1 } } }, { $sort: { purchases: -1 } }, { $limit: 10 }, { $lookup: { from: 'exams', localField: '_id', foreignField: '_id', as: 'exam' } }]), Activity.countDocuments({ type: 'download' }), (await import('../models/User.js')).default.countDocuments()]); const revenue = orders.reduce((n, o) => n + o.total, 0); if (req.query.format === 'csv') { res.type('text/csv').attachment('competition-notes-report.csv').send(['Order,User,Exam,Amount,Date', ...orders.map(o => `${o._id},${o.user?.email || ''},"${o.exam?.title || ''}",${o.total},${o.paidAt || o.createdAt}`)].join('\n')); return } ok(res, { revenue, orders: orders.length, downloads, users, topExams: top.map(x => ({ exam: x.exam[0], purchases: x.purchases })) }) } catch (e) { next(e) } };
