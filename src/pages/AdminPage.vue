<template>
  <div class="admin-container">
    <h1>Admin Control Panel</h1>

    <section class="admin-section">
      <h2>Slider Management</h2>
      <div class="slider-grid">
        <div v-for="slide in slides" :key="slide.id" class="slide-edit-card">
          <h4>Slide {{ slide.id }}</h4>
          
          <div class="form-group">
            <label>Image:</label>
            <div style="display:flex; align-items:center; gap:10px">
              <img :src="slide.image" width="60" height="40" style="object-fit:cover; border-radius:4px" />
              <input type="file" @change="(e) => handleSlideFile(e, slide)" accept="image/*" />
            </div>
            <span style="font-size:11px; color:gray">{{ slide.image }}</span>
          </div>

          <div class="form-group">
            <label>Title:</label>
            <input v-model="slide.title" placeholder="Slide Title" />
          </div>

          <div class="form-group">
            <label>Link Target:</label>
            <input v-model="slide.link" placeholder="e.g. /products/mobile/all" />
          </div>

          <button @click="updateSlide(slide)" class="btn-update">Update Slide</button>
        </div>
      </div>
    </section>

    <section class="admin-section">
      <h2>Add New Product</h2>
      <div class="add-form">
        <div class="form-group">
          <input v-model="newProduct.name" placeholder="Product Name" />
          <input v-model.number="newProduct.price" type="number" placeholder="Price ($)" />
        </div>
        <div class="form-group">
          <input v-model="newProduct.brand" placeholder="Brand" />
          <input v-model="newProduct.category" placeholder="Category (e.g. Mobile, Laptop)" />
        </div>
        <textarea v-model="newProduct.description" placeholder="Product Description"></textarea>
        
        <div class="image-upload">
          <label class="file-label">
            <span>Upload Image from Device</span>
            <input type="file" @change="handleFileUpload" accept="image/*" />
          </label>
          <span v-if="newProduct.image" style="font-size: 12px; color: green; margin-left: 10px;">
            {{ newProduct.image }}
          </span>
        </div>

        <button @click="addProduct" class="btn-add-main">Add Product to Store</button>
      </div>
    </section>

    <section class="admin-section">
      <h2>Product Management</h2>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Base Price</th>
              <th>Discount %</th>
              <th>Final Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div class="product-cell">
                  <img :src="product.image" />
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td>${{ product.price }}</td>
              <td>
                <div v-if="isFlash(product.id)" class="discount-input-wrapper">
                  <input 
                    type="number" 
                    :value="getDiscountPercent(product)" 
                    @change="updateDiscount(product, $event.target.value)"
                    class="percent-input"
                  /> %
                </div>
                <span v-else class="text-gray">No Discount</span>
              </td>
              <td>
                <span v-if="isFlash(product.id)" class="final-price">
                  ${{ getFlashInfo(product.id).discountPrice }}
                </span>
                <span v-else>${{ product.price }}</span>
              </td>
              <td>
                <div class="action-btns">
                  <button v-if="!isFlash(product.id)" @click="startFlash(product)" class="btn-sale">Set Sale</button>
                  <button v-else @click="stopFlash(product.id)" class="btn-stop">End Sale</button>
                  <button @click="deleteProduct(product.id)" class="btn-delete">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-section">
      <h2>Registered Users & Active Carts</h2>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User Info</th>
              <th>Role</th>
              <th>Active Cart Items</th>
              <th>Cart Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <strong class="user-name">{{ user.name }}</strong><br>
                <small class="user-email">{{ user.email }}</small>
              </td>
              <td><span class="role-badge">{{ user.role }}</span></td>
              <td>
                <ul v-if="user.cart && user.cart.length" class="cart-items-list">
                  <li v-for="item in user.cart" :key="item.id">
                    {{ item.name }} (x{{ item.quantity }})
                  </li>
                </ul>
                <span v-else class="empty-text">Empty</span>
              </td>
              <td>
                <strong v-if="user.cart">${{ calculateUserTotal(user.cart) }}</strong>
                <span v-else>$0</span>
              </td>
              <td>
                <button @click="deleteUser(user.id)" class="btn-delete">Delete User</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const products = ref([]);
const flashSales = ref([]);
const users = ref([]);
const slides = ref([]);
const newProduct = ref({ name: '', price: 0, brand: '', category: '', description: '', image: '' });

// متغیر برای زمان حال و تایمر
const currentTime = ref(new Date().getTime());
let adminTimer = null;

const fetchData = async () => {
  try {
    const [p, f, u, s] = await Promise.all([
      axios.get("http://localhost:3000/products"),
      axios.get("http://localhost:3000/flashSale"),
      axios.get("http://localhost:3000/users"),
      axios.get("http://localhost:3000/slides")
    ]);
    products.value = p.data;
    flashSales.value = f.data;
    users.value = u.data;
    slides.value = s.data;
  } catch (err) {
    console.error("Data fetch error:", err);
  }
};

// --- Slider Logic ---
const handleSlideFile = (e, slide) => {
  const file = e.target.files[0];
  if (file) {
    slide.image = "/images/" + file.name;
  }
};

const updateSlide = async (slide) => {
  try {
    await axios.put(`http://localhost:3000/slides/${slide.id}`, slide);
    alert(`Slide ${slide.id} updated successfully!`);
  } catch (e) {
    alert("Error updating slide");
  }
};

// --- Product Logic ---
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    newProduct.value.image = "/images/" + file.name;
  }
};

const addProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.price) return;
  const productToAdd = { ...newProduct.value, id: String(Date.now()) };
  await axios.post("http://localhost:3000/products", productToAdd);
  newProduct.value = { name: '', price: 0, brand: '', category: '', description: '', image: '' };
  fetchData();
};

