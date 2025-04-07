<template>
  <div class="h-full flex bg-gray-200">
    <Sidebar :collapsed="collapsed" @toggle="toggleSidebar" />
    <main class="flex-1 overflow-auto p-6 pb-20 md:pb-6">
      <RouterView />
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

export default {
  name: 'MainLayout',
  components: { Sidebar },
  data() {
    return {
      collapsed: false,
    }
  },
  methods: {
    toggleSidebar() {
      this.collapsed = !this.collapsed
    },
  },
}
</script>
