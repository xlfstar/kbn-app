<template>
  <aside class="flex h-full">
    <aside class="w-[44px] flex flex-col justify-between h-full px-[5px] py-[10px]">
      <div class="flex-1 flex flex-col items-center gap-[8px]">
        <div
          v-for="(item, index) in menus"
          :key="item.name"
          class="menu-item flex items-center justify-center w-full aspect-square hover:bg-(--bg-hover-color) cursor-pointer rounded-[5px] relative"
          :class="{ 'bg-(--bg-hover-color)': index === menuIndex }"
          @click="handleChangeMenu(item, index)"
        >
          <div class="tooltip">{{ title(item) }}</div>
          <Icon :name="item.meta.icon" size="16px" />
        </div>
      </div>
      <div class="flex flex-col items-center">
        <NPopover trigger="click" placement="right">
          <template #trigger>
            <span class="cursor-pointer setting-icon">
              <Icon name="icon-setting" size="24px" />
            </span>
          </template>
          <span class="capitalize">{{ t('aside.setting') }}</span>
        </NPopover>
      </div>
    </aside>
    <div v-if="Array.isArray(navList) && navList.length > 0 && showNav" class="mr-[5px]">
      <ResizeableView
        v-model:width="width"
        :min-width="100"
        :max-width="400"
        :handles="['right']"
        height="100%"
        class="bg-(--bg-aside-color) rounded-[6px]"
      >
        <div class="pl-[10px] py-[8px] font-bold text-[16px]">
          {{ title(menus[menuIndex]) }}
        </div>

        <div
          v-for="item in navList"
          :key="item.name"
          class="pl-[15px] py-[5px] cursor-pointer hover:bg-(--bg-hover-color) flex items-center"
          :class="{ 'bg-(--bg-hover-color)': item.name === currentTab }"
          @click="handleNavigate(item)"
        >
          <Icon :name="item.meta?.icon" size="16px" />
          <span class="ml-[12px]">{{ title(item) }}</span>
        </div>
      </ResizeableView>
    </div>
  </aside>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { t } from '@renderer/locales'
import { NPopover } from 'naive-ui'
import { Icon, ResizeableView } from '@renderer/components'
import { useRouter } from 'vue-router'
import { useTabsStore, useMenuStore } from '@renderer/stores'
import { useLocale } from '@renderer/locales/useLocales'
const { locale } = useLocale()
const router = useRouter()

const width = ref(200)
const menuIndex = ref(0)
const showNav = ref(false)
const menus = computed(() => useMenuStore().menuList.filter((item) => !item.meta?.hide) || [])

const currentTab = computed(() => useTabsStore().currentTab)
const handleChangeMenu = (item, index) => {
  if (menuIndex.value === index) {
    showNav.value = !showNav.value
  } else {
    showNav.value = true
  }
  const { children, name } = item || {}
  menuIndex.value = index
  if (!Array.isArray(children) || children.length === 0) {
    if (name) {
      router.push({ name })
    }
    return
  }
}

const navList = computed(() =>
  (menus.value[menuIndex.value]?.children || []).filter((item) => !item.meta?.hide)
)

const handleNavigate = (item) => {
  // useTabsStore().addTab(item)
  const { name } = item || {}
  if (router.currentRoute.value.name === name) return
  // useTabsStore().setCurrentTab(name)
  router.push({ name })
}
const title = computed(() => {
  return (item) => {
    const l = locale ? locale.value : 'zh_CN'
    return item.meta?.title[l]
  }
})

onMounted(() => {})
</script>
<style scoped lang="scss">
.menu-item {
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: var(--bg-hover-color);
  }
}
.menu-item .tooltip {
  z-index: 100;
  position: absolute;
  top: 50%;
  right: 0;
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  transform: translate(calc(100% + 5px), -50%);
  background-color: var(--bg-reverse-color);
  color: var(--text-reverse-color);
  transition: all 0.3s ease-in-out;
  display: none;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 12px;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -4px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 5px solid var(--bg-reverse-color);
  }
}
.menu-item:hover .tooltip {
  display: block;
}
</style>
