<template>
  <div class="h-full flex flex-col">
    <div
      class="bg-(--bg-content-color) p-4 rounded-t-lg shadow-sm flex justify-between items-center mb-4"
    >
      <div class="text-lg font-bold flex items-center gap-2">
        <n-button circle secondary size="small" @click="handleBack">
          <template #icon>
            <div class="i-icon-arrow-left" />
          </template>
        </n-button>
        {{ t('create') }} {{ t('goods') }}
      </div>
      <n-space>
        <n-button @click="handleBack">{{ t('cancel') }}</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ t('save') }}
        </n-button>
      </n-space>
    </div>

    <div class="flex-1 overflow-hidden bg-(--bg-content-color) rounded-lg p-4 shadow-sm">
      <n-scrollbar>
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
          label-width="auto"
          require-mark-placement="right-hanging"
          class="max-w-5xl mx-auto"
        >
          <n-tabs type="line" animated>
            <!-- Tab 1: 基本信息 -->
            <n-tab-pane name="basic" :tab="t('baseInfo')">
              <n-grid :cols="24" :x-gap="24">
                <n-form-item-gi :span="8" :label="t('code')" path="code">
                  <n-input v-model:value="form.code" :placeholder="t('code')" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('name')" path="name">
                  <n-input v-model:value="form.name" :placeholder="t('name')" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('enName')" path="enName">
                  <n-input v-model:value="form.enName" :placeholder="t('enName')" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('category')" path="categoryId">
                  <x-select v-model:value="form.categoryId" :api="categoryApi.getAllCategories" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('manufacturer')" path="manufacturer">
                  <n-input v-model:value="form.manufacturer" :placeholder="t('manufacturer')" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('supplier')" path="supplierIds">
                  <!-- <n-select
                    v-model:value="form.supplierIds"
                    :options="supplierOptions"
                    value-field="id"
                    label-field="name"
                    :placeholder="t('supplier')"
                    clearable
                    multiple
                  /> -->
                  <x-select
                    v-model:value="form.supplierIds"
                    :api="supplierApi.getSupplierList"
                    multiple
                    :placeholder="t('supplier')"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="24" :label="t('remark')" path="remark">
                  <n-input v-model:value="form.remark" type="textarea" :placeholder="t('remark')" />
                </n-form-item-gi>
              </n-grid>
            </n-tab-pane>

            <!-- Tab 2: 规格参数 -->
            <n-tab-pane name="specs" :tab="t('specs')">
              <n-grid :cols="24" :x-gap="24">
                <n-form-item-gi :span="8" :label="t('packagingUnit')" path="packagingUnit">
                  <x-select
                    v-model:value="form.packagingUnit"
                    :api="goodsApi.getPackageList"
                    :placeholder="t('packagingUnit')"
                    clearable
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('packagingSpec')" path="packagingSpec">
                  <n-input v-model:value="form.packagingSpec" :placeholder="t('packagingSpec')" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('specName')" path="specName">
                  <n-input v-model:value="form.specName" :placeholder="t('specName')" />
                </n-form-item-gi>

                <n-form-item-gi :span="8" :label="t('packagingNumber')" path="packagingNumber">
                  <n-input-number
                    v-model:value="form.packagingNumber"
                    :placeholder="t('packagingNumber')"
                    :min="0"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('weightUnit')" path="weightUnit">
                  <!-- <n-select
                    v-model:value="form.weightUnit"
                    :options="weightUnitOptions"
                    value-field="id"
                    label-field="name"
                    :placeholder="t('weightUnit')"
                    clearable
                  /> -->
                  <x-select
                    v-model:value="form.weightUnit"
                    :api="goodsApi.getWeightList"
                    :placeholder="t('weightUnit')"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('netWeight')" path="netWeight">
                  <n-input-number
                    v-model:value="form.netWeight"
                    :placeholder="t('netWeight')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('grossWeight')" path="grossWeight">
                  <n-input-number
                    v-model:value="form.grossWeight"
                    :placeholder="t('grossWeight')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('palletSpec')" path="palletSpec">
                  <n-input-number
                    v-model:value="form.palletSpec"
                    :placeholder="t('palletSpec')"
                    class="w-full"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-tab-pane>

            <!-- Tab 3: 库存与仓储 -->
            <n-tab-pane name="stock" tab="库存与仓储">
              <n-grid :cols="24" :x-gap="24">
                <n-form-item-gi :span="8" :label="t('warehouse')" path="warehouseId">
                  <template #label>
                    <div class="flex justify-between items-center w-full help-label">
                      <span class="mr-4">{{ t('warehouse') }}</span>
                      <Icon name="icon-help-fill" size="14px" class="cursor-pointer" />
                    </div>
                  </template>
                  <x-select v-model:value="form.warehouseId" :api="warehouseApi.getWarehouseList" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('warehouseZone')" path="warehouseZoneId">
                  <x-select
                    v-model:value="form.warehouseZoneId"
                    :api="warehouseZoneApi.getWarehouseZoneList"
                    value-field="id"
                    label-field="name"
                    :placeholder="t('warehouseZone')"
                    clearable
                  />
                </n-form-item-gi>
                <!-- <n-form-item-gi
                  :span="8"
                  :label="t('warehouseLocation')"
                  path="warehouseLocationId"
                >
                  <x-select
                    v-model:value="form.warehouseLocationId"
                    :api="warehouseLocationApi.getWarehouseLocationList"
                    :query="{ warehouseId: form.warehouseId }"
                  />
                </n-form-item-gi> -->

                <n-form-item-gi :span="8" :label="t('minStock')" path="minStock">
                  <n-input-number
                    v-model:value="form.minStock"
                    :placeholder="t('minStock')"
                    :min="0"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('maxStock')" path="maxStock">
                  <n-input-number
                    v-model:value="form.maxStock"
                    :placeholder="t('maxStock')"
                    :min="0"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('safetyStock')" path="safetyStock">
                  <n-input-number
                    v-model:value="form.safetyStock"
                    :placeholder="t('safetyStock')"
                    :min="0"
                    class="w-full"
                  />
                </n-form-item-gi>

                <n-form-item-gi :span="8" :label="t('shelfLife')" path="shelfLife">
                  <n-input-number
                    v-model:value="form.shelfLife"
                    :placeholder="t('shelfLife')"
                    :min="0"
                    :precision="0"
                    class="w-full"
                  >
                    <template #suffix>{{ t('days') }}</template>
                  </n-input-number>
                </n-form-item-gi>
                <n-form-item-gi
                  :span="8"
                  :label="t('warehouseDateWarning')"
                  path="warehouseDateWarning"
                >
                  <n-input-number
                    v-model:value="form.warehouseDateWarning"
                    :placeholder="t('warehouseDateWarning')"
                    :min="0"
                    :precision="0"
                    class="w-full"
                  >
                    <template #suffix>{{ t('days') }}</template>
                  </n-input-number>
                </n-form-item-gi>
              </n-grid>
            </n-tab-pane>

            <!-- Tab 4: 价格与成本 -->
            <n-tab-pane name="price" :tab="t('priceAndCost')">
              <n-grid :cols="24" :x-gap="24">
                <n-form-item-gi :span="8" :label="t('arrivalCost')" path="cost">
                  <n-input-number
                    v-model:value="form.cost"
                    :placeholder="t('arrivalCost')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('netPrice')" path="netPrice">
                  <n-input-number
                    v-model:value="form.netPrice"
                    :placeholder="t('netPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('referencePrice')" path="referencePrice">
                  <n-input-number
                    v-model:value="form.referencePrice"
                    :placeholder="t('referencePrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>

                <n-form-item-gi :span="8" :label="t('extraFee')" path="extraFee">
                  <n-input-number
                    v-model:value="form.extraFee"
                    :placeholder="t('extraFee')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('surcharge')" path="surcharge">
                  <n-input-number
                    v-model:value="form.surcharge"
                    :placeholder="t('surcharge')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="t('lowestPrice')" path="lowestPrice">
                  <n-input-number
                    v-model:value="form.lowestPrice"
                    :placeholder="t('lowestPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  >
                  </n-input-number>
                </n-form-item-gi>

                <n-grid-item :span="24">
                  <div class="text-gray-500 mb-2">{{ t('tieredPricing') }}</div>
                </n-grid-item>

                <n-form-item-gi :span="4" :label="t('firstPrice')" path="firstPrice">
                  <n-input-number
                    v-model:value="form.firstPrice"
                    :placeholder="t('firstPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="4" :label="t('secondPrice')" path="secondPrice">
                  <n-input-number
                    v-model:value="form.secondPrice"
                    :placeholder="t('secondPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="4" :label="t('thirdPrice')" path="thirdPrice">
                  <n-input-number
                    v-model:value="form.thirdPrice"
                    :placeholder="t('thirdPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="4" :label="t('fourthPrice')" path="fourthPrice">
                  <n-input-number
                    v-model:value="form.fourthPrice"
                    :placeholder="t('fourthPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="4" :label="t('fifthPrice')" path="fifthPrice">
                  <n-input-number
                    v-model:value="form.fifthPrice"
                    :placeholder="t('fifthPrice')"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-tab-pane>
            <n-tab-pane name="images" :tab="t('picture')">
              <n-upload
                :action="uploadActionUrl"
                :default-file-list="imageList"
                :headers="uploadHeaders"
                accept="image/*"
                multiple
                list-type="image-card"
                @finish="handleFinish"
              />
              <!-- <x-upload /> -->
            </n-tab-pane>
          </n-tabs>
        </n-form>
      </n-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NFormItemGi,
  NInput,
  NInputNumber,
  NUpload,
  NButton,
  NSpace,
  NTabs,
  NTabPane,
  NGrid,
  NGridItem,
  NScrollbar,
  useMessage
} from 'naive-ui'
import { t } from '@renderer/locales'
import { goodsApi, categoryApi, warehouseApi, supplierApi, warehouseZoneApi } from '@renderer/api'
import XSelect from '@renderer/components/InputView/select.vue'
import { Icon } from '@renderer/components'
import { useAuthStore } from '@renderer/stores'

