<template>
  <div>
    <div
      v-if="!isMobile"
      :class="[
        'h-screen flex flex-col justify-between transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        'bg-white/50 text-white',
      ]"
    >
      <div>
        <div class="p-4 text-center text-xl font-bold tracking-wide text-gray-900 bg-white/50">
          <img
            v-if="!collapsed"
            src="@/assets/images/Logosemed.png"
            alt="Logo"
            class="h-10 mx-auto"
          />
          <span v-else>🔷</span>
        </div>

        <div class="p-4">
          <button
            @click="$emit('toggle')"
            class="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
          >
            <ArrowLeftIcon v-if="!collapsed" class="h-5 w-5 mx-auto" />
            <ArrowRightIcon v-else class="h-5 w-5 mx-auto" />
          </button>
        </div>

        <nav class="p-4 space-y-2">
          <button
            v-for="menu in mainMenus"
            :key="menu.name"
            @click="menu.action"
            :class="menu.class"
          >
            <component :is="menu.icon" class="h-5 w-5 text-gray-900" />
            <span v-if="!collapsed" class="ml-2">{{ menu.name }}</span>
          </button>
        </nav>
      </div>

      <div class="p-4 mt-auto">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-900 hover:bg-red-500 hover:text-white transition"
        >
          <ArrowLeftStartOnRectangleIcon class="h-5 w-5" />
          <span v-if="!collapsed" class="ml-2">Log Out</span>
        </button>
      </div>
    </div>

    <div
      v-else
      class="fixed bottom-0 left-0 right-0 bg-white text-white flex justify-around py-2 z-50"
    >
      <button
        v-for="menu in allMenus"
        :key="menu.name"
        @click="menu.action"
        class="flex flex-col items-center"
      >
        <component :is="menu.icon" class="h-5 w-5 text-gray-900" />
        <span class="text-xs text-gray-900">{{ menu.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArchiveBoxIcon,
  ListBulletIcon,
  MapIcon,
  ArrowLeftStartOnRectangleIcon,
  ClockIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'Sidebar',
  components: {
    ArrowLeftIcon,
    ArrowRightIcon,
    ArchiveBoxIcon,
    ListBulletIcon,
    MapIcon,
    ArrowLeftStartOnRectangleIcon,
    ClockIcon,
    HomeIcon,
  },
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isMobile: false,
    }
  },
  computed: {
    mainMenus() {
      return [
        {
          name: 'Items',
          icon: ArchiveBoxIcon,
          class:
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-300 text-gray-900 font-medium hover:bg-pink-400 transition',
          action: () => {
            this.$router.push('/items')
          },
        },
        {
          name: 'จัดการหมวดหมู่/หน่วยนับ',
          icon: ListBulletIcon,
          class:
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-300 text-gray-900 font-medium hover:bg-pink-400 transition',
          action: () => {
            this.$router.push('/category-unit-management')
          },
        },
        {
          name: 'จัดการงาน',
          icon: MapIcon,
          class:
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-300 text-gray-900 font-medium hover:bg-pink-400 transition',
          action: () => {
            this.$router.push('/jobs')
          },
        },
        {
          name: 'บันทึกการทำงาน',
          icon: ClockIcon,
          class:
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-300 text-gray-900 font-medium hover:bg-pink-400 transition',
          action: () => {
            this.$router.push('/logs')
          },
        },
      ]
    },
    allMenus() {
      return [
        ...this.mainMenus,
        {
          name: 'Log Out',
          icon: ArrowLeftStartOnRectangleIcon,
          action: this.handleLogout,
        },
      ]
    },
  },
  created() {
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize)
  },
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768
    },
    handleLogout() {
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการออกจากระบบหรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ออกจากระบบ!',
        cancelButtonText: 'ยกเลิก',
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('token')
          this.$router.push('/auth')
          Swal.fire({
            icon: 'success',
            title: 'ออกจากระบบแล้ว!',
            text: 'คุณได้ออกจากระบบเรียบร้อยแล้ว.',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          })
        }
      })
    },
  },
}
</script>

<style scoped></style>
