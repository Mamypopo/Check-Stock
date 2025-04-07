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
        <h1 class="text-2xl font-bold mb-4">สรุปการใช้สิ่งของ: {{ job.title }}</h1>

        <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-700 mb-2">ข้อมูลงาน</h3>
            <p><span class="font-medium">ชื่องาน:</span> {{ job.title }}</p>
            <p><span class="font-medium">สถานะ:</span> {{ getStatusText(job.status) }}</p>
            <p><span class="font-medium">วันที่:</span> {{ formatDate(job.scheduledAt) }}</p>
          </div>

          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-green-700 mb-2">ข้อมูลการเช็คของออก</h3>
            <p v-if="checkout">
              <span class="font-medium">วันที่เช็คออก:</span>
              {{ formatDateTime(checkout.createdAt) }}
            </p>
            <p v-if="checkout">
              <span class="font-medium">ผู้เช็คออก:</span> {{ checkout.user?.name || '-' }}
            </p>
            <p v-if="checkout">
              <span class="font-medium">จำนวนรายการ:</span> {{ checkout.items?.length || 0 }} รายการ
            </p>
            <p v-else class="text-gray-500 italic">ยังไม่มีการเช็คของออก</p>
          </div>

          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-700 mb-2">ข้อมูลการเช็คของเข้า</h3>
            <p v-if="checkin">
              <span class="font-medium">วันที่เช็คเข้า:</span>
              {{ formatDateTime(checkin.createdAt) }}
            </p>
            <p v-if="checkin">
              <span class="font-medium">ผู้เช็คเข้า:</span> {{ checkin.user?.name || '-' }}
            </p>
            <p v-if="checkin">
              <span class="font-medium">จำนวนรายการ:</span> {{ checkin.items?.length || 0 }} รายการ
            </p>
            <p v-else class="text-gray-500 italic">ยังไม่มีการเช็คของเข้า</p>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">รายการสิ่งของ</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
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
                <tr v-for="item in summaryItems" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.code || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.category || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      v-if="item.isConsumable"
                      class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs"
                      >สิ้นเปลือง</span
                    >
                    <span v-else class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                      >ไม่สิ้นเปลือง</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ item.checkoutQuantity }} {{ item.unit }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ item.checkinQuantity }} {{ item.unit }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      v-if="item.checkinQuantity === item.checkoutQuantity"
                      class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs"
                      >ครบ</span
                    >
                    <span
                      v-else-if="item.isConsumable"
                      class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs"
                      >ใช้ไป {{ item.checkoutQuantity - item.checkinQuantity }}
                      {{ item.unit }}</span
                    >
                    <span v-else class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                      >หายไป {{ item.checkoutQuantity - item.checkinQuantity }}
                      {{ item.unit }}</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="item.note" class="flex items-center">
                      <button
                        @click="openNoteModal(item)"
                        class="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
                        title="ดูหมายเหตุ"
                      >
                        <DocumentTextIcon class="h-5 w-5" />
                      </button>
                    </div>
                    <span v-else>-</span>
                  </td>
                </tr>
                <tr v-if="summaryItems.length === 0">
                  <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    ไม่พบข้อมูลสิ่งของ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="hasMissingItems" class="mb-6 bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-700 mb-2">สรุปสิ่งของที่ไม่ครบ</h3>
          <ul class="list-disc pl-5">
            <li v-for="(item, index) in missingItems" :key="index" class="mb-2">
              <span class="font-medium">{{ item.name }}</span
              >:
              <span v-if="item.isConsumable">
                ใช้ไป {{ item.checkoutQuantity - item.checkinQuantity }} {{ item.unit }}
              </span>
              <span v-else>
                หายไป {{ item.checkoutQuantity - item.checkinQuantity }} {{ item.unit }}
              </span>
              <span v-if="item.note" class="text-gray-600 italic"> - {{ item.note }}</span>
            </li>
          </ul>
        </div>

        <div class="flex justify-end">
          <button
            @click="printSummary"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            พิมพ์รายงาน
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Note Modal -->
  <div
    v-if="showNoteModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">รายละเอียดบันทึก</h3>
        <button @click="closeNoteModal" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="mb-4">
        <p class="text-sm text-gray-500 mb-2">รายการ:</p>
        <p class="font-medium">{{ currentItem?.name || '' }}</p>
      </div>

      <div class="mb-4">
        <p class="text-sm text-gray-500 mb-2">บันทึก:</p>
        <div class="bg-gray-50 p-4 rounded-md">
          <p class="whitespace-pre-wrap">{{ currentItem?.note || '' }}</p>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="closeNoteModal"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJobById } from '@/services/job'
