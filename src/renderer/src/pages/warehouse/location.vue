<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    :api="warehouseLocationApi.getWarehouseLocationList"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="
      isEdit
        ? warehouseLocationApi.updateWarehouseLocation
        : warehouseLocationApi.createWarehouseLocation
    "
    :multiple-check="true"
    :rules="rules"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
  >
    <template #maxWeight-suffix>KG</template>
    <template #maxVolume-suffix>m³</template>
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed, onMounted } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { warehouseLocationApi, warehouseLocationTypeApi, warehouseApi,warehouseAreaTypeApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'

const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const statusOptions = computed(() => [
  {
    label: t('used'),
    value: 2
  },
  {
    label: t('enable'),
    value: 1
  },
  {
    label: t('disable'),
    value: 0
  }
])
const rules = {
  name: [
    {
      required: true,
      message: t('requiredErrorMessage', { key: 'name' })
    }
  ]
}
const columns = ref([
  { titleKey: 'name', key: 'name', width: 150, inputType: 'input' },

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
    titleKey: 'locationCode',
    key: 'locationCode',
    width: 120,
    inputType: 'input'
  },
  {
    titleKey: 'shelfNo',
    key: 'shelfNo',
    width: 100,
    inputType: 'input',
    filterable: false
  },
  {
    titleKey: 'layerNo',
    key: 'layerNo',
    width: 100,
    inputType: 'input',
    filterable: false
  },
  {
    titleKey: 'positionNo',
    key: 'positionNo',
    width: 100,
    inputType: 'input',
    filterable: false
  },
  {
    titleKey: 'warehouseAreaType',
    key: 'areaTypeId',
    width: 100,
    inputType: 'xSelect',
    api:warehouseAreaTypeApi.getAllWarehouseAreaTypes
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
    },
    defaultValue: 1
  },
  {
    titleKey: 'maxWeight',
    key: 'maxWeight',
    width: 100,
    inputType: 'number',
    showButton: false,
    style: { width: '100%' },
    filterable: false
  },

  {
    titleKey: 'maxVolume',
    key: 'maxVolume',
    width: 100,
    inputType: 'input',
    showButton: false,
    style: { width: '100%' },
    filterable: false
  },
  { titleKey: 'sort', key: 'sort', width: 60, inputType: 'input', filterable: false },
  {
    titleKey: 'status',
    key: 'status',
    width: 100,
    render: (row) => {
      const { status } = row || {}
      const text = status === 1 ? t('enable') : t('disable')
      const type = status === 1 ? 'success' : 'error'
      return (
        <NTag bordered={false} type={type} size="small">
          {text}
        </NTag>
      )
    },
    inputType: 'select',
    options: statusOptions.value,
    filterMultiple: true,
    defaultValue: 1
  },

  // {
  //   titleKey: 'remark',
  //   key: 'remark',
  //   width: 150,
  //   inputType: 'input',
  //   filterable: false,
  //   props: {
  //     type: 'textarea'
  //   }
  // },
  {
    titleKey: 'createdAt',
    key: 'createdAt',
    width: 100,
    render: (row) => dayjs(row.createdAt).format('YYYY-MM-DD')
  },
  {
    titleKey: 'updatedAt',
    key: 'updatedAt',
    width: 100,
    render: (row) => dayjs(row.updatedAt).format('YYYY-MM-DD')
  },
  {
    titleKey: 'actions',
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (row) => {
      return (
        <NSpace>
          <NButton type="info" size="tiny" onClick={() => handleEdit(row)}>
            {t('edit')}
          </NButton>
          <NPopconfirm
            negative-text={t('cancel')}
            positive-text={t('confirm')}
            on-positive-click={() => handleDelItem(row)}
          >
            {{
              default: () => t('confirmDelete'),
              trigger: () => (
                <NButton type="error" size="tiny">
                  {t('delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      )
    }
  }
])
const handleRefresh = () => {
  isRefresh.value = true
}

const handleEdit = (row) => {
  // eslint-disable-next-line no-unused-vars
  currentRow.value = row
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row || {}
  isEdit.value = true
  modalFormData.value = { ...rest }
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    await warehouseLocationApi.removeWarehouseLocation(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    warehouseLocationApi.removeWarehouseLocationList({ ids }).then((res) => {
      if (res.success) {
        handleRefresh()
      }
    })
  }
}

const closeModal = () => {
  modalFormData.value = {}
}
const handleComfirm = (e) => {
  if (!e) return
}

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
