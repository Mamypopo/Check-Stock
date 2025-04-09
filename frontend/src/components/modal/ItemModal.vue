<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 px-4"
  >
    <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEditMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}
      </h2>
      <form @submit.prevent="isEditMode ? update() : save()">
        <!-- ชื่อสินค้า -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">ชื่อสินค้า</label>
          <input
            v-model="localForm.name"
            type="text"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            required
          />
        </div>

        <!-- รหัสสินค้า -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">รหัสสิ่งของ</label>
          <input
            v-model="localForm.code"
            type="text"
            class="mt-1 px-2 p-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            required
          />
        </div>

        <!-- จำนวน -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">จำนวน</label>
          <input
            v-model="localForm.stock"
            type="number"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            required
          />
        </div>

        <!-- คำอธิบาย -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">คำอธิบาย</label>
          <textarea
            v-model="localForm.description"
            class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          ></textarea>
        </div>

        <!-- หมวดหมู่ -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">หมวดหมู่</label>
          <div class="relative">
            <input
              v-model="categorySearchQuery"
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              @focus="showCategoryDropdown = true"
              @blur="handleCategoryBlur"
            />
            <div
              v-if="showCategoryDropdown"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              <div
                v-for="category in filteredCategories"
                :key="category.id"
                @click="selectCategory(category)"
                class="p-2 hover:bg-blue-50 cursor-pointer"
              >
                {{ category.name }}
              </div>
              <div v-if="filteredCategories.length === 0" class="p-2 text-gray-500 text-center">
                ไม่พบหมวดหมู่
              </div>
            </div>
          </div>
          <div v-if="selectedCategory" class="mt-2 text-sm text-blue-600">
            หมวดหมู่ที่เลือก: {{ selectedCategory.name }}
          </div>
        </div>
        <p class="text-end mt-2 text-sm text-blue-600">
          <router-link to="/category-unit-management">สร้างหน่วยหรือหมวดหมู่</router-link>
        </p>
        <!-- หน่วย -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">หน่วย</label>
          <div class="relative">
            <input
              v-model="unitSearchQuery"
              type="text"
              placeholder="ค้นหาหน่วย..."
              class="mt-1 px-2 py-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              @focus="showUnitDropdown = true"
              @blur="handleUnitBlur"
            />
            <div
              v-if="showUnitDropdown"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              <div
                v-for="unit in filteredUnits"
                :key="unit.id"
                @click="selectUnit(unit)"
                class="p-2 hover:bg-blue-50 cursor-pointer"
              >
                {{ unit.name }}
              </div>
              <div v-if="filteredUnits.length === 0" class="p-2 text-gray-500 text-center">
                ไม่พบหน่วย
              </div>
            </div>
          </div>
          <div v-if="selectedUnit" class="mt-2 text-sm text-blue-600">
            หน่วยที่เลือก: {{ selectedUnit.name }}
          </div>
        </div>

        <!-- สิ้นเปลือง -->
        <div class="mb-4">
          <label class="inline-flex items-center">
            <input type="checkbox" v-model="localForm.isConsumable" class="form-checkbox" />
            <span class="ml-2">เป็นของสิ้นเปลือง</span>
          </label>
        </div>

        <!-- ปุ่ม -->
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
            {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสิ่งของ' }}
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
    form: Object,
    categories: Array,
    units: Array,
  },
  data() {
    return {
      localForm: { ...this.form },
      categorySearchQuery: '',
      unitSearchQuery: '',
      showCategoryDropdown: false,
      showUnitDropdown: false,
      selectedCategory: null,
      selectedUnit: null,
    }
  },
  computed: {
    filteredCategories() {
      if (!this.categorySearchQuery) {
        return this.categories
      }
      const query = this.categorySearchQuery.toLowerCase()
      return this.categories.filter((category) => category.name.toLowerCase().includes(query))
    },
    filteredUnits() {
      if (!this.unitSearchQuery) {
        return this.units
      }
      const query = this.unitSearchQuery.toLowerCase()
      return this.units.filter((unit) => unit.name.toLowerCase().includes(query))
    },
  },
  watch: {
    form: {
      handler(newForm) {
        this.localForm = { ...newForm }

        if (newForm.categoryId) {
          this.selectedCategory = this.categories.find((c) => c.id === newForm.categoryId) || null
          this.categorySearchQuery = this.selectedCategory ? this.selectedCategory.name : ''
        } else {
          this.selectedCategory = null
          this.categorySearchQuery = ''
        }

        if (newForm.unitId) {
          this.selectedUnit = this.units.find((u) => u.id === newForm.unitId) || null
          this.unitSearchQuery = this.selectedUnit ? this.selectedUnit.name : ''
        } else {
          this.selectedUnit = null
          this.unitSearchQuery = ''
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleCategoryBlur() {
      setTimeout(() => {
        this.showCategoryDropdown = false
      }, 200)
    },
    handleUnitBlur() {
      setTimeout(() => {
        this.showUnitDropdown = false
      }, 200)
    },
    selectCategory(category) {
      this.selectedCategory = category
      this.localForm.categoryId = category.id
      this.categorySearchQuery = category.name
      this.showCategoryDropdown = false
    },
    selectUnit(unit) {
      this.selectedUnit = unit
      this.localForm.unitId = unit.id
      this.unitSearchQuery = unit.name
      this.showUnitDropdown = false
    },
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
