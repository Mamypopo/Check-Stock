<template>
  <div class="w-full max-w-md bg-white rounded-xl shadow p-6">
    <div class="flex justify-center mb-4">
      <button
        class="px-4 py-2 font-medium"
        :class="
          activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="activeTab = 'login'"
      >
        เข้าสู่ระบบ
      </button>
      <button
        class="px-4 py-2 font-medium"
        :class="
          activeTab === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="activeTab = 'register'"
      >
        สมัครสมาชิก
      </button>
    </div>

    <!-- Login Form -->
    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
      <input v-model="loginForm.email" type="email" placeholder="อีเมล" class="input" required />
      <input
        v-model="loginForm.password"
        type="password"
        placeholder="รหัสผ่าน"
        class="input"
        required
      />
      <button class="btn-primary">เข้าสู่ระบบ</button>

      <!-- Google Login Button -->
      <div class="mt-4">
        <p class="text-center text-gray-500 mb-2">หรือเข้าสู่ระบบด้วย</p>
        <button @click.prevent="loginWithGoogle" class="btn-google">
          <img src="@/assets/images/icons8-google.svg" alt="Google" class="w-5 h-5 mr-2" />
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    </form>

    <!-- Register Form -->
    <form v-else @submit.prevent="handleRegister" class="space-y-4">
      <input v-model="registerForm.name" type="text" placeholder="ชื่อ" class="input" required />
      <input v-model="registerForm.email" type="email" placeholder="อีเมล" class="input" required />
      <input
        v-model="registerForm.password"
        type="password"
        placeholder="รหัสผ่าน"
        class="input"
        required
      />
      <select v-model="registerForm.role" class="input" required>
        <option value="STAFF">STAFF</option>
        <option value="ADMIN">ADMIN</option>
        <option value="MANAGER">MANAGER</option>
      </select>
      <button class="btn-primary">สมัครสมาชิก</button>

      <!-- Google Register Button -->
      <div class="mt-4">
        <p class="text-center text-gray-500 mb-2">หรือสมัครสมาชิกด้วย</p>
        <button @click.prevent="loginWithGoogle" class="btn-google">
          <img src="@/assets/images/icons8-google.svg" alt="Google" class="w-5 h-5 mr-2" />
          สมัครสมาชิกด้วย Google
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { login, register, getGoogleAuthUrl } from '../services/auth.js'
import Swal from 'sweetalert2'

export default {
  name: 'AuthView',
  data() {
    return {
      activeTab: 'login',
      loginForm: {
        email: '',
        password: '',
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        role: 'STAFF',
      },
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      localStorage.setItem('token', token)

      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })

      this.$router.push('/')
    }
  },
  methods: {
    async handleLogin() {
      try {
        const res = await login(this.loginForm)
        localStorage.setItem('token', res.token)

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })

        this.$router.push('/')
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'

        let title = 'เข้าสู่ระบบไม่สำเร็จ'
        let icon = 'error'

        if (errorMessage.includes('ไม่พบผู้ใช้งาน')) {
          title = 'ไม่พบผู้ใช้งาน'
        } else if (errorMessage.includes('รหัสผ่านไม่ถูกต้อง')) {
          title = 'รหัสผ่านไม่ถูกต้อง'
        }

        Swal.fire({
          icon,
          title,
          text: errorMessage,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ยืนยัน',
        })
      }
    },

    async handleRegister() {
      try {
        await register(this.registerForm)

        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          text: 'กรุณาเข้าสู่ระบบ',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        })

        this.activeTab = 'login'
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'สมัครสมาชิกไม่สำเร็จ',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ลองใหม่',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
        })
      }
    },

    loginWithGoogle() {
      window.location.href = getGoogleAuthUrl()
    },
  },
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200;
}
.btn-primary {
  @apply w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition;
}
.btn-google {
  @apply w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition;
}
</style>
