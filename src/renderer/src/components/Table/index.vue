<template>
  <div class="flex flex-col gap-2 pt-2 flex-1">
    <slot v-if="filter" name="filter">
      <div class="fitlter-block p-2 bg-(--bg-card-color) rounded-[5px]" :key="locale">
        <n-collapse v-model:expanded-names="expandedNames">
          <n-collapse-item :title="expandedNames.length > 0 ? t('collapse') : t('expand')" name="1">
            <template #header-extra>
              <div class="flex gap-[12px] justify-end w-full">
                <n-button type="primary" size="small" @click.stop="changeFilterData">{{
                  t('query')
                }}</n-button>
                <n-button size="small" @click.stop="handleReset">{{ t('reset') }}</n-button>
              </div>
            </template>
            <n-form
              ref="filterFormRef"
              :model="filterData"
              size="small"
              label-placement="left"
              :label-width="80"
            >
              <n-grid cols="0 200:1 400:2 600:3 800:4 1000:5 1200:6" :x-gap="12" :y-gap="12">
                <slot name="filterItem" v-bind="filterData"></slot>
                <n-grid-item v-for="item in filterCols" :key="item.key">
                  <n-form-item
                    :label="filterLabel ? t(item.label || item.titleKey) : ''"
                    :path="item.key"
                  >
                    <input-view
                      :key="`${item.key}-${resetKey}`"
                      v-model:value="filterData[item.key]"
                      :col="item"
                      :placeholder="t(item.titleKey)"
                      position="filter"
                    />
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-form>
          </n-collapse-item>
        </n-collapse>
      </div>
    </slot>
    <div class="flex-1 h-0 flex flex-col bg-(--bg-card-color) rounded-[5px]">
      <div class="table-top flex items-center justify-between p-2">
        <div class="flex items-center gap-2">
          <slot name="tableHeaderLeft">
            <n-button type="info" size="small" @click="handleCreate">
              <Icon name="icon-add" size="14px" />
              <span class="pl-1">{{ t('create') }}</span>
            </n-button>
            <slot name="batchesCreate">
              <template v-if="batchesCreate">
                <n-button type="success" size="small" @click="handleCreateInBatches">
                  <Icon name="icon-add" size="14px" />
                  <span class="pl-1">{{ t('createInBatches') }}</span>
                </n-button>
              </template>
            </slot>
            <template v-if="multipleCheck">
              <NPopconfirm
                :negative-text="t('cancel')"
                :positive-text="t('confirm')"
                @positive-click="handleDeleteItems"
              >
                <template #trigger>
                  <n-button type="error" size="small" :disabled="isEmpty(checkedRowKeys)">
                    <Icon name="icon-delete-" size="14px" />
                    <span class="pl-1">{{ t('delete') }}</span>
                  </n-button>
                </template>
                {{ t('confirmDeleteItems', { length: checkedRowKeys.length }) }}
              </NPopconfirm>
            </template>
          </slot>
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
              <span class="px-2 cursor-pointer hover:text-blue-500" @click="handleRefresh">
                <Icon name="icon-rotate-right" size="14px" />
              </span>
            </template>
            {{ t('refresh') }}
          </n-tooltip>
          <!-- <Filter :columns="filterCols" :visible="filter" @on-change="changeFilterData" /> -->
          <DraggableList
            v-model="columns"
            :height="tableContainerHeight ? tableContainerHeight : 300"
          />
        </div>
      </div>
      <div ref="tableContainer" class="flex-1 h-0 px-2 pb-2">
        <n-data-table
          :data="tableData || data"
          :columns="tableCols"
          :loading="realLoading"
          :scroll-x="scrollX"
          :row-key="(row) => row.id"
          :row-props="rowProps"
          :bordered="false"
          :striped="striped"
          :pagination="pageOptions === false ? false : pagination"
          pagination-behavior-on-filter="first"
          remote
          style="height: 100%"
          flex-height
          @update:page="handleChangePage"
          @update:page-size="handleChangePageSize"
          @update:checked-row-keys="handleChecked"
        />
      </div>
    </div>
    <slot v-if="modal" name="modal">
      <DraggableModal
        v-model:visible="showModal"
        :header="modalHeader"
        :width="modalWidth || 1000"
        :draggable="draggable"
        :loading="modalLoading"
        @confirm="handleSubmit"
        @close="closeModal"
      >
        <n-form ref="modalFormRef" :model="modalFormData" size="small" :rules="rules">
          <n-grid
            :cols="modalGridCols || '0 200:1 400:2 600:3 800:4 1000:5 1200:6'"
            :x-gap="12"
            :y-gap="12"
          >
            <slot name="beforeModalForm" v-bind="modalFormData"></slot>
            <n-grid-item v-for="item in modalCols" :key="item.key">
              <n-form-item :label="t(item.label || item.titleKey)" :path="item.key">
                <input-view
                  :ref="(el) => setModalFieldRef(item.key, el)"
                  v-model:value="modalFormData[item.key]"
                  :col="item"
                  position="modal"
                >
                  <!-- Forward prefixed slots: e.g. 'age-suffix' -> 'suffix' for input 'age' -->
                  <template
                    v-for="slotKey in Object.keys($slots).filter((k) =>
                      k.startsWith(item.key + '-')
                    )"
                    :key="slotKey"
                    #[slotKey.slice(item.key.length+1)]="scope"
                  >
                    <slot :name="slotKey" v-bind="scope" />
                  </template>
                </input-view>
              </n-form-item>
            </n-grid-item>
            <slot name="afterModalForm" v-bind="modalFormData"></slot>
          </n-grid>
        </n-form>
      </DraggableModal>
    </slot>
  </div>
