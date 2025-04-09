<template>
  <div class="p-2">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <ClipboardDocumentListIcon class="h-6 w-6 mr-2 text-gray-700" />
        รายการงาน
      </h1>

      <div class="flex flex-wrap gap-2 items-center">
        <!-- ช่องค้นหา -->
        <div class="relative w-full md:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหางาน..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            @keyup.enter="searchJobs"
          />
          <MagnifyingGlassIcon
            class="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
            @click="searchJobs"
          />
        </div>

        <div class="w-full md:w-auto">
          <DatePicker
            v-model="dateRange"
            range
            locale="th"
            :format="formatDate"
            :preview-format="formatPreview"
            placeholder="เลือกช่วงวันที่"
            :enable-time-picker="false"
            auto-apply
            :clearable="true"
            @update:model-value="applyFilters"
            class="date-picker-custom"
          >
            <template #trigger>
              <div
                class="flex items-center px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <CalendarIcon class="h-5 w-5 mr-2 text-gray-500" />
                <span v-if="!dateRange || !dateRange[0]" class="text-gray-500"
                  >เลือกช่วงวันที่</span
                >
                <span v-else class="text-gray-700">
                  {{ formatDisplayDate(dateRange[0]) }} -
                  {{ dateRange[1] ? formatDisplayDate(dateRange[1]) : 'ปัจจุบัน' }}
                </span>
              </div>
            </template>
          </DatePicker>
        </div>

        <!-- ตัวกรองสถานะ -->
        <select
          v-model="selectedStatus"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          @change="applyFilters"
        >
          <option value="">ทุกสถานะ</option>
          <option value="PENDING">รอดำเนินการ</option>
          <option value="IN_PROGRESS">กำลังดำเนินการ</option>
          <option value="COMPLETED">เสร็จสิ้น</option>
        </select>

        <!-- ปุ่มล้างการค้นหา -->
        <button
          v-if="searchQuery || selectedStatus || (dateRange && dateRange[0])"
          @click="clearSearch"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center"
        >
          <XMarkIcon class="h-5 w-5 mr-1" />
          ล้างการค้นหา
        </button>

        <!-- ปุ่มเพิ่มงานใหม่ -->
        <button
          @click="addJob"
          class="px-4 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center"
        >
          <PlusIcon class="h-5 w-5 mr-1" />
          เพิ่มงานใหม่
        </button>
      </div>
    </div>

    <!-- แสดงสถานะการโหลด -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border bg-white shadow rounded text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2">รหัส</th>
            <th class="px-4 py-2">ชื่อ</th>
            <th class="px-4 py-2">รายละเอียด</th>
            <th class="px-4 py-2">สถานที่</th>
            <th class="px-4 py-2">วันที่</th>
            <th class="px-4 py-2">สถานะ</th>
            <th class="px-4 py-2">กระบวนการ</th>
            <th class="px-3 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in jobs" :key="job.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-2">{{ job.id || '-' }}</td>
            <td class="px-4 py-2">{{ job.title }}</td>
            <td class="px-4 py-2 truncate max-w-[180px]">{{ job.description || '-' }}</td>
            <td class="px-4 py-2 truncate max-w-[180px]">{{ job.location || '-' }}</td>
            <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(job.scheduledAt) }}</td>
            <td class="px-4 py-2">
              <span
                :class="getStatusClass(job.status)"
                class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {{ getStatusText(job.status) }}
              </span>
            </td>
            <td class="px-4 py-2 text-center">
              <div class="flex items-center justify-center">
                <!-- กระบวนการเช็คของออก -->
                <div
                  class="flex flex-col items-center mr-2"
                  :title="getProcessTooltip(job, 'checkout')"
                >
                  <CheckCircleIcon class="h-5 w-5" :class="getProcessIconClass(job, 'checkout')" />
                  <span class="text-xs mt-1">เช็คออก</span>
                </div>

                <!-- เส้นเชื่อม -->
                <div class="w-4 h-0.5 bg-gray-300"></div>

                <!-- กระบวนการเช็คของเข้า -->
                <div
                  class="flex flex-col items-center ml-2"
                  :title="getProcessTooltip(job, 'checkin')"
                >
                  <CheckCircleIcon class="h-5 w-5" :class="getProcessIconClass(job, 'checkin')" />
                  <span class="text-xs mt-1">เช็คเข้า</span>
                </div>
              </div>
            </td>
            <td class="px-3 py-2 text-center whitespace-nowrap">
              <router-link
                :to="{ name: 'JobDetailView', params: { id: job.id } }"
                class="px-2 py-1 bg-green-100 rounded-md text-green-500 hover:underline mr-2 inline-flex items-center"
              >
                <ArchiveBoxIcon class="h-4 w-4 mr-1" />
                จัดของ
              </router-link>
              <button
                @click="editJob(job)"
                class="px-2 py-1 bg-blue-100 rounded-md text-blue-500 hover:underline mr-2 inline-flex items-center"
              >
                <PencilSquareIcon class="h-4 w-4 mr-1" />
                แก้ไข
              </button>
              <button
                @click="deleteJob(job.id)"
                class="px-2 py-1 bg-red-100 rounded-md text-red-500 hover:underline inline-flex items-center"
              >
                <TrashIcon class="h-4 w-4 mr-1" />
                ลบ
              </button>
            </td>
          </tr>
          <tr v-if="jobs.length === 0">
            <td colspan="8" class="px-4 py-2 text-center text-gray-500">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 bg-gray-100 p-4 rounded-md"
    >
      <!-- Dropdown: จำนวนต่อหน้า -->
      <div class="flex items-center gap-2">
        <label for="jobsPerPage" class="text-sm whitespace-nowrap">แสดง:</label>
        <select
          class="rounded-md text-sm py-1 px-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
          id="jobsPerPage"
          v-model="jobsPerPage"
          @change="loadJobs"
        >
          <option v-for="option in [10, 20, 50, 100]" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <!-- Pagination -->
      <div class="flex items-center gap-2 text-sm">
        <button
          class="px-3 py-1 bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-1" />
          ก่อนหน้า
        </button>
        <span class="whitespace-nowrap">หน้า {{ currentPage }}</span>
        <button
          class="px-3 py-1 bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          @click="nextPage"
          :disabled="!hasMoreJobs"
        >
          ถัดไป
          <ChevronRightIcon class="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>

    <!-- Modal  -->
    <JobModal
      :show="showModal"
      :isEditMode="isEditMode"
      :form="form"
      @save="saveNewJob"
      @update="updateJob"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { fetchJobs, createJob, updateJob, deleteJob } from '@/services/job'
