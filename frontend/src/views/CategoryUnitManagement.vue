<template>
  <div class="p-2">
    <h1 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
      <TagIcon class="h-6 w-6 mr-2 text-gray-700" />
      จัดการหน่วยนับและหมวดหมู่
    </h1>

    <!-- หน่วยนับ -->
    <div class="mb-10">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-3">
        <h2 class="text-xl font-semibold text-gray-700 flex items-center">
          <ScaleIcon class="h-5 w-5 mr-2 text-gray-600" />
          หน่วยนับ
        </h2>
        <div
          class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <!-- ช่องค้นหาหน่วยนับ -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="unitSearchQuery"
              type="text"
              placeholder="ค้นหาหน่วยนับ..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              @input="searchUnits"
            />
            <MagnifyingGlassIcon
              v-if="!unitSearchQuery"
              class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            />
            <XMarkIcon
              v-else
              class="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              @click="clearUnitSearch"
            />
          </div>
          <button
            @click="openUnitModal"
            class="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 flex items-center w-full sm:w-auto justify-center"
          >
            <PlusIcon class="h-5 w-5 mr-1" />
            เพิ่มหน่วยนับ
          </button>
        </div>
      </div>

      <div class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-gray-700 text-left">
            <tr>
              <th class="px-6 py-3">ชื่อหน่วย</th>
              <th class="px-6 py-3">สร้างเมื่อ</th>
              <th class="px-6 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="filteredUnits.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลหน่วยนับ</td>
            </tr>
            <tr v-for="unit in paginatedUnits" :key="unit.id" class="hover:bg-gray-50">
              <td class="px-6 py-3 whitespace-nowrap">{{ unit.name }}</td>
              <td class="px-6 py-3 whitespace-nowrap">{{ formatDate(unit.createdAt) }}</td>
              <td class="px-6 py-3 space-x-2 text-center whitespace-nowrap">
                <button
                  @click="editUnit(unit)"
                  class="px-2 py-1 bg-blue-100 rounded-md text-blue-500 hover:underline inline-flex items-center"
                >
                  <PencilSquareIcon class="h-4 w-4 mr-1" />
                  แก้ไข
                </button>
                <button
                  @click="deleteUnit(unit.id)"
                  class="px-2 py-1 bg-red-100 rounded-md text-red-500 hover:underline inline-flex items-center"
                >
                  <TrashIcon class="h-4 w-4 mr-1" />
                  ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600">
          แสดง {{ filteredUnits.length > 0 ? (currentUnitPage - 1) * unitsPerPage + 1 : 0 }} ถึง
          {{ Math.min(currentUnitPage * unitsPerPage, filteredUnits.length) }} จากทั้งหมด
          {{ filteredUnits.length }} รายการ
        </div>
        <div class="flex space-x-2">
          <button
            @click="changeUnitPage(currentUnitPage - 1)"
            :disabled="currentUnitPage === 1"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          >
            <ChevronLeftIcon class="h-4 w-4 mr-1" />
            ก่อนหน้า
          </button>
          <span class="text-gray-700 text-sm">หน้า {{ currentUnitPage }}</span>
          <button
            @click="changeUnitPage(currentUnitPage + 1)"
            :disabled="currentUnitPage === totalUnitPages"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          >
            ถัดไป
            <ChevronRightIcon class="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <!-- หมวดหมู่ -->
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-center mb-3">
        <h2 class="text-xl font-semibold text-gray-700 flex items-center">
          <FolderIcon class="h-5 w-5 mr-2 text-gray-600" />
          หมวดหมู่
        </h2>
        <div
          class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <!-- ช่องค้นหาหมวดหมู่ -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="categorySearchQuery"
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              @input="searchCategories"
            />
            <MagnifyingGlassIcon
              v-if="!categorySearchQuery"
              class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            />
            <XMarkIcon
              v-else
              class="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              @click="clearCategorySearch"
            />
          </div>
          <button
            @click="openCategoryModal"
            class="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 flex items-center w-full sm:w-auto justify-center"
          >
            <PlusIcon class="h-5 w-5 mr-1" />
            เพิ่มหมวดหมู่
          </button>
        </div>
      </div>

      <div class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-gray-700 text-left">
            <tr>
              <th class="px-6 py-3">ชื่อหมวดหมู่</th>
              <th class="px-6 py-3">สร้างเมื่อ</th>
              <th class="px-6 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="filteredCategories.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลหมวดหมู่</td>
            </tr>
            <tr v-for="category in paginatedCategories" :key="category.id" class="hover:bg-gray-50">
              <td class="px-6 py-3 whitespace-nowrap">{{ category.name }}</td>
              <td class="px-6 py-3 whitespace-nowrap">{{ formatDate(category.createdAt) }}</td>
              <td class="px-6 py-3 space-x-2 text-center whitespace-nowrap">
                <button
                  @click="editCategory(category)"
                  class="px-2 py-1 bg-blue-100 rounded-md text-blue-500 hover:underline inline-flex items-center"
                >
                  <PencilSquareIcon class="h-4 w-4 mr-1" />
                  แก้ไข
                </button>
                <button
                  @click="deleteCategory(category.id)"
                  class="px-2 py-1 bg-red-100 rounded-md text-red-500 hover:underline inline-flex items-center"
                >
                  <TrashIcon class="h-4 w-4 mr-1" />
                  ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600">
          แสดง
          {{
            filteredCategories.length > 0 ? (currentCategoryPage - 1) * categoriesPerPage + 1 : 0
          }}
          ถึง
          {{ Math.min(currentCategoryPage * categoriesPerPage, filteredCategories.length) }}
          จากทั้งหมด {{ filteredCategories.length }} รายการ
        </div>
        <div class="flex space-x-2">
          <button
            @click="changeCategoryPage(currentCategoryPage - 1)"
            :disabled="currentCategoryPage === 1"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          >
            <ChevronLeftIcon class="h-4 w-4 mr-1" />
            ก่อนหน้า
          </button>
          <span class="text-gray-700 text-sm">หน้า {{ currentCategoryPage }}</span>
          <button
            @click="changeCategoryPage(currentCategoryPage + 1)"
            :disabled="currentCategoryPage === totalCategoryPages"
            class="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded disabled:opacity-50 flex items-center"
          >
            ถัดไป
            <ChevronRightIcon class="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <CategoryUnitModal
      :show="showModal"
      :isEditMode="isEditMode"
      :type="modalType"
      :form="form"
      @save="save"
      @update="update"
      @close="closeModal"
    />
  </div>
