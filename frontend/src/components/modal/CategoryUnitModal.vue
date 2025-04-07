<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center px-4 z-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">{{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }} {{ type }}</h2>
      <form @submit.prevent="isEditMode ? update() : save()">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> ชื่อ {{ type }} </label>
          <input
            v-model="localForm.name"
            type="text"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            required
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            @click="close"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2 flex items-center"
          >
            <XMarkIcon class="h-5 w-5 mr-1" />
            ยกเลิก
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center"
          >
            <CheckIcon class="h-5 w-5 mr-1" />
            {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่ม' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
export default {
  components: {
    XMarkIcon,
    CheckIcon,
  },
  props: {
    show: Boolean,
    isEditMode: Boolean,
    type: String,
    form: Object,
  },
  data() {
    return {
      localForm: { ...this.form },
    }
  },
  watch: {
    form: {
      handler(newForm) {
        this.localForm = { ...newForm }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    save() {
      this.$emit('save', this.localForm)
    },
    update() {
      this.$emit('update', this.localForm)
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped></style>
