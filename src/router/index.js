import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/HomePage.vue";
import Products from "../pages/ProductsPage.vue";
import ProductDetails from "../pages/ProductDetails.vue";
import Login from "../pages/LoginPage.vue";
import Register from "../pages/RegisterPage.vue";
import Cart from "../pages/CartPage.vue";
import Wishlist from "../pages/WishlistPage.vue";
import AdminPage from "../pages/AdminPage.vue";
import About from "../pages/AboutPage.vue";
import Contact from "../pages/ContactPage.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/products/:category/:brand", component: Products },
  { path: "/product/:id", component: ProductDetails },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/cart", component: Cart },
  { path: "/wishlist", component: Wishlist },
  // صفحه ادمین نیاز به احراز هویت دارد
  { path: "/admin", component: AdminPage , meta: { requiresAuth: true }},
  { path: "/about", component: About },
  { path: "/contact", component: Contact }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// --- گارد امنیتی (اصلاح شده) ---
router.beforeEach((to, from, next) => {
  // گرفتن اطلاعات کامل کاربر از حافظه
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // ۱. اگر کاربر می‌خواهد به صفحه ادمین برود
  if (to.path.startsWith('/admin')) {
    if (!user) {
      // اگر اصلا لاگین نکرده
      alert("برای دسترسی به پنل مدیریت باید وارد شوید.");
      next('/login');
    } else if (user.role !== 'admin') {
      // اگر لاگین کرده ولی ادمین نیست (مهمترین بخش)
      alert("شما اجازه دسترسی به پنل مدیریت را ندارید!");
      next('/'); // برگرداندن به صفحه اصلی
    } else {
      // اگر هم لاگین کرده و هم ادمین است
      next();
    }
  } 
  // ۲. برای سایر صفحاتی که فقط نیاز به لاگین دارند (مثل پروفایل احتمالی در آینده)
  else if (to.meta.requiresAuth) {
    if (!user) {
      alert("لطفا ابتدا وارد شوید.");
      next('/login');
    } else {
      next();
    }
  } 
  // ۳. صفحات عمومی (مثل خانه، محصولات و...)
  else {
    next();
  }
});

export default router;