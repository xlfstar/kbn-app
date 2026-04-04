<template>
  <div v-if="tabs.length > 0" ref="tabsRef" class="tabs h-[38px] bg-(--bg-tabs-color)">
    <div v-if="showArrows" class="tabs-arrow left cursor-pointer" @click="scrollLeft">
      <Icon name="icon-arrow-left" size="12px" />
    </div>
    <div
      ref="scrollContainer"
      class="tabs-scroll flex h-[38px] items-center overflow-x-auto"
      :class="{ 'show-arrows': showArrows }"
    >
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="h-[38px] tab-item px-[10px] py-[8px] cursor-pointer flex items-center tab-item"
        :class="{ active: tab.name === currentTab }"
        @click="handleTabClick(tab)"
        @contextmenu="openMenu(tab, $event)"
      >
        <span class="mr-[5px] capitalize whitespace-nowrap">{{ title(tab) }}</span>
        <span v-if="!lockTab(tab)" class="remove-icon cursor-pointer" @click.stop="removeTab(tab)">
          <Icon name="icon-delete" size="12px" />
        </span>
      </div>
    </div>
    <div v-if="showArrows" class="tabs-arrow right cursor-pointer" @click="scrollRight">
      <Icon name="icon-arrow-right" size="12px" />
    </div>

    <teleport to="body">
      <div
        v-show="menuVisible"
        class="tab-menu bg-(--bg-content-color) p-2"
        :style="{ top: menuY + 'px', left: menuX + 'px' }"
        @click.stop
      >
        <div class="tab-menu-item enable" @click.stop="actionClose">{{ t('close') }}</div>
        <div
          :class="['tab-menu-item', tabs.length > 1 ? 'enable' : 'disabled']"
          @click.stop="tabs.length > 1 && actionCloseOthers()"
        >
          {{ t('closeOthers') }}
        </div>
        <div
          :class="['tab-menu-item', menuHasRight ? 'enable' : 'disabled']"
          @click.stop="menuHasRight && actionCloseRight()"
        >
          {{ t('closeToTheRight') }}
        </div>
      </div>
    </teleport>
  </div>
</template>
<script setup>
import { useTabsStore } from '@renderer/stores'
import { Icon } from '@renderer/components'
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@renderer/locales/useLocales'
import { t } from '@renderer/locales'
const { locale } = useLocale()
const router = useRouter()

const tabs = computed(() => useTabsStore().tabs)
const currentTab = computed(() => useTabsStore().currentTab)

const lockTab = computed(() => {
  return (item) => {
    const { name } = item || {}
    return tabs.value.length === 1 && name === 'dashboard'
  }
})

const scrollContainer = ref(null)
const showArrows = ref(false)
const totalTabsWidth = ref(0)
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const menuTab = ref(null)
const menuHasRight = computed(() => {
  if (!menuTab.value) return false
  const idx = tabs.value.findIndex((i) => i.name === menuTab.value.name)
  return idx > -1 && idx < tabs.value.length - 1
})

const removeTab = (tab) => {
  useTabsStore().removeTab(tab)

  // 如果关闭后没有标签页了，跳转到 dashboard
  const currentTabs = useTabsStore().tabs
  if (currentTabs.length === 0) {
    router.push({ name: 'dashboard' })
  } else {
    // 否则跳转到当前激活的标签页
    const activeTab = currentTabs.find((t) => t.name === useTabsStore().currentTab)
    if (activeTab) {
      router.push({ name: activeTab.name, query: activeTab.query, params: activeTab.params })
    }
  }
}

const handleTabClick = (tab) => {
  useTabsStore().setCurrentTab(tab.name)
  router.push({ name: tab.name, query: tab.query, params: tab.params })
}
const title = computed(() => {
  return (item) => {
    const l = locale ? locale.value : 'zh_CN'
    return item.meta?.title ? item.meta?.title[l] : item.name
  }
})

const updateMetrics = () => {
  const el = scrollContainer.value
  if (!el) return
  const items = el.querySelectorAll('.tab-item')
  totalTabsWidth.value = Array.from(items).reduce((sum, i) => sum + i.offsetWidth, 0)
  showArrows.value = totalTabsWidth.value > el.clientWidth
}

