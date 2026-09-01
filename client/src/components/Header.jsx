import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, Sun, Moon, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Header() {
  const { user } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(() => localStorage.theme === "light");

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.theme = light ? "light" : "dark";
  }, [light]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080c1b]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="rounded-lg bg-indigo-600 p-2">
            <BookOpen size={18} />
          </span>

          <span>
            Competition <span className="text-violet-400">Notes</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-300">
          <NavLink to="/exams">Exams</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLight((v) => !v)}
            className="rounded-lg p-2 text-slate-300"
          >
            {light ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* PUBLIC USER */}
          {!user && (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-slate-300 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="hidden sm:block rounded-lg bg-violet-600 px-5 py-2 font-semibold hover:bg-violet-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* NORMAL USER */}
          {user && user.role === "user" && (
            <Link
              to="/dashboard"
              className="hidden sm:block rounded-lg bg-violet-600 px-5 py-2 font-semibold hover:bg-violet-700"
            >
              My Dashboard
            </Link>
          )}

          {/* ADMIN */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="hidden sm:block rounded-lg bg-red-600 px-5 py-2 font-semibold hover:bg-red-700"
            >
              Admin Panel
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 md:hidden"
          >
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={close}
          ></button>

          <nav className="absolute right-0 top-0 flex h-full w-72 flex-col gap-3 bg-[#10172A] p-5 text-white">
            <button onClick={close} className="self-end">
              <X />
            </button>

            <Link to="/exams" onClick={close}>Exams</Link>
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/faq" onClick={close}>FAQ</Link>
            <Link to="/contact" onClick={close}>Contact</Link>

            {!user && (
              <>
                <Link to="/login" onClick={close}>Login</Link>
                <Link to="/signup" onClick={close}>Sign Up</Link>
              </>
            )}

            {user?.role === "user" && (
              <Link to="/dashboard" onClick={close}>
                My Dashboard
              </Link>
            )}

            {user?.role === "admin" && (
              <Link to="/admin" onClick={close}>
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}