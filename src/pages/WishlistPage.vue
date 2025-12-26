<template>
  <div class="wishlist-wrapper">
    <div class="custom-container">
      <h1 class="page-header">My Wishlist</h1>

      <div v-if="!cartStore.wishlist || cartStore.wishlist.length === 0" class="empty-status">
        <p>Your wishlist is currently empty.</p>
        <router-link to="/" class="return-btn">Return to Shop</router-link>
      </div>

      <div v-else class="products-layout">
        <div v-for="product in cartStore.wishlist" :key="product.id" class="item-card">
          <div class="image-box">
            <img :src="product.image" :alt="product.name" />
          </div>
          
          <div class="item-details">
            <h3 class="item-title">{{ product.name }}</h3>
            <p class="item-price">${{ product.price }}</p>
            
            <div class="action-buttons">
              <button @click="cartStore.addToCart(product)" class="add-btn">
                Add to Cart
              </button>
              <button @click="cartStore.addToWishlist(product)" class="delete-btn" title="Remove">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../store/cart.js';
const cartStore = useCartStore();
</script>

<style scoped>
.wishlist-wrapper { padding: 40px 0; min-height: 80vh; background-color: var(--bg); }
.custom-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.page-header {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
}

.products-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
}

.item-card {
  background: white;
  border: 1px solid transparent;
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.item-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-hover); border-color: var(--primary); }

.image-box {
  width: 100%;
  height: 200px;
  padding: 20px;
  display: flex; align-items: center; justify-content: center;
}
.image-box img { max-width: 100%; max-height: 100%; object-fit: contain; }

.item-details { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }

.item-title {
  font-size: 1rem; font-weight: 700; color: var(--dark);
  margin-bottom: 10px; height: 40px; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

.item-price { font-size: 1.2rem; font-weight: 800; color: var(--primary); margin-bottom: 20px; }

.action-buttons { display: flex; gap: 10px; margin-top: auto; }

.add-btn {
  flex: 2;
  padding: 10px;
  background: var(--dark);
  color: white;
  border: none; border-radius: 8px;
  font-weight: 600;
  transition: 0.2s;
}
.add-btn:hover { background: var(--primary); }

.delete-btn {
  flex: 1;
  padding: 10px;
  background: white;
  color: var(--danger);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  transition: 0.2s;
}
.delete-btn:hover { background: #fee2e2; border-color: var(--danger); }

.empty-status { text-align: center; padding: 80px 0; color: var(--light); }
.return-btn {
  display: inline-block; margin-top: 20px; padding: 12px 25px;
  background: var(--primary); color: white; border-radius: 8px; font-weight: 600;
}
</style>