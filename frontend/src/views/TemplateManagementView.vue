<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
      <DocumentDuplicateIcon class="h-6 w-6 mr-2 text-gray-700" />
      จัดการเทมเพลต
    </h1>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <!-- Header with search and add button -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div class="relative w-full md:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาเทมเพลต..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            @input="filterTemplates"
          />
          <MagnifyingGlassIcon
            class="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
          />
        </div>

        <button
          @click="openCreateModal"
          class="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
        >
          <PlusIcon class="h-5 w-5 mr-1" />
          สร้างเทมเพลตใหม่
        </button>
      </div>

      <!-- Templates list -->
      <div
        v-if="filteredTemplates.length === 0"
        class="bg-white rounded-lg shadow-md p-6 text-center"
      >
        <DocumentDuplicateIcon class="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p class="text-gray-500">ไม่พบเทมเพลต</p>
        <button
          @click="openCreateModal"
          class="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
        >
          สร้างเทมเพลตใหม่
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-lg font-semibold text-gray-800">{{ template.name }}</h2>
            <div class="flex space-x-2">
              <button
                @click="openEditModal(template)"
                class="text-blue-500 hover:text-blue-700"
                title="แก้ไข"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(template)"
                class="text-red-500 hover:text-red-700"
                title="ลบ"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-500 mb-2">
            จำนวนรายการ: {{ template.items?.length || 0 }} รายการ
          </p>
          <button
            @click="viewTemplateDetails(template)"
            class="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          >
            <EyeIcon class="h-4 w-4 mr-1" />
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold">
            {{ isEditing ? 'แก้ไขเทมเพลต' : 'สร้างเทมเพลตใหม่' }}
          </h2>
        </div>

        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเทมเพลต</label>
            <input
              v-model="templateForm.name"
              type="text"
              class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ระบุชื่อเทมเพลต"
            />
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
                >รายการสิ่งของ</label
              >
              <div class="relative w-full">
                <input
                  v-model="searchItemQuery"
                  type="text"
                  placeholder="ค้นหาสิ่งของ..."
                  class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @input="searchAvailableItems"
                  @focus="showSearchDropdown = true"
                />

                <!-- Dropdown for search results -->
                <div
                  v-if="showSearchDropdown && searchResults.length > 0"
                  class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                >
                  <div
                    v-for="item in searchResults"
                    :key="item.id"
                    @mousedown="addItemToTemplate(item)"
                    class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                  >
                    <div class="flex items-center">
                      <span class="font-normal block truncate">{{ item.name }}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      รหัส: {{ item.code }} | {{ item.category?.name || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="templateForm.items.length === 0"
              class="text-center p-4 border border-dashed border-gray-300 rounded-md"
            >
              <DocumentDuplicateIcon class="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p class="text-gray-500">ยังไม่มีรายการสิ่งของที่เลือก</p>
              <p class="text-sm text-gray-400 mt-1">ค้นหาและเลือกสิ่งของเพื่อเพิ่มในรายการ</p>
            </div>

            <div v-else class="border border-gray-200 rounded-md">
              <div class="max-h-[40vh] overflow-y-auto">
                <div class="divide-y divide-gray-200">
                  <div
                    v-for="(item, index) in templateForm.items"
                    :key="index"
                    class="p-3 hover:bg-gray-50 flex justify-between items-center"
                    :class="{ 'bg-red-50': isDuplicateItem(item.itemId, index) }"
                  >
                    <div class="flex-grow">
                      <div class="font-medium truncate w-[280px]">{{ item.selectedItem.name }}</div>
                      <div class="text-xs text-gray-500">
                        รหัส: {{ item.selectedItem.code }} |
                        {{ item.selectedItem.category?.name || '-' }}
                      </div>
                      <div
                        v-if="isDuplicateItem(item.itemId, index)"
                        class="text-xs text-red-500 mt-1"
                      >
                        สิ่งของนี้ถูกเพิ่มซ้ำ
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="flex items-center border border-gray-300 rounded-md">
                        <button
                          @click="decreaseQuantity(index)"
                          class="px-2 py-1 text-gray-500 hover:bg-gray-100"
                          :disabled="item.quantity <= 1"
                        >
                          <MinusIcon class="h-4 w-4" />
                        </button>
                        <input
                          v-model.number="item.quantity"
                          type="number"
                          min="1"
                          class="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
                        />
                        <button
                          @click="increaseQuantity(index)"
                          class="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        >
                          <PlusIcon class="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        @click="removeItemRow(index)"
                        class="text-red-500 hover:text-red-700"
                        title="ลบรายการ"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex justify-between items-center p-2 bg-gray-50 border-t border-gray-200"
              >
                <div class="text-sm text-gray-600">
                  รายการทั้งหมด: {{ templateForm.items.length }}
                </div>
                <button
                  v-if="templateForm.items.length > 0"
                  @click="clearAllItems"
                  class="text-red-500 hover:text-red-700 text-sm flex items-center"
                >
                  <TrashIcon class="h-4 w-4 mr-1" />
                  ล้างทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            :disabled="isSaving"
          >
            ยกเลิก
          </button>
          <button
            @click="saveTemplate"
            class="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="mr-2">
              <svg
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างเทมเพลต' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Template Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">รายละเอียดเทมเพลต</h2>
          <button @click="closeDetailsModal" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold">{{ selectedTemplate.name }}</h3>
          <p class="text-sm text-gray-500">
            จำนวนรายการ: {{ selectedTemplate.items?.length || 0 }} รายการ
          </p>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <h4 class="font-medium mb-2">รายการสิ่งของ</h4>
          <div
            v-if="!selectedTemplate.items || selectedTemplate.items.length === 0"
            class="text-center p-4"
          >
            <p class="text-gray-500">ไม่มีรายการสิ่งของ</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รหัส
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ชื่อสิ่งของ
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    หมวดหมู่
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จำนวน
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    หน่วยนับ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in selectedTemplate.items" :key="item.id">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ item.item.code }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ item.item.name }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ item.item.category?.name || '-' }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ item.quantity }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ item.item.Unit?.name || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="closeDetailsModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  MinusIcon,
} from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'
import {
  getItemTemplates,
  getItemTemplateById,
  createItemTemplate,
  updateItemTemplate,
  deleteItemTemplate,
} from '../services/itemTemplate'
import { searchItemsForDropdown } from '../services/item'

export default {
  name: 'TemplateManagementView',
  components: {
    DocumentDuplicateIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    MinusIcon,
  },
  data() {
    return {
      loading: true,
      templates: [],
      filteredTemplates: [],
      searchQuery: '',
      showModal: false,
      showDetailsModal: false,
      isEditing: false,
      isSaving: false,
      templateForm: {
        id: null,
        name: '',
        items: [],
      },
      selectedTemplate: {},
      searchItemQuery: '',
      searchResults: [],
      allItems: [],
      showSearchDropdown: false,
    }
  },
  methods: {
    async loadTemplates() {
      try {
        this.loading = true
        const response = await getItemTemplates()

        this.templates = response.data
        this.filterTemplates()
      } catch (error) {
        console.error('Error loading templates:', error)
        this.showErrorToast('ไม่สามารถโหลดข้อมูลเทมเพลตได้')
      } finally {
        this.loading = false
      }
    },

    async loadItems() {
      try {
        const response = await searchItemsForDropdown('')
        this.allItems = response.data
      } catch (error) {
        console.error('Error loading items:', error)
        this.showErrorToast('ไม่สามารถโหลดข้อมูลสิ่งของได้')
      }
    },

    filterTemplates() {
      if (!this.searchQuery) {
        this.filteredTemplates = [...this.templates]
        return
      }

      const query = this.searchQuery.toLowerCase()
      this.filteredTemplates = this.templates.filter((template) =>
        template.name.toLowerCase().includes(query),
      )
    },

    openCreateModal() {
      this.isEditing = false
      this.templateForm = {
        id: null,
        name: '',
        items: [],
      }
      this.showModal = true
    },

    async openEditModal(template) {
      try {
        const response = await getItemTemplateById(template.id)
        const templateData = response.data

        this.isEditing = true
        this.templateForm = {
          id: templateData.id,
          name: templateData.name,
          items: await Promise.all(
            templateData.items.map(async (item) => {
              const itemDetail = {
                itemId: item.item.id,
                quantity: item.quantity,
                searchQuery: item.item.name,
                showDropdown: false,
                searchResults: [],
                selectedItem: item.item,
              }
              return itemDetail
            }),
          ),
        }
        this.showModal = true
      } catch (error) {
        console.error('Error loading template for edit:', error)
        this.showErrorToast('ไม่สามารถโหลดข้อมูลเทมเพลตเพื่อแก้ไขได้')
      }
    },

    closeModal() {
      this.showModal = false
      this.templateForm = {
        id: null,
        name: '',
        items: [],
      }
    },

    addItemRow() {
      this.templateForm.items.push({
        itemId: '',
        quantity: 1,
        searchQuery: '',
        showDropdown: false,
        searchResults: [],
        selectedItem: null,
      })
    },

    removeItemRow(index) {
      this.templateForm.items.splice(index, 1)
    },

    async searchItems(index) {
      const item = this.templateForm.items[index]
      if (!item.searchQuery) {
        item.searchResults = []
        return
      }

      try {
        const response = await searchItemsForDropdown(item.searchQuery)
        item.searchResults = response.data
        item.showDropdown = true
      } catch (error) {
        console.error('Error searching items:', error)
      }
    },

    selectItem(index, selectedItem) {
      const item = this.templateForm.items[index]

      const isDuplicate = this.templateForm.items.some(
        (existingItem, idx) => existingItem.itemId === selectedItem.id && idx !== index,
      )

      if (isDuplicate) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'สิ่งของนี้มีอยู่ในรายการแล้ว',
          text: 'คุณอาจต้องการเพิ่มจำนวนในรายการที่มีอยู่แล้วแทน',
          showConfirmButton: false,
          timer: 3000,
        })
      }

      item.itemId = selectedItem.id
      item.searchQuery = selectedItem.name
      item.selectedItem = selectedItem
      item.showDropdown = false
    },

    async saveTemplate() {
      if (!this.templateForm.name.trim()) {
        this.showErrorToast('กรุณาระบุชื่อเทมเพลต')
        return
      }

      if (this.templateForm.items.length === 0) {
        this.showErrorToast('กรุณาเพิ่มรายการสิ่งของอย่างน้อย 1 รายการ')
        return
      }

      const duplicateItems = this.templateForm.items.filter((item, index) =>
        this.isDuplicateItem(item.itemId, index),
      )

      if (duplicateItems.length > 0) {
        this.showErrorToast('มีรายการสิ่งของซ้ำกัน กรุณาตรวจสอบรายการที่ไฮไลท์สีแดง')
        return
      }

      for (const item of this.templateForm.items) {
        if (!item.itemId) {
          this.showErrorToast('กรุณาเลือกสิ่งของให้ครบทุกรายการ')
          return
        }
        if (!item.quantity || item.quantity <= 0) {
          this.showErrorToast('จำนวนสิ่งของต้องมากกว่า 0')
          return
        }
      }

      try {
        this.isSaving = true

        const formattedItems = this.templateForm.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        }))

        if (this.isEditing) {
          await updateItemTemplate(this.templateForm.id, {
            name: this.templateForm.name,
            items: formattedItems,
          })
          this.showSuccessToast('แก้ไขเทมเพลตสำเร็จ')
        } else {
          await createItemTemplate({
            name: this.templateForm.name,
            items: formattedItems,
          })
          this.showSuccessToast('สร้างเทมเพลตสำเร็จ')
        }

        this.closeModal()
        await this.loadTemplates()
      } catch (error) {
        console.error('Error saving template:', error)
        this.showErrorToast(error.response?.data?.error || 'ไม่สามารถบันทึกเทมเพลตได้')
      } finally {
        this.isSaving = false
      }
    },

    async viewTemplateDetails(template) {
      try {
        const response = await getItemTemplateById(template.id)
        this.selectedTemplate = response.data
        this.showDetailsModal = true
      } catch (error) {
        console.error('Error loading template details:', error)
        this.showErrorToast('ไม่สามารถโหลดรายละเอียดเทมเพลตได้')
      }
    },

    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedTemplate = {}
    },

    async confirmDelete(template) {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `คุณต้องการลบเทมเพลต "${template.name}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
      })

      if (result.isConfirmed) {
        try {
          await deleteItemTemplate(template.id)
          this.showSuccessToast('ลบเทมเพลตสำเร็จ')
          await this.loadTemplates()
        } catch (error) {
          console.error('Error deleting template:', error)
          this.showErrorToast('ไม่สามารถลบเทมเพลตได้')
        }
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

    isDuplicateItem(itemId, currentIndex) {
      if (!itemId) return false

      return this.templateForm.items.some(
        (item, index) => item.itemId === itemId && index !== currentIndex,
      )
    },

    async searchAvailableItems() {
      if (!this.searchItemQuery) {
        this.searchResults = []
        return
      }

      try {
        const response = await searchItemsForDropdown(this.searchItemQuery)
        this.searchResults = response.data
      } catch (error) {
        console.error('Error searching items:', error)
        this.searchResults = []
      }
    },

    addItemToTemplate(item) {
      const existingIndex = this.templateForm.items.findIndex((i) => i.itemId === item.id)

      if (existingIndex !== -1) {
        this.templateForm.items[existingIndex].quantity += 1

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'เพิ่มจำนวนสิ่งของที่มีอยู่แล้ว',
          showConfirmButton: false,
          timer: 2000,
        })
      } else {
        this.templateForm.items.push({
          itemId: item.id,
          quantity: 1,
          selectedItem: item,
        })
      }

      this.searchItemQuery = ''
      this.searchResults = []
    },

    increaseQuantity(index) {
      this.templateForm.items[index].quantity += 1
    },

    decreaseQuantity(index) {
      if (this.templateForm.items[index].quantity > 1) {
        this.templateForm.items[index].quantity -= 1
      }
    },

    clearAllItems() {
      Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบรายการสิ่งของทั้งหมดใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบทั้งหมด!',
        cancelButtonText: 'ยกเลิก',
      }).then((result) => {
        if (result.isConfirmed) {
          this.templateForm.items = []
        }
      })
    },
  },
  async mounted() {
    await Promise.all([this.loadTemplates(), this.loadItems()])
  },
}
</script>