const authStore = useAuthStore()
const BASE_API_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:3001/api'
const uploadActionUrl = BASE_API_URL + '/upload/image'
const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const imageList = ref([])
const uploadHeaders = ref({
  Authorization: 'Bearer ' + authStore.token
})
const handleFinish = ({ file, event }) => {
  const res = JSON.parse(event.target.response)

  if (res.code === 200 || res.success) {
    const url = res.data?.url || res.data
    if (url) {
      imageList.value.push({
        id: file.id,
        url,
        name: file.name,
        status: 'finish'
      })
    }
  }
}

// 表单数据
const form = ref({
  code: '',
  name: '',
  enName: '',
  categoryId: null,
  manufacturer: '',
  warehouseId: null,
  warehouseZoneId: null,
  // warehouseLocationId: null,
  supplierIds: null, // 假设是数组或字符串，这里如果是多选select，通常是数组
  packagingUnit: null,
  innerUnit: null,
  packagingSpec: '',
  specName: '',
  weightUnit: null,
  minStock: 0,
  maxStock: 0,
  safetyStock: 0,
  palletSpec: 0,
  netWeight: 0,
  grossWeight: 0,
  shelfLife: 0,
  warehouseDateWarning: 0,
  packagingNumber: 0,
  netPrice: 0,
  extraFee: 0,
  surcharge: 0,
  cost: 0,
  lowestPrice: 0,
  referencePrice: 0,
  firstPrice: 0,
  secondPrice: 0,
  thirdPrice: 0,
  fourthPrice: 0,
  fifthPrice: 0,
  remark: ''
})

