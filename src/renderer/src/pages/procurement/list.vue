<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:modal-form-data="modalFormData"
    v-model:query="query"
    :api="purchaseOrderApi.getPurchaseOrders"
    :page-options="true"
    :modal-api="
      isEdit ? purchaseOrderApi.updatePurchaseOrder : purchaseOrderApi.createPurchaseOrder
    "
    :use-modal="false"
    :scroll-x="1500"
    :multiple-check="true"
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { supplierApi, areaApi, purchaseOrderApi, goodsApi, usersApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { useLocale } from '@renderer/locales/useLocales'
import { useRouter } from 'vue-router'
const { locale } = useLocale()
const router = useRouter()
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const tableRef = ref(null)
const buyerOptions = ref([])
const query = ref({})

const statusOptions = computed(() => {
  void locale.value
  return [
    {
      labelKey: 'pendingApproval',
      value: 1
    },
    {
      labelKey: 'approved',
      value: 2
    },
    {
      labelKey: 'rejected',
      value: 3
    },
    {
      labelKey: 'partiallyReceived',
      value: 4
    },
    {
      labelKey: 'completed',
      value: 5
    },
    {
      labelKey: 'canceled',
      value: 6
    }
  ]
})
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

/**
  * 采购订单列表
  *
  *
  * id: number
  orderNo: string // 采购单号，通常自动生成
  buyerId: number //采购员id
  totalAmount: number // 订单总金额
  paidAmount: number // 已付金额
  status: number // 状态：1待审批 2已批准 3已驳回 4部分收货 5已完成 6已取消
  paymentStatus: number // 付款状态：0-未付款 1-部分付款 2-已结清
  expectedDate?: Date | null // 预计交货日期
  remark?: string | null // 备注
  createdBy?: number | null // 创建人
  updatedBy?: number | null // 更新人
  createdAt?: Date
  updatedAt?: Date
*/
const columns = ref([
  { titleKey: 'orderNo', key: 'orderNo', width: 200, inputType: 'input', modalDisabled: true },
  {
    titleKey: 'buyer',
    key: 'buyerId',
    width: 100,
    inputType: 'select',
    options: buyerOptions
    // props: { optionLabel: 'realName', optionValue: 'id' }
  },

  { titleKey: 'paidAmount', key: 'paidAmount', width: 100 },
  {
    titleKey: 'totalAmount',
    key: 'totalAmount',
    width: 100
  },
  {
    titleKey: 'status',
    key: 'status',
    width: 150,
    render: (row) => {
      const { status } = row || {}
      let text = ''
      let type = ''
      switch (status) {
        case 1:
          text = t('pendingApproval')
          type = 'warning'
          break
        case 2:
          text = t('approved')
          type = 'success'
          break
        case 3:
          text = t('rejected')
          type = 'error'
          break
        case 4:
          text = t('partiallyReceived')
          type = 'info'
          break
        case 5:
          text = t('completed')
          type = 'success'
          break
        case 6:
          text = t('canceled')
          type = 'error'
          break
        default:
          text = status
      }
      return (
        <NTag bordered={false} type={type} size="small">
          {text}
        </NTag>
      )
    }
  },
  {
    titleKey: 'paymentStatus',
    key: 'paymentStatus',
    width: 150,
    render: (row) => {
      const { paymentStatus } = row || {}
      let text = ''
      let type = ''
      switch (paymentStatus) {
        case 0:
          text = t('unpaid')
          type = 'error'
          break
        case 1:
          text = t('partiallyPaid')
          type = 'warning'
          break
        case 2:
          text = t('paid')
          type = 'success'
          break
        default:
          text = paymentStatus
      }
      return (
        <NTag bordered={false} type={type} size="small">
          {text}
        </NTag>
      )
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
}

const handleEdit = async (row) => {
  // eslint-disable-next-line no-unused-vars
  currentRow.value = row
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row || {}
  modalFormData.value = { ...rest }
  isEdit.value = true
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    // await supplierApi.removeSupplier(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    // supplierApi.removeSupplierList({ ids }).then((res) => {
    //   if (res.success) {
    //     handleRefresh()
    //   }
    // })
  }
}

const closeModal = () => {
  modalFormData.value = {}
}
const handleComfirm = (e) => {
  if (!e) return
}

const fetchBuyerOptions = async () => {
  try {
    const res = await usersApi.getUserList({ page: 1, pageSize: 9999 })
    if (res.success) {
      buyerOptions.value = res.data?.items.map((user) => ({
        label: user.realName || user.username,
        value: user.id
      }))
    }
  } catch (err) {
    console.log(err.message)
  }
}
watch(buyerOptions, (newVal) => {
  const col = columns.value.find((i) => i.key === 'buyerId')
  if (col) col.options = newVal
})

const handleCreate = () => {
  isEdit.value = false
  router.push('/procurement/create')
}
onMounted(() => {
  fetchBuyerOptions()
})
</script>

<style lang="scss" scoped></style>
