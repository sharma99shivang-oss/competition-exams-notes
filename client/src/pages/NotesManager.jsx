import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../store/api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, Users, Layers, FileText, ReceiptText, IndianRupee, Crown, Upload } from 'lucide-react';

export function AdminAnalytics() {
  const token = useSelector((state) => state.auth.accessToken);

  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    subjects: 0,
    chapters: 0,
    uploads: 0,
    activity: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data.data);
      } catch (err) {
        console.error("Analytics Error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  const cards = [['Total exams', stats.exams, BookOpen, 'text-indigo-300'], ['Subjects', stats.subjects, Layers, 'text-violet-300'], ['Notes uploaded', stats.uploads, Upload, 'text-sky-300'], ['Total users', stats.users, Users, 'text-emerald-300'], ['Premium users', stats.premiumUsers, Crown, 'text-amber-300'], ['Total orders', stats.orders, ReceiptText, 'text-pink-300'], ['Revenue today', money(stats.revenue?.today), IndianRupee, 'text-green-300'], ['This month', money(stats.revenue?.month), IndianRupee, 'text-cyan-300'], ['Lifetime revenue', money(stats.revenue?.overall), IndianRupee, 'text-orange-300']];
  if (loading) return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 9 }, (_, i) => <div key={i} className="glass h-28 animate-pulse rounded-2xl" />)}</div>;
  return <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-indigo-300">ADMIN CONTROL CENTER</p><h1 className="mt-1 text-3xl font-bold">Good morning, manage with clarity.</h1><p className="mt-2 text-sm text-slate-400">Live performance across your notes marketplace.</p></div><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-300">● Systems operational</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon, color]) => <article key={label} className="glass rounded-2xl p-4"><div className="flex items-start justify-between"><p className="text-sm text-slate-400">{label}</p><Icon size={18} className={color} /></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p></article>)}</div><div className="mt-6 grid gap-5 xl:grid-cols-5"><section className="glass rounded-2xl p-5 xl:col-span-3"><div className="flex justify-between"><div><h2 className="font-bold">Revenue performance</h2><p className="mt-1 text-sm text-slate-400">Paid orders over the last 30 days</p></div><b className="text-emerald-300">{money(stats.revenue?.month)}</b></div><div className="mt-5 h-64">{stats.revenueChart?.length ? <ResponsiveContainer><LineChart data={stats.revenueChart}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="date" hide /><YAxis stroke="#94a3b8" width={42} /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer> : <Empty text="Revenue will appear after your first paid order." />}</div></section><section className="glass rounded-2xl p-5 xl:col-span-2"><h2 className="font-bold">Top-selling exams</h2><div className="mt-5 h-64">{stats.topExams?.length ? <ResponsiveContainer><BarChart data={stats.topExams} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={90} tick={{ fill: '#cbd5e1', fontSize: 11 }} /><Tooltip /><Bar dataKey="sales" fill="#6366f1" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer> : <Empty text="Sales rankings will appear here." />}</div></section></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="glass rounded-2xl p-5"><h2 className="font-bold">Daily upload activity</h2><div className="mt-5 h-48">{stats.activity?.length ? <ResponsiveContainer><BarChart data={stats.activity}><XAxis dataKey="date" hide /><Tooltip /><Bar dataKey="chapters" fill="#38bdf8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <Empty text="No notes have been uploaded yet." />}</div></section><section className="glass rounded-2xl p-5"><h2 className="font-bold">Recent activity</h2><div className="mt-3 space-y-1">{stats.recentActivity?.length ? stats.recentActivity.map(x => <div key={x.id} className="flex items-center justify-between border-b border-white/5 py-3 text-sm"><div><b className="font-medium">{x.user}</b><span className="text-slate-400"> {x.type} · {x.exam}</span></div><time className="text-xs text-slate-500">{new Date(x.createdAt).toLocaleDateString()}</time></div>) : <Empty text="No activity yet." />}</div></section></div></>;
}
const Empty = ({ text }) => <div className="grid h-full place-items-center text-center text-sm text-slate-400">{text}</div>;

