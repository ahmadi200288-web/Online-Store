<template>
  <div class="details-page">
    <div v-if="product" class="container">
      <div class="flex-layout">
        <div class="image-box">
          <img :src="product.image" :alt="product.name" />
        </div>
        
        <div class="content-box">
          <p class="path">Category: {{ product.category }} / {{ product.brand }}</p>
          <h1>{{ product.name }}</h1>
          
          <div class="price-box">
            <template v-if="flashInfo">
              <span class="old-p">${{ product.price }}</span>
              <span class="new-p">${{ flashInfo.discountPrice }}</span>
              <span class="save-tag">SAVE ${{ product.price - flashInfo.discountPrice }}</span>
            </template>
            <template v-else>
              <span class="new-p">${{ product.price }}</span>
            </template>
          </div>

          <p class="desc">{{ product.description }}</p>

          <div class="actions">
            <button @click="handleAddToCart" class="buy-btn">
              Add to Cart
            </button>
            <button 
              @click="cartStore.addToWishlist(product)" 
              class="fav-btn"
              :class="{ active: cartStore.isInWishlist(product.id) }"
            >
              ❤ Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">
      <div class="spinner"></div>
      <p>Loading Product Details...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useCartStore } from '../store/cart';

const route = useRoute();
const cartStore = useCartStore();
const product = ref(null);
const flashInfo = ref(null);

const loadProductData = async () => {
  const targetId = route.params.id;
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get("http://localhost:3000/products"),
      axios.get("http://localhost:3000/flashSale")
    ]);
    
    product.value = pRes.data.find(p => String(p.id) === String(targetId));
    flashInfo.value = fRes.data.find(f => String(f.productId) === String(targetId));
  } catch (e) {
    console.error("Error loading product:", e);
  }
};

const handleAddToCart = () => {
  if (!product.value) return;

  // چک کردن اینکه آیا تخفیف وجود دارد و زمانش نگذشته است؟
  const now = new Date().getTime();
  const isValidSale = flashInfo.value && flashInfo.value.endTime > now;

  const finalPrice = isValidSale ? flashInfo.value.discountPrice : product.value.price;

  cartStore.addToCart(product.value, finalPrice);
  alert(`${product.value.name} added to cart at $${finalPrice}`);
};

onMounted(loadProductData);
</script>

<style scoped>
.details-page { padding: 60px 0; background: var(--bg); min-height: 80vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

.flex-layout {
  display: flex;
  gap: 50px;
  align-items: flex-start;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.image-box {
  flex: 1;
  background: #f9fafb;
  border-radius: 15px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-box img {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  transition: transform 0.3s;
}
.image-box img:hover { transform: scale(1.02); }

.content-box { flex: 1.2; }

.path {
  color: var(--light);
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

h1 {
  font-size: 2.2rem;
  color: var(--dark);
  margin-bottom: 20px;
  line-height: 1.2;
}

.price-box {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}
.old-p { text-decoration: line-through; color: var(--light); font-size: 1.2rem; }
.new-p { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
.save-tag {
  background: var(--danger);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}

.desc {
  color: var(--light);
  line-height: 1.8;
  margin-bottom: 40px;
  font-size: 1.05rem;
}

.actions { display: flex; gap: 15px; }

.buy-btn {
  flex: 2;
  padding: 16px;
  background: var(--dark);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  transition: 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.buy-btn:hover {
  background: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.fav-btn {
  flex: 1;
  padding: 16px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--light);
  transition: 0.3s;
  cursor: pointer;
}
.fav-btn:hover { border-color: var(--danger); color: var(--danger); }
.fav-btn.active { color: var(--danger); background: #fee2e2; border-color: var(--danger); }

.loading { text-align: center; padding: 100px; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }

/* Responsive: تبدیل به ستون در موبایل */
@media (max-width: 850px) {
  .flex-layout { flex-direction: column; padding: 25px; }
  .image-box { width: 100%; }
}
</style>