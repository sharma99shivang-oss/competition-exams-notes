import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api } from '../../store/api';
import { Edit3, Eye, Filter, ImagePlus, Plus, Search, Star, Trash2, Copy, X } from 'lucide-react';

const initial = { title: '', slug: '', description: '', language: 'English', price: '', discountPrice: '', tags: '', isFeatured: false, status: 'draft' };
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function ExamManagement() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [page, setPage] = useState(1), [meta, setMeta] = useState({ pages: 1, total: 0 }), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null);
  const load = () => { setLoading(true); api.get('/admin/exams', { params: { q: query, status: filter === 'all' ? undefined : filter, page, limit: 9 } }).then(r => { setItems(r.data.data || []); setMeta(r.data.meta || { pages: 1, total: 0 }) }).catch(e => setError(e.response?.data?.message || 'Unable to load exams')).finally(() => setLoading(false)) };
  useEffect(load, [query, filter, page]);
  const save = async (data) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title.trim());

      formData.append(
        "slug",
        data.slug?.trim()
          ? data.slug.trim().toLowerCase()
          : data.title.trim().toLowerCase().replace(/\s+/g, "-")
      );

      formData.append("description", data.description || "");
      formData.append("language", data.language || "English");
      formData.append("price", Number(data.price) || 0);
      formData.append("discountPrice", Number(data.discountPrice) || 0);
      formData.append("status", data.status || "draft");
      formData.append("isFeatured", data.isFeatured ? "true" : "false");

      formData.append(
        "tags",
        JSON.stringify(
          String(data.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );

      if (data.banner?.[0]) {
        formData.append("banner", data.banner[0]);
      }

      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }

      if (editing?._id) {
        await api.patch(`/exams/${editing._id}`, formData);
      } else {
        await api.post("/exams", formData);
      }

      setEditing(null);
      setError("");
      load();
    } catch (err) {
      console.log("API Error:", err.response?.data);

      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.msg).join(", "));
      } else {
        setError(err.response?.data?.message || "Validation failed");
      }
    }
  };

  const remove = async () => { try { await api.delete(`/exams/${deleting._id}`); setDeleting(null); load() } catch (e) { setError(e.response?.data?.message || 'Could not delete exam') } };
  const duplicate = async item => { const fd = new FormData(); fd.append('title', `${item.title} (Copy)`); fd.append('slug', `${item.slug}-copy-${Date.now()}`); fd.append('description', item.description || ''); fd.append('language', item.language || 'English'); fd.append('price', item.price || 0); fd.append('status', 'draft'); fd.append('tags', JSON.stringify(item.tags || [])); try { await api.post('/exams', fd); load() } catch (e) { setError(e.response?.data?.message || 'Could not duplicate exam') } };
  const toggle = async item => { try { await api.patch(`/exams/${item._id}`, { status: item.status === 'published' ? 'draft' : 'published', isFeatured: item.isFeatured }); load() } catch (e) { setError(e.response?.data?.message || 'Could not update exam') } };
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-300">Content catalogue</p><h1 className="mt-1 text-3xl font-bold">Exam management</h1><p className="mt-2 text-sm text-slate-400">Create, price and publish your examination products.</p></div><button className="btn btn-primary" onClick={() => setEditing({})}><Plus className="mr-1 inline" size={17} />Create exam</button></div><div className="glass mt-6 flex flex-wrap gap-3 rounded-2xl p-4"><div className="flex min-w-55 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search size={17} className="text-slate-400" /><input className="w-full bg-transparent py-2 outline-none" placeholder="Search exams…" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} /></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Filter size={16} className="text-slate-400" /><select className="bg-transparent py-2 outline-none" value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}><option value="all">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div><span className="self-center text-sm text-slate-400">{meta.total || items.length} exams</span></div>{error && <div className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{error}</div>}{loading ? <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="glass h-72 animate-pulse rounded-2xl" />)}</div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map(item => <article key={item._id} className="glass overflow-hidden rounded-2xl transition hover:-translate-y-1"><div className="relative h-36 bg-linear-to-br from-indigo-700 to-violet-800">{item.banner?.url && <img src={item.banner.url} className="h-full w-full object-cover" />}<div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" /><div className="absolute bottom-3 left-3 flex gap-2"><span className="rounded-full bg-black/50 px-2 py-1 text-xs">{item.status}</span>{item.isFeatured && <span className="rounded-full bg-amber-400 px-2 py-1 text-xs font-bold text-amber-950"><Star size={11} className="mr-1 inline" />Featured</span>}</div></div><div className="p-4"><div className="flex items-start gap-3">{item.thumbnail?.url ? <img src={item.thumbnail.url} className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><ImagePlus size={18} /></div>}<div className="min-w-0"><h2 className="truncate font-bold">{item.title}</h2><p className="text-xs text-slate-400">{item.language} · {item.slug}</p></div></div><div className="mt-4 flex items-end gap-2"><b className="text-xl">{money(item.discountPrice ?? item.price)}</b>{item.discountPrice != null && <del className="text-sm text-slate-500">{money(item.price)}</del>}</div><div className="mt-4 flex flex-wrap gap-2"><Link className="btn flex-1 border border-white/10 bg-white/5 text-center text-xs" to={`/admin/subjects?exam=${item._id}`}><Eye size={14} className="mr-1 inline" />Subjects</Link><button className="rounded-lg border border-white/10 p-2 text-indigo-300" title="Edit" onClick={() => setEditing(item)}><Edit3 size={16} /></button><button className="rounded-lg border border-white/10 p-2 text-violet-300" title="Duplicate" onClick={() => duplicate(item)}><Copy size={16} /></button><button className="rounded-lg border border-white/10 p-2 text-amber-300" title="Publish/unpublish" onClick={() => toggle(item)}>{item.status === 'published' ? 'Unpublish' : 'Publish'}</button><button className="rounded-lg border border-white/10 p-2 text-red-300" title="Delete" onClick={() => setDeleting(item)}><Trash2 size={16} /></button></div></div></article>)}{!items.length && <div className="glass rounded-2xl p-12 text-center text-slate-400 sm:col-span-2 xl:col-span-3">No exams match your filters. Create your first exam to get started.</div>}</div>}<div className="mt-6 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn border border-white/10 bg-white/5 disabled:opacity-40">Previous</button><span className="text-sm text-slate-400">Page {page} of {meta.pages || 1}</span><button disabled={page >= (meta.pages || 1)} onClick={() => setPage(p => p + 1)} className="btn border border-white/10 bg-white/5 disabled:opacity-40">Next</button></div>{editing && <ExamForm value={editing} onClose={() => setEditing(null)} onSubmit={save} />} {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"><div className="glass w-full max-w-md rounded-2xl p-6"><h2 className="text-xl font-bold">Delete {deleting.title}?</h2><p className="mt-2 text-sm text-slate-400">This action cannot be undone. Subjects and chapters are not automatically removed.</p><div className="mt-6 flex justify-end gap-3"><button className="btn border border-white/10" onClick={() => setDeleting(null)}>Cancel</button><button className="btn bg-red-500 text-white" onClick={remove}>Delete exam</button></div></div></div>}</div>;
}
function ExamForm({ value, onClose, onSubmit }) { const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { ...initial, ...value, tags: Array.isArray(value.tags) ? value.tags.join(', ') : value.tags || '' } }); return <div className="fixed inset-0 z-50 overflow-auto bg-black/70 p-5"><form onSubmit={handleSubmit(onSubmit)} className="mx-auto my-5 max-w-3xl rounded-2xl bg-[#12182d] p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-sm text-indigo-300">Catalogue editor</p><h2 className="text-2xl font-bold">{value._id ? 'Edit exam' : 'Create new exam'}</h2></div><button type="button" onClick={onClose}><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm sm:col-span-2">Exam name<input className="input mt-1" {...register('title', { required: 'Exam name is required' })} />{errors.title && <small className="text-red-300">{errors.title.message}</small>}</label><label className="text-sm">Slug<input className="input mt-1" placeholder="auto-generated if empty" {...register('slug')} /></label><label className="text-sm">Language<input className="input mt-1" {...register('language')} /></label><label className="text-sm sm:col-span-2">Description<textarea className="input mt-1 min-h-24" {...register('description')} /></label><label className="text-sm">Price<input type="number" min="0" className="input mt-1" {...register('price', { required: true })} /></label><label className="text-sm">Discount price<input type="number" min="0" className="input mt-1" {...register('discountPrice')} /></label><label className="text-sm">Flash sale price<input type="number" min="0" className="input mt-1" {...register('flashSalePrice')} /></label><label className="text-sm">Tags <span className="text-slate-500">(comma separated)</span><input className="input mt-1" {...register('tags')} /></label><label className="text-sm">Status<select className="input mt-1" {...register('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="mt-7 flex items-center gap-2 text-sm"><input type="checkbox" {...register('isFeatured')} /> Featured exam</label><label className="text-sm">Banner image<input className="input mt-1 p-2" type="file" accept="image/jpeg,image/png,image/webp" {...register('banner')} /></label><label className="text-sm">Thumbnail image<input className="input mt-1 p-2" type="file" accept="image/jpeg,image/png,image/webp" {...register('thumbnail')} /></label></div><div className="mt-7 flex justify-end gap-3"><button type="button" className="btn border border-white/10" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save exam</button></div></form></div> }