const scrollLeft = () => {
  const el = scrollContainer.value
  if (!el) return
  const target = Math.max(0, el.scrollLeft - 120)
  el.scrollTo({ left: target, behavior: 'smooth' })
}

const scrollRight = () => {
  const el = scrollContainer.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  const target = Math.min(max, el.scrollLeft + 120)
  el.scrollTo({ left: target, behavior: 'smooth' })
}

const openMenu = (tab, e) => {
  menuTab.value = tab
  menuVisible.value = true
  menuY.value = e.clientY
  menuX.value = e.clientX
}
const closeMenu = () => {
  menuVisible.value = false
  menuTab.value = null
}
const setToLastIfNeeded = (closedNames) => {
  const closedSet = new Set(closedNames)
  if (closedSet.has(currentTab.value)) {
    const last = tabs.value[tabs.value.length - 1]
    if (last) {
      useTabsStore().setCurrentTab(last.name)
      router.push({ name: last.name, query: last.query, params: last.params })
    } else {
      router.push({ name: 'dashboard' })
    }
  }
}
const actionClose = () => {
  if (!menuTab.value) return
  const name = menuTab.value.name
  useTabsStore().removeTab({ name })
  setToLastIfNeeded([name])
  closeMenu()
}
const actionCloseRight = () => {
  if (!menuTab.value) return
  const idx = tabs.value.findIndex((i) => i.name === menuTab.value.name)
  if (idx === -1) return
  const rightNames = tabs.value.slice(idx + 1).map((i) => i.name)
  rightNames.forEach((name) => useTabsStore().removeTab({ name }))
  setToLastIfNeeded(rightNames)
  closeMenu()
}
const actionCloseOthers = () => {
  if (!menuTab.value) return
  const keep = menuTab.value.name
  const targetTab = tabs.value.find((i) => i.name === keep)
  const otherNames = tabs.value.filter((i) => i.name !== keep).map((i) => i.name)
  otherNames.forEach((name) => useTabsStore().removeTab({ name }))
  setToLastIfNeeded(otherNames)
  useTabsStore().setCurrentTab(keep)
  if (targetTab) {
    router.push({ name: keep, query: targetTab.query, params: targetTab.params })
  } else {
    router.push({ name: keep })
  }
  closeMenu()
}

onMounted(() => {
  nextTick(updateMetrics)
  window.addEventListener('resize', updateMetrics)
  window.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMetrics)
  window.removeEventListener('click', closeMenu)
})

watch(
  tabs,
  async () => {
    await nextTick()
    updateMetrics()
  },
  { deep: true }
)
</script>
<style scoped lang="scss">
.tabs {
  border-radius: 6px 6px 0 0;
  position: sticky;
  top: 0;
  position: sticky;
  // overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--bg-hover-color);
  }
}
.tabs-scroll {
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &.show-arrows {
    padding: 0 28px;
  }
}
.tabs-scroll::-webkit-scrollbar {
  display: none;
}
.tabs-arrow {
  position: absolute;
  top: 0;
  width: 28px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  color: var(--text-color);
  background-color: var(--bg-hover-color);
  &.left {
    left: 0;

    border-right: 1px solid var(--bg-hover-color);
  }
  &.right {
    right: 0;
  }
}
.tab-menu {
  position: fixed;
  min-width: 120px;
  // background-color: var(--bg-hover-color, #fff);
  border: 1px solid var(--bg-hover-color);
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}
.tab-menu-item {
  position: relative;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-color);
  border-radius: 3px;
  &.enable {
    cursor: pointer;
    &:hover {
      background-color: var(--bg-hover-color);
    }
  }
}

.tab-menu-item.disabled {
  opacity: 0.5;
  cursor: default;
}
.tab-item {
  font-size: 12px;
  position: relative;
  border-right: 1px solid var(--bg-hover-color);
  border-top: 1px solid var(--bg-content-color);
  opacity: 0.7;
  .remove-icon {
    visibility: hidden;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--text-color);
    &:hover {
      background-color: var(--bg-hover-color);
    }
  }
  &.active {
    border-top: 1px solid var(--text-color);
    opacity: 1;
    background: var(--bg-active-tab-color);
    .remove-icon {
      visibility: visible;
    }
    &::after {
      z-index: 2;
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--bg-content-color);
    }
  }
  &:hover {
    .remove-icon {
      visibility: visible;
    }
  }
}
</style>