</template>
<script setup lang="jsx">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  reactive,
  nextTick,
  triggerRef,
  unref
} from 'vue'
import {
  NDataTable,
  useMessage,
  NButton,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NTooltip,
  NSwitch,
  NDivider,
  NCollapse,
  NCollapseItem,
  NPopconfirm
} from 'naive-ui'
import { Icon, DraggableList, InputView, DraggableModal } from '@renderer/components'
import { t } from '@renderer/locales'
import { useLocale } from '@renderer/locales/useLocales'
import { isEmpty } from 'es-toolkit/compat'

const { locale } = useLocale()

const emit = defineEmits([
  'refresh',
  'confirm',
  'closeModal',
  'update:isEdit',
  'update:checkedRowKeys',
  'update:isRefresh',
  'loadSuccess',
  'deleteItems',
  'modal-data-change',
  'create',
  'createInBatches'
])
const {
  isRefresh,
  filterLabel,
  draggable,
  modalWidth,
  modalGridCols,
  rules,
  api,
  modalApi,
  filter,
  pageOptions,
  tableData,
  loading,
  filterFormData,
  scrollX,
  multipleCheck,
  checkedRowKeys,
  deleteApi,
  rowProps,
  selectionDisabled,
  useModal,
  batchesCreate
} = defineProps({
  batchesCreate: {
    type: Boolean,
    default: false
  },
  rowProps: {
    type: Function,
    default: () => ({})
  },
  selectionDisabled: {
    type: Function
  },
  isRefresh: {
    type: Boolean,
    default: false
  },
  filterLabel: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: false
  },
  modalWidth: {
    type: [Number, String],
    default: ''
  },
  modalGridCols: {
    type: String,
    default: ''
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  multipleCheck: {
    type: Boolean,
    default: false
  },
  checkedRowKeys: {
    type: [Array, null],
    default: null
  },
  scrollX: {
    type: [Number, String],
    default: 1650
  },
  // modalFormData: {
  //   type: Object,
  //   default: () => ({})
  // },
  filterFormData: {
    type: Object,
    default: () => ({})
  },
  modal: {
    type: Boolean,
    default: true
  },
  filter: {
    type: Boolean,
    default: true
  },
  tableData: {
    type: [Array, Boolean],
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  // columns: {
  //   type: Array,
  //   default: () => []
  // },
  api: {
    type: [Function, Boolean],
    default: false
  },
  modalApi: {
    type: [Function, Boolean],
    default: false
  },

  pageOptions: {
    type: [Boolean, Object],
    default: () => ({})
  },
  header: {
    type: [String, Boolean],
    default: t('title')
  },
  deleteApi: {
    type: [Function, Boolean],
    default: false
  },
  useModal: {
    type: Boolean,
    default: true
  }
})

const message = useMessage()
const tableContainer = ref(null)
const tableContainerHeight = ref(0)
let tableContainerObserver = null
let heightRafId = null
const columns = defineModel('columns', {
  type: Array,
  default: () => []
})
const tableLoading = ref(false)
const realLoading = computed(() => (api ? tableLoading.value : loading))

const modalLoading = ref(false)
const data = ref([])
const filterData = defineModel('query', { type: Object, default: () => ({}) })
const filterFormRef = ref(null)
const modalFormData = defineModel('modalFormData', { type: Object, default: () => ({}) })
const modalFormRef = ref(null)
const striped = ref(true)
const expandedNames = ref(['1'])
const resetKey = ref(0)

const processColumnOptions = (item) => {
  const col = { ...item, title: item.titleKey ? t(item.titleKey) : '' }
  if (['xSelect', 'treeSelect'].includes(col.inputType)) {
    return col
  }
  const options = unref(col.options)
  if (options && Array.isArray(options)) {
    col.options = options.map((opt) => ({
      ...opt,
      label: opt.labelKey ? t(opt.labelKey) : opt.label || ''
    }))
  } else {
    col.options = options
  }
  return col
}

const filterCols = computed(() => {
  void locale.value
  return columns.value
    .filter((item) => item.filterable !== false && item.inputType)
    .map(processColumnOptions)
})

const modalCols = computed(() => {
  void locale.value
  return columns.value
    .filter((item) => item.modalEnable !== false && item.inputType)
    .map(processColumnOptions)
})
const modalHeader = computed(() => (isEdit.value ? t('edit') : t('create')))
const isEdit = defineModel('isEdit', {
  type: Boolean,
  default: false
})
const showModal = ref(false)
const pagination = reactive({
  page: 1,
  itemCount: 0,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [
    {
      label: t('pageOption.perPages', { items: 10 }),
      value: 10
    },
    {
      label: t('pageOption.perPages', { items: 20 }),
      value: 20
    },
    {
      label: t('pageOption.perPages', { items: 50 }),
      value: 50
    },
    {
      label: t('pageOption.perPages', { items: 100 }),
      value: 100
    }
  ]
})

if (pageOptions && typeof pageOptions === 'object') {
  Object.assign(pagination, pageOptions)
}

const changeFilterData = () => {
  loadTableData()
  // emit('onSearch', filterData.value)
}

const handleReset = () => {
  const cols = filterCols.value || []
  cols.forEach((item) => {
    const type = item.inputType || item.filterType || item.modalType
    const multiple =
      item.filterMultiple !== undefined ? item.filterMultiple : item.multiple === true
    let resetVal = ''
    if (type === 'input') {
      resetVal = ''
    } else if (type === 'number') {
      resetVal = null
    } else if (
      type === 'select' ||
      type === 'treeSelect' ||
      type === 'radio' ||
      type === 'checkbox'
    ) {
      resetVal = multiple ? [] : null
    } else if (type === 'date' || type === 'daterange') {
      resetVal = null
    } else {
      resetVal = ''
    }
    filterData.value[item.key] = resetVal
  })
  resetKey.value++
}
const handleChangePage = (currentPage) => {
  pagination.page = currentPage
  loadTableData()
}
const handleChangePageSize = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadTableData()
}