const deleteProduct = async (id) => {
  if (confirm("Permanently delete this product?")) {
    await axios.delete(`http://localhost:3000/products/${id}`);
    const flash = flashSales.value.find(f => String(f.productId) === String(id));
    if (flash) await axios.delete(`http://localhost:3000/flashSale/${flash.id}`);
    fetchData();
  }
};

// --- User Logic ---
const deleteUser = async (userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await axios.delete(`http://localhost:3000/users/${userId}`);
      try { await axios.delete(`http://localhost:3000/carts/${userId}`); } catch (e) {}
      alert("User deleted successfully.");
      fetchData();
    } catch (error) {
      alert("Error deleting user");
    }
  }
};

// --- Flash Sale Logic (UPDATED) ---

// این تابع حالا زمان را هم چک می‌کند
const isFlash = (id) => {
  return flashSales.value.some(f => 
    String(f.productId) === String(id) && f.endTime > currentTime.value
  );
};

// دریافت اطلاعات تخفیف با شرط زمان
const getFlashInfo = (id) => {
  return flashSales.value.find(f => 
    String(f.productId) === String(id) && f.endTime > currentTime.value
  );
};

const getDiscountPercent = (product) => {
  const flash = getFlashInfo(product.id);
  // اگر فلش وجود نداشت یا منقضی شده بود، صفر برگردان
  if (!flash) return 0;
  return Math.round(((product.price - flash.discountPrice) / product.price) * 100);
};

const updateDiscount = async (product, percent) => {
  const flash = getFlashInfo(product.id);
  if (!flash) return;
  const newPrice = Math.round(product.price * (1 - percent / 100));
  await axios.patch(`http://localhost:3000/flashSale/${flash.id}`, { discountPrice: newPrice });
  fetchData();
};

const startFlash = async (product) => {
  // پاک کردن تخفیف‌های قبلی (منقضی شده) این محصول اگر وجود داشت
  const oldFlash = flashSales.value.find(f => String(f.productId) === String(product.id));
  if (oldFlash) {
     await axios.delete(`http://localhost:3000/flashSale/${oldFlash.id}`);
  }

  await axios.post("http://localhost:3000/flashSale", {
    id: String(Date.now()),
    productId: String(product.id),
    discountPrice: Math.round(product.price * 0.9),
    endTime: new Date().getTime() + 86400000 // 24 ساعت
  });
  fetchData();
};

const stopFlash = async (productId) => {
  // اینجا نیازی به چک کردن زمان نیست، چون می‌خواهیم دستی حذف کنیم
  const flash = flashSales.value.find(f => String(f.productId) === String(productId));
  if (flash) {
    await axios.delete(`http://localhost:3000/flashSale/${flash.id}`);
    fetchData();
  }
};

const calculateUserTotal = (cart) => {
  return cart.reduce((sum, item) => sum + ((item.priceAtPurchase || item.price) * item.quantity), 0);
};

onMounted(() => {
  fetchData();
  // آپدیت کردن زمان جاری هر ثانیه برای رفرش شدن ظاهر جدول
  adminTimer = setInterval(() => {
    currentTime.value = new Date().getTime();
  }, 1000);
});

onUnmounted(() => {
  if (adminTimer) clearInterval(adminTimer);
});
</script>

<style scoped>
.admin-container {
  padding: 40px 20px;
  background: var(--bg);
  max-width: 1200px;
  margin: 0 auto;
}

h1 { margin-bottom: 30px; font-weight: 800; color: var(--dark); }
h2 { font-size: 1.2rem; margin-bottom: 20px; color: var(--dark); padding-bottom: 10px; border-bottom: 1px solid var(--border); }

.admin-section {
  background: white;
  border: 1px solid var(--border);
  padding: 30px;
  border-radius: var(--radius);
  margin-bottom: 30px;
  box-shadow: var(--shadow);
}

/* Forms */
.add-form { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
.form-group { display: flex; gap: 20px; }
.form-group input { flex: 1; }

input, textarea {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f9fafb;
  width: 100%;
  font-size: 0.9rem;
  outline: none;
  transition: 0.2s;
}
input:focus, textarea:focus { border-color: var(--primary); background: white; }
textarea { resize: vertical; min-height: 100px; }

.image-upload {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px dashed var(--border);
  border-radius: 8px;
}

.file-label {
  cursor: pointer;
  background: white;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: 0.2s;
}
.file-label:hover { border-color: var(--primary); color: var(--primary); }
.file-label input { display: none; }

.btn-add-main {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  align-self: flex-start;
  transition: 0.2s;
}
.btn-add-main:hover { background: var(--primary-dark); }

/* Tables */
.table-responsive { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 700px; }

.admin-table th {
  background: #f9fafb;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: var(--light);
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}

.admin-table td {
  padding: 15px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  vertical-align: middle;
}

.product-cell { display: flex; align-items: center; gap: 12px; font-weight: 500; }
.product-cell img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #eee; }

/* Buttons inside table */
.btn-sale, .btn-stop, .btn-delete, .btn-update {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 5px;
  transition: 0.2s;
}
.btn-sale { background: #dcfce7; color: #166534; }
.btn-stop { background: #fef9c3; color: #854d0e; }
.btn-delete { background: #fee2e2; color: #991b1b; }
.btn-update { background: var(--secondary); color: white; width: 100%; margin-top: 10px; padding: 8px; cursor: pointer; }

/* Slider Grid */
.slider-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.slide-edit-card { background: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid var(--border); }

/* Badges */
.role-badge { background: #eff6ff; color: var(--primary); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.final-price { color: var(--secondary); font-weight: bold; }

@media (max-width: 768px) {
  .form-group { flex-direction: column; gap: 15px; }
}
</style>