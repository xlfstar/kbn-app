<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:query="query"
    :api="usersApi.getUserList"
    :filter="false"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? usersApi.updateUser : usersApi.createUser"
    :scroll-x="2000"
    :multiple-check="true"
    modal-grid-cols="2"
    :modal-width="800"
    :rules="rules"
    :selection-disabled="(row) => row.group?.code === 'surperAdmin'"
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
import { usersApi, dptApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { useAuthStore } from '@renderer/stores'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { useLocale } from '@renderer/locales/useLocales'

const { locale } = useLocale()
const authStore = useAuthStore()
const query = ref({})

const groupOptions = computed(() => authStore.groupList)
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const groupDisabled = computed(() => currentRow.value.group?.code === 'surperAdmin')
const statusOptions = computed(() => [
  {
    labelKey: 'enable',
    label: t('enable'),
    value: 1
  },
  {
    labelKey: 'disable',
    label: t('disable'),
    value: 0
  }
])

const sexOptions = computed(() => [
  { labelKey: 'secret', label: t('secret'), value: 0 },
  { labelKey: 'male', label: t('male'), value: 1 },
  { labelKey: 'female', label: t('female'), value: 2 }
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
  {
    titleKey: 'avatar',
    key: 'avatar',
    width: 100
  },
  { titleKey: 'username', key: 'username', width: 150, inputType: 'input' },
  { titleKey: 'realName', key: 'realName', width: 150, inputType: 'input' },
  {
    titleKey: 'role',
    key: 'groupId',
    width: 200,
    render: (row) => {
      const { group } = row || {}
      if (group) {
        return <NTag size="small">{group.name}</NTag>
      } else {
        return ''
      }
    },
    inputType: 'select',
    options: groupOptions.value,
    valueField: 'id',
    labelField: 'name',
    props: {
      disabled: groupDisabled
    }
  },
  {
    titleKey: 'department',
    key: 'departmentId',
    width: 200,
    render: (row) => {
      const { department } = row || {}

      if (department) {
        return locale.value === 'en_US' ? department.enName : department.name
      } else {
        return ''
      }
    },
    inputType: 'xSelect',
    api: dptApi.getAllDepartments
  },
  { titleKey: 'email', key: 'email', width: 150, inputType: 'input' },
  { titleKey: 'phone', key: 'phone', width: 150, inputType: 'input' },
  {
    titleKey: 'sex',
    key: 'sex',
    width: 200,
    inputType: 'select',
    options: sexOptions.value,
    render: (row) => {
      const { sex } = row || {}
      return sexOptions.value.find((item) => item.value === sex)?.label || ''
    }
  },

  { titleKey: 'initPassword', key: 'initPassword', width: 150 },
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
    titleKey: 'lastLoginAt',
    key: 'lastLoginAt',
    width: 120,
    render: (row) => (row.lastLoginAt ? dayjs(row.lastLoginAt).format('YYYY-MM-DD') : '')
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
    await usersApi.removeUser(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  console.log({ ids })
  if (ids.length > 0) {
    usersApi.removeUsers({ ids }).then((res) => {
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
