<template>
  <div class="flex gap-[8px] flex-wrap">
    <input
      ref="fileInputRef"
      type="file"
      name="file"
      style="display: none"
      :accept="accept"
      :multiple="mode === 2"
      @change="handleFileChange"
    />

    <!-- Mode 1: Single Image -->
    <div
      v-if="mode === 1 && modelValue"
      class="relative flex justify-center items-center item group"
    >
      <NImage :src="modelValue" object-fit="cover" class="w-full h-full" />
      <div
        class="absolute inset-0 bg-black/50 hidden group-hover:flex justify-center items-center gap-2"
      >
        <Icon
          name="icon-shanchu"
          size="20px"
          class="text-white cursor-pointer hover:text-red-500"
          @click="handleRemove(0)"
        />
      </div>
    </div>

    <!-- Mode 2: Multiple Images -->
    <template v-else-if="mode === 2">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="relative flex justify-center items-center item group"
      >
        <NImage :src="item" object-fit="cover" class="w-full h-full" />
        <div
          class="absolute inset-0 bg-black/50 hidden group-hover:flex justify-center items-center gap-2"
        >
          <Icon
            name="icon-shanchu"
            size="20px"
            class="text-white cursor-pointer hover:text-red-500"
            @click="handleRemove(index)"
          />
        </div>
      </div>
    </template>

    <!-- Add Button -->
    <div
      v-if="showAddButton"
      class="flex justify-center items-center item add cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors"
      @click="handleAddClick"
    >
      <div v-if="loading" class="animate-spin i-icon-loading text-2xl" />
      <Icon v-else name="icon-add" size="20px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components'
import { NImage, useMessage } from 'naive-ui'
import { UploadApi } from '@renderer/api'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxCount: {
    type: Number,
    default: 10
  },
  mode: {
    type: Number,
    default: 1 // 1: single, 2: multiple
  }
})

const emit = defineEmits(['update:modelValue'])
const message = useMessage()

const fileInputRef = ref(null)
const loading = ref(false)

const list = computed(() => {
  if (props.mode === 1) {
    if (typeof props.modelValue === 'string') {
      return props.modelValue ? [props.modelValue] : []
    }
    return []
  }
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

const showAddButton = computed(() => {
  if (loading.value) return false
  if (props.mode === 1) {
    return list.value.length === 0
  }
  return list.value.length < props.maxCount
})

const handleAddClick = () => {
  if (loading.value) return
  fileInputRef.value.value = '' // Reset input
  fileInputRef.value.click()
}

const handleFileChange = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  loading.value = true
  try {
    if (props.mode === 1) {
      // Single upload
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file) // 确保这里 append 的 key 是 'file'

      // 使用 axiosInstance 来支持 multipart/form-data
      // UploadApi 可能是 application/json 配置的
      const res = await UploadApi.uploadImage(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.code === 200 || res.success) {
        // Adjust based on actual API response structure
        // Assuming res.data is the URL based on common patterns, but check if it's nested
        const url = res.data?.url || res.data
        emit('update:modelValue', url)
        message.success('上传成功')
      } else {
        message.error(res.msg || '上传失败')
      }
    } else {
      // Multiple upload
      const uploadPromises = []
      const currentCount = list.value.length
      const remainingCount = props.maxCount - currentCount

      const filesToUpload = Array.from(files).slice(0, remainingCount)

      if (filesToUpload.length < files.length) {
        message.warning(`最多只能上传 ${props.maxCount} 张图片`)
      }

      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('file', file)
        uploadPromises.push(
          UploadApi.uploadImage(formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        )
      }

      const results = await Promise.all(uploadPromises)
      const newUrls = []

      results.forEach((res) => {
        if (res.code === 200 || res.success) {
          const url = res.data?.url || res.data
          if (url) newUrls.push(url)
        }
      })

      if (newUrls.length > 0) {
        const newList = [...list.value, ...newUrls]
        emit('update:modelValue', newList)
        message.success(`成功上传 ${newUrls.length} 张图片`)
      }

      if (newUrls.length < filesToUpload.length) {
        message.error('部分图片上传失败')
      }
    }
  } catch (error) {
    console.error(error)
    message.error('上传出错')
  } finally {
    loading.value = false
  }
}

const handleRemove = (index) => {
  if (props.mode === 1) {
    emit('update:modelValue', '')
  } else {
    const newList = [...list.value]
    newList.splice(index, 1)
    emit('update:modelValue', newList)
  }
}
</script>

<style scoped>
.item {
  width: 100px;
  height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.item.add {
  border: 1px dashed #d1d5db;
  transition: all 0.3s;
}

.item.add:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* Ensure images fill the container */
:deep(.n-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