import Swal from 'sweetalert2'
import JobModal from '@/components/modal/JobModal.vue'
import DatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  PlusIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'JobListView',
  components: {
    JobModal,
    DatePicker,
    PlusIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    PencilSquareIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CalendarIcon,
  },
  data() {
    return {
      jobs: [],
      currentPage: 1,
      jobsPerPage: 10,
      hasMoreJobs: true,
      totalJobs: 0,
      searchQuery: '',
      dateRange: null,
      selectedStatus: null,
      isLoading: false,

      showModal: false,
      isEditMode: false,
      form: {
        id: null,
        title: '',
        description: '',
        location: '',
      },
    }
  },
  methods: {
    formatPreview(date) {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    formatDisplayDate(date) {
      if (!date) return ''
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },

    async loadJobs() {
      try {
        this.isLoading = true

        const searchParams = {}

        if (this.searchQuery) {
          searchParams.query = this.searchQuery
        }

        if (this.selectedStatus) {
          searchParams.status = this.selectedStatus
        }

        if (this.dateRange && this.dateRange[0]) {
          searchParams.startDate = this.formatDateForAPI(this.dateRange[0])

          if (this.dateRange[1]) {
            searchParams.endDate = this.formatDateForAPI(this.dateRange[1])
          }
        }

        const response = await fetchJobs(this.currentPage, this.jobsPerPage, searchParams)

        if (response && response.data) {
          if (response.data.jobs) {
            this.jobs = response.data.jobs
            this.totalJobs = response.data.total || 0
            this.hasMoreJobs = this.jobs.length === this.jobsPerPage
          } else if (Array.isArray(response.data)) {
            this.jobs = response.data
            this.totalJobs = response.data.length
            this.hasMoreJobs = this.jobs.length === this.jobsPerPage
          } else {
            console.warn('Unexpected response structure:', response.data)
            this.jobs = []
            this.totalJobs = 0
            this.hasMoreJobs = false
          }
        } else {
          this.jobs = []
          this.totalJobs = 0
          this.hasMoreJobs = false
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
        this.jobs = []
        this.totalJobs = 0
        this.hasMoreJobs = false
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ไม่สามารถโหลดข้อมูลงานได้',
          showConfirmButton: false,
          timer: 3000,
        })
      } finally {
        this.isLoading = false
      }
    },

    formatDateForAPI(date) {
      return date.toISOString().split('T')[0]
    },

    searchJobs() {
      this.currentPage = 1
      this.loadJobs()
    },

    applyFilters() {
      this.currentPage = 1
      this.loadJobs()
    },

    clearSearch() {
      this.searchQuery = ''
      this.dateRange = null
      this.selectedStatus = null
      this.currentPage = 1
      this.loadJobs()
    },

    addJob() {
      this.isEditMode = false
      this.form = {
        id: null,
        title: '',
        description: '',
        location: '',
        scheduledAt: null,
        notes: '',
      }
      this.showModal = true
    },

    editJob(job) {
      this.isEditMode = true
      this.form = {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        scheduledAt: job.scheduledAt,
        notes: job.notes,
      }
      this.showModal = true
    },
    async saveNewJob(formData) {
      try {
        let jobData = { ...formData }

        if (jobData.scheduledAt && typeof jobData.scheduledAt === 'string') {
          const date = new Date(jobData.scheduledAt)
          if (!isNaN(date.getTime())) {
            jobData.scheduledAt = date.toISOString()
          } else {
            jobData.scheduledAt = null
          }
        }

        const confirm = await Swal.fire({
          title: 'ยืนยันการบันทึก',
          text: 'คุณต้องการเพิ่มงานใหม่นี้ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ใช่, บันทึกเลย!',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#d33',
        })

        if (!confirm.isConfirmed) return

        await createJob(jobData)
        this.showModal = false
        await this.loadJobs()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'เพิ่มงานสำเร็จ',
          showConfirmButton: false,
          timer: 3000,
        })
      } catch (error) {
        console.error('Error saving job:', error)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ไม่สามารถเพิ่มงานได้',
          text: error.response?.data?.error || 'เกิดข้อผิดพลาดบางอย่าง',
          showConfirmButton: false,
          timer: 3000,
        })
      }
    },
    async updateJob(form) {
      const result = await Swal.fire({
        title: 'ยืนยันการแก้ไขงาน',
        text: 'คุณต้องการแก้ไขงานนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, แก้ไขเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (!result.isConfirmed) return

      try {
        await updateJob(form.id, form)
        await this.loadJobs()
        this.closeModal()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'แก้ไขงานสำเร็จ',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'แก้ไขงานล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขงาน',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    },

    closeModal() {
      this.showModal = false
    },
    async deleteJob(id) {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ใช่, ลบเลย!',
          cancelButtonText: 'ยกเลิก',
        })

        if (result.isConfirmed) {
          if (!id) {
            throw new Error('ไม่พบรหัสงาน')
          }
          await deleteJob(id)
          await this.loadJobs()

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'ลบงานสำเร็จ',
            showConfirmButton: false,
            timer: 3000,
          })
        }
      } catch (error) {
        console.error('Error deleting job:', error)

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ไม่สามารถลบงานได้',
          text: error.response?.data?.error || error.message || 'เกิดข้อผิดพลาดบางอย่าง',
          showConfirmButton: false,
          timer: 3000,
        })
      }
    },
    nextPage() {
      if (this.hasMoreJobs) {
        this.currentPage++
        this.loadJobs()
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadJobs()
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)

      // สร้างชื่อเดือนภาษาไทย
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
      const year = date.getFullYear() + 543 // แปลงเป็นปี พ.ศ.

      return `${day} ${month} ${year}`
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

    getStatusClass(status) {
      const classMap = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
      }
      return classMap[status] || 'bg-gray-100 text-gray-800'
    },

    getProcessIconClass(job, processType) {
      if (processType === 'checkout') {
        return job.status === 'IN_PROGRESS' || job.status === 'COMPLETED'
          ? 'text-green-500'
          : 'text-gray-300'
      } else if (processType === 'checkin') {
        return job.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-300'
      }
      return 'text-gray-300'
    },

    getProcessTooltip(job, processType) {
      if (processType === 'checkout') {
        if (job.status === 'PENDING') {
          return 'ยังไม่ได้เช็คของออก'
        } else {
          return 'เช็คของออกแล้ว'
        }
      } else if (processType === 'checkin') {
        if (job.status === 'COMPLETED') {
          return 'เช็คของเข้าแล้ว'
        } else if (job.status === 'IN_PROGRESS') {
          return 'รอเช็คของเข้า'
        } else {
          return 'ยังไม่ถึงขั้นตอนเช็คของเข้า'
        }
      }
      return ''
    },
  },
  mounted() {
    this.loadJobs()
  },
}
</script>

<style>
.date-picker-custom {
  --dp-border-radius: 0.375rem;
  --dp-primary-color: #3b82f6;
  --dp-icon-color: #6b7280;
  --dp-hover-color: #eff6ff;
  --dp-hover-text-color: #1e40af;
  --dp-font-family: inherit;
}
</style>
