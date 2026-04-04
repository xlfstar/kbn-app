<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:query="query"
    :api="warehouseApi.getWarehouseList"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? warehouseApi.updateWarehouse : warehouseApi.createWarehouse"
    :multiple-check="true"
    :rules="rules"
    :scroll-x="2000"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
  >
    <template #area-suffix>m²</template>
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { warehouseTypeApi, warehouseApi, areaApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useSelectOptionsStore } from '@renderer/stores/modules/selectOptions'

const selectOptionsStore = useSelectOptionsStore()
const router = useRouter()
const query = ref({})
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const tableRef = ref(null)
const stateOptions = ref([])
const cityOptions = ref([])
const statusOptions = computed(() => [
  {
    labelKey: 'enable',
    value: 1
  },
  {
    labelKey: 'disable',
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
    titleKey: 'code',
    key: 'warehouseCode',
    width: 150,
    inputType: 'input'
  },

  {
    titleKey: 'warehouseType',
    key: 'warehouseType',
    width: 120,
    inputType: 'xSelect',
    api: warehouseTypeApi.getAllWarehouseTypes,
    filterable: false
  },
  {
    titleKey: 'state',
    key: 'state',
    width: 150,
    inputType: 'xSelect',
    filterable: false,
    api: areaApi.getAllAreas,
    childrenField: 'xxx',
    listeners: {
      change: (value, option) => {
        if (isEdit.value) return
        const children = option?.children || []
        cityOptions.value = children
      }
    },
    render: (row) => row.stateInfo?.name || ''
  },
  {
    titleKey: 'city',
    key: 'city',
    width: 150,
    inputType: 'select',
    filterable: false,
    options: cityOptions,
    valueField: 'id',
    render: (row) => row.cityInfo?.name || ''
  },
  { titleKey: 'address', key: 'address', width: 150, inputType: 'input', filterable: false },
  {
    titleKey: 'contactPerson',
    key: 'contactPerson',
    width: 100,
    inputType: 'input',
    filterable: false
  },
  {
    titleKey: 'contactPhone',
    key: 'contactPhone',
    width: 100,
    inputType: 'input',
    filterable: false
  },
  {
    titleKey: 'floorArea',
    key: 'area',
    width: 80,
    inputType: 'number',
    showButton: false,
    style: { width: '100%' },
    precision: 2,
    filterable: false
  },
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
  {
    titleKey: 'sort',
    key: 'sortOrder',
    width: 60,
    inputType: 'number',
    filterable: false,
    precision: 0,
    showButton: false,
    style: { width: '100%' }
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
    width: 150,
    render: (row) => {
      return (
        <NSpace>
          <NButton size="tiny" onClick={() => handleView(row)}>
            {t('detail')}
          </NButton>
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
  selectOptionsStore.refreshList(warehouseApi.getAllWarehouses, 'warehouseId')
}

const handleView = (row) => {
  const { id } = row || {}
  if (id) {
    router.push({
      path: '/warehouse/warehouseDetail',
      query: {
        id
      }
    })
  }
}

const handleEdit = async (row) => {
  // eslint-disable-next-line no-unused-vars
  currentRow.value = row
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row || {}
  isEdit.value = true
  modalFormData.value = { ...rest }
  await nextTick()
  const stateRef = tableRef.value.getFieldRef('state')
  if (stateRef) {
    const opts = stateRef.hasCache()
      ? stateRef.getOptions()
      : (await stateRef.refresh(), stateRef.getOptions())
    stateOptions.value = opts
  }
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    await warehouseApi.removeWarehouse(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    warehouseApi.removeWarehouseList({ ids }).then((res) => {
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
  selectOptionsStore.refreshList(warehouseApi.getAllWarehouses, 'warehouseId')
}

//更新
watch(cityOptions, (opts) => {
  const col = columns.value.find((i) => i.key === 'city')
  if (col) col.options = opts
})

watch(
  () => [modalFormData.value.state, stateOptions.value],
  ([val, s], [oldVal, _]) => {
    if (!isEdit.value) return
    cityOptions.value = val ? s.find((item) => item?.id === val)?.children || [] : []
    if (oldVal !== undefined && val !== oldVal) {
      modalFormData.value.cityId = null
    }
  }
)

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
