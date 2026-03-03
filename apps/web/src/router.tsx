import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "./auth/RequireAdmin";
import { AdminLoginPage } from "./features/admin/pages/AdminLoginPage";
import { AdminNewProductPage } from "./features/admin/pages/AdminNewProductPage";
import { ProductPage } from "./features/shop/pages/ProductPage";
import { ShopPage } from "./features/shop/pages/ShopPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" replace />} />

      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:slug" element={<ProductPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<RequireAdmin />}>
        <Route path="/admin/products/new" element={<AdminNewProductPage />} />
      </Route>

      <Route path="*" element={<p className="p-6">Not found</p>} />
    </Routes>
  );
}
