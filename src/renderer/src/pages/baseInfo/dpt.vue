<template>
  <div class="flex">
    <resizeable-view
      v-model:width="asideWidth"
      :min-width="100"
      :max-width="400"
      :handles="['right']"
      height="100%"
      class="bg-(--bg-color) rounded-[6px] p-2"
    >
      <div class="flex flex-col h-full max-h-full">
        <n-input v-model:value="pattern" :placeholder="t('searchDpt')" class="mb-2">
          <template #prefix>
            <Icon name="icon-sousuo" size="16px" style="margin-right: 4px" />
          </template>
        </n-input>
        <n-tree
          :show-irrelevant-nodes="false"
          :pattern="pattern"
          :data="list"
          key-field="id"
          :label-field="labelField"
          :render-prefix="renderPrefix"
          :render-suffix="renderSuffix"
          block-line
          class="flex-1 h-0 overflow-y-auto"
          :override-default-node-click-behavior="override"
          :selected-keys="selectedKeys"
        />
        <n-button type="info" style="flex-shrink: 0" @click="handleCreate"
          ><Icon name="icon-add" size="14px" style="margin-right: 4px" />{{ t('create') }}</n-button
        >
      </div>
    </resizeable-view>
    <div class="flex-1 flex-col flex p-4 bg-(--bg-aside-color)">
      <div class="flex">
        <div
          class="bg-(--bg-color) rounded-[6px] w-[48px] h-[48px] mr-4 flex items-center justify-center"
        >
          <Icon name="icon-jianzhu4" size="24px" />
        </div>

        <div class="flex flex-col">
          <span class="font-bold text-[16px]">{{ currentOption?.[labelField] }}</span>
          <span class="text-[14px] bg-(--n-option-text-color-active)">{{
            currentOption?.[locale === 'en_US' ? 'name' : 'enName']
          }}</span>
        </div>
      </div>
      <div class="rounded-[8px] bg-(--bg-color) p-4 mt-4">
        <div class="flex items-center">
          <Icon name="icon-yonghu" />
          <span class="ml-2">{{ t('dptHead') }}</span>
        </div>
        <div class="flex mt-6">
          <n-avatar :size="48" round>H</n-avatar>
          <div class="flex flex-col">
            <span class="ml-2 text-[16px] font-bold">{{
              currentOption?.leader?.realName || ''
            }}</span>
            <div class="ml-2 text-[12px] text-(--text-secondary-color) gap-2 flex items-center">
              <Icon name="icon-email" size="12px" />
              <span>{{ currentOption?.leader?.email || 'xxxxxx@company.com' }}</span>
              <Icon name="icon-dianhua" size="12px" />
              <span>{{ currentOption?.leader?.phone || '**********' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 h-0">
        <div class="rounded-[8px] bg-(--bg-color) p-4 mt-4 flex-col flex max-h-full">
          <div class="mb-8">{{ t('dptMember') }}</div>
          <div
            v-if="!Array.isArray(currentOption?.admins) || currentOption?.admins.length === 0"
            class="flex items-center justify-center h-full"
          >
            <div class="n-data-table-empty">
              <div
                class="n-empty"
                style="
                  --n-icon-size: 40px;
                  --n-font-size: 14px;
                  --n-bezier: cubic-bezier(0.4, 0, 0.2, 1);
                  --n-text-color: rgba(255, 255, 255, 0.38);
                  --n-icon-color: rgba(255, 255, 255, 0.38);
                  --n-extra-text-color: rgba(255, 255, 255, 0.82);
                "
              >
                <div class="n-empty__icon">
                  <i class="n-base-icon"
                    ><svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M26 7.5C26 11.0899 23.0899 14 19.5 14C15.9101 14 13 11.0899 13 7.5C13 3.91015 15.9101 1 19.5 1C23.0899 1 26 3.91015 26 7.5ZM16.8536 4.14645C16.6583 3.95118 16.3417 3.95118 16.1464 4.14645C15.9512 4.34171 15.9512 4.65829 16.1464 4.85355L18.7929 7.5L16.1464 10.1464C15.9512 10.3417 15.9512 10.6583 16.1464 10.8536C16.3417 11.0488 16.6583 11.0488 16.8536 10.8536L19.5 8.20711L22.1464 10.8536C22.3417 11.0488 22.6583 11.0488 22.8536 10.8536C23.0488 10.6583 23.0488 10.3417 22.8536 10.1464L20.2071 7.5L22.8536 4.85355C23.0488 4.65829 23.0488 4.34171 22.8536 4.14645C22.6583 3.95118 22.3417 3.95118 22.1464 4.14645L19.5 6.79289L16.8536 4.14645Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M25 22.75V12.5991C24.5572 13.0765 24.053 13.4961 23.5 13.8454V16H17.5L17.3982 16.0068C17.0322 16.0565 16.75 16.3703 16.75 16.75C16.75 18.2688 15.5188 19.5 14 19.5C12.4812 19.5 11.25 18.2688 11.25 16.75L11.2432 16.6482C11.1935 16.2822 10.8797 16 10.5 16H4.5V7.25C4.5 6.2835 5.2835 5.5 6.25 5.5H12.2696C12.4146 4.97463 12.6153 4.47237 12.865 4H6.25C4.45507 4 3 5.45507 3 7.25V22.75C3 24.5449 4.45507 26 6.25 26H21.75C23.5449 26 25 24.5449 25 22.75ZM4.5 22.75V17.5H9.81597L9.85751 17.7041C10.2905 19.5919 11.9808 21 14 21L14.215 20.9947C16.2095 20.8953 17.842 19.4209 18.184 17.5H23.5V22.75C23.5 23.7165 22.7165 24.5 21.75 24.5H6.25C5.2835 24.5 4.5 23.7165 4.5 22.75Z"
                        fill="currentColor"
                      ></path></svg
                  ></i>
                </div>
                <div class="n-empty__description">{{ t('noData') }}</div>
                <!---->
              </div>
            </div>
          </div>
          <template v-else>
            <div
              class="flex gap-4 p-2 bg-(--bg-aside-color) rounded-[6px] font-bold text-(--text-secondary-color) mb-2"
            >
              <div class="w-[10%]">{{ t('avatar') }}</div>
              <div class="w-[20%]">{{ t('account') }}</div>
              <div class="w-[20%]">{{ t('realName') }}</div>
              <div class="w-[25%]">{{ t('email') }}</div>
              <div class="w-[20%]">{{ t('phone') }}</div>
            </div>
            <div class="flex-1 flex-col flex h-0 overflow-y-auto">
              <div
                class="flex gap-4 hover:bg-(--bg-color) rounded-[6px] flex items-center p-2"
                v-for="item in currentOption?.admins || []"
                :key="item.id"
              >
                <div class="w-[10%] flex items-center">
                  <n-avatar :size="40" round>{{ item.realName?.[0] || 'U' }}</n-avatar>
                </div>
                <div class="w-[20%]">{{ item.username }}</div>
                <div class="w-[20%]">{{ item.realName }}</div>
                <div class="w-[25%]">{{ item.email }}</div>
                <div class="w-[20%]">{{ item.phone }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <draggable-modal
      v-model:visible="visible"
      v-model:loading="loading"
      :header="t('create')"
      width="400px"
      :draggable="false"
      @confirm="handleSave"
    >
      <n-form ref="formRef" :model="formData" size="small" :rules="rules">
        <n-form-item :label="t('parentDpt')" path="parentId">
          <n-tree-select
            :value="formData.parentId"
            :options="list"
            key-field="id"
            :label-field="labelField"
            @update:value="handleUpdateParent"
          />
        </n-form-item>
        <n-form-item :label="t('name')" path="name">
          <n-input v-model:value="formData.name" />
        </n-form-item>
        <n-form-item :label="t('enName')" path="enName">
          <n-input v-model:value="formData.enName" />
        </n-form-item>
        <n-form-item :label="t('dptHead')" path="leaderId">
          <x-select
            v-model:value="formData.leaderId"
            :api="usersApi.getUserList"
            :query="{ page: 1, pageSize: 999 }"
            label-field="realName"
            key-field="id"
          />
        </n-form-item>
        <n-form-item :label="t('status')" path="status">
          <n-select v-model:value="formData.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
    </draggable-modal>
  </div>
</template>
<script lang="jsx" setup>
import { ref, computed, onMounted, h, render } from 'vue'
import { Icon, ResizeableView, DraggableModal, XSelect } from '@renderer/components'
import { dptApi, usersApi } from '@renderer/api'
import {
  NInput,
  NButton,
  NTree,
  NForm,
  NFormItem,
  NSelect,
  useMessage,
  NTreeSelect,
  NAvatar,
  NDropdown,
  NPopconfirm
} from 'naive-ui'
import { t } from '@renderer/locales'
import { useLocale } from '@renderer/locales/useLocales'

const { locale } = useLocale()

const labelField = computed(() => {
  return locale.value === 'en_US' ? 'enName' : 'name'
})

const message = useMessage()
const currentOption = ref(null)
const asideWidth = ref(240)
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
const isEdit = ref(false)
const loading = ref(false)
const pattern = ref('')
const list = ref([])
const visible = ref(false)
const formRef = ref(null)
const rules = computed(() => ({
  name: [
    {
      required: true,
      message: t('requiredErrorMessage', { key: t('name') }),
      trigger: ['blur', 'change']
    }
  ],
  enName: [
    {
      required: true,
      message: t('requiredErrorMessage', { key: t('enName') }),
      trigger: ['blur', 'change']
    }
  ]
}))
const initFormData = {
  name: '',
  enName: '',
  code: '',
  parentId: null,
  leaderId: null,
  sort: 0,
  status: 1,
  remark: ''
}
const formData = ref(initFormData)

const handleSave = (e) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      const API = isEdit.value ? dptApi.updateDepartment : dptApi.createDepartment
      const res = await API(formData.value)
      if (res.success) {
        message.success(t('success'))
        visible.value = false
        loading.value = false
        fetchDptList()
      }
    } else {
      console.log(errors)
    }
  })
}

