<template>
  <div class="p-2">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">บันทึกการทำงานระบบ</h1>

      <!-- ส่วนตัวกรอง -->
      <div class="bg-gray-100 p-4 rounded-lg mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- กรองตาม Action -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทการทำงาน</label>
            <div class="relative">
              <input
                v-model="actionSearchQuery"
                type="text"
                placeholder="ค้นหาประเภทการทำงาน..."
                class="w-full p-1 pl-5 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none"
                @focus="showActionDropdown = true"
                @blur="handleActionBlur"
              />
              <div
                v-if="showActionDropdown"
                class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <div class="p-2 hover:bg-purple-50 cursor-pointer" @click="selectAction('')">
                  ทั้งหมด
                </div>
                <div
                  v-for="action in filteredActions"
                  :key="action.value"
                  @click="selectAction(action.value)"
                  class="p-2 hover:bg-purple-50 cursor-pointer"
                >
                  {{ action.label }}
                </div>
                <div v-if="filteredActions.length === 0" class="p-2 text-gray-500 text-center">
                  ไม่พบประเภทการทำงาน
                </div>
              </div>
            </div>
          </div>

          <!-- กรองตามประเภทเป้าหมาย -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทเป้าหมาย</label>
            <select
              v-model="filters.targetType"
              @change="fetchLogs"
              class="w-full p-1 pl-5 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="User">ผู้ใช้งาน</option>
              <option value="Item">อุปกรณ์</option>
              <option value="Job">งาน</option>
              <option value="Category">หมวดหมู่</option>
              <option value="Unit">หน่วยนับ</option>
              <option value="Checkin">คืนอุปกรณ์</option>
              <option value="Checkout">เบิกอุปกรณ์</option>
              <option value="JobItem">อุปกรณ์ในงาน</option>
            </select>
          </div>

          <!-- กรองตามช่วงเวลา -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ตั้งแต่วันที่</label>
            <input
              type="date"
              v-model="filters.startDate"
              @change="fetchLogs"
              class="w-full p-1 pl-5 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
            <input
              type="date"
              v-model="filters.endDate"
              @change="fetchLogs"
              class="w-full p-1 pl-5 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            @click="resetFilters"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md flex items-center mr-2"
          >
            <ArrowPathIcon class="h-5 w-5 mr-2" />
            รีเซ็ต
          </button>
        </div>
      </div>

      <!-- ตารางแสดงผล Log -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                วันที่/เวลา
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ประเภท
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ผู้ใช้งาน
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                เป้าหมาย
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                รายละเอียด
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="text-center">
              <td colspan="5" class="px-6 py-4">
                <div class="flex justify-center">
                  <ArrowPathIcon class="h-5 w-5 text-purple-500 animate-spin" />
                </div>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0" class="text-center">
              <td colspan="5" class="px-6 py-4 text-gray-500">ไม่พบข้อมูลบันทึกการทำงาน</td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log.id"
              @click="selectLog(log)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getActionBadgeClass(log.action)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getActionText(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.user ? log.user.name || log.user.email : 'ไม่ระบุ' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getTargetText(log) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="selectLog(log)"
                  class="text-purple-600 hover:text-purple-800 focus:outline-none"
                  title="ดูรายละเอียด"
                >
                  <EyeIcon class="h-5 w-5 text-purple-600" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <div class="flex items-center">
          <span class="text-sm text-gray-700">
            แสดง
            <span class="font-medium">{{
              logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
            }}</span>
            ถึง
            <span class="font-medium">{{ Math.min(currentPage * pageSize, totalLogs) }}</span>
            จากทั้งหมด
            <span class="font-medium">{{ totalLogs }}</span>
            รายการ
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>

          <button
            v-for="page in paginationPages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === page
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal แสดงรายละเอียด Log -->
    <div
      v-if="selectedLog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="selectedLog = null"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">รายละเอียดบันทึกการทำงาน</h2>
            <button @click="selectedLog = null" class="text-gray-500 hover:text-gray-700">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm font-medium text-gray-500">วันที่/เวลา</p>
              <p class="text-gray-800">{{ formatDate(selectedLog.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">ประเภทการทำงาน</p>
              <p>
                <span
                  :class="getActionBadgeClass(selectedLog.action)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getActionText(selectedLog.action) }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">ผู้ใช้งาน</p>
              <p class="text-gray-800">
                {{ selectedLog.user ? selectedLog.user.name || selectedLog.user.email : 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">เป้าหมาย</p>
              <p class="text-gray-800">{{ getTargetText(selectedLog) }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">รายละเอียดเพิ่มเติม</h3>

            <div v-if="selectedLog.action === 'LOGIN'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการเข้าสู่ระบบ</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">อีเมล</p>
                    <p class="text-gray-800">{{ getLogDetails.email || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'REGISTER'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลงทะเบียนผู้ใช้</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">ชื่อผู้ใช้</p>
                    <p class="text-gray-800">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Role</p>
                    <p class="text-gray-800">
                      <span
                        :class="{
                          'bg-blue-100 text-blue-800': getLogDetails.role === 'ADMIN',
                          'bg-green-100 text-green-800': getLogDetails.role === 'STAFF',
                          'bg-yellow-100 text-yellow-800': getLogDetails.role === 'USER',
                          'bg-gray-100 text-gray-800': !['ADMIN', 'STAFF', 'USER'].includes(
                            getLogDetails.role,
                          ),
                        }"
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{ getRoleText(getLogDetails.role) }}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">อีเมล</p>
                    <p class="text-gray-800">{{ getLogDetails.email || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'LOGIN_GOOGLE'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการเข้าสู่ระบบด้วย Google</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">อีเมล</p>
                    <p class="text-gray-800">{{ getLogDetails.email || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">ผู้ให้บริการ</p>
                    <p class="text-gray-800">
                      <span
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                      >
                        {{ getLogDetails.provider || 'Google' }}
                      </span>
                    </p>
                  </div>
                  <div v-if="getLogDetails.name">
                    <p class="text-sm font-medium text-gray-500">ชื่อผู้ใช้</p>
                    <p class="text-gray-800">{{ getLogDetails.name }}</p>
                  </div>
                  <div v-if="getLogDetails.picture">
                    <p class="text-sm font-medium text-gray-500">รูปโปรไฟล์</p>
                    <img
                      :src="getLogDetails.picture"
                      alt="Profile"
                      class="h-10 w-10 rounded-full"
                    />
                  </div>
                </div>
                <div
                  v-if="getLogDetails.ip || getLogDetails.userAgent"
                  class="mt-4 pt-4 border-t border-gray-200"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="getLogDetails.ip">
                      <p class="text-sm font-medium text-gray-500">IP Address</p>
                      <p class="text-gray-800">{{ getLogDetails.ip }}</p>
                    </div>
                    <div v-if="getLogDetails.userAgent">
                      <p class="text-sm font-medium text-gray-500">User Agent</p>
                      <p class="text-gray-800 truncate">{{ getLogDetails.userAgent }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'REGISTER_GOOGLE'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลงทะเบียนด้วย Google</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">ชื่อผู้ใช้</p>
                    <p class="text-gray-800">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">อีเมล</p>
                    <p class="text-gray-800">{{ getLogDetails.email || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">ผู้ให้บริการ</p>
                    <p class="text-gray-800">
                      <span
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                      >
                        {{ getLogDetails.provider || 'Google' }}
                      </span>
                    </p>
                  </div>
                  <div v-if="getLogDetails.googleId">
                    <p class="text-sm font-medium text-gray-500">Google ID</p>
                    <p class="text-gray-800 truncate">{{ getLogDetails.googleId }}</p>
                  </div>
                  <div v-if="getLogDetails.registeredAt">
                    <p class="text-sm font-medium text-gray-500">วันที่ลงทะเบียน</p>
                    <p class="text-gray-800">{{ formatDate(getLogDetails.registeredAt) }}</p>
                  </div>
                  <div v-if="getLogDetails.picture">
                    <p class="text-sm font-medium text-gray-500">รูปโปรไฟล์</p>
                    <img
                      :src="getLogDetails.picture"
                      alt="Profile"
                      class="h-10 w-10 rounded-full"
                    />
                  </div>
                </div>
                <div
                  v-if="getLogDetails.ip || getLogDetails.userAgent"
                  class="mt-4 pt-4 border-t border-gray-200"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="getLogDetails.ip">
                      <p class="text-sm font-medium text-gray-500">IP Address</p>
                      <p class="text-gray-800">{{ getLogDetails.ip }}</p>
                    </div>
                    <div v-if="getLogDetails.userAgent">
                      <p class="text-sm font-medium text-gray-500">User Agent</p>
                      <p class="text-gray-800 truncate">{{ getLogDetails.userAgent }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'IMPORT_ITEMS'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการนำเข้าอุปกรณ์</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">จำนวนรายการที่สร้าง</p>
                    <p class="text-gray-800">
                      <span
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        {{ getLogDetails.created || 0 }} รายการ
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">จำนวนรายการที่ข้าม</p>
                    <p class="text-gray-800">
                      <span
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
                      >
                        {{ getLogDetails.skipped || 0 }} รายการ
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">จำนวนข้อผิดพลาด</p>
                    <p class="text-gray-800">
                      <span
                        :class="
                          getLogDetails.errors > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        "
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{ getLogDetails.errors || 0 }} รายการ
                      </span>
                    </p>
                  </div>
                  <div v-if="getLogDetails.filename">
                    <p class="text-sm font-medium text-gray-500">ชื่อไฟล์</p>
                    <p class="text-gray-800">{{ getLogDetails.filename }}</p>
                  </div>
                </div>

                <!-- แสดงรายละเอียดข้อผิดพลาด (ถ้ามี) -->
                <div
                  v-if="getLogDetails.errorDetails && getLogDetails.errorDetails.length > 0"
                  class="mt-4"
                >
                  <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียดข้อผิดพลาด</p>
                  <div class="bg-red-50 p-3 rounded-md border border-red-200">
                    <ul class="list-disc list-inside text-sm text-red-700">
                      <li v-for="(error, index) in getLogDetails.errorDetails" :key="index">
                        {{ error.row ? `แถวที่ ${error.row}: ` : '' }}{{ error.message || error }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- แสดงสรุปผลการนำเข้า -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2" />

                    <p class="text-gray-800">
                      นำเข้าข้อมูลสำเร็จ {{ getLogDetails.created || 0 }} รายการ จากทั้งหมด
                      {{
                        (getLogDetails.created || 0) +
                        (getLogDetails.skipped || 0) +
                        (getLogDetails.errors || 0)
                      }}
                      รายการ
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'CREATE_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการสร้างอุปกรณ์</h4>
              <div v-if="getLogDetails">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">รหัสอุปกรณ์</p>
                    <p class="text-gray-800">{{ getLogDetails.code || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">ชื่ออุปกรณ์</p>
                    <p class="text-gray-800">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">หมวดหมู่</p>
                    <p class="text-gray-800">{{ getLogDetails.category || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">หน่วยนับ</p>
                    <p class="text-gray-800">{{ getLogDetails.unit || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">จำนวนในคลัง</p>
                    <p class="text-gray-800">
                      {{ getLogDetails.stock || 0 }} {{ getLogDetails.unit || 'หน่วย' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">ประเภท</p>
                    <p class="text-gray-800">
                      <span
                        :class="
                          getLogDetails.isConsumable
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        "
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{ getLogDetails.isConsumable ? 'วัสดุสิ้นเปลือง' : 'ครุภัณฑ์' }}
                      </span>
                    </p>
                  </div>
                </div>

                <div v-if="getLogDetails.description" class="mt-4">
                  <p class="text-sm font-medium text-gray-500">รายละเอียด</p>
                  <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                </div>

                <div v-if="getLogDetails.image" class="mt-4">
                  <p class="text-sm font-medium text-gray-500">รูปภาพ</p>
                  <img
                    :src="getLogDetails.image"
                    alt="Item Image"
                    class="mt-1 h-32 w-auto object-cover rounded-md"
                  />
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'UPDATE_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการแก้ไขอุปกรณ์</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p class="text-blue-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <!-- รหัสอุปกรณ์ -->
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">รหัสอุปกรณ์</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldCode || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newCode || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- ชื่ออุปกรณ์ -->
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่ออุปกรณ์</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldName || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newName || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- หมวดหมู่ -->
                  <div
                    class="bg-white p-3 rounded-md border border-gray-200"
                    v-if="getLogDetails.oldCategory || getLogDetails.newCategory"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldCategory || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newCategory || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- หน่วยนับ -->
                  <div
                    class="bg-white p-3 rounded-md border border-gray-200"
                    v-if="getLogDetails.oldUnit || getLogDetails.newUnit"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หน่วยนับ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldUnit || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newUnit || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- จำนวนในคลัง -->
                  <div
                    class="bg-white p-3 rounded-md border border-gray-200"
                    v-if="
                      getLogDetails.oldStock !== undefined || getLogDetails.newStock !== undefined
                    "
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">จำนวนในคลัง</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          {{ getLogDetails.oldStock || 0 }} {{ getLogDetails.oldUnit || 'หน่วย' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newStock || 0 }} {{ getLogDetails.newUnit || 'หน่วย' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- ประเภท -->
                  <div
                    class="bg-white p-3 rounded-md border border-gray-200"
                    v-if="
                      getLogDetails.oldIsConsumable !== undefined ||
                      getLogDetails.newIsConsumable !== undefined
                    "
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">ประเภท</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          <span
                            :class="
                              getLogDetails.oldIsConsumable
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            "
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ getLogDetails.oldIsConsumable ? 'วัสดุสิ้นเปลือง' : 'ครุภัณฑ์' }}
                          </span>
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800">
                          <span
                            :class="
                              getLogDetails.newIsConsumable
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            "
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ getLogDetails.newIsConsumable ? 'วัสดุสิ้นเปลือง' : 'ครุภัณฑ์' }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'DELETE_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลบอุปกรณ์</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-red-50 rounded-md border border-red-200"
                >
                  <p class="text-red-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">รหัสอุปกรณ์</p>
                    <p class="text-gray-800">{{ getLogDetails.code || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">ชื่ออุปกรณ์</p>
                    <p class="text-gray-800">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">หมวดหมู่</p>
                    <p class="text-gray-800">{{ getLogDetails.category || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">หน่วยนับ</p>
                    <p class="text-gray-800">{{ getLogDetails.unit || 'ไม่ระบุ' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">จำนวนในคลัง</p>
                    <p class="text-gray-800">
                      {{ getLogDetails.stock || 0 }} {{ getLogDetails.unit || 'หน่วย' }}
                    </p>
                  </div>
                  <div v-if="getLogDetails.isConsumable !== undefined">
                    <p class="text-sm font-medium text-gray-500">ประเภท</p>
                    <p class="text-gray-800">
                      <span
                        :class="
                          getLogDetails.isConsumable
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        "
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{ getLogDetails.isConsumable ? 'วัสดุสิ้นเปลือง' : 'ครุภัณฑ์' }}
                      </span>
                    </p>
                  </div>
                </div>

                <div v-if="getLogDetails.description" class="mt-4">
                  <p class="text-sm font-medium text-gray-500">รายละเอียด</p>
                  <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                </div>

                <div v-if="getLogDetails.reason" class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-sm font-medium text-gray-500">เหตุผลในการลบ</p>
                  <p class="text-gray-800">{{ getLogDetails.reason }}</p>
                </div>

                <div v-if="getLogDetails.image" class="mt-4">
                  <p class="text-sm font-medium text-gray-500">รูปภาพ</p>
                  <img
                    :src="getLogDetails.image"
                    alt="Item Image"
                    class="mt-1 h-32 w-auto object-cover rounded-md"
                  />
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <TrashIcon class="h-5 w-5 text-red-500 mr-2" />

                    <p class="text-red-800 font-medium">อุปกรณ์นี้ถูกลบออกจากระบบแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'CREATE_UNIT'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการสร้างหน่วยนับ</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p class="text-blue-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหน่วยนับ</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2" />

                    <p class="text-green-800 font-medium">หน่วยนับถูกสร้างเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'UPDATE_UNIT'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการแก้ไขหน่วยนับ</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200"
                >
                  <p class="text-purple-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหน่วยนับ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldName || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                        📦 ถ้ายัง
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newName || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldDescription || getLogDetails.newDescription"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line">
                          {{ getLogDetails.oldDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line font-medium">
                          {{ getLogDetails.newDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <PencilIcon class="h-5 w-5 text-purple-500 mr-2" />

                    <p class="text-purple-800 font-medium">หน่วยนับถูกแก้ไขเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'DELETE_UNIT'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลบหน่วยนับ</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-red-50 rounded-md border border-red-200"
                >
                  <p class="text-red-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหน่วยนับ</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.reason"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">เหตุผลในการลบ</p>
                    <p class="text-gray-800">{{ getLogDetails.reason }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <TrashIcon class="h-5 w-5 text-red-500 mr-2" />

                    <p class="text-red-800 font-medium">หน่วยนับนี้ถูกลบออกจากระบบแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'CREATE_CATEGORY'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการสร้างหมวดหมู่</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p class="text-blue-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหมวดหมู่</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.parent"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่หลัก</p>
                    <p class="text-gray-800">{{ getLogDetails.parent }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2" />

                    <p class="text-green-800 font-medium">หมวดหมู่ถูกสร้างเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'UPDATE_CATEGORY'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการแก้ไขหมวดหมู่</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200"
                >
                  <p class="text-purple-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหมวดหมู่</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldName || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newName || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldDescription || getLogDetails.newDescription"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line">
                          {{ getLogDetails.oldDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line font-medium">
                          {{ getLogDetails.newDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldParent || getLogDetails.newParent"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่หลัก</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          {{ getLogDetails.oldParent || 'ไม่มีหมวดหมู่หลัก' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newParent || 'ไม่มีหมวดหมู่หลัก' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <PencilIcon class="h-5 w-5 text-purple-500 mr-2" />

                    <p class="text-purple-800 font-medium">หมวดหมู่ถูกแก้ไขเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'DELETE_CATEGORY'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลบหมวดหมู่</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-red-50 rounded-md border border-red-200"
                >
                  <p class="text-red-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่อหมวดหมู่</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.name || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.parent"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่หลัก</p>
                    <p class="text-gray-800">{{ getLogDetails.parent }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.reason"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">เหตุผลในการลบ</p>
                    <p class="text-gray-800">{{ getLogDetails.reason }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.itemCount"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">
                      จำนวนอุปกรณ์ที่อยู่ในหมวดหมู่
                    </p>
                    <p class="text-gray-800">{{ getLogDetails.itemCount }} รายการ</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <TrashIcon class="h-5 w-5 text-red-500 mr-2" />

                    <p class="text-red-800 font-medium">หมวดหมู่นี้ถูกลบออกจากระบบแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <!-- เพิ่มส่วนนี้ในบริเวณที่แสดงรายละเอียดตามประเภท Action ในส่วนของ Modal -->
            <div v-if="selectedLog.action === 'CREATE_JOB'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการสร้างงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p class="text-blue-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่องาน</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.title || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.scheduledAt"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">วันที่ทำงาน</p>
                    <p class="text-gray-800">
                      {{ formatScheduledDate(getLogDetails.scheduledAt) }}
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.location"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานที่</p>
                    <p class="text-gray-800">
                      {{ getLogDetails.location.replace('สถานที่ ', '').replace(/"/g, '') }}
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.status"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานะ</p>
                    <p class="text-gray-800">
                      <span
                        :class="{
                          'bg-yellow-100 text-yellow-800': getLogDetails.status.includes('PENDING'),
                          'bg-blue-100 text-blue-800': getLogDetails.status.includes('IN_PROGRESS'),
                          'bg-green-100 text-green-800': getLogDetails.status.includes('COMPLETED'),
                          'bg-red-100 text-red-800': getLogDetails.status.includes('CANCELLED'),
                          'bg-gray-100 text-gray-800':
                            !getLogDetails.status.includes('PENDING') &&
                            !getLogDetails.status.includes('IN_PROGRESS') &&
                            !getLogDetails.status.includes('COMPLETED') &&
                            !getLogDetails.status.includes('CANCELLED'),
                        }"
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{
                          getLogDetails.status.includes('PENDING')
                            ? 'รอดำเนินการ'
                            : getLogDetails.status.includes('IN_PROGRESS')
                              ? 'กำลังดำเนินการ'
                              : getLogDetails.status.includes('COMPLETED')
                                ? 'เสร็จสิ้น'
                                : getLogDetails.status.includes('CANCELLED')
                                  ? 'ยกเลิก'
                                  : getLogDetails.status.replace('สถานะ ', '').replace(/"/g, '')
                        }}
                      </span>
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.createdBy"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สร้างโดย</p>
                    <p class="text-gray-800">
                      {{ getLogDetails.createdBy.replace('สร้างโดย ', '').replace(/"/g, '') }}
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.note"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <p class="text-gray-800 whitespace-pre-line">
                      {{ getLogDetails.note.replace('หมายเหตุ ', '').replace(/"/g, '') }}
                    </p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2" />

                    <p class="text-green-800 font-medium">งานถูกสร้างเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'UPDATE_JOB'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการแก้ไขงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200"
                >
                  <p class="text-purple-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div
                    v-if="getLogDetails.oldTitle || getLogDetails.newTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่องาน</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">{{ getLogDetails.oldTitle || 'ไม่ระบุ' }}</p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newTitle || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldDescription || getLogDetails.newDescription"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line">
                          {{ getLogDetails.oldDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line font-medium">
                          {{ getLogDetails.newDescription || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldScheduledAt || getLogDetails.newScheduledAt"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">กำหนดการ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          {{ formatScheduledDate(getLogDetails.oldScheduledAt) }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ formatScheduledDate(getLogDetails.newScheduledAt) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldLocation || getLogDetails.newLocation"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานที่</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          {{
                            getLogDetails.oldLocation
                              ? getLogDetails.oldLocation.replace('สถานที่ ', '').replace(/"/g, '')
                              : 'ไม่ระบุ'
                          }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{
                            getLogDetails.newLocation
                              ? getLogDetails.newLocation.replace('สถานที่ ', '').replace(/"/g, '')
                              : 'ไม่ระบุ'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldStatus || getLogDetails.newStatus"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานะ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          <span
                            :class="{
                              'bg-yellow-100 text-yellow-800':
                                getLogDetails.oldStatus === 'PENDING',
                              'bg-blue-100 text-blue-800':
                                getLogDetails.oldStatus === 'IN_PROGRESS',
                              'bg-green-100 text-green-800':
                                getLogDetails.oldStatus === 'COMPLETED',
                              'bg-red-100 text-red-800': getLogDetails.oldStatus === 'CANCELLED',
                              'bg-gray-100 text-gray-800': ![
                                'PENDING',
                                'IN_PROGRESS',
                                'COMPLETED',
                                'CANCELLED',
                              ].includes(getLogDetails.oldStatus),
                            }"
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{
                              {
                                PENDING: 'รอดำเนินการ',
                                IN_PROGRESS: 'กำลังดำเนินการ',
                                COMPLETED: 'เสร็จสิ้น',
                                CANCELLED: 'ยกเลิก',
                              }[getLogDetails.oldStatus] ||
                              getLogDetails.oldStatus ||
                              'ไม่ระบุ'
                            }}
                          </span>
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800">
                          <span
                            :class="{
                              'bg-yellow-100 text-yellow-800':
                                getLogDetails.newStatus === 'PENDING',
                              'bg-blue-100 text-blue-800':
                                getLogDetails.newStatus === 'IN_PROGRESS',
                              'bg-green-100 text-green-800':
                                getLogDetails.newStatus === 'COMPLETED',
                              'bg-red-100 text-red-800': getLogDetails.newStatus === 'CANCELLED',
                              'bg-gray-100 text-gray-800': ![
                                'PENDING',
                                'IN_PROGRESS',
                                'COMPLETED',
                                'CANCELLED',
                              ].includes(getLogDetails.newStatus),
                            }"
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{
                              {
                                PENDING: 'รอดำเนินการ',
                                IN_PROGRESS: 'กำลังดำเนินการ',
                                COMPLETED: 'เสร็จสิ้น',
                                CANCELLED: 'ยกเลิก',
                              }[getLogDetails.newStatus] ||
                              getLogDetails.newStatus ||
                              'ไม่ระบุ'
                            }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.oldNote || getLogDetails.newNote"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line">
                          {{
                            getLogDetails.oldNote
                              ? getLogDetails.oldNote.replace('หมายเหตุ ', '').replace(/"/g, '')
                              : 'ไม่ระบุ'
                          }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line font-medium">
                          {{
                            getLogDetails.newNote
                              ? getLogDetails.newNote.replace('หมายเหตุ ', '').replace(/"/g, '')
                              : 'ไม่ระบุ'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <PencilIcon class="h-5 w-5 text-purple-500 mr-2" />

                    <p class="text-purple-800 font-medium">งานถูกแก้ไขเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'DELETE_JOB'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลบงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-red-50 rounded-md border border-red-200"
                >
                  <p class="text-red-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่องาน</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.title || 'ไม่ระบุ' }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.description"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">รายละเอียด</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.description }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.scheduledAt"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">กำหนดการ</p>
                    <p class="text-gray-800">
                      {{ formatScheduledDate(getLogDetails.scheduledAt) }}
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.location"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานที่</p>
                    <p class="text-gray-800">
                      {{ getLogDetails.location.replace('สถานที่ ', '').replace(/"/g, '') }}
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.status"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานะ</p>
                    <p class="text-gray-800">
                      <span
                        :class="{
                          'bg-yellow-100 text-yellow-800': getLogDetails.status === 'PENDING',
                          'bg-blue-100 text-blue-800': getLogDetails.status === 'IN_PROGRESS',
                          'bg-green-100 text-green-800': getLogDetails.status === 'COMPLETED',
                          'bg-red-100 text-red-800': getLogDetails.status === 'CANCELLED',
                          'bg-gray-100 text-gray-800': ![
                            'PENDING',
                            'IN_PROGRESS',
                            'COMPLETED',
                            'CANCELLED',
                          ].includes(getLogDetails.status),
                        }"
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{
                          {
                            PENDING: 'รอดำเนินการ',
                            IN_PROGRESS: 'กำลังดำเนินการ',
                            COMPLETED: 'เสร็จสิ้น',
                            CANCELLED: 'ยกเลิก',
                          }[getLogDetails.status] || getLogDetails.status
                        }}
                      </span>
                    </p>
                  </div>

                  <div
                    v-if="getLogDetails.reason"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">เหตุผลในการลบ</p>
                    <p class="text-gray-800">{{ getLogDetails.reason }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <TrashIcon class="h-5 w-5 text-red-500 mr-2" />

                    <p class="text-red-800 font-medium">งานนี้ถูกลบออกจากระบบแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'ADD_JOB_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการเพิ่มอุปกรณ์ในงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p class="text-blue-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">รหัสอุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemCode || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่ออุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemName || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-500 mb-2">จำนวน</p>
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.quantity || '0' }} {{ getLogDetails.unit || 'หน่วย' }}
                        </p>
                      </div>
                      <div class="flex items-center">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          <PlusIcon class="h-4 w-4 mr-1 text-current" />

                          เพิ่มในงาน
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.category"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่</p>
                    <p class="text-gray-800">{{ getLogDetails.category }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.jobTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">งาน</p>
                    <p class="text-gray-800">{{ getLogDetails.jobTitle }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.note"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.note }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2" />

                    <p class="text-green-800 font-medium">อุปกรณ์ถูกเพิ่มในงานเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'UPDATE_JOB_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการแก้ไขอุปกรณ์ในงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200"
                >
                  <p class="text-purple-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">รหัสอุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemCode || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่ออุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemName || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">จำนวน</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800">
                          {{ getLogDetails.oldQuantity || '0' }} {{ getLogDetails.unit || 'หน่วย' }}
                        </p>
                      </div>
                      <div class="flex-none px-3">
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.newQuantity || '0' }} {{ getLogDetails.unit || 'หน่วย' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.category"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่</p>
                    <p class="text-gray-800">{{ getLogDetails.category }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.jobTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">งาน</p>
                    <p class="text-gray-800">{{ getLogDetails.jobTitle }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.oldNote || getLogDetails.newNote"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <div class="flex items-center">
                      <div class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line">
                          {{ getLogDetails.oldNote || 'ไม่ระบุ' }}
                        </p>
                      </div>
                      <div
                        v-if="getLogDetails.oldNote !== getLogDetails.newNote"
                        class="flex-none px-3"
                      >
                        <ArrowRightIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <div v-if="getLogDetails.oldNote !== getLogDetails.newNote" class="flex-1">
                        <p class="text-gray-800 whitespace-pre-line font-medium">
                          {{ getLogDetails.newNote || 'ไม่ระบุ' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <PencilSquareIcon class="h-5 w-5 text-purple-500 mr-2" />

                    <p class="text-purple-800 font-medium">อุปกรณ์ในงานถูกแก้ไขเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'DELETE_JOB_ITEM'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการลบอุปกรณ์ออกจากงาน</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-red-50 rounded-md border border-red-200"
                >
                  <p class="text-red-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">รหัสอุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemCode || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <p class="text-sm font-medium text-gray-500 mb-2">ชื่ออุปกรณ์</p>
                    <p class="text-gray-800 font-medium">
                      {{ getLogDetails.itemName || 'ไม่ระบุ' }}
                    </p>
                  </div>

                  <div class="bg-white p-3 rounded-md border border-gray-200">
                    <div class="flex justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-500 mb-2">จำนวน</p>
                        <p class="text-gray-800 font-medium">
                          {{ getLogDetails.quantity || '0' }} {{ getLogDetails.unit || 'หน่วย' }}
                        </p>
                      </div>
                      <div class="flex items-center">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                        >
                          <MinusIcon class="h-4 w-4 mr-1" />
                          ลบออกจากงาน
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.category"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมวดหมู่</p>
                    <p class="text-gray-800">{{ getLogDetails.category }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.jobTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">งาน</p>
                    <p class="text-gray-800">{{ getLogDetails.jobTitle }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.reason"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">เหตุผลในการลบ</p>
                    <p class="text-gray-800">{{ getLogDetails.reason }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <TrashIcon class="h-5 w-5 text-red-500 mr-2" />

                    <p class="text-red-800 font-medium">อุปกรณ์ถูกลบออกจากงานแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'CHECKOUT'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการเช็คของออก</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-indigo-50 rounded-md border border-indigo-200"
                >
                  <p class="text-indigo-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div
                    v-if="getLogDetails.jobTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">งาน</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.jobTitle }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.jobLocation"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานที่</p>
                    <p class="text-gray-800">{{ getLogDetails.jobLocation }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.itemCount !== undefined"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">จำนวนรายการ</p>
                    <div class="flex items-center">
                      <span class="text-gray-800 font-medium"
                        >{{ getLogDetails.itemCount }} รายการ</span
                      >
                      <span
                        class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <ArrowsRightLeftIcon class="h-4 w-4 mr-1 text-gray-600" />
                        เช็คของออก
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.checkoutBy"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">ผู้เช็คของออก</p>
                    <p class="text-gray-800">{{ getLogDetails.checkoutBy }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.checkoutAt"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">วันเวลาที่เช็คของออก</p>
                    <p class="text-gray-800">{{ formatDate(getLogDetails.checkoutAt) }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.note"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.note }}</p>
                  </div>
                </div>

                <div v-if="getLogDetails.items && getLogDetails.items.length > 0" class="mt-4">
                  <h5 class="font-medium text-gray-700 mb-2">รายการอุปกรณ์</h5>
                  <div class="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ชื่ออุปกรณ์
                          </th>
                          <th
                            scope="col"
                            class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            จำนวน
                          </th>
                          <th
                            scope="col"
                            class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            จำนวนจริง
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(item, index) in getLogDetails.items" :key="index">
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {{ item.name || item.itemName }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                            {{ item.quantity }} {{ item.unit }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-right">
                            <span
                              :class="{
                                'text-green-600': item.actualQuantity === item.quantity,
                                'text-yellow-600': item.actualQuantity < item.quantity,
                                'text-red-600': item.actualQuantity === 0,
                              }"
                              class="font-medium"
                            >
                              {{ item.actualQuantity }} {{ item.unit }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-indigo-500 mr-2" />

                    <p class="text-indigo-800 font-medium">อุปกรณ์ถูกเช็คออกเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>

            <div v-if="selectedLog.action === 'CHECKIN'" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">ข้อมูลการเช็คของเข้า</h4>
              <div v-if="getLogDetails">
                <div
                  v-if="getLogDetails.message"
                  class="mb-4 p-3 bg-pink-50 rounded-md border border-pink-200"
                >
                  <p class="text-pink-800">{{ getLogDetails.message }}</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div
                    v-if="getLogDetails.jobTitle"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">งาน</p>
                    <p class="text-gray-800 font-medium">{{ getLogDetails.jobTitle }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.jobLocation"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">สถานที่</p>
                    <p class="text-gray-800">{{ getLogDetails.jobLocation }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.itemCount !== undefined"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">จำนวนรายการ</p>
                    <div class="flex items-center">
                      <span class="text-gray-800 font-medium"
                        >{{
                          getLogDetails.itemCount || getLogDetails.items?.length || 0
                        }}
                        รายการ</span
                      >
                      <span
                        class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                      >
                        <ArrowsRightLeftIcon class="h-4 w-4 mr-1 text-gray-600" />

                        เช็คของเข้า
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="getLogDetails.checkinBy"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">ผู้เช็คของเข้า</p>
                    <p class="text-gray-800">{{ getLogDetails.checkinBy }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.checkinAt"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">วันเวลาที่เช็คของเข้า</p>
                    <p class="text-gray-800">{{ formatDate(getLogDetails.checkinAt) }}</p>
                  </div>

                  <div
                    v-if="getLogDetails.note"
                    class="bg-white p-3 rounded-md border border-gray-200"
                  >
                    <p class="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</p>
                    <p class="text-gray-800 whitespace-pre-line">{{ getLogDetails.note }}</p>
                  </div>
                </div>

                <div v-if="getLogDetails.items && getLogDetails.items.length > 0" class="mt-4">
                  <h5 class="font-medium text-gray-700 mb-2">รายการอุปกรณ์</h5>
                  <div class="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ชื่ออุปกรณ์
                          </th>
                          <th
                            scope="col"
                            class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            จำนวน
                          </th>
                          <th
                            scope="col"
                            class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            จำนวนจริง
                          </th>
                          <th
                            scope="col"
                            class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(item, index) in getLogDetails.items" :key="index">
                          <td class="px-4 py-3 text-sm text-gray-800">
                            <div>{{ item.name }}</div>
                            <div class="text-xs text-gray-500">{{ item.code }}</div>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                            {{ item.quantity }} {{ item.unit }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-right">
                            <span
                              :class="{
                                'text-green-600': item.actualQuantity === item.quantity,
                                'text-yellow-600':
                                  item.actualQuantity < item.quantity && item.actualQuantity > 0,
                                'text-red-600': item.actualQuantity === 0,
                              }"
                              class="font-medium"
                            >
                              {{ item.actualQuantity }} {{ item.unit }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                            <span
                              :class="{
                                'bg-green-100 text-green-800': item.status === 'COMPLETE',
                                'bg-yellow-100 text-yellow-800': item.status === 'PARTIAL',
                                'bg-red-100 text-red-800':
                                  item.status === 'MISSING' || item.status === 'DAMAGED',
                                'bg-gray-100 text-gray-800': ![
                                  'COMPLETE',
                                  'PARTIAL',
                                  'MISSING',
                                  'DAMAGED',
                                ].includes(item.status),
                              }"
                              class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            >
                              {{
                                {
                                  COMPLETE: 'ครบถ้วน',
                                  PARTIAL: 'บางส่วน',
                                  MISSING: 'สูญหาย',
                                  DAMAGED: 'ชำรุด',
                                }[item.status] || item.status
                              }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="mt-3 space-y-2">
                    <div v-for="(item, index) in getLogDetails.items" :key="`note-${index}`">
                      <div
                        v-if="item.note"
                        class="bg-gray-50 p-3 rounded-md border border-gray-200"
                      >
                        <p class="text-sm font-medium text-gray-700">หมายเหตุ: {{ item.name }}</p>
                        <p class="text-sm text-gray-600 whitespace-pre-line">{{ item.note }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center">
                    <CheckCircleIcon class="h-5 w-5 text-pink-500 mr-2" />
                    <p class="text-pink-800 font-medium">อุปกรณ์ถูกเช็คเข้าเรียบร้อยแล้ว</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">ไม่มีข้อมูลเพิ่มเติม</div>
            </div>
            <!-- ปิดแทค-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logService from '@/services/log.js'
import {
  EyeIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  MinusIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/vue/24/solid'

import Swal from 'sweetalert2'

export default {
  name: 'LogsView',
  components: {
    EyeIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowsRightLeftIcon,
    TrashIcon,
    MinusIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    PencilIcon,
    PlusIcon,
  },
  data() {
    return {
      logs: [],
      loading: false,
      selectedLog: null,
      filters: {
        action: '',
        targetType: '',
        startDate: '',
        endDate: '',
      },
      currentPage: 1,
      pageSize: 10,
      totalLogs: 0,
      totalPages: 0,
      actionSearchQuery: '',
      showActionDropdown: false,
      actionOptions: [
        { value: 'LOGIN', label: 'เข้าสู่ระบบ' },
        { value: 'LOGIN_GOOGLE', label: 'เข้าสู่ระบบด้วย Google' },
        { value: 'REGISTER', label: 'สมัครสมาชิก' },
        { value: 'REGISTER_GOOGLE', label: 'สมัครสมาชิกด้วย Google' },
        { value: 'ADD_JOB_ITEM', label: 'เพิ่มอุปกรณ์ ให้กับงาน' },
        { value: 'UPDATE_JOB_ITEM', label: 'แก้ไขอุปกรณ์ ในงาน' },
        { value: 'DELETE_JOB_ITEM', label: 'ลบอุปกรณ์ ออกจากงาน' },
        { value: 'CHECKOUT', label: 'เบิกอุปกรณ์' },
        { value: 'CHECKIN', label: 'คืนอุปกรณ์' },
        { value: 'CREATE_ITEM', label: 'เพิ่มอุปกรณ์' },
        { value: 'UPDATE_ITEM', label: 'แก้ไขอุปกรณ์' },
        { value: 'DELETE_ITEM', label: 'ลบอุปกรณ์' },
        { value: 'IMPORT_ITEMS', label: 'นำเข้าอุปกรณ์' },
        { value: 'CREATE_UNIT', label: 'เพิ่มหน่วยนับ' },
        { value: 'UPDATE_UNIT', label: 'แก้ไขหน่วยนับ' },
        { value: 'DELETE_UNIT', label: 'ลบหน่วยนับ' },
        { value: 'CREATE_CATEGORY', label: 'เพิ่มหมวดหมู่' },
        { value: 'UPDATE_CATEGORY', label: 'แก้ไขหมวดหมู่' },
        { value: 'DELETE_CATEGORY', label: 'ลบหมวดหมู่' },
        { value: 'CREATE_JOB', label: 'เพิ่มงาน' },
        { value: 'UPDATE_JOB', label: 'แก้ไขงาน' },
        { value: 'DELETE_JOB', label: 'ลบงาน' },
      ],
    }
  },
  computed: {
    paginationPages() {
      const pages = []

      if (this.totalPages <= 7) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)

        if (this.currentPage > 3) {
          pages.push('...')
        }

        const startPage = Math.max(2, this.currentPage - 1)
        const endPage = Math.min(this.totalPages - 1, this.currentPage + 1)

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        if (this.currentPage < this.totalPages - 2) {
          pages.push('...')
        }

        pages.push(this.totalPages)
      }

      return pages
    },
    getLogDetails() {
      if (!this.selectedLog || !this.selectedLog.details) return null

      if (typeof this.selectedLog.details === 'string') {
        try {
          return JSON.parse(this.selectedLog.details)
        } catch (e) {
          return { message: this.selectedLog.details }
        }
      }

      return this.selectedLog.details
    },
    filteredActions() {
      if (!this.actionSearchQuery) {
        return this.actionOptions
      }
      const query = this.actionSearchQuery.toLowerCase()
      return this.actionOptions.filter(
        (action) =>
          action.label.toLowerCase().includes(query) || action.value.toLowerCase().includes(query),
      )
    },
  },
  created() {
    this.fetchLogs()
  },
  methods: {
    async fetchLogs() {
      this.loading = true

      try {
        const response = await logService.getLogs({
          page: this.currentPage,
          limit: this.pageSize,
          action: this.filters.action,
          targetType: this.filters.targetType,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
        })

        this.logs = response.data.logs
        this.totalLogs = response.data.total
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('Error fetching logs:', error)
        Swal.fire.error('ไม่สามารถดึงข้อมูลประวัติการทำงานได้ กรุณาลองใหม่อีกครั้ง', {
          position: 'top-right',
          timeout: 5000,
          closeOnClick: true,
        })
      } finally {
        this.loading = false
      }
    },

    resetFilters() {
      this.filters = {
        action: '',
        targetType: '',
        startDate: '',
        endDate: '',
      }
      this.currentPage = 1
      this.fetchLogs()
    },

    changePage(page) {
      if (page === '...' || page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchLogs()
    },

    selectLog(log) {
      this.selectedLog = log
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date)
    },

    getActionText(action) {
      const actionMap = {
        LOGIN: 'เข้าสู่ระบบ',
        CREATE: 'สร้างรายการ',
        UPDATE: 'แก้ไขรายการ',
        DELETE: 'ลบรายการ',
        CHECKOUT: 'เบิกอุปกรณ์',
        CHECKIN: 'คืนอุปกรณ์',
        REGISTER: 'ลงทะเบียนผู้ใช้',
        LOGIN_GOOGLE: 'เข้าสู่ระบบด้วย Google',
        REGISTER_GOOGLE: 'ลงทะเบียนด้วย Google',
        IMPORT_ITEMS: 'นำเข้าอุปกรณ์',
        CREATE_ITEM: 'สร้างอุปกรณ์',
        UPDATE_ITEM: 'แก้ไขอุปกรณ์',
        DELETE_ITEM: 'ลบอุปกรณ์',
        CREATE_UNIT: 'สร้างหน่วยนับ',
        UPDATE_UNIT: 'แก้ไขหน่วยนับ',
        DELETE_UNIT: 'ลบหน่วยนับ',
        CREATE_CATEGORY: 'สร้างหมวดหมู่',
        UPDATE_CATEGORY: 'แก้ไขหมวดหมู่',
        DELETE_CATEGORY: 'ลบหมวดหมู่',
        CREATE_JOB: 'สร้างงาน',
        UPDATE_JOB: 'แก้ไขงาน',
        DELETE_JOB: 'ลบงาน',
        ADD_JOB_ITEM: 'เพิ่มอุปกรณ์ในงาน',
        UPDATE_JOB_ITEM: 'แก้ไขอุปกรณ์ในงาน',
        DELETE_JOB_ITEM: 'ลบอุปกรณ์ออกจากงาน',
        CHECKOUT: 'เบิกอุปกรณ์',
        CHECKIN: 'คืนอุปกรณ์',
      }

      return actionMap[action] || action
    },

    getActionBadgeClass(action) {
      const classMap = {
        LOGIN: 'bg-green-100 text-green-800',
        CREATE: 'bg-blue-100 text-blue-800',
        UPDATE: 'bg-purple-100 text-purple-800',
        DELETE: 'bg-red-100 text-red-800',
        CHECKOUT: 'bg-indigo-100 text-indigo-800',
        CHECKIN: 'bg-pink-100 text-pink-800',
        REGISTER: 'bg-teal-100 text-teal-800',
        LOGIN_GOOGLE: 'bg-red-100 text-red-800',
        REGISTER_GOOGLE: 'bg-red-100 text-red-800',
        IMPORT_ITEMS: 'bg-blue-100 text-blue-800',
        CREATE_ITEM: 'bg-blue-100 text-blue-800',
        UPDATE_ITEM: 'bg-purple-100 text-purple-800',
        DELETE_ITEM: 'bg-red-100 text-red-800',
        CREATE_UNIT: 'bg-blue-100 text-blue-800',
        UPDATE_UNIT: 'bg-purple-100 text-purple-800',
        DELETE_UNIT: 'bg-red-100 text-red-800',
        CREATE_CATEGORY: 'bg-blue-100 text-blue-800',
        UPDATE_CATEGORY: 'bg-purple-100 text-purple-800',
        DELETE_CATEGORY: 'bg-red-100 text-red-800',
        CREATE_JOB: 'bg-green-100 text-green-800',
        UPDATE_JOB: 'bg-purple-100 text-purple-800',
        DELETE_JOB: 'bg-red-100 text-red-800',
        ADD_JOB_ITEM: 'bg-indigo-100 text-indigo-800',
        UPDATE_JOB_ITEM: 'bg-purple-100 text-purple-800',
        DELETE_JOB_ITEM: 'bg-red-100 text-red-800',
        CHECKOUT: 'bg-indigo-100 text-indigo-800',
        CHECKIN: 'bg-pink-100 text-pink-800',
      }

      return classMap[action] || 'bg-gray-100 text-gray-800'
    },

    getTargetText(log) {
      if (!log.targetType) return 'ไม่ระบุ'

      const targetTypeMap = {
        User: 'ผู้ใช้งาน',
        Item: 'อุปกรณ์',
        Job: 'งาน',
        Category: 'หมวดหมู่',
        Unit: 'หน่วยนับ',
        Checkin: 'คืนอุปกรณ์',
        Checkout: 'เบิกอุปกรณ์',
        JobItem: 'อุปกรณ์ในงาน',
      }

      const type = targetTypeMap[log.targetType] || log.targetType
      return `${type} ${log.targetId ? `#${log.targetId}` : ''}`
    },

    getTargetTypeText(targetType) {
      const targetTypeMap = {
        User: 'ผู้ใช้งาน',
        Item: 'อุปกรณ์',
        Job: 'งาน',
        Category: 'หมวดหมู่',
        Unit: 'หน่วยนับ',
        Checkin: 'คืนอุปกรณ์',
        Checkout: 'เบิกอุปกรณ์',
        JobItem: 'อุปกรณ์ในงาน',
      }

      return targetTypeMap[targetType] || targetType
    },

    getShortDetails(details) {
      if (!details) return 'ไม่มีรายละเอียด'

      if (typeof details === 'string') {
        try {
          const parsed = JSON.parse(details)
          if (parsed.message) return parsed.message
          return details.substring(0, 50) + (details.length > 50 ? '...' : '')
        } catch (e) {
          return details.substring(0, 50) + (details.length > 50 ? '...' : '')
        }
      }

      if (details.message) return details.message

      return (
        JSON.stringify(details).substring(0, 50) +
        (JSON.stringify(details).length > 50 ? '...' : '')
      )
    },

    isJsonString(str) {
      if (typeof str !== 'string') return false
      try {
        JSON.parse(str)
        return true
      } catch (e) {
        return false
      }
    },

    formatJson(jsonString) {
      if (typeof jsonString === 'string') {
        try {
          const obj = JSON.parse(jsonString)
          return JSON.stringify(obj, null, 2)
        } catch (e) {
          return jsonString
        }
      }
      return JSON.stringify(jsonString, null, 2)
    },

    getRoleText(role) {
      const roleMap = {
        ADMIN: 'ผู้ดูแลระบบ',
        STAFF: 'เจ้าหน้าที่',
        USER: 'ผู้ใช้งานทั่วไป',
      }

      return roleMap[role] || role
    },

    formatScheduledDate(dateString) {
      if (!dateString) return 'ไม่ระบุ'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date)
    },

    selectAction(actionValue) {
      this.filters.action = actionValue
      if (actionValue === '') {
        this.actionSearchQuery = ''
      } else {
        const selectedAction = this.actionOptions.find((a) => a.value === actionValue)
        this.actionSearchQuery = selectedAction ? selectedAction.label : ''
      }
      this.showActionDropdown = false
      this.fetchLogs()
    },

    handleActionBlur() {
      setTimeout(() => {
        this.showActionDropdown = false
      }, 200)
    },
  },
}
</script>
