<template>
  <div class="p-2">
    <!-- Breadcrumb -->
    <div class="mb-6 flex items-center">
      <router-link to="/jobs" class="text-blue-500 hover:underline flex items-center">
        <ArrowLeftIcon class="h-5 w-5 mr-1" />
        กลับไปยังรายการงาน
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <!-- Job Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h1 class="text-2xl font-bold">{{ job.title }}</h1>

          <div class="flex flex-wrap gap-2">
            <!-- ปุ่มเช็คของออก -->
            <button
              @click="goToCheckout"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              :class="{ 'opacity-50 cursor-not-allowed': job.status !== 'PENDING' }"
              :disabled="job.status !== 'PENDING'"
              :title="job.status !== 'PENDING' ? 'งานนี้ได้เช็คของออกไปแล้ว' : ''"
            >
              <ArrowUpTrayIcon class="h-5 w-5 mr-1" />
              เช็คของออก
            </button>

            <!-- ปุ่มเช็คของเข้า -->
            <button
              @click="goToCheckin"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
              :class="{ 'opacity-50 cursor-not-allowed': job.status !== 'IN_PROGRESS' }"
              :disabled="job.status !== 'IN_PROGRESS'"
              :title="
                job.status === 'PENDING'
                  ? 'ต้องเช็คของออกก่อนจึงจะเช็คของเข้าได้'
                  : job.status === 'COMPLETED'
                    ? 'งานนี้ได้เช็คของเข้าเรียบร้อยแล้ว'
                    : ''
              "
            >
              <ArrowDownTrayIcon class="h-5 w-5 mr-1" />
              เช็คของเข้า
            </button>

            <!-- ปุ่มสรุปงาน -->
            <button
              @click="goToSummary"
              class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
              :class="{ 'opacity-50 cursor-not-allowed': job.status !== 'COMPLETED' }"
              :disabled="job.status !== 'COMPLETED'"
              :title="job.status !== 'COMPLETED' ? 'ต้องเช็คของเข้าก่อนจึงจะดูสรุปได้' : ''"
            >
              <DocumentChartBarIcon class="h-5 w-5 mr-1" />
              สรุปงาน
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-gray-700">
              <span class="font-semibold mr-2">รายละเอียด:</span> {{ job.description || '-' }}
            </p>
            <p class="text-gray-700">
              <span class="font-semibold mr-2">สถานที่:</span> {{ job.location || '-' }}
            </p>
          </div>
          <div>
            <p class="text-gray-700">
              <span class="font-semibold mr-2">สถานะ:</span>
              <span
                :class="{
                  'text-yellow-500': job.status === 'PENDING',
                  'text-blue-500': job.status === 'IN_PROGRESS',
                  'text-green-500': job.status === 'COMPLETED',
                }"
              >
                {{ getStatusText(job.status) }}
              </span>
            </p>
            <p class="text-gray-700">
              <span class="font-semibold mr-2">สร้างเมื่อ:</span> {{ formatDate(job.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Job Items Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold flex items-center">
            <ArchiveBoxIcon class="h-5 w-5 mr-2" />
            รายการสิ่งของในงาน
          </h2>
          <button
            @click="openAddItemModal"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon class="h-5 w-5 mr-1" />
            เพิ่มสิ่งของ
          </button>
        </div>

        <!-- Job Items Table -->
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
                  ชื่อ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หมวดหมู่
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หน่วย
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จำนวน
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in jobItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.code || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.category?.name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.item.Unit?.name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="editItem(item)"
                    class="px-2 py-1 bg-blue-100 rounded-md text-blue-500 hover:text-blue-700 mr-3 items-center inline-flex"
                  >
                    <PencilSquareIcon class="h-4 w-4 mr-1" />
                    แก้ไข
                  </button>
                  <button
                    @click="confirmDeleteItem(item)"
                    class="px-2 py-1 bg-red-100 rounded-md text-red-500 hover:text-red-700 inline-flex items-center"
                  >
                    <TrashIcon class="h-4 w-4 mr-1" />
                    ลบ
                  </button>
                </td>
              </tr>
              <tr v-if="jobItems.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  ไม่พบรายการสิ่งของในงานนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="job.checkins && job.checkins.length > 0" class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">ประวัติการคืนอุปกรณ์</h3>

        <div
          v-for="checkin in job.checkins"
          :key="checkin.id"
          class="bg-white shadow overflow-hidden sm:rounded-lg mb-4"
        >
          <div class="px-4 py-5 sm:px-6 bg-gray-50">
            <h4 class="text-md font-medium text-gray-900">
              คืนเมื่อ: {{ formatDate(checkin.createdAt) }}
            </h4>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              โดย: {{ checkin.user?.name || 'ไม่ระบุ' }}
            </p>
          </div>

          <div class="border-t border-gray-200">
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
                    ชื่ออุปกรณ์
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จำนวนที่เบิก
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จำนวนที่คืน
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    หมายเหตุ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in checkin.items" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.item.code || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.item.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.quantity }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.actualQuantity }}</td>
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
                  </td>
                  <td class="px-6 py-4">
                    {{ item.note || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Item Modal -->
    <div
      v-if="showItemModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditMode ? 'แก้ไขจำนวนสิ่งของ' : 'เพิ่มสิ่งของในงาน' }}
        </h2>

        <div v-if="!isEditMode" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">เลือกสิ่งของ</label>

          <div class="relative">
            <div class="flex">
              <input
                v-model="itemSearchQuery"
                type="text"
                placeholder="พิมพ์เพื่อค้นหาสิ่งของ..."
                class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                @input="searchItems"
                @focus="handleInputFocus"
                @keydown.down.prevent="navigateDropdown(1)"
                @keydown.up.prevent="navigateDropdown(-1)"
                @keydown.enter.prevent="selectHighlightedItem"
                @keydown.esc="showItemDropdown = false"
              />
              <button
                @click="toggleDropdown"
                class="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <ArrowPathIcon v-if="isLoadingItems" class="h-5 w-5 animate-spin" />
                <ChevronDownIcon v-else-if="!showItemDropdown" class="h-5 w-5" />
                <ChevronUpIcon v-else class="h-5 w-5" />
              </button>
            </div>

            <!-- Dropdown สำหรับแสดงผลการค้นหา -->
            <div
              v-if="showItemDropdown"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <!-- แสดงสถานะการโหลด -->
              <div v-if="isLoadingItems" class="p-4 text-center text-gray-500">
                <ArrowPathIcon class="h-5 w-5 animate-spin mx-auto mb-2" />
                กำลังโหลดข้อมูล...
              </div>

              <!-- แสดงรายการสิ่งของ -->
              <div
                v-else-if="filteredItems.length > 0"
                v-for="(item, index) in filteredItems"
                :key="item.id"
                @click="selectItem(item)"
                @mouseover="highlightedIndex = index"
                class="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                :class="{ 'bg-blue-50': highlightedIndex === index }"
              >
                <div>
                  <div class="font-medium">
                    {{ item.code ? `${item.code} - ${item.name}` : item.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ item.category?.name || 'ไม่มีหมวดหมู่' }} |
                    {{ item.Unit?.name || 'ไม่มีหน่วย' }}
                  </div>
                </div>
                <div
                  :class="{
                    'text-green-500': item.stock > 0,
                    'text-red-500': item.stock <= 0,
                  }"
                >
                  คงเหลือ: {{ item.stock || 0 }}
                </div>
              </div>

              <!-- แสดงเมื่อไม่พบสิ่งของ -->
              <div v-else class="p-4 text-center text-gray-500">
                {{ itemSearchQuery ? 'ไม่พบสิ่งของที่ค้นหา' : 'ไม่พบสิ่งของในระบบ' }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="mb-4">
          <p class="text-gray-700">
            <span class="font-semibold">สิ่งของ:</span> {{ selectedItem?.name }}
          </p>
        </div>

        <div v-if="selectedItem" class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="text-gray-700">
            <span class="font-semibold">รหัส:</span> {{ selectedItem.code || '-' }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">หมวดหมู่:</span> {{ selectedItem.category?.name || '-' }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">หน่วย:</span> {{ selectedItem.Unit?.name || '-' }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">คงเหลือในคลัง:</span>
            <span
              :class="{
                'text-red-500': selectedItem.stock < itemQuantity,
                'text-green-500': selectedItem.stock >= itemQuantity,
              }"
            >
              {{ selectedItem.stock || 0 }} {{ selectedItem.Unit?.name || 'หน่วย' }}
            </span>
          </p>
          <p
            v-if="selectedItem.stock < itemQuantity"
            class="text-red-500 text-sm mt-1 flex items-center"
          >
            <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
            จำนวนในคลังไม่เพียงพอ
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">จำนวน</label>
          <input
            v-model.number="itemQuantity"
            type="number"
            min="1"
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>

        <div class="flex justify-end">
          <button
            @click="closeItemModal"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2 flex items-center"
          >
            <XMarkIcon class="h-5 w-5 mr-1" />
            ยกเลิก
          </button>
          <button
            @click="saveItem"
            class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center"
            :disabled="!isFormValid || !hasEnoughStock"
          >
            <CheckIcon class="h-5 w-5 mr-1" />
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJobById } from '@/services/job'
import { searchItemsForDropdown } from '@/services/item'
import { getJobItems, addJobItem, updateJobItem, deleteJobItem } from '@/services/jobItem'
import Swal from 'sweetalert2'
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ArchiveBoxIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon,
  DocumentChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'JobDetailView',
  components: {
    ArrowLeftIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    ArchiveBoxIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    CheckIcon,
    DocumentChartBarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowPathIcon,
  },
  data() {
    return {
      job: {},
      jobItems: [],
      availableItems: [],
      loading: true,
      showItemModal: false,
      isEditMode: false,
      selectedItemId: '',
      selectedItem: null,
      itemQuantity: 1,
      editingItemId: null,

      itemSearchQuery: '',
      showItemDropdown: false,
      filteredItems: [],
      highlightedIndex: 0,
      isLoadingItems: false,
    }
  },
  computed: {
    isFormValid() {
      if (this.isEditMode) {
        return this.itemQuantity > 0
      } else {
        return this.selectedItem && this.itemQuantity > 0
      }
    },
    hasEnoughStock() {
      if (!this.selectedItem) return true
      return this.selectedItem.stock >= this.itemQuantity
    },
    canCheckout() {
      return this.job.status === 'PENDING'
    },
    canCheckin() {
      return this.job.status === 'IN_PROGRESS'
    },
    canViewSummary() {
      return this.job.status === 'COMPLETED'
    },
  },
  async created() {
    try {
      await this.loadJobData()
      await this.loadJobItems()
      await this.loadInitialItems()
    } catch (error) {
      console.error('Error loading job details:', error)
      this.showErrorToast('ไม่สามารถโหลดข้อมูลงานได้')
    } finally {
      this.loading = false
    }
  },
  methods: {
    async loadJobData() {
      const jobId = parseInt(this.$route.params.id)
      const response = await fetchJobById(jobId)
      this.job = response.data
    },

    async loadJobItems() {
      const jobId = parseInt(this.$route.params.id)
      const response = await getJobItems(jobId)
      this.jobItems = response.data
    },

    async loadInitialItems() {
      try {
        this.isLoadingItems = true
        const response = await searchItemsForDropdown('')
        if (response && response.data) {
          this.availableItems = response.data
          this.filteredItems = [...this.availableItems]
        }
      } catch (error) {
        console.error('Error loading initial items:', error)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ไม่สามารถโหลดข้อมูลสิ่งของได้',
          showConfirmButton: false,
          timer: 3000,
        })
      } finally {
        this.isLoadingItems = false
      }
    },

    async searchItems() {
      try {
        if (!this.itemSearchQuery) {
          await this.loadInitialItems()
          return
        }

        this.isLoadingItems = true
        const response = await searchItemsForDropdown(this.itemSearchQuery)

        if (response && response.data) {
          this.filteredItems = response.data
        } else {
          this.filteredItems = []
        }

        this.highlightedIndex = 0
        this.showItemDropdown = true
      } catch (error) {
        console.error('Error searching items:', error)
        const query = this.itemSearchQuery.toLowerCase()
        this.filteredItems = this.availableItems.filter((item) => {
          return (
            (item.code && item.code.toLowerCase().includes(query)) ||
            item.name.toLowerCase().includes(query) ||
            (item.category?.name && item.category.name.toLowerCase().includes(query))
          )
        })
      } finally {
        this.isLoadingItems = false
      }
    },

    selectItem(item) {
      this.selectedItem = item
      this.selectedItemId = item.id
      this.itemSearchQuery = item.code ? `${item.code} - ${item.name}` : item.name
      this.showItemDropdown = false
    },

    navigateDropdown(direction) {
      const newIndex = this.highlightedIndex + direction
      if (newIndex >= 0 && newIndex < this.filteredItems.length) {
        this.highlightedIndex = newIndex

        this.$nextTick(() => {
          const dropdown = document.querySelector('.overflow-y-auto')
          const highlighted = dropdown.children[this.highlightedIndex]
          if (highlighted) {
            if (highlighted.offsetTop < dropdown.scrollTop) {
              dropdown.scrollTop = highlighted.offsetTop
            } else if (
              highlighted.offsetTop + highlighted.clientHeight >
              dropdown.scrollTop + dropdown.clientHeight
            ) {
              dropdown.scrollTop =
                highlighted.offsetTop + highlighted.clientHeight - dropdown.clientHeight
            }
          }
        })
      }
    },

    selectHighlightedItem() {
      if (this.filteredItems.length > 0) {
        this.selectItem(this.filteredItems[this.highlightedIndex])
      }
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

    getStatusText(status) {
      const statusMap = {
        PENDING: 'รอดำเนินการ',
        IN_PROGRESS: 'กำลังดำเนินการ',
        COMPLETED: 'เสร็จสิ้น',
      }
      return statusMap[status] || status
    },

    openAddItemModal() {
      this.isEditMode = false
      this.selectedItemId = ''
      this.selectedItem = null
      this.itemQuantity = 1
      this.editingItemId = null
      this.itemSearchQuery = ''
      this.showItemDropdown = false
      this.showItemModal = true

      this.loadInitialItems()
    },

    editItem(item) {
      this.isEditMode = true
      this.selectedItem = item.item
      this.selectedItemId = item.item.id
      this.itemQuantity = item.quantity
      this.editingItemId = item.id
      this.showItemModal = true
    },

    closeItemModal() {
      this.showItemModal = false
    },

    updateSelectedItem() {
      this.selectedItem = this.availableItems.find((item) => item.id === this.selectedItemId)
    },

    async saveItem() {
      try {
        if (this.isEditMode) {
          await updateJobItem(this.editingItemId, {
            quantity: this.itemQuantity,
          })
        } else {
          await addJobItem({
            jobId: this.job.id,
            itemId: this.selectedItemId,
            quantity: this.itemQuantity,
          })
        }

        this.closeItemModal()
        await this.loadJobItems()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: this.isEditMode ? 'แก้ไขสิ่งของสำเร็จ' : 'เพิ่มสิ่งของสำเร็จ',
          showConfirmButton: false,
          timer: 3000,
        })
      } catch (error) {
        console.error('Error saving item:', error)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ไม่สามารถบันทึกข้อมูลได้',
          showConfirmButton: false,
          timer: 3000,
        })
      }
    },

    async confirmDeleteItem(item) {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `คุณต้องการลบ "${item.item.name}" ออกจากงานนี้ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (result.isConfirmed) {
        await this.deleteItem(item.id)
      }
    },

    async deleteItem(itemId) {
      try {
        await deleteJobItem(itemId)
        this.showSuccessToast('ลบสิ่งของสำเร็จ')
        await this.loadJobItems()
        await this.loadInitialItems()
      } catch (error) {
        console.error('Error deleting job item:', error)
        this.showErrorToast('ไม่สามารถลบสิ่งของได้')
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

    goToCheckout() {
      if (this.job.status !== 'PENDING') {
        this.showErrorToast('งานนี้ได้เช็คของออกไปแล้ว ไม่สามารถเช็คของออกซ้ำได้')
        return
      }
      this.$router.push(`/jobs/${this.job.id}/checkout`)
    },

    goToCheckin() {
      if (this.job.status === 'PENDING') {
        this.showErrorToast('ต้องเช็คของออกก่อนจึงจะเช็คของเข้าได้')
        return
      }
      if (this.job.status === 'COMPLETED') {
        this.showErrorToast('งานนี้ได้เช็คของเข้าเรียบร้อยแล้ว ไม่สามารถเช็คของเข้าซ้ำได้')
        return
      }
      this.$router.push(`/jobs/${this.job.id}/checkin`)
    },

    goToSummary() {
      if (this.job.status !== 'COMPLETED') {
        this.showErrorToast('ต้องเช็คของเข้าก่อนจึงจะดูสรุปได้')
        return
      }
      this.$router.push(`/jobs/${this.job.id}/summary`)
    },

    handleInputFocus() {
      this.showItemDropdown = true

      if (!this.isLoadingItems) {
        this.loadInitialItems()
      }
    },

    toggleDropdown() {
      this.showItemDropdown = !this.showItemDropdown

      if (this.showItemDropdown && !this.isLoadingItems) {
        this.loadInitialItems()
      }
    },
  },
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>
