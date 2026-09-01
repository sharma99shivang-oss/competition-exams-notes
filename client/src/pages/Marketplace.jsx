import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Play, FileText, ShoppingCart, Star } from 'lucide-react';
import { api } from '../store/api';

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const asset = url => url?.startsWith('/') ? `${apiOrigin}${url}` : url;
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

function ExamCard({ exam }) { const price = exam.discountPrice ?? exam.price; return <article className="glass overflow-hidden rounded-2xl transition hover:-translate-y-1"><div className="relative h-40 bg-linear-to-br from-indigo-700 to-violet-900">{exam.banner?.url && <img className="h-full w-full object-cover" src={asset(exam.banner.url)} alt="" />}{exam.isFeatured && <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2 py-1 text-xs font-bold text-amber-950"><Star size={12} className="mr-1 inline" />Featured</span>}{exam.discountPrice != null && <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-1 text-xs font-semibold">Flash sale</span>}</div><div className="p-5"><div className="flex gap-3">{exam.thumbnail?.url ? <img className="h-12 w-12 rounded-xl object-cover" src={asset(exam.thumbnail.url)} alt="" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><BookOpen size={20} /></div>}<div className="min-w-0"><h2 className="truncate font-bold">{exam.title}</h2><p className="text-xs text-slate-400">{exam.language}</p></div></div><p className="mt-4 line-clamp-2 text-sm text-slate-400">{exam.description || 'Structured notes, previews and chapter-wise learning.'}</p><div className="mt-5 flex items-center gap-2"><b>{money(price)}</b>{exam.discountPrice != null && <del className="text-sm text-slate-500">{money(exam.price)}</del>}</div><div className="mt-5 grid grid-cols-2 gap-2"><Link className="btn btn-primary text-center text-sm" to={`/exam/${exam.slug}`}>View notes</Link><Link className="btn border border-white/10 bg-white/5 text-center text-sm" to={`/exam/${exam.slug}`}>Buy now</Link></div></div></article> }

function ExamGrid({ limit }) { const [exams, setExams] = useState([]), [error, setError] = useState(''); useEffect(() => { api.get('/exams', { params: { limit: limit || 100 } }).then(r => setExams(r.data.data || [])).catch(() => setError('Unable to load exams right now.')) }, [limit]); if (error) return <p className="mt-8 text-rose-300">{error}</p>; return <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{exams.map(exam => <ExamCard key={exam._id} exam={exam} />)}{!exams.length && <p className="text-slate-400">No published exams are available yet.</p>}</div> }

export function MarketplaceHome() {
    return <><section className="mesh">
        <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">
            <p className="inline-block rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">Premium notes for ambitious learners</p>
            <h1 className="mt-5 text-5xl font-black md:text-6xl">Prepare smarter.<br />
                <span className="gradient-text">Achieve bigger.</span></h1><p className="mt-6 max-w-xl text-lg text-slate-300">Browse published exam notes, preview samples, and unlock full study material after purchase.</p>
            <br></br>
            <Link to="/exams" className="btn btn-primary mt-8">Explore exams</Link>
        </div>

    </section>
        <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="flex items-end justify-between"><div><h2 className="text-3xl font-bold">Popular exams</h2>
                <p className="mt-2 text-slate-400">Freshly published by our academic team.</p>
            </div>
                <Link to="/exams" className="text-indigo-300">View all →</Link></div><ExamGrid limit={6} /></section></>
}
export function MarketplaceExams() {
    return <section className="mx-auto max-w-7xl px-5 py-16">

        <p className="text-indigo-300">Explore the library</p>
        <h1 className="mt-2 text-4xl font-bold">Find your examination</h1><ExamGrid /></section>
}

