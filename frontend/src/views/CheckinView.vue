<template>
  <div class="p-2">
    <!-- Breadcrumb -->
    <div class="mb-6 flex items-center">
      <router-link :to="`/jobs/${jobId}`" class="text-blue-500 hover:underline flex items-center">
        <ArrowLeftIcon class="h-5 w-5 mr-1" />

        กลับไปยังรายละเอียดงาน
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold mb-4">เช็คของกลับเข้าคลัง: {{ job.title }}</h1>

        <div class="mb-6">
          <p class="text-gray-600">กรุณาตรวจสอบและยืนยันจำนวนสิ่งของที่นำกลับเข้าคลัง</p>
          <p class="text-gray-600 mt-2">
            <span class="text-red-500 font-medium">*</span>
            กรุณาติ๊กเลือกทุกรายการเพื่อยืนยันว่าได้ตรวจสอบแล้ว
          </p>
          <p class="text-gray-600 mt-2">
            <span class="text-blue-500 font-medium">*</span>
            บันทึกเพิ่มเติมเกี่ยวกับสภาพอุปกรณ์ ปัญหาที่พบ หรือรายละเอียดการใช้งาน (ถ้ามี)
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ตรวจสอบแล้ว
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  รหัส
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ชื่อสิ่งของ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หมวดหมู่
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ประเภท
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จำนวนที่นำออก
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จำนวนที่นำกลับ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  สถานะ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  บันทึก
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in checkinItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    v-model="item.checked"
                    class="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.code || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.category?.name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="item.item.isConsumable"
                    class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs"
                    >สิ้นเปลือง</span
                  >
                  <span v-else class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                    >ไม่สิ้นเปลือง</span
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.quantity }}</td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    v-model.number="item.actualQuantity"
                    type="number"
                    min="0"
                    :max="item.quantity"
                    class="border border-gray-300 rounded-md p-1 w-20 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="item.actualQuantity === item.quantity"
                    class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs"
                    >ครบ</span
                  >
                  <span
                    v-else-if="item.item.isConsumable"
                    class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs"
                    >ใช้ไป {{ item.quantity - item.actualQuantity }}
                    {{ item.item.Unit?.name || 'หน่วย' }}</span
                  >
                  <span v-else class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                    >หายไป {{ item.quantity - item.actualQuantity }}
                    {{ item.item.Unit?.name || 'หน่วย' }}</span
                  >
                  <span
                    v-if="item.note"
                    class="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                    >มีบันทึก</span
                  >
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="openNoteModal(index)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap"
                  >
                    {{ item.note ? 'แก้ไขบันทึก' : 'เพิ่มบันทึก' }}
                  </button>
                </td>
              </tr>
              <tr v-if="checkinItems.length === 0">
                <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                  ไม่พบรายการสิ่งของในงานนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="cancelCheckin"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmCheckin"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            :disabled="!isFormValid"
          >
            ยืนยันการเช็คของเข้า
          </button>
        </div>
      </div>
    </div>

    <!-- Modal  -->
    <div
      v-if="showNoteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">บันทึก: {{ currentItem ? currentItem.item.name : '' }}</h3>
          <button @click="closeNoteModal" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="mb-4">
          <div class="flex items-center mb-2">
            <span class="font-medium mr-2">รหัส:</span>
            <span>{{ currentItem ? currentItem.item.code || '-' : '' }}</span>
          </div>
          <div class="flex items-center mb-2">
            <span class="font-medium mr-2">จำนวนที่นำออก:</span>
            <span>{{ currentItem ? currentItem.quantity : 0 }}</span>
          </div>
          <div class="flex items-center mb-2">
            <span class="font-medium mr-2">จำนวนที่นำกลับ:</span>
            <span>{{ currentItem ? currentItem.actualQuantity : 0 }}</span>
          </div>
          <div class="flex items-center mb-2">
            <span class="font-medium mr-2">สถานะ:</span>
            <span
              v-if="currentItem && currentItem.actualQuantity === currentItem.quantity"
              class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs"
              >ครบ</span
            >
            <span
              v-else-if="currentItem && currentItem.item.isConsumable"
              class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs"
            >
              ใช้ไป {{ currentItem ? currentItem.quantity - currentItem.actualQuantity : 0 }}
              {{ currentItem && currentItem.item.Unit ? currentItem.item.Unit.name : 'หน่วย' }}
            </span>
            <span
              v-else-if="currentItem"
              class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
            >
              หายไป {{ currentItem ? currentItem.quantity - currentItem.actualQuantity : 0 }}
              {{ currentItem && currentItem.item.Unit ? currentItem.item.Unit.name : 'หน่วย' }}
            </span>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">บันทึก</label>
          <textarea
            v-model="noteText"
            rows="5"
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
            :placeholder="getNotePlaceholder(currentItem)"
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            @click="closeNoteModal"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
          >
            ยกเลิก
          </button>
          <button
            @click="saveNote"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJobById } from '@/services/job'