// 验证规则
const rules = {
  code: { required: true, message: '请输入商品编码', trigger: 'blur' },
  name: { required: true, message: '请输入商品名称', trigger: 'blur' },
  categoryId: {
    type: 'number',
    required: true,
    message: '请选择商品分类',
    trigger: ['blur', 'change']
  },
  cost: {
    type: 'number',
    required: true,
    message: '请输入到库成本价',
    trigger: ['blur', 'change']
  },
  netPrice: {
    type: 'number',
    required: true,
    message: '请输入来货净价',
    trigger: ['blur', 'change']
  }
}

const handleBack = () => {
  router.back()
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        // 处理数据格式，例如 supplierIds 如果是数组转字符串等，根据后端需求
        // 假设 supplierIds 应该是逗号分隔字符串
        const payload = { ...form.value }
        if (Array.isArray(payload.supplierIds)) {
          payload.supplierIds = payload.supplierIds.join(',')
        }

        // await goodsApi.createGoods(payload)
        message.success(t('createSuccess'))
        router.back()
      } catch (error) {
        console.error(error)
        // message.error(error.message || t('createFailed'))
      } finally {
        loading.value = false
      }
    } else {
      message.error(t('formValidateFailed'))
    }
  })
}
</script>

<style scoped>
:deep(.n-form-item-label__text:has(> .help-label)) {
  flex: 1;
}
</style>
