<template>
  <div class="p-2">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <h1 class="text-xl font-semibold flex items-center">
        <ArchiveBoxIcon class="h-6 w-6 mr-2 text-gray-700" />
        รายการสิ่งของ
      </h1>

      <div class="flex flex-wrap gap-2 items-center">
        <div class="flex items-center gap-2">
          <label
            class="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 flex items-center"
          >
            <DocumentArrowUpIcon class="h-5 w-5 mr-1" />
            <input type="file" @change="handleFileSelect" class="hidden" />
            เลือกไฟล์
          </label>
          <span v-if="selectedFile" class="text-sm text-gray-600 truncate w-32">
            {{ selectedFile.name }}
          </span>
          <button
            @click="uploadFile"
            :disabled="!selectedFile"
            class="px-4 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowUpTrayIcon class="h-5 w-5 mr-1" />
            อัปโหลด
          </button>
        </div>

        <button
          @click="addItem"
          class="px-4 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center"
        >
          <PlusIcon class="h-5 w-5 mr-1" />
          เพิ่มสินค้าใหม่
        </button>

        <button
          @click="navigateToCategoryUnitManagement"
          class="px-4 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition flex items-center"
        >
          <TagIcon class="h-5 w-5 mr-1" />
          จัดการหมวดหมู่และหน่วยนับ
        </button>
      </div>
    </div>

    <!-- ค้นหา -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="ค้นหาสิ่งของ (ชื่อ, รหัส, หมวดหมู่)"
            class="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div class="flex gap-2">
        <select
          v-model="categoryFilter"
          @change="handleSearch"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">ทุกหมวดหมู่</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="typeFilter"
          @change="handleSearch"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">ทุกประเภท</option>
          <option value="true">สิ้นเปลือง</option>
          <option value="false">ไม่สิ้นเปลือง</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border bg-white shadow rounded text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2">รหัส</th>
            <th class="px-4 py-2">ชื่อ</th>
            <th class="px-4 py-2">หมวดหมู่</th>
            <th class="px-4 py-2 whitespace-nowrap">รายละเอียด</th>
            <th class="px-4 py-2">ประเภท</th>
            <th class="px-4 py-2">สร้างเมื่อ</th>
            <th class="px-4 py-2">จำนวน</th>
            <th class="px-4 py-2">หน่วย</th>
            <th class="px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-2 whitespace-nowrap">{{ item.code || '-' }}</td>
            <td class="px-4 py-2">{{ item.name }}</td>
            <td class="px-4 py-2 whitespace-nowrap">{{ item.category?.name }}</td>
            <td class="px-4 py-2 truncate max-w-[180px]">{{ item.description || '-' }}</td>
            <td class="px-4 py-2 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs whitespace-nowrap',
                  item.isConsumable ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ item.isConsumable ? 'สิ้นเปลือง' : 'ไม่สิ้นเปลือง' }}
              </span>
            </td>
            <td class="px-4 py-2 text-right whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
            <td class="px-4 py-2">{{ item.stock }}</td>
            <td class="px-4 py-2">{{ item.Unit?.name }}</td>
            <td class="px-4 py-2 whitespace-nowrap">
              <button
                @click="editItem(item)"
                class="px-2 py-1 bg-blue-100 rounded-md text-blue-500 hover:underline inline-flex items-center"
              >
                <PencilSquareIcon class="h-4 w-4 mr-1" />
                แก้ไข
              </button>
              <button
                @click="deleteItem(item.id)"
                class="px-2 py-1 bg-red-100 rounded-md text-red-500 hover:underline ml-2 inline-flex items-center"
              >
                <TrashIcon class="h-4 w-4 mr-1" />
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 bg-gray-100 p-4 rounded-md"
    >
      <!-- จำนวนต่อหน้า -->
      <div class="flex items-center gap-2">
        <label for="itemsPerPage" class="text-sm whitespace-nowrap">แสดง:</label>
        <select
          id="itemsPerPage"
          v-model="itemsPerPage"
          @change="loadItems"
          class="rounded-md text-sm py-1 px-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="option in [10, 20, 50, 100]" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <!-- Pagination -->
      <div class="flex items-center gap-2 text-sm">
        <button
          class="bg-gray-500 px-3 py-1 rounded-md text-white flex items-center disabled:opacity-50"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-1" />
          ก่อนหน้า
        </button>
        <span class="whitespace-nowrap">หน้า {{ currentPage }}</span>
        <button
          class="bg-gray-500 px-3 py-1 rounded-md text-white flex items-center disabled:opacity-50"
          @click="nextPage"
          :disabled="!hasMoreItems"
        >
          ถัดไป
          <ChevronRightIcon class="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>

    <!-- Modal  -->
    <ItemModal
      :show="showModal"
      :isEditMode="isEditMode"
      :form="form"
      :categories="categories"
      :units="units"
      @save="saveNewItem"
      @update="updateItem"
      @close="closeModal"
    />
  </div>