import { getCheckoutsByJobId } from '@/services/checkout'
import { createCheckin } from '@/services/checkin'
import Swal from 'sweetalert2'
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CheckinView',

  components: {
    ArrowLeftIcon,
    XMarkIcon,
  },
  data() {
    return {
      jobId: null,
      job: {},
      checkout: null,
      checkinItems: [],
      loading: true,
      showNoteModal: false,
      currentItemIndex: null,
      noteText: '',
    }
  },
  computed: {
    isFormValid() {
      if (this.checkinItems.length === 0) return false

      return this.checkinItems.every((item) => {
        const isChecked = item.checked === true

        const validQuantity =
          item.actualQuantity !== null &&
          item.actualQuantity !== undefined &&
          item.actualQuantity >= 0 &&
          item.actualQuantity <= item.quantity

        const needsNote = item.actualQuantity < item.quantity
        const hasNote = item.note && item.note.trim() !== ''

        return isChecked && validQuantity && (!needsNote || hasNote)
      })
    },

    hasMissingItems() {
      return this.checkinItems.some((item) => item.actualQuantity < item.quantity)
    },

    currentItem() {
      if (this.currentItemIndex === null) return null
      return this.checkinItems[this.currentItemIndex]
    },
  },
  async created() {
    this.jobId = parseInt(this.$route.params.id)

    try {
      await this.loadJobData()
      await this.loadCheckoutData()
      this.prepareCheckinItems()
    } catch (error) {
      console.error('Error loading checkin data:', error)
      this.showErrorToast('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      this.loading = false
    }
  },
  methods: {
    async loadJobData() {
      const response = await fetchJobById(this.jobId)
      this.job = response.data

      if (this.job.status !== 'IN_PROGRESS') {
        this.showErrorToast('งานนี้ไม่อยู่ในสถานะที่สามารถเช็คของเข้าได้')
        this.$router.push(`/jobs/${this.jobId}`)
      }
    },

    async loadCheckoutData() {
      const response = await getCheckoutsByJobId(this.jobId)
      if (response.data && response.data.length > 0) {
        this.checkout = response.data[0]
      } else {
        this.showErrorToast('ไม่พบข้อมูลการเช็คของออก')
        this.$router.push(`/jobs/${this.jobId}`)
      }
    },

    prepareCheckinItems() {
      if (!this.checkout || !this.checkout.items) {
        this.checkinItems = []
        return
      }

      this.checkinItems = this.checkout.items.map((checkoutItem) => ({
        itemId: checkoutItem.item.id,
        item: checkoutItem.item,
        quantity: checkoutItem.actualQuantity,
        actualQuantity: checkoutItem.actualQuantity,
        note: '',
        checked: false,
      }))
    },

    cancelCheckin() {
      this.$router.push(`/jobs/${this.jobId}`)
    },

    async confirmCheckin() {
      if (!this.isFormValid) {
        this.showErrorToast('กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน')
        return
      }

      const confirmResult = await Swal.fire({
        title: 'ยืนยันการคืนอุปกรณ์',
        html: `
          <div class="text-left">
            <p>คุณต้องการบันทึกการคืนอุปกรณ์ใช่หรือไม่?</p>
            ${
              this.hasMissingItems
                ? `
            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p class="text-yellow-700 font-medium">คำเตือน:</p>
              <p class="text-yellow-600">มีอุปกรณ์บางรายการที่คืนไม่ครบตามจำนวน</p>
            </div>
            `
                : ''
            }
          </div>
        `,
        icon: this.hasMissingItems ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
      })

      if (!confirmResult.isConfirmed) {
        return
      }

      try {
        const checkinData = {
          jobId: this.jobId,
          items: this.checkinItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            actualQuantity: item.actualQuantity,
            note: item.note,
          })),
        }

        await createCheckin(checkinData)

        this.showSuccessToast('บันทึกข้อมูลการคืนอุปกรณ์เรียบร้อยแล้ว')

        this.$router.push(`/jobs/${this.jobId}`)
      } catch (error) {
        console.error('Error creating checkin:', error)
        this.showErrorToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    },

    showSuccessToast(message) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 3000,
      })
    },

    showErrorToast(message) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 3000,
      })
    },

    openNoteModal(index) {
      this.currentItemIndex = index
      this.noteText = this.checkinItems[index].note || ''
      this.showNoteModal = true
    },

    closeNoteModal() {
      this.showNoteModal = false
      this.currentItemIndex = null
      this.noteText = ''
    },

    saveNote() {
      if (this.currentItemIndex !== null) {
        this.checkinItems[this.currentItemIndex].note = this.noteText
        this.closeNoteModal()
      }
    },

    getNotePlaceholder(item) {
      if (!item) return ''

      if (item.actualQuantity < item.quantity) {
        return item.item.isConsumable
          ? 'ระบุรายละเอียดการใช้งาน เช่น ใช้ในการทำอะไร ใช้ไปเท่าไหร่'
          : 'ระบุสาเหตุที่หายไป เช่น ชำรุด สูญหาย หรือมีปัญหาอื่นๆ'
      }
      return 'บันทึกสภาพอุปกรณ์ ปัญหาที่พบ หรือรายละเอียดการใช้งาน (ถ้ามี)'
    },
  },
}
</script>
