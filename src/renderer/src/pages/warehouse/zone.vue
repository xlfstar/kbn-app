<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:query="query"
    :api="warehouseZoneApi.getWarehouseZoneList"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="
      isEdit ? warehouseZoneApi.updateWarehouseZone : warehouseZoneApi.createWarehouseZone
    "
    :scroll-x="1000"
    :multiple-check="true"
    modal-grid-cols="1"
    modal-width="400"
    :rules="rules"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
  >
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed, onMounted } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { warehouseZoneApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import { useSelectOptionsStore } from '@renderer/stores/modules/selectOptions'
import dayjs from 'dayjs'

const selectOptionsStore = useSelectOptionsStore()
const query = ref({})
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
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
  { titleKey: 'enName', key: 'enName', width: 150, inputType: 'input' },
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
  { titleKey: 'sort', key: 'sort', width: 60, inputType: 'input', filterable: false },
  {
    titleKey: 'remark',
    key: 'remark',
    width: 150,
    inputType: 'input',
    filterable: false,
    props: {
      type: 'textarea'
    }
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
  selectOptionsStore.refreshList(warehouseZoneApi.getAllWarehouseZones, 'zoneId')
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
    await warehouseZoneApi.removeWarehouseZone(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    warehouseZoneApi.removeWarehouseZoneList({ ids }).then((res) => {
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
  selectOptionsStore.refreshList(warehouseZoneApi.getAllWarehouseZones, 'zoneId')
}

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