const fields = { exams: [['title', 'Name'], ['slug', 'Slug'], ['description', 'Description'], ['price', 'Price', 'number'], ['discountPrice', 'Discount price', 'number'], ['language', 'Language'], ['tags', 'Tags'], ['thumbnail', 'Thumbnail', 'file'], ['banner', 'Banner', 'file']], subjects: [['name', 'Subject name'], ['exam', 'Exam ID'], ['description', 'Description'], ['displayOrder', 'Display order', 'number'], ['image', 'Image', 'file']], chapters: [['title', 'Chapter name'], ['subject', 'Subject ID'], ['description', 'Description'], ['chapterNumber', 'Chapter number', 'number'], ['pagesCount', 'Pages', 'number'], ['samplePdf', 'Sample PDF', 'file'], ['fullPdf', 'Full PDF', 'file'], ['sampleImages', 'Sample images', 'files'], ['fullImages', 'Full images', 'files']] };
export function NotesManager({ type }) { const [data, setData] = useState([]), [q, setQ] = useState(''), [edit, setEdit] = useState(), [pick, setPick] = useState([]), [message, setMessage] = useState(''); const load = () => api.get('/' + type, { params: { q, limit: 25 } }).then(r => setData(r.data.data)).catch(e => setMessage(e.response?.data?.message || 'Unable to load')); useEffect(load, [type, q]); const save = async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); if (type === 'exams') fd.set('tags', JSON.stringify((fd.get('tags') || '').split(',').map(x => x.trim()).filter(Boolean))); try { edit._id ? await api.patch(`/${type}/${edit._id}`, fd) : await api.post('/' + type, fd); setEdit(); load() } catch (e) { setMessage(e.response?.data?.message || 'Save failed') } }; const bulk = action => api.post('/chapters/bulk', { ids: pick, action }).then(() => { setPick([]); load() }); return <><div className="flex items-center justify-between"><h1 className="text-3xl font-bold capitalize">{type}</h1><button className="btn btn-primary" onClick={() => setEdit({})}>New</button></div><section className="glass mt-6 rounded-2xl p-5"><div className="flex gap-3"><input className="rounded-lg bg-white/10 p-2" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />{type === 'chapters' && pick.length > 0 && <><button onClick={() => bulk('publish')}>Publish</button><button onClick={() => bulk('unpublish')}>Unpublish</button><button className="text-red-300" onClick={() => bulk('delete')}>Delete</button></>}</div>{message && <p className="mt-3 text-red-300">{message}</p>}<table className="mt-5 w-full text-left text-sm"><thead><tr>{type === 'chapters' && <th />}<th>Name</th><th>Status</th><th>Files</th><th /></tr></thead><tbody>{data.map(x => <tr className="border-t border-white/10" key={x._id}>{type === 'chapters' && <td><input type="checkbox" checked={pick.includes(x._id)} onChange={() => setPick(v => v.includes(x._id) ? v.filter(i => i !== x._id) : [...v, x._id])} /></td>}<td className="py-3">{x.title || x.name}</td><td>{x.status || String(x.published)}</td><td>{[x.thumbnail, x.banner, x.image, x.samplePdf, x.fullPdf].filter(Boolean).length + (x.sampleImages?.length || 0) + (x.fullImages?.length || 0)}</td><td><button className="text-indigo-300" onClick={() => setEdit(x)}>Edit</button><button className="ml-3 text-red-300" onClick={() => api.delete(`/${type}/${x._id}`).then(load)}>Delete</button></td></tr>)}</tbody></table></section>{edit && <div className="fixed inset-0 z-50 overflow-auto bg-black/70 p-5"><form onSubmit={save} className="mx-auto my-8 max-w-2xl rounded-2xl bg-[#12182d] p-6"><div className="flex justify-between"><h2>{edit._id ? 'Edit' : 'New'} {type}</h2><button type="button" onClick={() => setEdit()}>Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields[type].map(([name, label, kind = 'text']) => <label className="text-sm" key={name}>{label}<input required={['title', 'name', 'exam', 'subject'].includes(name)} className="mt-1 block w-full rounded bg-white/10 p-2" type={kind.startsWith('file') ? 'file' : kind} accept={name.toLowerCase().includes('pdf') ? 'application/pdf' : kind.startsWith('file') ? 'image/jpeg,image/png,image/webp' : undefined} multiple={kind === 'files'} name={name} defaultValue={kind === 'file' || kind === 'files' ? undefined : edit[name] ?? ''} /></label>)}</div><button className="btn btn-primary mt-6">Save</button></form></div>}</> }