import { getCheckoutsByJobId } from '@/services/checkout'
import { getCheckinsByJobId } from '@/services/checkin'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'JobSummaryView',

  components: {
    ArrowLeftIcon,
    DocumentTextIcon,
  },

  data() {
    return {
      jobId: null,
      job: {},
      checkout: null,
      checkin: null,
      summaryItems: [],
      loading: true,
      showNoteModal: false,
      currentItem: null,
    }
  },
  computed: {
    hasMissingItems() {
      return this.missingItems.length > 0
    },
    missingItems() {
      return this.summaryItems.filter((item) => item.checkinQuantity < item.checkoutQuantity)
    },
  },
  async mounted() {
    this.jobId = parseInt(this.$route.params.id)

    try {
      await this.loadJobData()
      await this.loadCheckoutData()
      await this.loadCheckinData()
      this.prepareSummaryItems()
    } catch (error) {
      console.error('Error loading summary data:', error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    async loadJobData() {
      const response = await fetchJobById(this.jobId)
      this.job = response.data
    },

    async loadCheckoutData() {
      const response = await getCheckoutsByJobId(this.jobId)
      if (response.data && response.data.length > 0) {
        this.checkout = response.data[0]
      }
    },

    async loadCheckinData() {
      const response = await getCheckinsByJobId(this.jobId)
      if (response.data && response.data.length > 0) {
        this.checkin = response.data[0]
      }
    },

    prepareSummaryItems() {
      if (!this.checkout || !this.checkout.items) {
        this.summaryItems = []
        return
      }

      this.summaryItems = this.checkout.items.map((checkoutItem) => {
        const checkinItem =
          this.checkin?.items?.find((item) => item.itemId === checkoutItem.itemId) || null

        return {
          id: checkoutItem.itemId,
          code: checkoutItem.item.code,
          name: checkoutItem.item.name,
          category: checkoutItem.item.category?.name,
          unit: checkoutItem.item.Unit?.name || 'หน่วย',
          isConsumable: checkoutItem.item.isConsumable,
          checkoutQuantity: checkoutItem.actualQuantity,
          checkinQuantity: checkinItem ? checkinItem.actualQuantity : 0,
          note: checkinItem?.note || '',
        }
      })
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)

      const thaiMonths = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ]

      const day = date.getDate()
      const month = thaiMonths[date.getMonth()]
      const year = date.getFullYear() + 543

      return `${day} ${month} ${year}`
    },

    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)

      const thaiMonths = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ]

      const day = date.getDate()
      const month = thaiMonths[date.getMonth()]
      const year = date.getFullYear() + 543

      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')

      return `${day} ${month} ${year} ${hours}:${minutes} น.`
    },

    getStatusText(status) {
      const statusMap = {
        PENDING: 'รอดำเนินการ',
        IN_PROGRESS: 'กำลังดำเนินการ',
        COMPLETED: 'เสร็จสิ้น',
        CANCELLED: 'ยกเลิก',
      }
      return statusMap[status] || status
    },

    printSummary() {
      window.print()
    },

    openNoteModal(item) {
      this.currentItem = item
      this.showNoteModal = true
    },

    closeNoteModal() {
      this.showNoteModal = false
    },
  },
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-section,
  .print-section * {
    visibility: visible;
  }
  .print-section {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .no-print {
    display: none !important;
  }
}
</style>
