import { defineStore } from "pinia";
import axios from "axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]')
  }),
  getters: {
    totalPrice: (state) => {
      return state.items.reduce((sum, item) => {
        const price = item.priceAtPurchase || item.price;
        return sum + (price * (item.quantity || 1));
      }, 0);
    },
    cartCount: (state) => state.items.length,
    wishlistCount: (state) => state.wishlist.length
  },
  actions: {
    addToCart(product, customPrice = null) {
      const existingItem = this.items.find(item => item.id === product.id);
      const priceToUse = customPrice !== null ? customPrice : product.price;

      if (existingItem) {
        existingItem.quantity++;
        existingItem.priceAtPurchase = priceToUse;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          priceAtPurchase: priceToUse
        });
      }
      this.save();
    },

    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
    },

    clearCart() {
      this.items = [];
      this.wishlist = [];
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    },

    addToWishlist(product) {
      if (!product) return;
      const index = this.wishlist.findIndex(p => p.id === product.id);
      if (index === -1) {
        this.wishlist.push(product);
      } else {
        this.wishlist.splice(index, 1);
      }
      this.save();
    },

    isInWishlist(productId) {
      return this.wishlist.some(p => String(p.id) === String(productId));
    },

    async loadUserCart() {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = String(user.id);

      try {
        const res = await axios.get(`http://localhost:3000/carts/${userId}`);
        if (res.data) {
          this.items = res.data.items || [];
          this.wishlist = res.data.wishlist || [];
          localStorage.setItem('cart', JSON.stringify(this.items));
          localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error("Error loading cart:", error);
        }
      }
    },

    // --- تابع جدید برای بررسی اعتبار قیمت‌ها ---
    async validateCartPrices() {
      try {
        // ۱. دریافت آخرین لیست حراجی‌ها
        const res = await axios.get("http://localhost:3000/flashSale");
        const flashSales = res.data;
        const now = new Date().getTime();
        let hasChanged = false;

        this.items.forEach(item => {
          // ۲. پیدا کردن تخفیف مرتبط با محصول داخل سبد
          const sale = flashSales.find(f => String(f.productId) === String(item.id));
          
          // ۳. شرط اعتبار: تخفیف وجود داشته باشد + زمانش نگذشته باشد
          const isSaleValid = sale && sale.endTime > now;

          if (isSaleValid) {
            // اگر معتبر است، قیمت سبد را با قیمت تخفیف هماهنگ کن (برای اطمینان)
            if (item.priceAtPurchase !== sale.discountPrice) {
              item.priceAtPurchase = sale.discountPrice;
              hasChanged = true;
            }
          } else {
            // ۴. اگر تخفیف حذف شده یا زمانش تمام شده -> برگرد به قیمت اصلی
            if (item.priceAtPurchase !== item.price) {
              item.priceAtPurchase = item.price;
              hasChanged = true;
            }
          }
        });

        if (hasChanged) {
          this.save();
          console.log("Cart prices updated due to sale expiration or removal.");
        }
      } catch (error) {
        console.error("Price validation error:", error);
      }
    },

    async save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));

      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = String(user.id);

      const cartData = {
        id: userId,
        userId: userId,
        items: this.items,
        wishlist: this.wishlist
      };

      try {
        await axios.put(`http://localhost:3000/carts/${userId}`, cartData);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          await axios.post(`http://localhost:3000/carts`, cartData);
        }
      }
    }
  }
});