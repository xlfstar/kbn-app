<template>
  <div class="flex flex-col h-0 flex-1">
    <x-table
      ref="tableRef"
      v-model:columns="columns"
      v-model:is-edit="isEdit"
      v-model:checked-row-keys="checkedRowKeys"
      :table-data="tableData"
      :filter="true"
      :page-options="true"
      :loading="loading"
      :modal-form-data="modalFormData"
      :modal-api="isEdit ? authApi.updateGroup : authApi.createGroup"
      :scroll-x="1000"
      :multiple-check="true"
      :header="header"
      modal-grid-cols="1"
      modal-width="400"
      :draggable="false"
      @refresh="handleRefresh"
      @close-modal="closeModal"
      @confirm="handleComfirm"
    >
    </x-table>

    <n-drawer v-model:show="visible" :width="502" placement="right">
      <n-drawer-content :title="permissionHeader" :native-scrollbar="false">
        <n-tree
          block-line
          :data="rulesTree"
          expand-on-click
          key-field="id"
          :checked-keys="checkedKeys"
          default-expand-all
          checkable
          multiple
          cascade
          @update:checked-keys="handleChangeCheckedKeys"
        />

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button size="small" @click="handleCancelRules">{{ t('cancel') }}</n-button>
            <n-button
              size="small"
              type="success"
              :loading="groupLoading"
              @click="handleConfirmRules"
              >{{ t('confirm') }}</n-button
            >
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
<script setup lang="jsx">
import { ref, onMounted, watch, computed, h } from 'vue'
import {
  NButton,
  NTag,
  NSpace,
  NPopconfirm,
  NDrawer,
  NDrawerContent,
  NTree,
  NGridItem,
  NFormItem,
  NTreeSelect,
  NSelect,
  useMessage
} from 'naive-ui'
import { authApi } from '@renderer/api'
import { Icon, XTable, DraggableModal } from '@renderer/components'
import { t } from '@renderer/locales'
import { useAuthStore, useRulesStore } from '@renderer/stores'
import { flatten } from '@renderer/utils'
import dayjs from 'dayjs'
import { isEmpty } from 'es-toolkit/compat'
const authStore = useAuthStore()
const rulesStore = useRulesStore()
const message = useMessage()
const tableRef = ref(null)
const tableData = computed(() => authStore.groupList)
const checkedRowKeys = ref([])
const isEdit = ref(false)
const header = computed(() => (isEdit.value ? t('edit') : t('create')))
const permissionHeader = ref('')
const rulesTree = computed(() => rulesStore.rulesTree)
const checkedKeys = ref([])
const currentGroupId = ref()
const groupLoading = ref(false)
const loading = ref(false)
const modalFormData = ref({})

const visible = ref(false)

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

const columns = ref([
  { titleKey: 'name', key: 'name', width: 150, inputType: 'input' },
  {
    titleKey: 'code',
    key: 'code',
    width: 150,
    inputType: 'input'
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
    width: 180,
    render: (row) => {
      return (
        <NSpace>
          <NButton
            type="warning"
            size="tiny"
            loading={groupLoading.value}
            disabled={row.code === 'surperAdmin'}
            onClick={() => handleEditPermissions(row)}
          >
            {t('menuPermissions')}
          </NButton>
          <NButton
            type="info"
            size="tiny"
            disabled={row.code === 'surperAdmin'}
            onClick={() => handleEdit(row)}
          >
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
                <NButton type="error" size="tiny" disabled={row.code === 'surperAdmin'}>
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
const handleRefresh = async () => {
  loading.value = true
  await authStore.fetchGroups()
  loading.value = false
}

const handleEdit = (row) => {
  // eslint-disable-next-line no-unused-vars
  const { createdAt: _createdAt, updatedAt: _updatedAt, children: _children, ...rest } = row || {}
  isEdit.value = true
  modalFormData.value = { ...rest }
}

const handleEditPermissions = (row) => {
  const { name, rules = [], id } = row || {}
  visible.value = true
  currentGroupId.value = id
  permissionHeader.value = t('assignMenuPermissions', { name })
  let list = []
  if (rules.toString() === '*') {
    const flatArr = flatten(rulesTree.value)
    list = flatArr.map((item) => item.id)
  } else {
    list = rules.map((item) => Number(item))
  }
  checkedKeys.value = list
}
const handleChangeCheckedKeys = (keys) => {
  checkedKeys.value = keys.filter((item) => item % 1 === 0)
}
const handleCancelRules = () => {
  visible.value = false
}
const handleConfirmRules = async () => {
  const body = { rules: checkedKeys.value.toString(), id: currentGroupId.value }
  groupLoading.value = true
  try {
    const res = await authApi.updateGroup(body)
    if (res.success) {
      message.success(t('actionSuccess'))
      handleRefresh()
      rulesStore.loadRulesData()
    } else {
      message.error(t('actionFaild'))
    }
  } catch {
    message.error(t('actionFaild'))
  } finally {
    groupLoading.value = false
    visible.value = false
  }
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    await authApi.removeGroup(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}

const closeModal = () => {
  checkedKeys.value = []
  modalFormData.value = {}
}
const handleComfirm = (c) => {
  if (c) {
    // useAuthStore().initRoutes()
  }
}
onMounted(() => {
  rulesStore.loadRulesData()
})
</script>

<style lang="scss" scoped></style>
