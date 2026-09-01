import { Outlet, NavLink } from "react-router-dom";
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
} from "lucide-react";

export default function DashboardLayout({ admin = false }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

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
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-72 bg-[#10172A] border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
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
                                    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${isActive
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
            <main className="flex-1 overflow-y-auto bg-slate-950">
                <div className="border-b border-slate-800 bg-[#0F172A] px-8 py-5">
                    <h2 className="text-2xl font-bold">
                        {admin ? "Admin Dashboard" : "My Dashboard"}
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                        Welcome {user?.name}
                    </p>
                </div>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}