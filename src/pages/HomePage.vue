<template>
  <div class="home">
    
    <div class="slider-wrapper">
      <div class="slider-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div 
          v-for="slide in slides" 
          :key="slide.id" 
          class="slide clickable-slide" 
          :style="{ backgroundImage: `url(${slide.image})` }"
          @click="goToLink(slide.link)"
        >
          <div class="slide-overlay">
            <h2>{{ slide.title }}</h2>
            </div>
        </div>
      </div>

      <button class="prev" @click.stop="prevSlide">❮</button>
      <button class="next" @click.stop="nextSlide">❯</button>
    </div>

    <section v-if="activeFlashSales.length > 0" class="flash-sale">
      <div class="container">
        <div class="sec-head">
          <h2>Flash Deals</h2>
          <p class="subtitle">Hurry up! Limited time offers.</p>
        </div>
        
        <div class="grid">
          <div v-for="item in activeFlashSales" :key="item.id" class="p-card">
            <div class="item-timer">⏱ {{ item.timeLeft }}</div>
            <button class="fav-btn" :class="{ active: cartStore.isInWishlist(item.productId) }" @click.stop="item.product && cartStore.addToWishlist(item.product)">❤</button>
            <div class="img-w" @click="$router.push('/product/' + item.productId)">
              <img v-if="item.product" :src="item.product.image" :alt="item.product.name" />
            </div>
            <div class="p-info">
              <h3>{{ item.product?.name }}</h3>
              <div class="prices">
                <span class="old">${{ item.product?.price }}</span>
                <span class="new">${{ item.discountPrice }}</span>
              </div>
              <button class="add-btn" @click.stop="item.product && cartStore.addToCart(item.product, item.discountPrice)">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useCartStore } from '../store/cart';

const cartStore = useCartStore();
const router = useRouter();
const flashSales = ref([]); 
const slides = ref([]); // اسلایدها از دیتابیس پر می‌شوند
const currentSlide = ref(0);
const currentTime = ref(new Date().getTime());
let timerInterval = null;

const activeFlashSales = computed(() => {
  return flashSales.value.filter(item => {
    return item.product && item.endTime > currentTime.value;
  });
});

const goToLink = (link) => {
  if (link) router.push(link);
};

const nextSlide = () => {
  if (slides.value.length > 0)
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  if (slides.value.length > 0)
    currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

const formatTimeLeft = (endTime) => {
  const diff = endTime - currentTime.value;
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

onMounted(async () => {
  try {
    const [pRes, fRes, sRes] = await Promise.all([
      axios.get("http://localhost:3000/products"), 
      axios.get("http://localhost:3000/flashSale"),
      axios.get("http://localhost:3000/slides") // دریافت اسلایدها
    ]);
    
    slides.value = sRes.data;

    flashSales.value = fRes.data.map(fs => ({ 
      ...fs, 
      product: pRes.data.find(x => String(x.id) === String(fs.productId)),
      timeLeft: "Loading..."
    }));

    timerInterval = setInterval(() => {
      currentTime.value = new Date().getTime();
      flashSales.value.forEach(item => {
        item.timeLeft = formatTimeLeft(item.endTime);
      });
    }, 1000);

    setInterval(nextSlide, 5000);
  } catch (e) {
    console.error(e);
  }
});

onUnmounted(() => clearInterval(timerInterval));
</script>

<style scoped>
.home { padding-bottom: 60px; }

/* استایل اسلایدر کاروسل */
.slider-wrapper {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  margin-bottom: 50px;
  border-radius: 20px;
  box-shadow: var(--shadow);
  /* محدودیت عرض برای نمایش زیباتر در دسکتاپ بزرگ */
  max-width: 1380px; 
  margin-left: auto; 
  margin-right: auto;
}

.slider-track {
  display: flex;
  height: 100%;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.clickable-slide { cursor: pointer; }

.slide-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 40px 60px;
  border-radius: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  transform: translateY(30px);
  opacity: 0;
  animation: floatUp 0.8s forwards 0.3s;
}

@keyframes floatUp {
  to { transform: translateY(0); opacity: 1; }
}

.slide-overlay h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  z-index: 10;
}

.prev:hover, .next:hover { background: white; color: black; }
.prev { left: 20px; } .next { right: 20px; }

/* کانتینر اصلی */
.container { max-width: 1240px; margin: 0 auto; padding: 0 20px; }

.sec-head { margin-bottom: 30px; text-align: center; }
.sec-head h2 { font-size: 2rem; font-weight: 800; color: var(--dark); margin-bottom: 5px; }
.subtitle { color: var(--light); font-size: 1.1rem; }

/* گرید محصولات */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
}

.p-card {
  background: white;
  border-radius: var(--radius);
  padding: 20px;
  position: relative;
  border: 1px solid transparent;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.p-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.item-timer {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--danger);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 5;
}

.fav-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ccc;
  transition: 0.3s;
  z-index: 5;
  font-size: 1.2rem;
}
.fav-btn:hover { color: var(--danger); border-color: var(--danger); }
.fav-btn.active { color: var(--danger); background: #fee2e2; border-color: var(--danger); }

.img-w {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  cursor: pointer;
}

.img-w img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: 0.3s;
}
.p-card:hover .img-w img { transform: scale(1.05); }

.p-info { margin-top: auto; }

.p-info h3 {
  font-size: 1rem;
  color: var(--dark);
  margin-bottom: 8px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prices { display: flex; gap: 10px; align-items: center; margin-bottom: 15px; }
.old { text-decoration: line-through; color: var(--light); font-size: 0.9rem; }
.new { color: var(--primary); font-weight: 800; font-size: 1.2rem; }

.add-btn {
  width: 100%;
  padding: 10px;
  background: var(--dark);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: 0.3s;
}
.add-btn:hover { background: var(--primary); }

@media (max-width: 768px) {
  .slider-wrapper { height: 250px; border-radius: 0; }
  .slide-overlay { padding: 15px 30px; }
  .slide-overlay h2 { font-size: 1.5rem; }
}
</style>