const handleCreate = () => {
  if (useModal) {
    // 1. 避免直接覆盖整个 modalFormData.value，防止破坏原有的响应式代理导致大量组件销毁重建
    // 2. 必须深拷贝 defaultValue，防止表单修改时污染了原来的 columns 配置，导致无意义的计算属性重估和卡顿
    const newFormData = {}
    modalCols.value.forEach((col) => {
      const def = col.defaultValue ?? null
      newFormData[col.key] = def !== null && typeof def === 'object' ? structuredClone(def) : def
    })

    // 清空旧数据并赋予新数据，保持对象引用不变
    Object.keys(modalFormData.value).forEach((key) => {
      delete modalFormData.value[key]
    })
    Object.assign(modalFormData.value, newFormData)

    showModal.value = true
    emit('update:isEdit', false)
  } else {
    emit('create')
  }
}

const handleCreateInBatches = () => {
  emit('createInBatches')
}
const loadTableData = () => {
  const query = { ...filterData.value, ...{ page: pagination.page, pageSize: pagination.pageSize } }
  if (api) {
    tableLoading.value = true
    api(query)
      .then((res) => {
        data.value = res.data.items
        pagination.itemCount = Number(res.data.total) || 0
        pagination.page = Number(res.data.page) || pagination.page
        pagination.pageSize = Number(res.data.pageSize) || pagination.pageSize
        emit('loadSuccess', data.value)
        emit('update:isRefresh', false)
      })
      .catch((err) => {
        console.error(err.message || '加载数据失败')
      })
      .finally(() => {
        tableLoading.value = false
        // emit('update:refresh', true)
      })
  } else {
    emit('refresh', query)
  }
}
const tableCols = computed(() => {
  void locale.value // 触发依赖收集，让 tableCols 在语言切换时重新计算
  let res = columns.value
    ?.filter((item) => item.show !== false && item.visible !== false)
    ?.map((item) => {
      const col = processColumnOptions(item)

      // 增强 render 函数，让其能够响应 locale 变化
      if (col.render) {
        const originalRender = col.render
        col.render = (row, index) => {
          void locale.value // 让每次渲染都追踪 locale 变化
          return originalRender(row, index)
        }
      }

      return col
    })

  if (multipleCheck) {
    res.unshift({
      type: 'selection',
      width: 35,
      fixed: 'left',
      disabled: (row) => {
        if (selectionDisabled) return !!selectionDisabled(row)
        const { code } = row || {}
        return code === 'surperAdmin'
      }
    })
  }

  return res
})
const handleChecked = (rowKeys) => {
  emit('update:checkedRowKeys', rowKeys)
}

