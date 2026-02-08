<template>
  <x-table
    ref="categoryTableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:refresh="refresh"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:query="query"
    :modal-api="modalApi"
    :modal-form-data="modalFormData"
    :scroll-x="1500"
    :table-data="categoryStore.allCategories"
    :loading="categoryStore.loading"
    :multiple-check="true"
    :filter-label="false"
    :page-options="false"
    @refresh="handleRefresh"
    @delete-items="handleDeleteItems"
  >
    <template #beforeModalForm>
      <NGridItem>
        <n-form-item :label="t('parentCategory')" path="parentId">
          <n-tree-select
            v-model:value="modalFormData.parentId"
            :options="parentOptions"
            clearable
            :placeholder="t('topCategory')"
            key-field="id"
          />
        </n-form-item>
      </NGridItem>
    </template>
    <template #storageFeeRate-suffix>%</template>
    <template #purchaseOrderHorizon-suffix>{{ t('days') }}</template>
  </x-table>
</template>
<script setup lang="jsx">
import { t } from '@renderer/locales'
import { categoryApi } from '@renderer/api'
import { XTable } from '@renderer/components'
import { ref, computed, watch, onMounted } from 'vue'
import { NTag, NPopconfirm, NButton, NSpace, NGridItem, NFormItem, NTreeSelect } from 'naive-ui'
import dayjs from 'dayjs'
import { useCategoryStore } from '@renderer/stores'

const categoryStore = useCategoryStore()
const categoryTableRef = ref(null)
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

const checkedRowKeys = ref([])
const modalFormData = ref({})
const query = ref({})
const isEdit = ref(false)
const modalApi = computed(() =>
  isEdit.value ? categoryApi.updateCategory : categoryApi.createCategory
)
const refresh = ref(false)
const handleEdit = (row) => {
  isEdit.value = true
  modalFormData.value = row
}
const handeleDelItem = async (row) => {
  const { id } = row || {}
  try {
    categoryStore.setLoading(true)
    const res = await categoryApi.removeCategory(id)
    if (res.success) {
      categoryStore.fetchAllCategories(query.value)
    }
  } catch (err) {
    console.log(err.message)
  } finally {
    categoryStore.setLoading(false)
  }
}
const handleDeleteItems = async (ids) => {
  try {
    categoryStore.setLoading(true)
    const res = await categoryApi.removeCategories({ ids })
    if (res.success) {
      categoryStore.fetchAllCategories(query.value)
    }
  } catch (err) {
    console.log(err.message)
  } finally {
    categoryStore.setLoading(false)
  }
}

const handleRefresh = (query) => {
  categoryStore.fetchAllCategories(query)
}
const parentOptions = computed(() =>
  categoryStore.categoriesTree.filter((item) => item.id !== modalFormData.value?.id)
)

const columns = ref([
  {
    titleKey: 'name',
    key: 'name',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'enName',
    key: 'enName',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'code',
    key: 'code',
    width: 150,
    inputType: 'input'
  },
  {
    titleKey: 'storageFeeRate',
    key: 'storageFeeRate',
    width: 120,
    inputType: 'number',
    filterable: false,
    showButton: false,
    style: { width: '100%' },
    precision: 2
  },
  {
    titleKey: 'purchaseOrderHorizon',
    key: 'purchaseOrderHorizon',
    width: 150,
    inputType: 'number',
    filterable: false,
    showButton: false,
    style: { width: '100%' },
    precision: 0
  },

  {
    titleKey: 'sort',
    key: 'sort',
    width: 100,
    inputType: 'input',
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
    modalType: 'radio',
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
    width: 100,
    render: (row) => {
      return (
        <NSpace>
          <NButton type="info" size="tiny" onClick={() => handleEdit(row)}>
            {t('edit')}
          </NButton>
          <NPopconfirm
            negative-text={t('cancel')}
            positive-text={t('confirm')}
            on-positive-click={() => handeleDelItem(row)}
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
watch(isEdit, (val) => {
  if (!val) {
    modalFormData.value = {}
  }
})

onMounted(() => {
  // categoryStore.fetchAllCategories()
})
</script>
<style lang="scss" scoped></style>
