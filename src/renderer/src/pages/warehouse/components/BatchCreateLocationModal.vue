<template>
  <span>
    <n-button type="success" size="small" @click="handleCreateInBatches">
      <Icon name="icon-add" size="14px" />
      <span class="pl-1">{{ t('createInBatches') }}</span>
    </n-button>
    <draggable-modal
      v-model:visible="visible"
      :header="t('createInBatches')"
      :width="1000"
      :draggable="false"
      :loading="loading"
      @confirm="handleBatchSubmit"
      @close="visible = false"
    >
      <n-form ref="batchmodalFormRef" :model="batchFormData" size="small" :rules="rules">
        <n-grid :cols="'0 200:1 400:2 600:3 800:4 1000:5 1200:6'" :x-gap="12" :y-gap="12">
          <n-grid-item v-for="item in batchColumns" :key="item.key">
            <n-form-item :label="t(item.label || item.titleKey)" :path="item.key">
              <input-view v-model:value="batchFormData[item.key]" :col="item" position="modal">
                <template v-if="item.key === 'maxWeight'" #suffix>KG</template>
                <template v-else-if="['length', 'width', 'height'].includes(item.key)" #suffix
                  >CM</template
                >
              </input-view>
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </n-form>
    </draggable-modal>
  </span>
</template>
<script setup lang="jsx">
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NGrid, NGridItem, useMessage } from 'naive-ui'
import {
  warehouseLocationTypeApi,
  warehouseZoneApi,
  warehouseApi,
  warehouseLocationApi
} from '@renderer/api'
import { t } from '@renderer/locales'
import { InputView, DraggableModal, Icon } from '@renderer/components'

const emit = defineEmits(['success'])
const visible = ref(false)
const loading = ref(false)
const batchFormData = ref({
  warehouseId: null,
  zoneId: null,
  shelfNumbers: null,
  layerNumbers: null,
  positionNumbers: null,
  locationType: null,
  length: null,
  width: null,
  height: null,
  maxWeight: null
})
const batchmodalFormRef = ref(null)
const message = useMessage()

const generateLocations = async () => {
  const {
    zoneId,
    shelfNumbers,
    layerNumbers,
    positionNumbers,
    locationType,
    length,
    width,
    height,
    maxWeight,
    warehouseId
  } = batchFormData.value

  let startShelf = 1
  try {
    const res = await warehouseLocationApi.getMaxShelfNoByWarehouseId({
      warehouseId
    })
    if (res && res.data && res.data.maxShelfNo !== null) {
      startShelf = res.data.maxShelfNo + 1
    }
  } catch (error) {
    console.error('获取最大货架号失败', error)
  }

  const locationCodes = []
  for (let shelf = 0; shelf < shelfNumbers; shelf++) {
    for (let layer = 0; layer < layerNumbers; layer++) {
      for (let position = 0; position < positionNumbers; position++) {
        const currentShelf = startShelf + shelf
        const locationCode = `${currentShelf}-${layer + 1}-${position + 1}`
        const item = {
          warehouseId,
          shelfNo: currentShelf,
          layerNo: layer + 1,
          positionNo: position + 1,
          zoneId,
          locationCode,
          name: locationCode,
          locationType,
          length,
          width,
          height,
          maxWeight
        }
        locationCodes.push(item)
      }
    }
  }
  return locationCodes
}
const rules = {
  warehouseId: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('warehouse') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  zoneId: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('warehouseZone') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  shelfNumbers: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('numberOfShelves') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  layerNumbers: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('numberOfLayersPerShelf') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  positionNumbers: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('numberOfPositionsPerLayer') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  locationType: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('locationType') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  length: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('length') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  width: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('width') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  height: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('height') }),
      trigger: ['input', 'blur', 'change']
    }
  ],
  maxWeight: [
    {
      required: true,
      type: 'number',
      message: t('requiredErrorMessage', { key: t('maxWeightPerPosition') }),
      trigger: ['input', 'blur', 'change']
    }
  ]
}
const batchColumns = ref([
  {
    titleKey: 'warehouse',
    key: 'warehouseId',
    width: 150,
    inputType: 'xSelect',
    api: warehouseApi.getAllWarehouses,
    render: (row) => {
      const { warehouse } = row || {}
      return warehouse?.name || ''
    }
  },
  {
    titleKey: 'warehouseZone',
    key: 'zoneId',
    width: 130,
    inputType: 'xSelect',
    api: warehouseZoneApi.getAllWarehouseZones,
    render: (row) => {
      const { zone } = row || {}
      return zone?.name || ''
    }
  },
  {
    titleKey: 'numberOfShelves',
    key: 'shelfNumbers',
    inputType: 'number',
    precision: 0,
    min: 1,
    style: { width: '100%' }
  },
  {
    titleKey: 'numberOfLayersPerShelf',
    key: 'layerNumbers',
    inputType: 'number',
    precision: 0,
    min: 1,
    style: { width: '100%' }
  },
  {
    titleKey: 'numberOfPositionsPerLayer',
    key: 'positionNumbers',
    inputType: 'number',
    precision: 0,
    min: 1,
    style: { width: '100%' }
  },
  {
    titleKey: 'locationType',
    key: 'locationType',
    width: 150,
    inputType: 'xSelect',
    api: warehouseLocationTypeApi.getWarehouseLocationTypeList,
    render: (row) => {
      const { type } = row || {}
      return type?.name || ''
    }
    // filterable: false
  },
  {
    titleKey: 'maxWeightPerPosition',
    key: 'maxWeight',
    width: 120,
    inputType: 'number',
    showButton: false,
    style: { width: '100%' }
  },
  {
    titleKey: 'length',
    key: 'length',
    inputType: 'number',
    showButton: false,
    precision: 0,
    min: 1,
    style: { width: '100%' }
  },
  {
    titleKey: 'width',
    key: 'width',
    inputType: 'number',
    precision: 0,
    showButton: false,
    min: 1,
    style: { width: '100%' }
  },
  {
    titleKey: 'height',
    key: 'height',
    showButton: false,
    inputType: 'number',
    precision: 0,
    min: 1,
    style: { width: '100%' }
  }
])
const handleCreateInBatches = () => {
  visible.value = true
}
const handleBatchSubmit = () => {
  batchmodalFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const items = await generateLocations()
        // TODO: 调用批量创建API
        await warehouseLocationApi.batchCreateWarehouseLocation({ items })
        message.success('生成成功')
        visible.value = false
        emit('success')
      } catch (error) {
        console.error(error)
        message.error('生成失败')
      } finally {
        loading.value = false
      }
    } else {
      console.log(errors)
      message.error('验证失败')
    }
  })
}
</script>
