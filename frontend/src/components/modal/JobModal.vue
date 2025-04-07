<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center px-4 z-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-full max-w-xl">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEditMode ? 'แก้ไขงาน' : 'เพิ่มงานใหม่' }}
      </h2>
      <form @submit.prevent="isEditMode ? update() : save()">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">ชื่องาน</label>
          <input
            v-model="localForm.title"
            type="text"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">รายละเอียด</label>
          <textarea
            v-model="localForm.description"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">สถานที่</label>
          <input
            v-model="localForm.location"
            type="text"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">วันที่กำหนด</label>
          <VueDatePicker
            v-model="localForm.scheduledAt"
            :enable-time-picker="false"
            :format="formatDate"
            locale="th"
            auto-apply
            placeholder="เลือกวันที่"
            class="mt-1 w-full"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">บันทึก</label>
          <textarea
            v-model="localForm.notes"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          ></textarea>
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
            {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มงาน' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
export default {
  components: {
    VueDatePicker,
    XMarkIcon,
    CheckIcon,
  },
  props: {
    show: Boolean,
    isEditMode: Boolean,
    form: Object,
  },
  data() {
    return {
      localForm: {
        id: null,
        title: '',
        description: '',
        location: '',
        scheduledAt: null,
        notes: '',
      },
    }
  },
  watch: {
    form: {
      handler(newForm) {
        if (newForm) {
          this.localForm = {
            id: newForm.id || null,
            title: newForm.title || '',
            description: newForm.description || '',
            location: newForm.location || '',
            scheduledAt: newForm.scheduledAt ? new Date(newForm.scheduledAt) : null,
            notes: newForm.notes || '',
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return ''

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    },
    save() {
      if (!this.localForm.title) {
        alert('กรุณากรอกชื่องาน')
        return
      }

      const jobData = {
        title: this.localForm.title,
        description: this.localForm.description,
        location: this.localForm.location,
        scheduledAt: this.localForm.scheduledAt ? this.localForm.scheduledAt.toISOString() : null,
        notes: this.localForm.notes,
      }

      this.$emit('save', jobData)
    },
    update() {
      const jobData = {
        id: this.localForm.id,
        title: this.localForm.title,
        description: this.localForm.description,
        location: this.localForm.location,
        scheduledAt: this.localForm.scheduledAt ? this.localForm.scheduledAt.toISOString() : null,
        notes: this.localForm.notes,
      }

      this.$emit('update', jobData)
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
