<template>
  <div id="app">
    <SiteHeader />
    <main class="main-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import { useUserStore } from './store/user';
import { useCartStore } from './store/cart';

const userStore = useUserStore();
const cartStore = useCartStore();

onMounted(async () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    userStore.login(user); 
    await cartStore.loadUserCart();
  }
});
</script>

<style>
/* Reset & Global Variables */
:root {
  --primary: #2563eb;       /* آبی مدرن */
  --primary-dark: #1d4ed8;
  --secondary: #10b981;     /* سبز */
  --danger: #ef4444;        /* قرمز */
  --dark: #1f2937;          /* خاکستری تیره برای متن */
  --light: #6b7280;         /* خاکستری روشن */
  --bg: #f3f4f6;            /* پس‌زمینه کلی */
  --card: #ffffff;
  --border: #e5e7eb;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg);
  color: var(--dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

button {
  font-family: inherit;
  cursor: pointer;
}

.main-content {
  min-height: 80vh;
  padding-bottom: 40px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  padding-top: 30px; /* فاصله از هدر */
}

/* Scrollbar زیبا */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>