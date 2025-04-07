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
        <h1 class="text-2xl font-bold mb-4">เช็คของก่อนออกงาน: {{ job.title }}</h1>

        <div class="mb-6">
          <p class="text-gray-600">กรุณาตรวจสอบและยืนยันจำนวนสิ่งของที่นำออกไปใช้ในงาน</p>
          <p class="text-gray-600 mt-2">
            <span class="text-red-500 font-medium">*</span>
            กรุณาติ๊กเลือกทุกรายการเพื่อยืนยันว่าได้ตรวจสอบแล้ว
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
                  จำนวนที่ต้องการ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จำนวนที่นำออกจริง
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in checkoutItems" :key="item.id" class="hover:bg-gray-50">
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
              </tr>

              <tr v-if="checkoutItems.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  ไม่พบรายการสิ่งของในงานนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="cancelCheckout"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmCheckout"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            :disabled="!isFormValid"
          >
            ยืนยันการเช็คของออก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJobById } from '@/services/job'
import { getJobItems } from '@/services/jobItem'
import { createCheckout } from '@/services/checkout'
import Swal from 'sweetalert2'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CheckoutView',

  components: {
    ArrowLeftIcon,
  },
  data() {
    return {
      jobId: null,
      job: {},
      jobItems: [],
      checkoutItems: [],
      loading: true,
    }
  },
  computed: {
    isFormValid() {
      if (this.checkoutItems.length === 0) return false

      return this.checkoutItems.every((item) => {
        const isChecked = item.checked === true

        const validQuantity =
          item.actualQuantity !== null &&
          item.actualQuantity !== undefined &&
          item.actualQuantity >= 0 &&
          item.actualQuantity <= item.quantity

        return isChecked && validQuantity
      })
    },
  },
  async created() {
    this.jobId = parseInt(this.$route.params.id)

    try {
      await this.loadJobData()
      await this.loadJobItems()
      this.prepareCheckoutItems()
    } catch (error) {
      console.error('Error loading checkout data:', error)
      this.showErrorToast('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      this.loading = false
    }
  },
  methods: {
    async loadJobData() {
      const response = await fetchJobById(this.jobId)
      this.job = response.data

      if (this.job.status !== 'PENDING') {
        this.showErrorToast('งานนี้ไม่อยู่ในสถานะที่สามารถเช็คของออกได้')
        this.$router.push(`/jobs/${this.jobId}`)
      }
    },

    async loadJobItems() {
      const response = await getJobItems(this.jobId)
      this.jobItems = response.data
    },

    prepareCheckoutItems() {
      this.checkoutItems = this.jobItems.map((item) => ({
        ...item,
        actualQuantity: item.quantity,
        checked: false,
      }))
    },

    cancelCheckout() {
      this.$router.push(`/jobs/${this.jobId}`)
    },

    async confirmCheckout() {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการเช็คของออก',
          text: 'คุณต้องการยืนยันการเช็คของออกใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
        })

        if (!result.isConfirmed) return

        const checkoutData = {
          jobId: this.jobId,
          items: this.checkoutItems.map((item) => ({
            itemId: item.item.id,
            quantity: item.quantity,
            actualQuantity: item.actualQuantity,
          })),
        }

        await createCheckout(checkoutData)

        this.showSuccessToast('เช็คของออกสำเร็จ')
        this.$router.push(`/jobs/${this.jobId}`)
      } catch (error) {
        console.error('Error during checkout:', error)
        this.showErrorToast('ไม่สามารถเช็คของออกได้')
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
  },
}
</script>
