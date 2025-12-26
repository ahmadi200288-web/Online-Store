<template>
  <div class="cart-page">
    <div class="container">
      <h1>Your Cart</h1>
      <div v-if="cartStore.items.length === 0" class="empty">Cart is empty!</div>
      <div v-else>
        <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
          <img :src="item.image" width="80" />
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>Unit Price: ${{ item.priceAtPurchase }}</p>
            <p>Qty: {{ item.quantity }}</p>
          </div>
          <div class="subtotal">${{ item.priceAtPurchase * item.quantity }}</div>
          <button @click="cartStore.removeFromCart(item.id)" class="remove">✖</button>
        </div>
        <div class="total">
          <h2>Grand Total: ${{ cartStore.totalPrice }}</h2>
          <button class="checkout">Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../store/cart';
const cartStore = useCartStore();
</script>

<style scoped>
.container { max-width: 800px; margin: 60px auto; padding: 0 20px; }

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: var(--shadow);
}

.info { flex: 1; }
.info h3 { margin: 0 0 5px; color: var(--dark); }
.info p { margin: 0; color: var(--light); font-size: 0.9rem; }

.subtotal { font-weight: 700; color: var(--primary); }

.remove {
  background: none;
  border: none;
  color: var(--light);
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.remove:hover { color: var(--danger); }

.total { text-align: right; margin-top: 30px; font-size: 1.2rem; font-weight: bold; }
.checkout { margin-top: 15px; background: var(--secondary); color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
</style>