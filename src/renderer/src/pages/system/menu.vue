<template>
  <x-table
    ref="tableRef"
    v-model:columns="columns"
    v-model:is-edit="isEdit"
    :table-data="data"
    :filter="false"
    :page-options="false"
    :loading="loading"
    :modal-form-data="modalFormData"
    :modal-api="isEdit ? rulesApi.updateRule : rulesApi.createRule"
    :scroll-x="1650"
    @refresh="handleRefresh"
    @close-modal="closeModal"
    @confirm="handleComfirm"
  >
    <template #beforeModalForm>
      <NGridItem>
        <n-form-item :label="t('parentMenu')" path="parentId">
          <n-tree-select
            v-model:value="modalFormData.parentId"
            :options="rulesTree"
            clearable
            :placeholder="t('topMenu')"
            key-field="id"
          />
        </n-form-item>
      </NGridItem>
    </template>
    <template #afterModalForm>
      <NGridItem>
        <n-form-item :label="t('type')" path="menuType">
          <n-select v-model:value="modalFormData.menuType" :options="menuTypeOptions" clearable />
        </n-form-item>
      </NGridItem>
      <NGridItem>
        <n-form-item :label="t('status')" path="status">
          <n-select v-model:value="modalFormData.status" :options="statusOptions" clearable />
        </n-form-item>
      </NGridItem>
      <NGridItem>
        <n-form-item :label="t('show')" path="show">
          <n-select v-model:value="modalFormData.show" :options="showOptions" clearable />
        </n-form-item>
      </NGridItem>
    </template>
  </x-table>
</template>
<script setup lang="jsx">
import { ref, onMounted, watch, computed, h } from 'vue'
import {
  NButton,
  NTag,
  NSpace,
  NPopconfirm,
  NGridItem,
  NFormItem,
  NTreeSelect,
  NSelect
} from 'naive-ui'
import { rulesApi } from '@renderer/api'
import { Icon, XTable } from '@renderer/components'
import { t } from '@renderer/locales'
import { useRulesStore, useMenuStore } from '@renderer/stores'
import dayjs from 'dayjs'
import alifont from '@renderer/assets/aliFonts/iconfont.json'
const aliIconList = alifont.glyphs.map((item) => {
  return { label: `icon-${item.font_class}`, value: `icon-${item.font_class}` }
})

const tableRef = ref(null)
const rulesStore = useRulesStore()
const isEdit = ref(false)
const data = computed(() => rulesStore.rules)
const modalFormData = ref({})
const rulesTree = computed(() => rulesStore.rulesTree)

const menuTypeOptions = computed(() => [
  {
    label: t('menu'),
    value: '1'
  },
  {
    label: t('page'),
    value: '2'
  },
  {
    label: t('button'),
    value: '3'
  }
])
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

const showOptions = computed(() => [
  {
    label: t('show'),
    value: 1
  },
  {
    label: t('hide'),
    value: 0
  }
])

const loading = computed(() => rulesStore.loading)
const columns = ref([
  {
    titleKey: 'name',
    key: 'name',
    width: 150,
    fixed: 'left',
    ellipsis: true,
    inputType: 'input'
    // modal
  },
  {
    titleKey: 'enName',
    key: 'enName',
    width: 200,
    ellipsis: true,
    inputType: 'input'
  },
  {
    titleKey: 'code',
    key: 'code',
    width: 200,
    ellipsis: true,
    inputType: 'input'
  },
  {
    titleKey: 'icon',
    key: 'icon',
    width: 60,
    render: (row) => {
      return <Icon name={row.icon} />
    },
    inputType: 'select',
    options: aliIconList,
    renderLabel: (option) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(Icon, { name: option.label }),
        h('span', {}, option.label)
      ])
  },
  {
    titleKey: 'path',
    key: 'path',
    width: 150,
    ellipsis: true,
    inputType: 'input'
  },

  {
    titleKey: 'sort',
    key: 'sort',
    width: 80,
    inputType: 'input'
  },
  {
    titleKey: 'file',
    key: 'component',
    width: 150,
    ellipsis: true,
    inputType: 'input'
  },
  {
    titleKey: 'type',
    key: 'menuType',
    width: 100,
    render: (row) => {
      const { menuType } = row || {}
      const text = menuType === '1' ? t('menu') : menuType === '2' ? t('page') : t('button')
      const type = menuType === '1' ? 'success' : menuType === '2' ? 'info' : 'warning'
      return (
        <NTag bordered={false} type={type} size="small">
          {text}
        </NTag>
      )
    }
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
    }
  },
  {
    titleKey: 'show',
    key: 'show',
    width: 100,
    render: (row) => {
      const { show } = row || {}
      const text = show === 1 ? t('show') : t('hide')
      const type = show === 1 ? 'success' : 'error'
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
  rulesStore.loadRulesData()
}
const handleEdit = (row) => {
  // eslint-disable-next-line no-unused-vars
  const { createdAt: _createdAt, updatedAt: _updatedAt, children: _children, ...rest } = row || {}
  isEdit.value = true
  modalFormData.value = { ...rest }
}
const handleDelItem = async (row) => {
  const { id } = row || {}
  try {
    await rulesApi.removeRule(id)
    handleRefresh()
  } catch (err) {
    console.log(err.message)
  }
}

const closeModal = () => {
  modalFormData.value = {}
}
const handleComfirm = (c) => {
  if (c) {
    useMenuStore().initRoutes()
  }
}
onMounted(() => {
  rulesStore.loadRulesData()
})
watch(rulesTree, (tree) => {
  columns.value[0].options = tree
})
</script>
<style></style>
