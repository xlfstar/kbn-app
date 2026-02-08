<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:modal-form-data="modalFormData"
    :api="supplierApi.getSupplierList"
    :page-options="true"
    :modal-api="isEdit ? supplierApi.updateSupplier : supplierApi.createSupplier"
    :scroll-x="2000"
    :multiple-check="true"
    :rules="rules"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
  >
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed, watch, nextTick } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { supplierApi, areaApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'

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
    label: t('enable'),
    value: 1
  },
  {
    label: t('disable'),
    value: 0
  }
])
const rules = {
  username: [
    {
      required: true,
      max: 20,
      min: 3,
      message: t('requiredErrorMessage', { key: 'username' })
    }
  ]
}
const columns = ref([
  { titleKey: 'code', key: 'code', width: 100, inputType: 'input' },

  { titleKey: 'name', key: 'name', width: 200, inputType: 'input' },
  { titleKey: 'enName', key: 'enName', width: 200, inputType: 'input' },
  { titleKey: 'contact', key: 'contact', width: 100, inputType: 'input' },
  { titleKey: 'telephone', key: 'phone', width: 100, inputType: 'input' },
  { titleKey: 'email', key: 'email', width: 150, inputType: 'input', filterable: false },

  {
    titleKey: 'state',
    key: 'provinceId',
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
    render: (row) => row.province?.name || ''
  },
  {
    titleKey: 'city',
    key: 'cityId',
    width: 150,
    inputType: 'select',
    filterable: false,
    options: cityOptions,
    valueField: 'id',
    render: (row) => row.city?.name || ''
  },
  { titleKey: 'address', key: 'address', width: 150, inputType: 'input', filterable: false },

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

const handleEdit = async (row) => {
  // eslint-disable-next-line no-unused-vars
  currentRow.value = row
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row || {}
  modalFormData.value = { ...rest }
  isEdit.value = true
  await nextTick()
  const provinceRef = tableRef.value.getFieldRef('provinceId')
  if (provinceRef) {
    const opts = provinceRef.hasCache()
      ? provinceRef.getOptions()
      : (await provinceRef.refresh(), provinceRef.getOptions())
    stateOptions.value = opts
  }
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    await supplierApi.removeSupplier(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    supplierApi.removeSupplierList({ ids }).then((res) => {
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

watch(cityOptions, (opts) => {
  const col = columns.value.find((i) => i.key === 'cityId')
  if (col) col.options = opts
})

watch(
  () => [modalFormData.value.provinceId, stateOptions.value],
  ([val, s], [oldVal, _]) => {
    if (!isEdit.value) return
    cityOptions.value = val ? s.find((item) => item?.id === val)?.children || [] : []
    if (oldVal !== undefined && val !== oldVal) {
      modalFormData.value.cityId = null
    }
  }
)
</script>

<style lang="scss" scoped></style>