export function ExamDetail() {
    const { slug } = useParams(),
        go = useNavigate(),
        [exam, setExam] = useState(),
        [owned, setOwned] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState('');
    useEffect(() => {
        if (!slug) return;
        api.get(`/exams/slug/${slug}`).then(r => setExam(r.data.data)).catch(e => setError(e.response?.data?.message || 'Exam not found'));
        api.get('/purchases/my').then(r => setOwned((r.data.data.ownedExamIds || []).some(id => String(id) === String(r.data.data.exams?.find(x => x.slug === slug)?._id)))).catch(() => { })
    }, [slug]);

    const buy = async () => {
        try {
            setBusy(true);

            // Create Razorpay order
            const res = await api.post("/payments/orders", {
                examId: exam._id,
            });

            const order = res.data.data;

            // Free exam
            if (!order.orderId) {
                setOwned(true);
                alert("Exam unlocked successfully.");
                return;
            }

            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "Competition Notes",
                description: exam.title,
                order_id: order.orderId,

                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true,
                },

                handler: async (response) => {
                    try {
                        await api.post("/payments/verify", response);

                        alert("✅ Payment Successful!");
                        setOwned(true);

                        // Refresh purchase state
                        window.location.reload();
                    } catch (err) {
                        alert(
                            err.response?.data?.message || "Payment verification failed."
                        );
                    }
                },

                prefill: {
                    name: "Competition Notes User",
                },

                theme: {
                    color: "#6366F1",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                console.error("Payment Failed:", response.error);
                alert(response.error.description);
            });

            razorpay.open();
        } catch (e) {
            console.error("Purchase Error:", e.response?.data || e);

            if (e.response?.status === 401) {
                go("/login");
            } else {
                setError(e.response?.data?.message || "Could not start purchase");
            }
        } finally {
            setBusy(false);
        }
    };
    const openPdf = async id => { try { const { data } = await api.get(`/chapters/${id}/access`); window.open(asset(data.data.url), '_blank', 'noopener') } catch (e) { setError(e.response?.data?.message || 'Preview unavailable') } }; if (error) return <section className="mx-auto max-w-5xl px-5 py-16"><h1 className="text-3xl font-bold">{error}</h1></section>; if (!exam) return <div className="grid min-h-80 place-items-center text-slate-400">Loading exam…</div>; return <main><section className="relative min-h-72 overflow-hidden bg-indigo-950">{exam.banner?.url && <img className="absolute inset-0 h-full w-full object-cover opacity-40" src={asset(exam.banner.url)} alt="" />}<div className="relative mx-auto max-w-7xl px-5 py-16"><p className="text-indigo-200">{exam.language}</p><h1 className="mt-2 text-4xl font-black">{exam.title}</h1><p className="mt-4 max-w-2xl text-slate-200">{exam.description}</p><div className="mt-6 flex flex-wrap items-center gap-4"><b className="text-2xl">{money(exam.discountPrice ?? exam.price)}</b>{owned ? <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">Purchased · Full notes unlocked</span> : <button disabled={busy} onClick={buy} className="btn btn-primary"><ShoppingCart className="mr-1 inline" size={16} />{busy ? 'Starting…' : 'Buy now'}</button>}</div></div></section><section className="mx-auto max-w-5xl px-5 py-12"><h2 className="text-2xl font-bold">Subjects & chapters</h2><div className="mt-5 space-y-4">{exam.subjects?.map(subject => <details className="glass rounded-2xl p-5" key={subject._id} open><summary className="cursor-pointer font-bold">{subject.name}<span className="ml-2 text-sm font-normal text-slate-400">{subject.description}</span></summary><div className="mt-4 space-y-3">{subject.chapters?.map(chapter => <article className="rounded-xl bg-white/5 p-4" key={chapter._id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{chapter.chapterNumber}. {chapter.title}</h3><p className="mt-1 text-sm text-slate-400">{chapter.description}</p></div>{chapter.sampleVideo?.url && <video className="w-full max-w-sm rounded-lg" controls src={asset(chapter.sampleVideo.url)} />}</div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => openPdf(chapter._id)} className="btn border border-white/10 bg-white/5 text-sm"><FileText className="mr-1 inline" size={15} />Sample PDF</button>{chapter.sampleImages?.map(image => <a key={image.url} className="btn border border-white/10 bg-white/5 text-sm" target="_blank" rel="noreferrer" href={asset(image.url)}>Sample image</a>)}{owned ? <button onClick={() => openPdf(chapter._id)} className="btn btn-primary text-sm">Download full PDF</button> : chapter.isPremium && <span className="inline-flex items-center px-3 text-sm text-amber-200"><Lock className="mr-1" size={15} />Full notes locked</span>}</div></article>)}{!subject.chapters?.length && <p className="text-sm text-slate-400">No published chapters yet.</p>}</div></details>)}{!exam.subjects?.length && <p className="text-slate-400">Subjects will appear here once published.</p>}</div></section></main>
}
