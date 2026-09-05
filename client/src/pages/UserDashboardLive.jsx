import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    Heart,
    Bell,
    Clock,
    ArrowRight,
} from "lucide-react";
import { api } from "../store/api";

const Card = ({ icon: Icon, value, label }) => (
    <article className="glass rounded-2xl p-5">
        <Icon className="text-indigo-300" size={26} />

        <h2 className="mt-4 text-3xl font-bold">{value}</h2>

        <p className="mt-1 text-sm text-slate-400">{label}</p>
    </article>
);

export default function UserDashboardLive() {
    const [data, setData] = useState({
        exams: [],
        recent: [],
        wishlist: [],
        notifications: [],
    });

    useEffect(() => {
        Promise.all([
            api.get("/purchases/my"),
            api.get("/wishlist"),
            api.get("/notifications/my"),
        ])
            .then(([purchases, wishlist, notifications]) => {
                setData({
                    exams: purchases.data.data.exams || [],
                    recent: purchases.data.data.recent || [],
                    wishlist: wishlist.data.data.exams || [],
                    notifications: notifications.data.data || [],
                });
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="space-y-8">
            {/* ================= TOP HEADER ================= */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 hover:text-white"
                    >
                        <ArrowLeft size={18} />
                        Back to Website
                    </Link>

                    <p className="mt-5 text-indigo-300">Your study space</p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Welcome to your Dashboard 👋
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Track your purchased exams, wishlist, recent notes and notifications.
                    </p>
                </div>

                <Link
                    to="/exams"
                    className="rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold hover:bg-violet-700"
                >
                    Browse Exams
                </Link>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card
                    icon={BookOpen}
                    value={data.exams.length}
                    label="Purchased Exams"
                />

                <Card
                    icon={Heart}
                    value={data.wishlist.length}
                    label="Wishlist"
                />

                <Card
                    icon={Clock}
                    value={data.recent.length}
                    label="Recent Notes"
                />

                <Card
                    icon={Bell}
                    value={data.notifications.filter((item) => !item.read).length}
                    label="Unread Alerts"
                />
            </div>

            {/* ================= PURCHASED EXAMS ================= */}
            <section className="glass rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Purchased Exams</h2>

                    <Link
                        to="/dashboard/purchased"
                        className="text-sm text-violet-400 hover:text-violet-300"
                    >
                        View All
                    </Link>
                </div>

                {data.exams.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {data.exams.map((exam) => (
                            <div
                                key={exam._id}
                                className="rounded-xl border border-white/10 bg-white/5 p-4"
                            >
                                <h3 className="font-semibold">{exam.title}</h3>

                                <p className="mt-2 text-sm text-emerald-400">
                                    Full Notes Unlocked
                                </p>

                                <Link
                                    to={`/exam/${exam.slug}`}
                                    className="mt-4 inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                                >
                                    Open Notes
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">
                        You haven't purchased any exam yet.
                    </p>
                )}
            </section>

            {/* ================= RECENT NOTES ================= */}
            <section className="glass rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Recently Viewed Notes</h2>

                    <Link
                        to="/dashboard/purchased"
                        className="text-sm text-violet-400 hover:text-violet-300"
                    >
                        Open Purchased Notes
                    </Link>
                </div>

                {data.recent.length ? (
                    <div className="space-y-3">
                        {data.recent.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.chapter?.title || item.exam?.title}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <Link
                                    to={`/exam/${item.exam?.slug}`}
                                    className="text-violet-400 hover:text-violet-300"
                                >
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">
                        No recently viewed notes available.
                    </p>
                )}
            </section>

            {/* ================= WISHLIST ================= */}
            <section className="glass rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Wishlist</h2>

                    <Link
                        to="/dashboard/wishlist"
                        className="text-sm text-violet-400 hover:text-violet-300"
                    >
                        View Wishlist
                    </Link>
                </div>

                {data.wishlist.length ? (
                    <div className="space-y-3">
                        {data.wishlist.slice(0, 3).map((exam) => (
                            <div
                                key={exam._id}
                                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                            >
                                <div>
                                    <p className="font-medium">{exam.title}</p>

                                    <p className="text-sm text-slate-400">
                                        ₹{exam.discountPrice ?? exam.price}
                                    </p>
                                </div>

                                <Link
                                    to={`/exam/${exam.slug}`}
                                    className="text-violet-400 hover:text-violet-300"
                                >
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">Your wishlist is empty.</p>
                )}
            </section>

            {/* ================= NOTIFICATIONS ================= */}
            <section className="glass rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Latest Notifications</h2>

                    <Link
                        to="/dashboard/notifications"
                        className="text-sm text-violet-400 hover:text-violet-300"
                    >
                        View All
                    </Link>
                </div>

                {data.notifications.length ? (
                    <div className="space-y-3">
                        {data.notifications.slice(0, 4).map((note) => (
                            <div
                                key={note._id}
                                className="rounded-xl bg-white/5 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">
                                        {note.title || "Notification"}
                                    </p>

                                    {!note.read && (
                                        <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs text-rose-300">
                                            New
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-sm text-slate-400">
                                    {note.message}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    {new Date(note.createdAt).toLocaleDateString("en-IN")}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">No notifications available.</p>
                )}
            </section>
        </div>
    );
}