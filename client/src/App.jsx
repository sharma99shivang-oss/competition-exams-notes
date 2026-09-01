import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { api } from "./store/api";
import { token } from "./store/authSlice";

import Header from "./components/Header";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import {
  Auth,
  Forgot,
  Info,
  FAQ,
} from "./pages/PublicPages";

// Marketplace Pages
import {
  MarketplaceHome,
  MarketplaceExams,
  ExamDetail,
} from "./pages/Marketplace";

// User Pages
import UserDashboardLive from "./pages/UserDashboardLive";
import Purchased from "./pages/Purchased";
import { UserSection } from "./pages/Dashboards";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ExamManagement from "./pages/admin/ExamManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import ChapterManagement from "./pages/admin/ChapterManagement";
import AdminWorkspace from "./pages/admin/AdminWorkspace";

/* =====================================================
   PROTECTED ROUTE
===================================================== */

function Guard({ admin = false, children }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={admin ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* =====================================================
   PUBLIC LAYOUT
===================================================== */

function Public({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

/* =====================================================
   SEO
===================================================== */

function Seo() {
  const location = useLocation();

  useEffect(() => {
    let title = "Competition Exams Notes";

    if (location.pathname === "/") {
      title = "Competition Exams Notes";
    } else if (location.pathname === "/exams") {
      title = "All Exams | Competition Exams Notes";
    } else if (location.pathname.startsWith("/exam")) {
      title = "Exam Details | Competition Exams Notes";
    } else if (location.pathname.startsWith("/dashboard")) {
      title = "My Dashboard | Competition Exams Notes";
    } else if (location.pathname.startsWith("/admin")) {
      title = "Admin Panel | Competition Exams Notes";
    }

    document.title = title;
  }, [location.pathname]);

  return null;
}

/* =====================================================
   USER ROUTES
===================================================== */

function UserRoute() {
  const { section } = useParams();

  switch (section) {
    case "purchased":
      return <Purchased />;

    case "profile":
    case "wishlist":
    case "orders":
    case "notifications":
    case "settings":
      return <UserSection type={section} />;

    default:
      return <Navigate to="/dashboard" replace />;
  }
}

/* =====================================================
   ADMIN ROUTES
===================================================== */

function AdminRoute() {
  const { section } = useParams();

  switch (section) {
    case "exams":
      return <ExamManagement />;

    case "subjects":
      return <SubjectManagement />;

    case "chapters":
      return <ChapterManagement />;

    case "users":
    case "orders":
    case "offers":
    case "coupons":
    case "notifications":
    case "analytics":
    case "settings":
      return <AdminWorkspace type={section} />;

    default:
      return <Navigate to="/admin" replace />;
  }
}

/* =====================================================
   APP
===================================================== */

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then(({ data }) => {
        if (data?.accessToken) {
          dispatch(token(data));
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <h2 className="text-lg font-semibold text-indigo-400">
          Restoring Session...
        </h2>
      </div>
    );
  }

  return (
    <>
      <Seo />

      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={
            <Public>
              <MarketplaceHome />
            </Public>
          }
        />

        <Route
          path="/exams"
          element={
            <Public>
              <MarketplaceExams />
            </Public>
          }
        />

        <Route
          path="/exam/:slug"
          element={
            <Public>
              <ExamDetail />
            </Public>
          }
        />

        <Route
          path="/login"
          element={
            <Public>
              <Auth />
            </Public>
          }
        />

        <Route
          path="/signup"
          element={
            <Public>
              <Auth mode="signup" />
            </Public>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/forgot-password"
          element={
            <Public>
              <Forgot />
            </Public>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <Public>
              <Forgot reset />
            </Public>
          }
        />

        <Route
          path="/about"
          element={
            <Public>
              <Info title="About" />
            </Public>
          }
        />

        <Route
          path="/contact"
          element={
            <Public>
              <Info title="Contact" />
            </Public>
          }
        />

        <Route
          path="/privacy"
          element={
            <Public>
              <Info title="Privacy Policy" />
            </Public>
          }
        />

        <Route
          path="/terms"
          element={
            <Public>
              <Info title="Terms & Conditions" />
            </Public>
          }
        />

        <Route
          path="/faq"
          element={
            <Public>
              <FAQ />
            </Public>
          }
        />

        {/* ================= USER DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            <Guard>
              <DashboardLayout />
            </Guard>
          }
        >
          {/* Dashboard Home */}
          <Route index element={<UserDashboardLive />} />

          {/* User Modules */}
          <Route path=":section" element={<UserRoute />} />
        </Route>

        {/* ================= ADMIN PANEL ================= */}

        <Route
          path="/admin"
          element={
            <Guard admin>
              <DashboardLayout admin />
            </Guard>
          }
        >
          {/* Admin Dashboard Home */}
          <Route index element={<AdminDashboard />} />

          {/* Admin Modules */}
          <Route path=":section" element={<AdminRoute />} />
        </Route>

        {/* ================= 404 PAGE ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}