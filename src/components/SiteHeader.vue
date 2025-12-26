<template>
  <header class="header">
    <div class="header-container">
      <div class="logo" @click="$router.push('/')"><img src="/images/logo.jpg" alt="Logo Site"></div>
      
      <nav class="nav">
        <div class="dropdown">
          <span class="drop-btn">Mobiles ▾</span>
          <div class="dropdown-content">
            <router-link to="/products/mobile/all">All Mobiles</router-link>
            <router-link to="/products/mobile/samsung">Samsung</router-link>
            <router-link to="/products/mobile/apple">Apple</router-link>
          </div>
        </div>
        <div class="dropdown">
          <span class="drop-btn">Laptops ▾</span>
          <div class="dropdown-content">
            <router-link to="/products/laptop/all">All Laptops</router-link>
            <router-link to="/products/laptop/hp">HP</router-link>
            <router-link to="/products/laptop/dell">Dell</router-link>
          </div>
        </div>
      </nav>

      <div class="search-section" ref="searchContainer">
        <div>
          <input type="text" v-model="searchQuery" placeholder="Search..." @input="handleSearch" />
          
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="p in searchResults" :key="p.id" @click="goToProduct(p.id)" class="result-item">
              {{ p.name }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <div class="icons">
          <div class="icon-box" @click="$router.push('/wishlist')">
            <span class="icon">❤</span>
            <span class="badge" v-if="cartStore.wishlistCount">{{ cartStore.wishlistCount }}</span>
          </div>
          <div class="icon-box" @click="$router.push('/cart')">
            <span class="icon">🛒</span>
            <span class="badge" v-if="cartStore.cartCount">{{ cartStore.cartCount }}</span>
          </div>
        </div>
      </div>

      <div class="login-register">
        <div v-if="userStore.user" class="user-info">
          <span class="welcome-msg">Hi, {{ userStore.user.name }}</span>
          <button @click="handleLogout" class="logout-btn">Log Out</button>
        </div>
        <div v-else class="auth-links">
          <router-link to="/login">Login</router-link>
          <span class="sep">|</span>
          <router-link to="/register">Register</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useCartStore } from '../store/cart';
import { useUserStore } from '../store/user';

const cartStore = useCartStore();
const userStore = useUserStore();
const router = useRouter();

const searchQuery = ref("");
const searchResults = ref([]);
const searchContainer = ref(null);
let timeout = null;

const handleSearch = () => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = [];
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/products?name_like=${searchQuery.value}`);
      searchResults.value = res.data.slice(0, 5);
    } catch (error) {
      console.error("Search error:", error);
    }
  }, 700);
};

const goToProduct = (id) => {
  router.push(`/product/${id}`);
  searchQuery.value = "";
  searchResults.value = [];
};

const handleLogout = () => {
  userStore.logout();
  cartStore.clearCart();
  router.push("/");
};

const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    searchQuery.value = "";
    searchResults.value = [];
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 15px 0;
  transition: all 0.3s ease;
}

/* استایل‌های قبلی کانتینر (بدون تغییر بماند) */
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 25px;
  gap: 20px;
}

/* تغییرات در کلاس لوگو */
.logo {
  /* استایل‌های فونت (font-size, weight, color) را حذف کردیم چون دیگر متن نیست */
  flex-shrink: 0; /* این خط را نگه دارید تا لوگو جمع نشود */
  cursor: pointer; /* برای اینکه موس حالت کلیک بگیرد */
  display: flex; /* برای تراز بهتر عکس */
  align-items: center;
}

/* اضافه کردن استایل جدید برای خود عکس */
.logo img {
  height: 70px; /* ارتفاع عکس را تنظیم کنید تا هدر را بهم نریزد */
  width: auto;  /* عرض خودکار تغییر کند تا عکس دفرمه نشود */
  object-fit: contain;
  width: auto;
  
  /* این خط باعث می‌شود سفیدی عکس با سفیدی هدر ترکیب شود */
  mix-blend-mode: multiply; 
  
  /* کمی گوشه‌ها را گرد کنیم که حالت کاغذ بودن کمتر دیده شود */
  border-radius: 50%;
}

.nav {
  display: flex;
  gap: 25px;
  font-weight: 500;
  font-size: 0.95rem;
}

.dropdown {
  position: relative;
  padding: 10px 0;
}

.drop-btn {
  cursor: pointer;
  color: var(--dark);
  transition: color 0.2s;
}
.drop-btn:hover { color: var(--primary); }

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 200px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-hover);
  border: 1px solid var(--border);
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.dropdown:hover .dropdown-content { display: block; }

.dropdown-content a {
  display: block;
  padding: 12px 15px;
  color: var(--dark);
  font-size: 0.9rem;
}
.dropdown-content a:hover {
  background: #f9fafb;
  color: var(--primary);
}

/* Search Bar Styling */
.search-section {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-section input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: #f9fafb;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s;
}

.search-section input:focus {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.search-results {
  position: absolute;
  top: 55px;
  left: 0;
  width: 100%;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-hover);
  border: 1px solid var(--border);
  overflow: hidden;
  z-index: 100;
}

.result-item {
  padding: 12px 15px;
  cursor: pointer;
  font-size: 0.9rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}
.result-item:hover { background: #f9fafb; color: var(--primary); }

/* Icons & User */
.actions { display: flex; align-items: center; }
.icons { display: flex; gap: 20px; }

.icon-box {
  position: relative;
  cursor: pointer;
  font-size: 1.4rem;
  color: var(--dark);
  transition: transform 0.2s;
}
.icon-box:hover { color: var(--primary); transform: translateY(-2px); }

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--danger);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 20px;
  border: 2px solid white;
  font-weight: bold;
}

.login-register { font-size: 0.9rem; font-weight: 500; }
.user-info { display: flex; align-items: center; gap: 15px; }
.welcome-msg { display: none; } /* مخفی در موبایل، نمایش در دسکتاپ */
@media (min-width: 768px) { .welcome-msg { display: block; } }

.logout-btn {
  background: white;
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: 0.3s;
}
.logout-btn:hover { background: var(--danger); color: white; }

.auth-links { display: flex; align-items: center; gap: 10px; }
.auth-links a:hover { color: var(--primary); }
.sep { color: #ccc; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 900px) {
  .nav { display: none; } /* منو ساده برای موبایل حذف شده */
  .search-section { display: none; } /* یا تبدیل به آیکون */
}
</style>