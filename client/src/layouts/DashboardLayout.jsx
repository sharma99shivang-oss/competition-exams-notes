import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clear } from "../store/authSlice";
import { api } from "../store/api";
import {
    LayoutDashboard,
    BookOpen,
    Heart,
    ShoppingBag,
    User,
    Bell,
    Settings,
    LogOut,
    Users,
    FolderOpen,
    FileText,
    Tag,
    IndianRupee,
    BarChart3,
    Menu,
    X,
} from "lucide-react";

export default function DashboardLayout({ admin = false }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", sidebarOpen);
        return () => document.body.classList.remove("overflow-hidden");
    }, [sidebarOpen]);

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch { }

        dispatch(clear());
        window.location.href = "/";
    };

    const userMenu = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Purchased Notes", icon: ShoppingBag, path: "/dashboard/purchased" },
        { name: "Wishlist", icon: Heart, path: "/dashboard/wishlist" },
        { name: "Orders", icon: FileText, path: "/dashboard/orders" },
        { name: "Notifications", icon: Bell, path: "/dashboard/notifications" },
        { name: "Profile", icon: User, path: "/dashboard/profile" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    const adminMenu = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { name: "Exams", icon: BookOpen, path: "/admin/exams" },
        { name: "Subjects", icon: FolderOpen, path: "/admin/subjects" },
        { name: "Chapters", icon: FileText, path: "/admin/chapters" },
        { name: "Users", icon: Users, path: "/admin/users" },
        { name: "Orders", icon: ShoppingBag, path: "/admin/orders" },
        { name: "Offers", icon: Tag, path: "/admin/offers" },
        { name: "Coupons", icon: IndianRupee, path: "/admin/coupons" },
        { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
        { name: "Settings", icon: Settings, path: "/admin/settings" },
    ];

    const menu = admin ? adminMenu : userMenu;

    return (
        <div className="min-h-screen bg-slate-950 text-white md:flex">
            {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 md:hidden" />}
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col border-r border-slate-800 bg-[#10172A] shadow-2xl transition-transform duration-300 md:sticky md:top-0 md:h-screen md:max-w-none md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6 border-b border-slate-800">
                    <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10 md:hidden"><X size={20} /></button>
                    <h1 className="text-xl font-bold text-violet-400">
                        Competition Notes
                    </h1>

                    <p className="text-sm text-slate-400 mt-2">
                        {admin ? "Admin Panel" : "Student Dashboard"}
                    </p>

                    <div className="mt-5 rounded-xl bg-slate-900 p-3">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>

                        <span className="inline-block mt-2 rounded-full bg-violet-600 px-3 py-1 text-xs">
                            {user?.role?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menu.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/dashboard" || item.path === "/admin"}
                                className={({ isActive }) =>
                                    `flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 transition ${isActive
                                        ? "bg-violet-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 hover:bg-red-700"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 flex-1 overflow-y-auto bg-slate-950">
                <div className="flex items-center gap-3 border-b border-slate-800 bg-[#0F172A] px-4 py-4 sm:px-6 md:px-8 md:py-5">
                    <button aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-white/10 md:hidden"><Menu size={22} /></button>
                    <div className="min-w-0"><h2 className="text-xl font-bold sm:text-2xl">
                        {admin ? "Admin Dashboard" : "My Dashboard"}
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                        Welcome {user?.name}
                    </p></div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
