import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { api } from "../../store/api";
import {
  CheckSquare,
  Edit3,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

export default function ChapterManagement() {
  const [params, setParams] = useSearchParams();

  const exam = params.get("exam") || "";
  const subject = params.get("subject") || "";

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [pick, setPick] = useState([]);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress] = useState(0);

  // ---------------- LOAD EXAMS ----------------
  useEffect(() => {
    api
      .get("/admin/exams", {
        params: { limit: 100 },
      })
      .then((res) => setExams(res.data.data || []))
      .catch(() => { });
  }, []);

  // ---------------- LOAD SUBJECTS ----------------
  useEffect(() => {
    if (!exam) {
      setSubjects([]);
      return;
    }

    api
      .get("/admin/subjects", {
        params: { exam, limit: 100 },
      })
      .then((res) => setSubjects(res.data.data || []))
      .catch(() => { });
  }, [exam]);

  // ---------------- LOAD CHAPTERS ----------------
  const load = () => {
    if (!subject) {
      setChapters([]);
      return;
    }

    setLoading(true);

    api
      .get("/admin/chapters", {
        params: {
          subject,
          q: query,
          limit: 100,
        },
      })
      .then((res) => setChapters(res.data.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load chapters")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [subject, query]);

  // ---------------- FILTER ----------------
  const chooseExam = (value) => {
    setParams(value ? { exam: value } : {});
  };

  const chooseSubject = (value) => {
    setParams({ exam, subject: value });
  };

  // ---------------- BULK ----------------
  const bulk = async (action) => {
    if (!pick.length) return;

    try {
      await api.post("/chapters/bulk", {
        ids: pick,
        action,
      });

      setPick([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk action failed");
    }
  };

  // ---------------- DELETE ----------------
  const remove = async (id) => {
    if (!window.confirm("Delete this chapter permanently?")) return;

    try {
      await api.delete(`/chapters/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // ---------------- SAVE ----------------
  const save = async (data) => {
    const fd = new FormData();

    fd.append("title", data.title.trim());
    fd.append(
      "subject",
      typeof data.subject === "object" ? data.subject._id : data.subject
    );
    fd.append("description", data.description || "");
    fd.append("chapterNumber", Number(data.chapterNumber) || 1);
    fd.append("pagesCount", Number(data.pagesCount) || 0);
    fd.append("previewEnabled", data.previewEnabled ? "true" : "false");
    fd.append("published", data.published ? "true" : "false");
    fd.append("isPremium", data.isPremium ? "true" : "false");

    if (data.samplePdf?.[0]) fd.append("samplePdf", data.samplePdf[0]);
    if (data.fullPdf?.[0]) fd.append("fullPdf", data.fullPdf[0]);
    if (data.sampleVideo?.[0]) fd.append("sampleVideo", data.sampleVideo[0]);

    [...(data.sampleImages || [])].forEach((img) =>
      fd.append("sampleImages", img)
    );

    [...(data.fullImages || [])].forEach((img) =>
      fd.append("fullImages", img)
    );

    try {
      if (editing?._id) {
        await api.patch(`/chapters/${editing._id}`, fd);
      } else {
        await api.post("/chapters", fd);
      }

      setEditing(null);
      load();
    } catch (err) {
      console.log(err.response?.data);
      setError(err.response?.data?.message || "Chapter save failed");
    }
  };

  // ======================= UI =======================
  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chapter Management</h1>
          <p className="text-slate-400">
            Manage PDFs, Images and Premium Chapters
          </p>
        </div>

        <button
          onClick={() => setEditing({
            subject: subject,
            title: "",
            description: "",
            chapterNumber: 1,
            pagesCount: 0,
            previewEnabled: false,
            published: true,
            isPremium: true, // ✅ Default Premium
          })}
          className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-medium hover:bg-cyan-700 sm:w-auto"
        >
          <Plus className="mr-2 inline" size={18} />
          Add Chapter
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-4 rounded-2xl bg-slate-900 p-5 md:grid-cols-3">
        <select
          value={exam}
          onChange={(e) => chooseExam(e.target.value)}
          className="rounded-lg bg-slate-800 p-3"
        >
          <option value="">Select Exam</option>

          {exams.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title || item.name}
            </option>
          ))}
        </select>

        <select
          value={subject}
          onChange={(e) => chooseSubject(e.target.value)}
          className="rounded-lg bg-slate-800 p-3"
        >
          <option value="">Select Subject</option>

          {subjects.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title || item.name}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-lg bg-slate-800 px-3">
          <Search size={18} />

          <input
            className="w-full bg-transparent p-2 outline-none"
            placeholder="Search chapter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {pick.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4 sm:flex-row sm:flex-wrap">
          <button
            onClick={() => bulk("publish")}
            className="rounded-lg bg-green-600 px-3 py-2 sm:flex-1"
          >
            Publish Selected
          </button>

          <button
            onClick={() => bulk("unpublish")}
            className="rounded-lg bg-yellow-600 px-3 py-2 sm:flex-1"
          >
            Unpublish Selected
          </button>

          <button
            onClick={() => bulk("delete")}
            className="rounded-lg bg-red-600 px-3 py-2 sm:flex-1"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? <div className="rounded-2xl bg-slate-900 p-5 text-center">Loading...</div> : chapters.length === 0 ? <div className="rounded-2xl bg-slate-900 p-5 text-center">No Chapters Found</div> : chapters.map((chapter) => (
          <article key={chapter._id} className="rounded-2xl bg-slate-900 p-4">
            <div className="flex items-start gap-3"><input className="mt-1" type="checkbox" checked={pick.includes(chapter._id)} onChange={(e) => setPick(e.target.checked ? [...pick, chapter._id] : pick.filter((id) => id !== chapter._id))} /><div className="min-w-0 flex-1"><h2 className="break-words font-semibold">{chapter.title}</h2><p className="mt-1 text-sm text-slate-400">Chapter {chapter.chapterNumber} · {chapter.pagesCount} pages</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs ${chapter.published ? "bg-green-600/20 text-green-400" : "bg-yellow-500/20 text-yellow-300"}`}>{chapter.published ? "Published" : "Draft"}</span><span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">{chapter.isPremium ? "Premium" : "Free"}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setEditing({ ...chapter, subject: chapter.subject?._id || chapter.subject })} className="rounded-lg bg-blue-600 p-2 hover:bg-blue-700"><Edit3 className="mr-1 inline" size={16} />Edit</button><button onClick={() => remove(chapter._id)} className="rounded-lg bg-red-600 p-2 hover:bg-red-700"><Trash2 className="mr-1 inline" size={16} />Delete</button></div>
          </article>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl bg-slate-900 md:block">
        <table className="w-full">
          <thead className="bg-slate-800 text-left text-sm text-slate-300">
            <tr>
              <th className="p-4">
                <CheckSquare size={18} />
              </th>

              <th className="p-4">Title</th>
              <th className="p-4">Chapter</th>
              <th className="p-4">Pages</th>
              <th className="p-4">Status</th>
              <th className="p-4">Premium</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-5 text-center" colSpan="7">
                  Loading...
                </td>
              </tr>
            ) : chapters.length === 0 ? (
              <tr>
                <td className="p-5 text-center" colSpan="7">
                  No Chapters Found
                </td>
              </tr>
            ) : (
              chapters.map((chapter) => (
                <tr
                  key={chapter._id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={pick.includes(chapter._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPick([...pick, chapter._id]);
                        } else {
                          setPick(pick.filter((id) => id !== chapter._id));
                        }
                      }}
                    />
                  </td>

                  <td className="p-4 font-medium">{chapter.title}</td>

                  <td className="p-4">{chapter.chapterNumber}</td>

                  <td className="p-4">{chapter.pagesCount}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${chapter.published
                        ? "bg-green-600/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-300"
                        }`}
                    >
                      {chapter.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="p-4">
                    {chapter.isPremium ? "Premium" : "Free"}
                  </td>

                  <td className="flex gap-2 p-4">
                    <button
                      onClick={() =>
                        setEditing({
                          ...chapter,
                          subject: chapter.subject?._id || chapter.subject,
                        })
                      }
                      className="rounded-lg bg-blue-600 p-2 hover:bg-blue-700"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => remove(chapter._id)}
                      className="rounded-lg bg-red-600 p-2 hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ChapterForm
          value={editing}
          progress={progress}
          onClose={() => setEditing(null)}
          onSubmit={save}
        />
      )}
    </div>
  );
}

// ======================= FORM =======================

function ChapterForm({ value, onClose, onSubmit, progress }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      description: "",
      chapterNumber: 1,
      pagesCount: 0,
      subject: value.subject || "",
      published: false,
      previewEnabled: true,
      isPremium: false,
      ...value,
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/70 p-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto my-2 max-w-3xl rounded-2xl bg-slate-900 p-4 sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            {value._id ? "Edit Chapter" : "Add Chapter"}
          </h2>

          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-lg bg-slate-800 p-3"
            placeholder="Title"
            {...register("title")}
          />

          <input type="hidden" {...register("subject")} />

          <textarea
            className="rounded-lg bg-slate-800 p-3 md:col-span-2"
            placeholder="Description"
            {...register("description")}
          />

          <input
            type="number"
            className="rounded-lg bg-slate-800 p-3"
            placeholder="Chapter Number"
            {...register("chapterNumber")}
          />

          <input
            type="number"
            className="rounded-lg bg-slate-800 p-3"
            placeholder="Pages Count"
            {...register("pagesCount")}
          />

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("previewEnabled")} />
            Preview Enabled
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("published")} />
            Published
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("isPremium")} />
            Premium Chapter
          </label>

          <FileField
            label="Sample PDF"
            name="samplePdf"
            accept="application/pdf"
            register={register}
          />

          <FileField
            label="Full PDF"
            name="fullPdf"
            accept="application/pdf"
            register={register}
          />

          <FileField label="Sample video" name="sampleVideo" accept="video/mp4,video/webm,video/quicktime" register={register} />

          <FileField
            label="Sample Images"
            name="sampleImages"
            accept="image/*"
            multiple
            register={register}
          />

          <FileField
            label="Full Images"
            name="fullImages"
            accept="image/*"
            multiple
            register={register}
          />
        </div>

        {progress > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-sm">Uploading... {progress}%</div>

            <div className="h-2 rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-4 py-3"
          >
            Cancel
          </button>

          <button className="rounded-lg bg-cyan-600 px-4 py-3 hover:bg-cyan-700">
            <UploadCloud size={16} className="mr-2 inline" />
            Save Chapter
          </button>
        </div>
      </form>
    </div>
  );
}

// ======================= FILE FIELD =======================

function FileField({ label, name, accept, multiple, register }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm">{label}</span>

      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800 p-3 sm:flex-row sm:items-center">
        <ImagePlus size={18} />

        <input
          type="file"
          accept={accept}
          multiple={multiple}
          {...register(name)}
          className="w-full text-sm"
        />
      </div>
    </label>
  );
}
