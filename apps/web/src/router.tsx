import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "./auth/RequireAdmin";
import { AdminLoginPage } from "./features/admin/pages/AdminLoginPage";
import { AdminNewProductPage } from "./features/admin/pages/AdminNewProductPage";
import { ProductPage } from "./features/shop/pages/ProductPage";
import { ShopPage } from "./features/shop/pages/ShopPage";
import { CartPage } from "./features/cart/pages/CartPage";
import { CheckoutPage } from "./features/checkout/pages/CheckoutPage";
import { OrderConfirmationPage } from "./features/orders/pages/OrderConfirmationPage";
import { OrdersListPage } from "./features/orders/pages/OrdersListPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { VerifyEmailPage } from "./features/auth/pages/VerifyEmailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" replace />} />

      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersListPage />} />
      <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<RequireAdmin />}>
        <Route path="/admin/products/new" element={<AdminNewProductPage />} />
      </Route>

      <Route path="*" element={<p className="p-6">Not found</p>} />
    </Routes>
  );
}
