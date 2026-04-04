<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:query="query"
    :api="goodsApi.getGoodsList"
    :page-options="{ pageSize: 30 }"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? goodsApi.updateGoods : goodsApi.createGoods"
    :scroll-x="2400"
    :multiple-check="true"
    :use-modal="false"
    :rules="rules"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
    @create="handleCreate"
  >
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { goodsApi, categoryApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLocale } from '@renderer/locales/useLocales'
const { locale } = useLocale()
const router = useRouter()

const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const query = ref({})

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
  { titleKey: 'picture', key: 'picture', width: 150 },
  { titleKey: 'code', key: 'code', width: 150, inputType: 'input' },

  { titleKey: 'name', key: 'name', width: 150, inputType: 'input' },
  { titleKey: 'enName', key: 'enName', width: 150, inputType: 'input' },
  {
    titleKey: 'aside.category',
    key: 'categoryId',
    width: 150,
    inputType: 'xSelect',
    api: categoryApi.getAllCategories,

    props: {
      multiple: true,
      maxTagCount: 1,
      filterable: true
    },
    render: (row) => {
      const { category } = row || {}
      return locale.value === 'zh_CN' ? category?.name || '' : category?.enName || ''
    }
  },
  {
    titleKey: 'aside.supplier',
    key: 'supplierIds',
    width: 150,
    render: (row) => {
      const { suppliers } = row || {}
      return suppliers?.map((item) => item.name).join(',') || ''
    }
  },
  {
    titleKey: 'warehouse',
    key: 'warehouseId',
    width: 150,
    // inputType: 'input'
    render: (row) => {
      const { warehouse } = row || {}
      return warehouse?.name || ''
    }
  },
  {
    titleKey: 'warehouseZone',
    key: 'warehouseZoneId',
    width: 150,
    render: (row) => {
      const { warehouseZone } = row || {}
      return warehouseZone?.name || ''
    }
    // inputType: 'input'
  },
  {
    titleKey: 'warehouseLocation',
    key: 'warehouseLocationId',
    width: 150,
    render: (row) => {
      const { warehouseLocation } = row || {}
      return warehouseLocation?.name || ''
    }
    // inputType: 'input'
  },
  {
    titleKey: 'manufacturer',
    key: 'manufacturer',
    width: 150
    // inputType: 'input'
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
const handleView = (row) => {
  router.push({ name: 'goodsDetail', query: { id: row.id } })
}
const handleCreate = () => {
  isEdit.value = false
  router.push('/goods/add')
}
</script>

<style lang="scss" scoped></style>