const handleDeleteItems = () => {
  if (deleteApi) {
    tableLoading.value = true
    deleteApi({ ids: checkedRowKeys })
      .then((res) => {
        if (res.success) {
          loadTableData()
        }
      })
      .finally(() => {
        tableLoading.value = false
      })
  } else {
    emit('deleteItems', checkedRowKeys)
  }
}

const handleRefresh = () => {
  loadTableData()
  // emit('update:isEdit', false)
  Object.keys(modalFormData.value).forEach((key) => {
    delete modalFormData.value[key]
  })
}
const handleSubmit = async () => {
  if (!modalApi) return

  modalFormRef.value?.validate(async (error) => {
    if (error) {
      message.warning(error[0][0].message)
    } else {
      try {
        modalLoading.value = true
        const res = await modalApi(modalFormData.value)
        if (res.success) {
          emit('confirm', res.data)
          handleRefresh()
          showModal.value = false
          emit('update:isEdit', false)
        } else {
          emit('confirm', false)
        }
      } catch (err) {
        emit('confirm', false, err)
      } finally {
        modalLoading.value = false
      }
    }
  })
}

const closeModal = () => {
  showModal.value = false
  emit('update:isEdit', false)
  emit('closeModal')
}
watch(isEdit, (val) => {
  if (val) {
    showModal.value = true
  } else {
    Object.keys(modalFormData.value).forEach((key) => {
      delete modalFormData.value[key]
    })
  }
})
watch(
  () => filterFormData,
  (val) => {
    filterData.value = { ...filterData.value, ...val }
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => isRefresh,
  (val) => {
    if (val) {
      loadTableData()
    }
  }
)
onMounted(() => {
  loadTableData()
  nextTick(() => {
    const el = tableContainer.value
    if (!el) return

    const updateHeight = () => {
      if (heightRafId) cancelAnimationFrame(heightRafId)
      heightRafId = requestAnimationFrame(() => {
        tableContainerHeight.value = el.getBoundingClientRect().height || 0
      })
    }

    updateHeight()
    if (typeof ResizeObserver !== 'undefined') {
      tableContainerObserver = new ResizeObserver(updateHeight)
      tableContainerObserver.observe(el)
    } else {
      window.addEventListener('resize', updateHeight)
    }
  })
})
onBeforeUnmount(() => {
  if (heightRafId) cancelAnimationFrame(heightRafId)
  heightRafId = null
  if (tableContainerObserver) {
    tableContainerObserver.disconnect()
    tableContainerObserver = null
  }
})
const modalFieldRefs = ref({})
const setModalFieldRef = (key, el) => {
  if (el) modalFieldRefs.value[key] = el
}
defineExpose({
  loadTableData,
  tableData: data.value,
  getFieldRef: (key) => modalFieldRefs.value[key],
  getTableContainerHeight: () => tableContainerHeight.value
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
  min-height: 300px;
  max-height: 100%;
}
</style>
