<template>
  <div class="flex flex-col gap-2 p-2">
    <div class="fitlter-block p-2 bg-(--bg-card-color) rounded-[5px]">
      <n-collapse v-model:expanded-names="expandedNames">
        <n-collapse-item :title="expandedNames.length > 0 ? t('collapse') : t('expand')" name="1">
          <template #header-extra>
            <div class="flex gap-[12px] justify-end w-full">
              <n-button type="primary" size="small">{{ t('query') }}</n-button>
              <n-button size="small">{{ t('reset') }}</n-button>
            </div>
          </template>
          <n-form
            ref="formRef"
            :model="filterData"
            size="small"
            label-placement="left"
            :label-width="50"
          >
            <n-grid cols="0 250:1 500:2 750:3 1000:4 1200:5 1400:6" :x-gap="12" :y-gap="12">
              <n-grid-item
                ><n-form-item :label="t('name')" path="name">
                  <n-input v-model="filterData.name" /> </n-form-item
              ></n-grid-item>

              <n-grid-item
                ><n-form-item :label="t('code')" path="code">
                  <n-input v-model="filterData.code" /> </n-form-item
              ></n-grid-item>

              <n-grid-item
                ><n-form-item :label="t('path')" path="path">
                  <n-input v-model="filterData.path" /> </n-form-item
              ></n-grid-item>

              <n-grid-item
                ><n-form-item :label="t('file')" path="component">
                  <n-input v-model="filterData.component" /> </n-form-item
              ></n-grid-item>

              <n-grid-item
                ><n-form-item :label="t('type')" path="menuType">
                  <n-select
                    v-model:value="filterData.menuType"
                    multiple
                    :options="options.menuType"
                    :max-tag-count="1"
                  /> </n-form-item
              ></n-grid-item>

              <n-grid-item
                ><n-form-item :label="t('status')" path="status">
                  <n-select
                    v-model:value="filterData.status"
                    multiple
                    :options="options.status"
                    :max-tag-count="1"
                  /> </n-form-item
              ></n-grid-item>

              <n-grid-item>
                <n-form-item :label="t('show')" path="show">
                  <n-select
                    v-model:value="filterData.show"
                    multiple
                    :options="options.show"
                    :max-tag-count="1"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-form>
        </n-collapse-item>
      </n-collapse>
    </div>
    <div class="flex-1 h-0 flex flex-col bg-(--bg-card-color) rounded-[5px]">
      <div class="table-top flex items-center justify-between p-2">
        <div class="">
          <n-button type="info" size="small">
            <Icon name="icon-add" size="14px" />
            <span class="pl-1">{{ t('create') }}</span>
          </n-button>
        </div>
        <div class="flex items-center">
          <n-tooltip trigger="hover">
            <template #trigger>
              <span class="px-2">
                <n-switch v-model:value="striped" />
              </span>
            </template>
            {{ t('tableStriped') }}
          </n-tooltip>
          <n-divider vertical />
          <n-tooltip trigger="hover">
            <template #trigger>
              <span class="px-2 cursor-pointer hover:text-blue-500">
                <Icon name="icon-rotate-right" size="14px" />
              </span>
            </template>
            {{ t('refresh') }}
          </n-tooltip>
          <!-- <n-tooltip trigger="hover">
            <template #trigger>
              <span class="px-2 cursor-pointer hover:text-blue-500">
                <Icon name="icon-setting"
              /></span>
            </template>
            {{ t('column setting') }}
          </n-tooltip> -->
          <DraggableList v-model="initCols" />
        </div>
      </div>
      <div class="flex-1 h-0 px-2">
        <n-data-table
          :data="data"
          :columns="columns"
          :loading="loading"
          :scroll-x="1550"
          :row-key="(row) => row.id"
          :bordered="false"
          :striped="striped"
          style="height: 100%"
          flex-height
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { ref, onMounted, watch, h, computed, reactive } from 'vue'
import {
  NDataTable,
  useMessage,
  NButton,
  NForm,
  NFormItem,
  NTag,
  NSpace,
  NPopconfirm,
  NInput,
  NSelect,
  NGrid,
  NGridItem,
  NTooltip,
  NSwitch,
  NDivider,
  NCollapse,
  NCollapseItem
} from 'naive-ui'
import { rulesApi } from '@renderer/api'
import { Icon, DraggableList } from '@renderer/components'
import { t } from '@renderer/locales'
import dayjs from 'dayjs'
const message = useMessage()

const initCols = ref([
  {
    titleKey: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: t('code'),
    titleKey: 'code',
    key: 'code',
    width: 200
  },
  {
    titleKey: 'icon',
    key: 'icon',
    width: 60,
    render: (row) => {
      return <Icon name={row.icon} />
    }
  },
  {
    titleKey: 'path',
    key: 'path',
    width: 150
  },
  {
    titleKey: 'type',
    key: 'menuType',
    width: 100,
    render: (row) => {
      const { menuType } = row || {}
      const text = menyTypes[menuType]
      const type = menuType === '1' ? 'success' : menuType === '2' ? 'info' : 'warning'
      return (
        <NTag bordered={false} type={type} size="small">
          {text}
        </NTag>
      )
    }
  },
  {
    titleKey: 'sort',
    key: 'sort',
    width: 50
  },
  {
    titleKey: 'file',
    key: 'component',
    width: 150
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
          <NButton type="info" size="tiny">
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
const menyTypes = {
  1: t('menu'),
  2: t('page'),
  3: t('button')
}
const loading = ref(false)
const data = ref([])
const filterData = ref({})
const striped = ref(false)
const expandedNames = ref(['1'])
const options = computed(() => ({
  menuType: [
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
  ],
  status: [
    {
      label: t('enable'),
      value: 1
    },
    {
      label: t('disable'),
      value: 0
    }
  ],
  show: [
    {
      label: t('show'),
      value: 1
    },
    {
      label: t('hide'),
      value: 0
    }
  ]
}))
const columns = computed(() => {
  const res = initCols.value.filter((i) => i.show)
  return res.map((item) => ({ ...item, title: t(item.titleKey) }))
})

const fetchData = async () => {
  try {
    loading.value = true
    const res = await rulesApi.getAllRules()
    if (res.success) {
      data.value = res.data.items
    }
  } catch (error) {
    message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleDelItem = (row) => {}
onMounted(() => {
  fetchData()
})
</script>
<style lang="scss" scoped>
:deep(.n-form-item .n-form-item-feedback-wrapper) {
  display: none;
}
.filter-btns {
  // position: absolute;
  // right: 0;
  // bottom: 0;
  // transform: translateY(-100%);
}
.table-block {
  height: auto;
  min-height: 300;
  max-height: 100%;
}
</style>
