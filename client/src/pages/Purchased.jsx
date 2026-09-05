import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Download,
    ArrowRight,
    Clock,
    Eye,
} from "lucide-react";
import { api } from "../store/api";

export default function Purchased() {
    const [data, setData] = useState({
        orders: [],
        recent: [],
        downloads: [],
    });

    useEffect(() => {
        api.get("/purchases/my").then((res) => {
            setData(res.data.data);
        });
    }, []);

    return (
        <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">Purchased Notes</h1>
                    <p className="mt-2 text-slate-400">
                        Access all your purchased exam notes and download full PDFs.
                    </p>
                </div>

                <div className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">
                    {data.orders.length} Exams
                </div>
            </div>

            {/* Purchased Exams */}
            <div className="mt-8 space-y-5">
                {data.orders.map((order) => (
                    <article
                        key={order._id}
                        className="rounded-2xl border border-white/10 bg-[#111A3C] p-6 shadow-lg"
                    >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            {/* Left */}
                                <div className="flex min-w-0 items-start gap-4">
                                <div className="grid h-16 w-16 place-items-center rounded-xl bg-violet-600/20">
                                    <BookOpen className="text-violet-400" size={30} />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {order.exam?.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-400">
                                        All premium notes for this exam are unlocked.
                                    </p>
                                </div>
                            </div>

                            {/* Right Buttons */}
                                <div className="grid gap-3 sm:flex sm:flex-wrap">
                                <Link
                                    to={`/exam/${order.exam?.slug}`}
                                    className="w-full rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
                                >
                                    <Eye className="mr-2 inline" size={18} />
                                    View Notes
                                </Link>

                                <Link
                                    to={`/exam/${order.exam?.slug}`}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-white transition hover:bg-white/10 sm:w-auto"
                                >
                                    <Download className="mr-2 inline" size={18} />
                                    Download Notes
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}

                {!data.orders.length && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
                        You haven't purchased any exam yet.
                    </div>
                )}
            </div>

            {/* Recently Viewed */}
            <section className="mt-10 rounded-2xl border border-white/10 bg-[#111A3C] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
                    <Clock size={22} className="text-violet-400" />
                    Recently Viewed
                </h2>

                {data.recent.length ? (
                    <div className="space-y-3">
                        {data.recent.map((item) => (
                            <Link
                                key={item._id}
                                to={`/exam/${item.exam?.slug}`}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-4 transition hover:bg-white/10"
                            >
                                <div>
                                    <p className="font-medium text-white">
                                        {item.chapter?.title || item.exam?.title}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <ArrowRight className="text-violet-400" size={18} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">No recently viewed notes.</p>
                )}
            </section>

            {/* Download History */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#111A3C] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
                    <Download size={22} className="text-violet-400" />
                    Download History
                </h2>

                {data.downloads.length ? (
                    <div className="space-y-3">
                        {data.downloads.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-4"
                            >
                                <div>
                                    <p className="font-medium text-white">
                                        {item.chapter?.title || item.exam?.title}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Downloaded on{" "}
                                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <Download className="text-violet-400" size={18} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">No downloads yet.</p>
                )}
            </section>
        </>
    );
}
