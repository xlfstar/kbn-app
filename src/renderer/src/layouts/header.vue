<template>
  <header class="windows-header flex items-center justify-between h-[40px]">
    <div class="header-left flex items-center pl-2">
      <img :src="LogoSvg" alt="logo" class="h-[24px] w-[24px]" />
      <span class="ml-2">{{ t('appTitle') }}</span>
    </div>
    <div class="header-right flex items-center">
      <n-dropdown
        v-if="authStore.isAuthenticated"
        trigger="click"
        placement="bottom-end"
        :options="options"
      >
        <div
          class="user cursor-pointer flex items-center justify-center h-[30px] w-[30px] hover:bg-(--bg-hover-color) rounded-[3px]"
        >
          <Icon name="icon-yonghu" />
        </div>
      </n-dropdown>
      <n-divider
        vertical
        style="width: 2px; height: 16px; background-color: var(--bg-hover-color)"
      />
      <div class="flex gap-4 items-center win-control">
        <span
          class="h-[38px] w-[38px] flex items-center justify-center hover:bg-(--bg-hover-color)"
          @click="handleMinimizeWindow"
          ><Icon name="icon-minimize"
        /></span>
        <span
          class="h-[38px] w-[38px] flex items-center justify-center hover:bg-(--bg-hover-color)"
          @click="handleToggleMaximizeWindow"
          ><Icon :name="isMaximized ? 'icon-unmaximize' : 'icon-maximize'"
        /></span>
        <span
          class="h-[38px] w-[38px] flex items-center justify-center hover:bg-red-500 hover:text-white"
          @click="handleCloseWindow"
          ><Icon name="icon-delete"
        /></span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, h } from 'vue'
import { t } from '@renderer/locales'
import { NText, NDropdown, NDivider, NButton } from 'naive-ui'
import LogoSvg from '@renderer/assets/electron.svg'
import { Icon } from '@renderer/components'
import { useWindowControls } from '@renderer/hooks'
import { useAuthStore, useTheme } from '@renderer/stores'
import { useRouter } from 'vue-router'
import { useLocale } from '@renderer/locales/useLocales'
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useTheme()
const { changeLocale } = useLocale()

const { minimize, toggleMaximize, close, isMaximized } = useWindowControls()
const handleMinimizeWindow = async () => {
  await minimize()
}
const handleToggleMaximizeWindow = async () => {
  await toggleMaximize()
}
const handleCloseWindow = async () => {
  await close()
}

const handleLogout = async () => {
  await authStore.logout()
}
function renderCustomHeader() {
  return h(
    'div',
    {
      style: 'display: flex; align-items: center; padding: 8px 12px;'
    },

    [
      authStore.user?.avatar
        ? h('img', {
            src: authStore.user?.avatar,
            alt: 'avatar',
            class:
              'mr-[16px] rounded-[3px] bg-(--bg-hover-color) flex items-center justify-center h-[30px] w-[30px]'
          })
        : h(
            'div',
            {
              class:
                'mr-[16px] rounded-[3px] bg-(--bg-hover-color) flex items-center justify-center h-[30px] w-[30px]'
            },
            h(Icon, { name: 'icon-yonghu' })
          ),
      h('div', null, [h(NText, { depth: 2 }, { default: () => authStore.user?.username })])
    ]
  )
}

const options = computed(() => [
  {
    key: 'header',
    type: 'render',
    render: renderCustomHeader
  },
  {
    key: 'header-divider',
    type: 'divider'
  },
  {
    label: t('userCenter'),
    key: 'userCenter',
    props: {
      onClick: () => router.push('/user')
    }
  },
  {
    label: t('theme'),
    key: 'theme',

    children: themeStore.themes.map((item) => ({
      label: t(item.key),
      key: item.key,
      props: {
        onClick: () => themeStore.toggle(item.key)
      }
    }))
  },
  {
    label: t('lang'),
    key: 'lang',
    children: [
      {
        label: t('chinese'),
        key: 'zh_CN',
        props: {
          onClick: () => changeLocale('zh_CN')
        }
      },
      {
        label: t('english'),
        key: 'en_US',
        props: {
          onClick: () => changeLocale('en_US')
        }
      }
    ]
  },
  {
    key: 'footer-divider',
    type: 'divider'
  },
  {
    label: t('logout'),
    key: 'logout',
    type: 'render',
    render: () =>
      h(
        'div',
        { class: 'w-[200px] px-1' },
        h(
          NButton,
          { size: 'small', secondary: true, strong: true, block: true },
          { default: () => t('logout') }
        )
      ),

    props: {
      onClick: handleLogout
    }
  }
])
</script>
<style scoped lang="scss">
header {
  -webkit-app-region: drag;
}
.win-control {
  -webkit-app-region: no-drag;
}
.user {
  -webkit-app-region: no-drag;
  position: relative;
  // &::after {
  //   content: '';
  //   position: absolute;
  //   top: 50%;
  //   transform: translateY(-50%);
  //   right: -10px;
  //   width: 1px;
  //   height: 16px;
  //   background-color: rgba(0, 0, 0, 0.1);
  // }
}
.windows-header {
  position: sticky;
  top: 0;
}
</style>