</template>

<script>
import {
  fetchCategories,
  fetchUnits,
  createCategory,
  updateCategory,
  deleteCategory,
  createUnit,
  updateUnit,
  deleteUnit,
} from '@/services/item'
import CategoryUnitModal from '@/components/modal/CategoryUnitModal.vue'
import Swal from 'sweetalert2'
import {
  TagIcon,
  ScaleIcon,
  FolderIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

export default {
  components: {
    CategoryUnitModal,
    TagIcon,
    ScaleIcon,
    FolderIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
  },
  data() {
    return {
      units: [],
      categories: [],
      showModal: false,
      isEditMode: false,
      modalType: '',
      isSubmitting: false,
      form: { id: null, name: '' },
      currentUnitPage: 1,
      currentCategoryPage: 1,
      itemsPerPage: 10,
      unitSearchQuery: '',
      categorySearchQuery: '',
      filteredUnits: [],
      filteredCategories: [],
      unitsPerPage: 10,
      categoriesPerPage: 10,
    }
  },
  computed: {
    paginatedUnits() {
      const start = (this.currentUnitPage - 1) * this.unitsPerPage
      const end = start + this.unitsPerPage
      return this.filteredUnits.slice(start, end)
    },
    paginatedCategories() {
      const start = (this.currentCategoryPage - 1) * this.categoriesPerPage
      const end = start + this.categoriesPerPage
      return this.filteredCategories.slice(start, end)
    },
    totalUnitPages() {
      return Math.ceil(this.filteredUnits.length / this.unitsPerPage)
    },
    totalCategoryPages() {
      return Math.ceil(this.filteredCategories.length / this.categoriesPerPage)
    },
  },
  methods: {
    async loadUnitsAndCategories() {
      try {
        const [unitsRes, categoriesRes] = await Promise.all([fetchUnits(), fetchCategories()])
        this.units = unitsRes.data
        this.categories = categoriesRes.data
        this.filteredUnits = [...this.units]
        this.filteredCategories = [...this.categories]
      } catch (err) {
        console.error('Error loading units and categories:', err)
      }
    },
    openUnitModal() {
      this.isEditMode = false
      this.modalType = 'หน่วยนับ'
      this.form = { id: null, name: '' }
      this.showModal = true
    },
    openCategoryModal() {
      this.isEditMode = false
      this.modalType = 'หมวดหมู่'
      this.form = { id: null, name: '' }
      this.showModal = true
    },
    editUnit(unit) {
      this.isEditMode = true
      this.modalType = 'หน่วยนับ'
      this.form = { ...unit }
      this.showModal = true
    },
    editCategory(category) {
      this.isEditMode = true
      this.modalType = 'หมวดหมู่'
      this.form = { ...category }
      this.showModal = true
    },
    async save(form) {
      try {
        const confirm = await Swal.fire({
          title: 'ยืนยันการบันทึก',
          text: `คุณต้องการเพิ่ม${this.modalType}นี้ใช่หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ใช่',
          confirmButtonColor: '#10B981',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
        })

        if (!confirm.isConfirmed) return
        this.isSubmitting = true
        if (this.modalType === 'หน่วยนับ') {
          await createUnit(form)
        } else {
          await createCategory(form)
        }

        await this.loadUnitsAndCategories()
        this.closeModal()

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `${this.modalType}ถูกเพิ่มเรียบร้อยแล้ว`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        console.error('Error saving:', err)
        if (err.response?.data?.existingUnit || err.response?.data?.existingCategory) {
          const dup = err.response.data.existingUnit || err.response.data.existingCategory
          Swal.fire({
            title: 'ชื่อซ้ำกัน',
            html: `ชื่อ <b>${dup.name}</b> มีอยู่แล้วในระบบ`,
            icon: 'warning',
            confirmButtonText: 'ตกลง',
          })
          return
        }

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.error || err.message || 'ไม่สามารถบันทึกได้',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        })
      } finally {
        this.isSubmitting = false
      }
    },

    async update(form) {
      try {
        const confirm = await Swal.fire({
          title: 'ยืนยันการแก้ไข',
          text: `คุณต้องการแก้ไข${this.modalType}นี้ใช่หรือไม่?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่',
          confirmButtonColor: '#10B981',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
        })

        if (!confirm.isConfirmed) return

        if (this.modalType === 'หน่วยนับ') {
          await updateUnit(form.id, form)
        } else {
          await updateCategory(form.id, form)
        }

        await this.loadUnitsAndCategories()
        this.closeModal()

        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          text: `${this.modalType}ถูกแก้ไขเรียบร้อยแล้ว`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        console.error('Error updating:', err)
        Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถแก้ไขได้', 'error')
      }
    },

    async deleteUnit(id) {
      try {
        const confirm = await Swal.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยนับนี้?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่, ลบเลย!',
          confirmButtonColor: '#d33',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#3085d6',
        })

        if (!confirm.isConfirmed) return

        await deleteUnit(id)
        await this.loadUnitsAndCategories()

        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'หน่วยนับถูกลบเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        console.error('Error deleting unit:', err)
        Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบได้', 'error')
      }
    },

    async deleteCategory(id) {
      try {
        const confirm = await Swal.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่, ลบเลย!',
          confirmButtonColor: '#d33',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#3085d6',
        })

        if (!confirm.isConfirmed) return

        await deleteCategory(id)
        await this.loadUnitsAndCategories()

        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'หมวดหมู่ถูกลบเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      } catch (err) {
        console.error('Error deleting category:', err)
        Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบได้', 'error')
      }
    },
    closeModal() {
      this.showModal = false
    },
    changeUnitPage(page) {
      if (page > 0 && page <= this.totalUnitPages) {
        this.currentUnitPage = page
      }
    },
    changeCategoryPage(page) {
      if (page > 0 && page <= this.totalCategoryPages) {
        this.currentCategoryPage = page
      }
    },

    formatDate(datetime) {
      if (!datetime) return '-'
      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }

      const date = new Date(datetime)
      return date.toLocaleString('th-TH', options)
    },

    searchUnits() {
      if (!this.unitSearchQuery) {
        this.filteredUnits = [...this.units]
      } else {
        const query = this.unitSearchQuery.toLowerCase()
        this.filteredUnits = this.units.filter((unit) => unit.name.toLowerCase().includes(query))
      }
      this.currentUnitPage = 1
    },

    clearUnitSearch() {
      this.unitSearchQuery = ''
      this.searchUnits()
    },

    searchCategories() {
      if (!this.categorySearchQuery) {
        this.filteredCategories = [...this.categories]
      } else {
        const query = this.categorySearchQuery.toLowerCase()
        this.filteredCategories = this.categories.filter((category) =>
          category.name.toLowerCase().includes(query),
        )
      }
      this.currentCategoryPage = 1
    },

    clearCategorySearch() {
      this.categorySearchQuery = ''
      this.searchCategories()
    },
  },
  mounted() {
    this.loadUnitsAndCategories()
  },
}
</script>

<style scoped>
@media (max-width: 640px) {
  .flex-col {
    flex-direction: column;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
}
</style>