</template>

<script>
import {
  fetchItems,
  importExcel,
  fetchCategories,
  fetchUnits,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
} from '@/services/item'
import Swal from 'sweetalert2'
import ItemModal from '@/components/modal/ItemModal.vue'
import {
  ArchiveBoxIcon,
  DocumentArrowUpIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  TagIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

export default {
  name: 'ItemListView',
  components: {
    ItemModal,
    ArchiveBoxIcon,
    DocumentArrowUpIcon,
    ArrowUpTrayIcon,
    PlusIcon,
    TagIcon,
    PencilSquareIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
  },
  data() {
    return {
      items: [],
      categories: [],
      units: [],
      selectedFile: null,
      currentPage: 1,
      itemsPerPage: 10,
      hasMoreItems: true,
      showModal: false,
      isEditMode: false,
      form: {
        id: null,
        name: '',
        code: '',
        stock: 0,
        description: '',
        categoryId: null,
        unitId: null,
        isConsumable: false,
      },
      searchQuery: '',
      categoryFilter: '',
      typeFilter: '',
      searchTimeout: null,
    }
  },
  methods: {
    async loadItems() {
      try {
        const res = await fetchItems(this.currentPage, this.itemsPerPage)
        this.items = res.data
        this.hasMoreItems = res.data.length === this.itemsPerPage
      } catch (err) {
        console.error('Load items error:', err)
        Swal.fire({
          icon: 'error',
          title: 'โหลดข้อมูลล้มเหลว',
          text: 'ไม่สามารถโหลดรายการสิ่งของได้',
        })
      }
    },
    async loadCategoriesAndUnits() {
      try {
        const [categoriesRes, unitsRes] = await Promise.all([fetchCategories(), fetchUnits()])
        this.categories = categoriesRes.data
        this.units = unitsRes.data
      } catch (err) {
        console.error('Load error:', err)
        Swal.fire({
          icon: 'error',
          title: 'โหลดข้อมูลล้มเหลว',
          text: 'ไม่สามารถโหลดหมวดหมู่หรือหน่วยได้',
        })
      }
    },
    handleFileSelect(e) {
      this.selectedFile = e.target.files[0]
    },
    async uploadFile() {
      if (!this.selectedFile) return

      const confirm = await Swal.fire({
        title: 'ยืนยันการนำเข้า',
        text: 'คุณต้องการนำเข้าข้อมูลจากไฟล์ Excel ใช่หรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, นำเข้าเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (!confirm.isConfirmed) return

      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const response = await importExcel(formData)
        console.log('API Response:', response)
        await this.loadItems()

        if (response.data.summary.errors > 0 && response.data.errorDetails) {
          let errorHTML = `
            <div class="text-left">
              <p class="font-semibold mb-2">สรุปผลการนำเข้า:</p>
              <ul class="mb-4">
                <li>จำนวนทั้งหมด: ${response.data.summary.total} รายการ</li>
                <li>นำเข้าสำเร็จ: ${response.data.summary.created} รายการ</li>
                <li>ข้ามการนำเข้า: ${response.data.summary.skipped} รายการ</li>
                <li class="text-red-600">ผิดพลาด: ${response.data.summary.errors} รายการ</li>
              </ul>
              <p class="font-semibold mb-2 text-red-600">รายละเอียดข้อผิดพลาด:</p>
              <div class="max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr>
                      <th class="text-left p-1">ลำดับ</th>
                      <th class="text-left p-1">ข้อมูล</th>
                      <th class="text-left p-1">สาเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
          `

          response.data.errorDetails.forEach((error, index) => {
            const getMissingFieldClass = (fieldName) => {
              if (error.missingFields && error.missingFields.includes(fieldName)) {
                return 'bg-red-100 text-red-700 font-semibold'
              }
              return ''
            }

            errorHTML += `
              <tr class="border-t border-gray-200">
                <td class="p-1">${index + 1}</td>
                <td class="p-1">
                  ${
                    error.item
                      ? `
                    <div class="font-semibold text-red-600">แถวที่: ${error.rowNumber || 'ไม่ระบุ'}</div>
                    <div>รหัส: ${error.item.code || '-'}</div>
                    <div class="${getMissingFieldClass('ชื่อสินค้า')}">ชื่อ: ${error.item.name || '<span class="text-red-600">ไม่ระบุ</span>'}</div>
                    <div class="${getMissingFieldClass('หมวดหมู่')}">หมวดหมู่: ${error.item.categoryName || '<span class="text-red-600">ไม่ระบุ</span>'}</div>
                    <div class="${getMissingFieldClass('หน่วย')}">หน่วย: ${error.item.unitName || '<span class="text-red-600">ไม่ระบุ</span>'}</div>
                    <div>จำนวน: ${error.item.stock || '-'}</div>
                  `
                      : '-'
                  }
                </td>
                <td class="p-1 text-red-600">${error.reason}</td>
              </tr>
            `
          })

          errorHTML += `
                  </tbody>
                </table>
              </div>
            </div>
          `

          await Swal.fire({
            title: 'นำเข้าเสร็จสิ้น (มีข้อผิดพลาด)',
            html: errorHTML,
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            width: '800px',
          })
        } else {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'นำเข้าเสร็จแล้ว!',
            html: `
              <div class="text-left">
                <ul>
                  <li>จำนวนทั้งหมด: ${response.data.summary.total} รายการ</li>
                  <li>นำเข้าสำเร็จ: ${response.data.summary.created} รายการ</li>
                  <li>ข้ามการนำเข้า: ${response.data.summary.skipped} รายการ</li>
                </ul>
              </div>
            `,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          })
        }
      } catch (err) {
        console.error('Import error:', err)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'นำเข้าล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการนำเข้า',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      } finally {
        this.selectedFile = null
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''
      }
    },
    addItem() {
      this.isEditMode = false
      this.form = {
        id: null,
        name: '',
        code: '',
        stock: 0,
        description: '',
        categoryId: null,
        unitId: null,
        isConsumable: false,
      }
      this.showModal = true
    },
    editItem(item) {
      this.isEditMode = true
      this.form = {
        id: item.id,
        name: item.name,
        code: item.code,
        stock: item.stock,
        description: item.description,
        categoryId: item.category ? item.category.id : null,
        unitId: item.Unit ? item.Unit.id : null,
        isConsumable: item.isConsumable,
      }
      this.showModal = true
    },
    async saveNewItem(form) {
      const result = await Swal.fire({
        title: 'ยืนยันการเพิ่มสินค้า',
        text: 'คุณต้องการเพิ่มสินค้านี้ใช่หรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, เพิ่มเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (!result.isConfirmed) return

      try {
        await createItem(form)
        await this.loadItems()
        this.closeModal()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'เพิ่มสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'เพิ่มสินค้าล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    },

    async updateItem(form) {
      const result = await Swal.fire({
        title: 'ยืนยันการแก้ไขสินค้า',
        text: 'คุณต้องการแก้ไขสินค้านี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, แก้ไขเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (!result.isConfirmed) return

      try {
        await updateItem(form.id, form)
        await this.loadItems()
        this.closeModal()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'แก้ไขสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'แก้ไขสินค้าล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขสินค้า',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    },

    closeModal() {
      this.showModal = false
    },
    async deleteItem(id) {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e3342f',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (!result.isConfirmed) return

      try {
        await deleteItem(id)
        await this.loadItems()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'ลบสินค้าสำเร็จ',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        console.error('Delete error:', err)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ลบสินค้าล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบสินค้า',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    },
    navigateToCategoryUnitManagement() {
      this.$router.push('/category-unit-management')
    },
    handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.searchItems()
      }, 300)
    },
    async searchItems() {
      try {
        if (!this.searchQuery && !this.categoryFilter && !this.typeFilter) {
          return this.loadItems()
        }

        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
          query: this.searchQuery,
          categoryId: this.categoryFilter || undefined,
          isConsumable: this.typeFilter !== '' ? this.typeFilter === 'true' : undefined,
        }

        const res = await searchItems(params)
        this.items = res.data
        this.hasMoreItems = res.data.length === this.itemsPerPage
      } catch (err) {
        console.error('Search error:', err)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'ค้นหาล้มเหลว',
          text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการค้นหา',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        if (this.searchQuery || this.categoryFilter || this.typeFilter) {
          this.searchItems()
        } else {
          this.loadItems()
        }
      }
    },
    nextPage() {
      if (this.hasMoreItems) {
        this.currentPage++
        if (this.searchQuery || this.categoryFilter || this.typeFilter) {
          this.searchItems()
        } else {
          this.loadItems()
        }
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
  },
  async mounted() {
    await Promise.all([this.loadItems(), this.loadCategoriesAndUnits()])
  },
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition;
}
</style>
