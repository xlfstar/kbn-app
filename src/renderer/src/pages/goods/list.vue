<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    :api="goodsApi.getGoodsList"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? goodsApi.updateGoods : goodsApi.createGoods"
    :scroll-x="1600"
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
import { ref, computed } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { goodsApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { useCategoryStore } from '@renderer/stores'

const categoryStore = useCategoryStore()
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})

const categoryOptions = computed(() => categoryStore.categoriesTree)
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
  { titleKey: 'code', key: 'code', width: 150, inputType: 'input' },

  { titleKey: 'name', key: 'name', width: 150, inputType: 'input' },
  { titleKey: 'enName', key: 'enName', width: 150, inputType: 'input' },
  {
    titleKey: 'aside.category',
    key: 'categoryId',
    width: 150,
    inputType: 'treeSelect',
    options: categoryOptions.value,
    keyField: 'id'
  },
  {
    titleKey: 'manufacturer',
    key: 'manufacturer',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'warehouse',
    key: 'warehouse',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'location',
    key: 'location',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'manufacturer',
    key: 'manufacturer',
    width: 150,
    inputType: 'input'
  },
  { titleKey: 'picture', key: 'picture', width: 150, inputType: 'input' },
  {
    titleKey: 'aside.supplier',
    key: 'supplierIds',
    width: 100
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
    filterMultiple: true
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
    await goodsApi.removeGoods(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  console.log({ ids })
  if (ids.length > 0) {
    goodsApi.removeGoodsList({ ids }).then((res) => {
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
</script>

<style lang="scss" scoped></style>
