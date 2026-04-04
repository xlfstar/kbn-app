<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    v-model:checked-row-keys="checkedRowKeys"
    v-model:is-refresh="isRefresh"
    v-model:query="query"
    :api="areaApi.getAreaList"
    :page-options="true"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? areaApi.updateArea : areaApi.createArea"
    :scroll-x="1200"
    :multiple-check="true"
    modal-grid-cols="1"
    modal-width="400"
    :rules="rules"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
    @delete-items="handleDeleteItems"
  >
    <!-- <template #beforeModalForm>
      <NGridItem>
        <n-form-item :label="t('parentArea')" path="parentId">
          <n-tree-select
            v-model:value="modalFormData.parentId"
            :options="allAreas"
            clearable
            :placeholder="t('none')"
            key-field="id"
            label-field="name"
          />
        </n-form-item>
      </NGridItem>
    </template> -->
  </x-table>
</template>
<script setup lang="jsx">
import { ref, computed, onMounted } from 'vue'
import { NButton, NTag, NSpace, NPopconfirm } from 'naive-ui'
import { areaApi } from '@renderer/api'
import { t } from '@renderer/locales'
import { XTable } from '@renderer/components'
import dayjs from 'dayjs'
import { NGridItem, NFormItem, NTreeSelect } from 'naive-ui'
import { useSelectOptionsStore } from '@renderer/stores/modules/selectOptions'

const selectOptionsStore = useSelectOptionsStore()
const query = ref({})
const checkedRowKeys = ref([])
const isEdit = ref(false)
const isRefresh = ref(false)
const modalFormData = ref({})
const currentRow = ref({})
const allAreas = ref([])
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
      max: 20,
      min: 3,
      message: t('requiredErrorMessage', { key: 'name' })
    }
  ]
}
const columns = ref([
  {
    titleKey: 'parentArea',
    key: 'parentId',
    width: 150,
    inputType: 'xSelect',
    placeholder: t('none'),
    api: areaApi.getAllAreas,
    childrenField: 'xxx',
    filterable: false
  },
  { titleKey: 'code', key: 'code', width: 150, inputType: 'input' },
  { titleKey: 'name', key: 'name', width: 150, inputType: 'input' },
  { titleKey: 'enName', key: 'enName', width: 150, inputType: 'input' },

  {
    titleKey: 'areaLevel',
    key: 'areaLevel',
    width: 150,
    render: (row) => (row.parentId === null ? t('state') : t('city'))
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
  selectOptionsStore.refreshList(areaApi.getAllAreas, 'area')
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
    await areaApi.removeArea(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}
const handleDeleteItems = (ids) => {
  if (ids.length > 0) {
    areaApi.removeAreas({ ids }).then((res) => {
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
  selectOptionsStore.refreshList(areaApi.getAllAreas, 'area')
}
// const fecthState = async () => {
//   try {
//     const res = await areaApi.getAllAreas()
//     if (res.success) {
//       allAreas.value = res.data.items || []
//     }
//   } catch (err) {
//     console.log(err.message)
//   }
// }
onMounted(() => {
  // fecthState()
  console.log(selectOptionsStore.lists)
})
</script>

<style lang="scss" scoped></style>
