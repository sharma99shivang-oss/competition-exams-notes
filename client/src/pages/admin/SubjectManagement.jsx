import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../store/api';
import { Edit3, GripVertical, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';

export default function SubjectManagement(){
  const [params,setParams]=useSearchParams(), selected=params.get('exam')||'';
  const [exams,setExams]=useState([]),[subjects,setSubjects]=useState([]),[query,setQuery]=useState(''),[editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[drag,setDrag]=useState(null);
  const loadExams=()=>api.get('/admin/exams',{params:{limit:100}}).then(r=>setExams(r.data.data||[])).catch(()=>{});
  const load=()=>{if(!selected){setSubjects([]);setLoading(false);return}setLoading(true);api.get('/admin/subjects',{params:{exam:selected,limit:100,q:query}}).then(r=>setSubjects(r.data.data||[])).catch(e=>setError(e.response?.data?.message||'Unable to load subjects')).finally(()=>setLoading(false))};
  useEffect(()=>{loadExams()},[]);useEffect(load,[selected,query]);
const save = async (data) => {
  const fd = new FormData();

  fd.append("name", data.name.trim());
  fd.append("exam", data.exam);
  fd.append("description", data.description || "");
  fd.append("displayOrder", Number(data.displayOrder) || 0);
  fd.append("status", data.status || "published");

  if (data.image?.[0]) {
    fd.append("image", data.image[0]);
  }

  try {
    if (editing?._id) {
      await api.patch(`/subjects/${editing._id}`, fd);
    } else {
      await api.post("/subjects", fd);
    }

    setEditing(null);
    load();
  } catch (err) {
    setError(err.response?.data?.message || "Subject save failed");
  }
};

const remove=async item=>{if(!confirm(`Delete ${item.name}?`))return;try{await api.delete(`/subjects/${item._id}`);load()}catch(e){setError(e.response?.data?.message||'Could not delete subject')}};
  const drop=async index=>{if(drag===null||drag===index)return;const next=[...subjects],moved=next.splice(drag,1)[0];next.splice(index,0,moved);setSubjects(next);setDrag(null);try{await Promise.all(next.map((x,i)=>api.patch(`/subjects/${x._id}`,{displayOrder:i})))}catch(e){setError('Order changed locally but could not be saved.')} };
  const selectedExam=exams.find(x=>x._id===selected);
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-violet-300">Content structure</p><h1 className="mt-1 text-3xl font-bold">Subject management</h1><p className="mt-2 text-sm text-slate-400">Organise subjects inside each examination.</p></div><button disabled={!selected} className="btn btn-primary disabled:opacity-40" onClick={()=>setEditing({exam:selected,displayOrder:subjects.length,status:'draft'})}><Plus className="mr-1 inline" size={17}/>Add subject</button></div><div className="glass mt-6 flex flex-wrap gap-3 rounded-2xl p-4"><select className="input max-w-sm" value={selected} onChange={e=>{setParams(e.target.value?{exam:e.target.value}:{})}}><option value="">Select an exam</option>{exams.map(e=><option key={e._id} value={e._id}>{e.title}</option>)}</select><div className="flex min-w-220px flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search size={17} className="text-slate-400"/><input className="w-full bg-transparent py-2 outline-none" placeholder="Search subjects…" value={query} onChange={e=>setQuery(e.target.value)}/></div></div>{error&&<div className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{error}</div>}{!selected?<div className="glass mt-6 rounded-2xl p-12 text-center text-slate-400">Select an exam to manage its subjects.</div>:<section className="glass mt-6 rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">{selectedExam?.title||'Exam'} subjects</h2><p className="text-sm text-slate-400">Drag rows to change display order.</p></div><span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300">{subjects.length} subjects</span></div>{loading?<div className="space-y-3">{[1,2,3].map(i=><div className="h-16 animate-pulse rounded-xl bg-white/5" key={i}/>)}</div>:<div className="space-y-2">{subjects.map((item,index)=><div draggable onDragStart={()=>setDrag(index)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(index)} key={item._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/.03 p-3 transition hover:border-indigo-400/40"><GripVertical size={18} className="cursor-grab text-slate-500"/><span className="w-7 text-center text-sm text-slate-500">{index+1}</span>{item.image?.url?<img src={item.image.url} className="h-11 w-11 rounded-lg object-cover"/>:<div className="grid h-11 w-11 place-items-center rounded-lg bg-white/10"><ImagePlus size={17}/></div>}<div className="min-w-150px flex-1"><p className="font-semibold">{item.name}</p><p className="truncate text-sm text-slate-400">{item.description||'No description'}</p></div><span className={`rounded-full px-2.5 py-1 text-xs ${item.status==='published'?'bg-emerald-400/10 text-emerald-300':'bg-amber-400/10 text-amber-300'}`}>{item.status}</span><button className="rounded-lg p-2 text-indigo-300 hover:bg-white/10" onClick={()=>setEditing(item)}><Edit3 size={16}/></button><button className="rounded-lg p-2 text-red-300 hover:bg-white/10" onClick={()=>remove(item)}><Trash2 size={16}/></button></div>)}{!subjects.length&&<div className="py-12 text-center text-slate-400">No subjects yet. Add the first subject for this exam.</div>}</div>}</section>}{editing&&<SubjectForm value={editing} onClose={()=>setEditing(null)} onSubmit={save} exams={exams}/>}</div>
}
function SubjectForm({value,onClose,onSubmit,exams}){const {register,handleSubmit,formState:{errors}}=useForm({defaultValues:{name:'',description:'',displayOrder:0,status:'draft',...value}});return <div className="fixed inset-0 z-50 overflow-auto bg-black/70 p-5"><form onSubmit={handleSubmit(onSubmit)} className="mx-auto my-8 max-w-xl rounded-2xl bg-[#12182d] p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-sm text-violet-300">Subject editor</p><h2 className="text-2xl font-bold">{value._id?'Edit subject':'Add subject'}</h2></div><button type="button" onClick={onClose}><X/></button></div><div className="mt-6 space-y-4"><label className="block text-sm">Exam<select className="input mt-1" {...register('exam',{required:true})}>{exams.map(e=><option key={e._id} value={e._id}>{e.title}</option>)}</select></label><label className="block text-sm">Subject name<input className="input mt-1" {...register('name',{required:'Name is required'})}/>{errors.name&&<small className="text-red-300">{errors.name.message}</small>}</label><label className="block text-sm">Description<textarea className="input mt-1 min-h-24" {...register('description')}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Display order<input type="number" min="0" className="input mt-1" {...register('displayOrder',{valueAsNumber:true})}/></label><label className="text-sm">Visibility<select className="input mt-1" {...register('status')}><option value="draft">Draft</option><option value="published">Published</option></select></label></div><label className="block text-sm">Subject image<input className="input mt-1 p-2" type="file" accept="image/jpeg,image/png,image/webp" {...register('image')}/></label></div><div className="mt-7 flex justify-end gap-3"><button type="button" className="btn border border-white/10" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save subject</button></div></form></div>}
