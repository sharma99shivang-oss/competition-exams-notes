import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(
        login({
          email,
          password,
          adminOnly: true,
        })
      ).unwrap();

      // Login successful
      navigate("/admin", { replace: true });
    } catch (err) {
      alert(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh min-h-screen flex items-center justify-center p-5">
      <form
        onSubmit={handleLogin}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl"
      >
        <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-xl font-black">C</div><p className="text-sm font-semibold tracking-[.18em] text-indigo-300">COMPETITION NOTES</p><h2 className="mt-2 text-2xl font-bold">Admin sign in</h2><p className="mt-2 text-sm text-slate-400">Use your authorised administrator account.</p></div>

        <input
          type="email"
          className="input mb-4"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="input mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Admin Login"}
        </button>
      </form>
    </div>
  );
}
