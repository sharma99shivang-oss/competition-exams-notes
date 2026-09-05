import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../store/api';
import {
    BookOpen,
    Heart,
    ReceiptText,
    Bell,
    Users,
    IndianRupee,
    GraduationCap,
    Plus,
    Calendar,
    Clock,
    BadgeCheck,
    Trash2,
    ShoppingCart,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Stat = ({ icon: Icon, label, value, color = 'text-indigo-300' }) =>
    <div className="glass rounded-2xl p-5"><Icon className={color} /><p className="mt-4 text-2xl font-bold">{value}</p><p className="text-sm text-slate-400">{label}</p></div>; const Panel = ({ title, children }) => <section className="glass rounded-2xl p-5"><h2 className="font-bold">{title}</h2>{children}</section>;
export function UserDashboard() { const user = useSelector(s => s.auth.user); return <><p className="text-indigo-300">Your study space</p><h1 className="mt-1 text-3xl font-bold">Good to see you, {user?.name?.split(' ')[0]}.</h1><div className="mt-7 grid gap-4 sm:grid-cols-3"><Stat icon={BookOpen} value="0" label="Purchased exams" /><Stat icon={Heart} value="0" label="Saved exams" color="text-pink-300" /><Stat icon={GraduationCap} value="0h" label="Study time this week" color="text-emerald-300" /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><Panel title="Continue learning"><div className="mt-4 rounded-xl border border-dashed border-white/15 p-7 text-center text-sm text-slate-400">Your purchased courses will appear here.<br /><Link className="mt-2 inline-block text-indigo-300" to="/exams">Browse examinations →</Link></div></Panel><Panel title="Daily focus"><div className="mt-5 h-3 rounded-full bg-white/10"><div className="h-full w-1/3 rounded-full bg-indigo-500" /></div><p className="mt-3 text-sm text-slate-400">Set a goal in Settings and build your streak.</p></Panel></div></> }

export function UserSection({ type }) {
    const [data, setData] = useState([]);
    const [ownedExamIds, setOwnedExamIds] = useState([]);
    const user = useSelector((s) => s.auth.user);
    const navigate = useNavigate();
    const title = {
        profile: "Profile",
        purchased: "Purchased Exams",
        wishlist: "Wishlist",
        orders: "Orders",
        notifications: "Notifications",
        settings: "Settings",
    }[type];

    useEffect(() => {
        if (type === "wishlist") {
            Promise.all([api.get("/wishlist"), api.get("/purchases/my")])
                .then(([wishRes, purchaseRes]) => {
                    setData(wishRes.data.data.exams || []);
                    setOwnedExamIds(
                        (purchaseRes.data.data.ownedExamIds || []).map(String)
                    );
                })
                .catch(() => { });
            return;
        }

        const paths = {
            orders: "/orders/my",
            notifications: "/notifications/my",
        };

        if (paths[type]) {
            api
                .get(paths[type])
                .then((r) => setData(r.data.data))
                .catch(() => { });
        }
    }, [type]);

    // Money formatter
    const money = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);

    return (
        <>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>

            {/* PROFILE */}
            {type === "profile" && (
                <Panel title="Personal Details">
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <small className="text-slate-500">Name</small>
                            <p className="font-medium">{user?.name}</p>
                        </div>

                        <div>
                            <small className="text-slate-500">Email</small>
                            <p className="font-medium">{user?.email}</p>
                        </div>

                        <div>
                            <small className="text-slate-500">Role</small>
                            <p className="font-medium capitalize">{user?.role}</p>
                        </div>
                    </div>
                </Panel>
            )}

            {/* SETTINGS */}
            {type === "settings" && (
                <Panel title="Settings">
                    <p className="text-slate-400">
                        Manage your preferences and notification settings.
                    </p>

                    <button className="btn btn-primary mt-5 w-full sm:w-auto">
                        Save Preferences
                    </button>
                </Panel>
            )}

            {/* WISHLIST */}
            {type === "wishlist" && (
                <Panel title="My Wishlist">
                    <div className="mt-5 space-y-4">
                        {data.length ? (
                            data.map((exam) => {
                                const isPurchased = ownedExamIds.includes(String(exam._id));

                                return (
                                    <div
                                        key={exam._id}
                                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111A3C] p-5 md:flex-row md:items-center md:justify-between"
                                    >
                                        {/* Left */}
                                        <div className="flex min-w-0 gap-4">
                                            {exam.thumbnail?.url ? (
                                                <img
                                                    src={exam.thumbnail.url}
                                                    alt={exam.title}
                                                    className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                                                />
                                            ) : (
                                                <div className="grid h-20 w-20 place-items-center rounded-xl bg-violet-600/20">
                                                    <BookOpen className="text-violet-400" size={28} />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-white">
                                                    {exam.title}
                                                </h3>

                                                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                                    {exam.description ||
                                                        "Premium notes available for this exam."}
                                                </p>

                                                {isPurchased ? (
                                                    <span className="mt-3 inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                                                        ✅ Purchased
                                                    </span>
                                                ) : (
                                                    <p className="mt-3 text-lg font-semibold text-emerald-400">
                                                        ₹{exam.discountPrice ?? exam.price}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Buttons */}
                                        <div className="grid gap-3 sm:flex sm:flex-wrap">
                                            {isPurchased ? (
                                                <button
                                                    onClick={() => navigate(`/exam/${exam.slug}`)}
                                                    className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-700 sm:w-auto"
                                                >
                                                    View Notes
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/exam/${exam.slug}`)}
                                                    className="w-full rounded-xl bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-700 sm:w-auto"
                                                >
                                                    Buy Now
                                                </button>
                                            )}

                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.delete(`/wishlist/${exam._id}`);

                                                        setData((prev) =>
                                                            prev.filter((item) => item._id !== exam._id)
                                                        );
                                                    } catch (err) {
                                                        console.log(err.response?.data);
                                                    }
                                                }}
                                                className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/20 sm:w-auto"
                                            >
                                                <Trash2 className="mr-2 inline" size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                                <Heart className="mx-auto mb-4 text-pink-400" size={40} />
                                <p className="text-slate-300">Your wishlist is empty.</p>

                                <Link
                                    to="/exams"
                                    className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-700"
                                >
                                    Browse Exams
                                </Link>
                            </div>
                        )}
                    </div>
                </Panel>
            )}

            {/* NOTIFICATIONS */}
            {type === "notifications" && (
                <Panel title="Notifications">
                    <div className="mt-5 space-y-3">
                        {data.length ? (
                            data.map((n) => (
                                <div
                                    key={n._id}
                                    className="break-words rounded-xl bg-white/5 p-4"
                                >
                                    {n.message}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400">
                                No notifications available.
                            </p>
                        )}
                    </div>
                </Panel>
            )}

            {/* ORDERS PAGE */}
            {type === "orders" && (
                <div className="mt-6 space-y-5">
                    {data.length ? (
                        data.map((order) => {
                            // Purchase date = paidAt ya createdAt
                            const purchaseDate = order.purchaseDate || order.paidAt || order.createdAt;

                            // 1 year validity calculate
                            const validTill =
                                order.validTill ||
                                new Date(new Date(purchaseDate).setFullYear(new Date(purchaseDate).getFullYear() + 1));

                            // Active / Expired
                            const isActive =
                                order.isActive !== undefined
                                    ? order.isActive
                                    : new Date(validTill) > new Date();

                            return (
                                <article
                                    key={order._id}
                                    className="rounded-2xl border border-white/10 bg-[#111A3C] p-6"
                                >
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="grid h-16 w-16 place-items-center rounded-xl bg-violet-600/20">
                                                <BookOpen className="text-violet-400" size={28} />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-xl font-bold">{order.exam?.title}</h2>

                                                <div className="mt-2">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-sm ${isActive
                                                            ? "bg-emerald-500/20 text-emerald-300"
                                                            : "bg-red-500/20 text-red-300"
                                                            }`}
                                                    >
                                                        {isActive ? "Active (1 Year)" : "Expired"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/exam/${order.exam?.slug}`}
                                            className="w-full rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold hover:bg-violet-700 md:w-auto"
                                        >
                                            Open Notes
                                        </Link>
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                                        {/* Purchase Date */}
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <Calendar className="mb-2 text-violet-400" size={20} />
                                            <p className="text-xs text-slate-400">Purchase Date</p>

                                            <p className="font-semibold">
                                                {purchaseDate
                                                    ? new Date(purchaseDate).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </p>
                                        </div>

                                        {/* Valid Till */}
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <Clock className="mb-2 text-yellow-400" size={20} />
                                            <p className="text-xs text-slate-400">Valid Till</p>

                                            <p className="font-semibold">
                                                {new Date(validTill).toLocaleDateString("en-IN")}
                                            </p>
                                        </div>

                                        {/* Amount */}
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <BadgeCheck className="mb-2 text-emerald-400" size={20} />
                                            <p className="text-xs text-slate-400">Amount Paid</p>

                                            <p className="font-semibold text-emerald-400">
                                                {money(order.total)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-500">
                                        Order ID: {order._id}
                                    </div>
                                </article>
                            );
                        })

                    ) : (
                        <Panel title="Orders">
                            <p className="py-8 text-center text-slate-400">
                                No orders found yet.
                            </p>
                        </Panel>
                    )}
                </div>
            )}
        </>
    );
}

export function AdminDashboard() { const [stats, setStats] = useState({ users: 0, exams: 0, orders: 0, revenue: 0 }); useEffect(() => { api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => { }) }, []); const chart = [{ name: 'Mon', v: 4 }, { name: 'Tue', v: 7 }, { name: 'Wed', v: 5 }, { name: 'Thu', v: 11 }, { name: 'Fri', v: 9 }, { name: 'Sat', v: 14 }]; return <><p className="text-violet-300">Control center</p><h1 className="mt-1 text-3xl font-bold">Admin overview</h1><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Users} value={stats.users} label="Total users" /><Stat icon={BookOpen} value={stats.exams} label="Published exams" color="text-violet-300" /><Stat icon={ReceiptText} value={stats.orders} label="Paid orders" color="text-emerald-300" /><Stat icon={IndianRupee} value={`₹${stats.revenue}`} label="Revenue" color="text-amber-300" /></div><div className="mt-6 grid gap-5 lg:grid-cols-3"><Panel title="Learner activity"><div className="mt-5 h-60"><ResponsiveContainer><BarChart data={chart}><XAxis dataKey="name" stroke="#9ca3af" /><Tooltip /><Bar dataKey="v" fill="#818cf8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel><Panel title="Quick actions"><div className="mt-4 space-y-3"><Link to="/admin/exams" className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-sm"><Plus size={16} />Create an exam</Link><Link to="/admin/users" className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-sm"><Users size={16} />Manage learners</Link></div></Panel></div></> }
export function AdminSection({ type }) { const [data, setData] = useState([]); const title = type[0].toUpperCase() + type.slice(1); useEffect(() => { if (['users', 'exams', 'subjects', 'chapters', 'orders', 'notifications'].includes(type)) api.get('/' + type).then(r => setData(r.data.data)).catch(() => { }) }, [type]); return <><div className="flex items-center justify-between"><div><p className="text-violet-300">Administration</p><h1 className="text-3xl font-bold">{title}</h1></div>{['exams', 'subjects', 'chapters', 'notifications'].includes(type) && <button className="btn btn-primary"><Plus className="mr-1 inline" size={16} />New {type.slice(0, -1)}</button>}</div><Panel title={`${title} management`}><div className="mt-5 overflow-x-auto">{data.length ? <table className="w-full text-left text-sm"><thead className="border-b border-white/10 text-slate-400"><tr><th className="pb-3">Name</th><th className="pb-3">Details</th><th className="pb-3">Created</th></tr></thead><tbody>{data.map(x => <tr className="border-b border-white/5" key={x._id}><td className="py-4 font-medium">{x.name || x.title || x.email || 'Order'}</td><td className="py-4 text-slate-400">{x.category || x.role || x.status || x.description || '—'}</td><td className="py-4 text-slate-400">{new Date(x.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table> : type === 'coupons' ? <div className="py-8 text-center text-slate-400">Coupon management is ready for your first promotion.</div> : <div className="py-8 text-center text-slate-400">No {type} found yet.</div>}</div></Panel></> }
