<template>
  <div class="auth-page">
    <h1>Register</h1>

    <form @submit.prevent="handleRegister">
      <div>
        <label>Name</label>
        <input v-model="name" required />
      </div>

      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div>
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import { useUserStore } from "../store/user";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: ""
    };
  },
  methods: {
    async handleRegister() {
      const res = await axios.post("http://localhost:3000/users", {
        name: this.name,
        email: this.email,
        password: this.password,
        role: "user"
      });

      const userStore = useUserStore();
      userStore.login(res.data);

      this.$router.push("/");
    }
  }
};
</script>
<style scoped>
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* چون در تمپلیت شما کلاس auth-card نیست و مستقیم form دارید، به تگ والد استایل میدهم */
.auth-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 { margin-bottom: 30px; color: var(--dark); font-weight: 800; }

form {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-hover);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f9fafb;
  outline: none;
  transition: 0.3s;
}
input:focus { border-color: var(--primary); background: white; }

button {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  transition: 0.3s;
}
button:hover { background: var(--primary-dark); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
</style>