const handleUpdateParent = (val, options) => {
  formData.value.parentId = val
}

const fixedList = (arr) => {
  if (!arr || arr.length === 0) return null
  return arr.map((item) => {
    return {
      ...item,
      disabled: item.status === 0,
      children: fixedList(item.children || null)
    }
  })
}
const fetchDptList = async () => {
  try {
    const res = await dptApi.getAllDepartments()
    if (res.success) {
      const data = res.data?.items || []
      list.value = fixedList(data)

      if (data.length > 0 && !currentOption.value) {
        currentOption.value = data[0]
      }
    }
  } catch (error) {
    console.error(error)
  }
}
const selectedKeys = computed(() => {
  return currentOption.value ? [currentOption.value.id] : []
})

const renderPrefix = ({ option }) => {
  return h(Icon, { name: 'icon-jianzhu4', size: '14px' })
}

const renderSuffix = ({ option }) => {
  const userCount = option.admins ? option.admins.length : 0

  return h('div', { class: 'flex items-center' }, [
    h(Icon, { name: 'icon-user', style: { marginRight: '6px' }, size: '12px' }),
    h('span', {}, userCount),
    h(
      NDropdown,
      {
        options: [
          { label: t('edit'), key: 'edit' },
          { label: t('delete'), key: 'delete' }
        ],
        renderOption: ({ option: opt }) => {
          const { key } = opt || {}
          return h(
            'div',
            {
              class:
                'mx-1 px-[12px] py-[5px] rounded-[3px] hover:bg-(--n-option-color-hover) cursor-pointer',
              onClick: (e) => {
                e.stopPropagation()
              }
            },
            [
              key === 'edit'
                ? h(
                    'span',
                    {
                      class: '',
                      onClick: (e) => {
                        e.stopPropagation()
                        visible.value = true
                        isEdit.value = true
                        const { id, name, enName, parentId, leaderId, status, remark } = option
                        formData.value = { id, name, enName, parentId, leaderId, status, remark }
                      }
                    },
                    opt.label
                  )
                : h(
                    NPopconfirm,
                    {
                      onPositiveClick: () => {
                        dptApi.removeDepartment(option.id).then((res) => {
                          if (res.success) {
                            message.success(t('success'))
                            if (currentOption.value?.id === option.id) {
                              currentOption.value = list.value[0] || null
                            }
                            fetchDptList()
                          }
                        })
                      }
                    },
                    {
                      trigger: () => h('span', { class: 'text-red-400' }, opt.label),
                      default: () => opt.label
                    }
                  )
            ]
          )
        },
        trigger: 'hover'
      },
      {
        default: () =>
          h(Icon, {
            name: 'icon-more1',
            size: '12px',
            style: { marginLeft: '6px' }
          })
      }
    )
  ])
}

const override = ({ option }) => {
  currentOption.value = option
  if (option.children) {
    return 'toggleExpand'
  }
  return 'default'
}
const handleCreate = () => {
  isEdit.value = false
  formData.value = { ...initFormData }
  visible.value = true
}
onMounted(() => {
  fetchDptList()
})
</script>
<style scoped lang="scss"></style>
