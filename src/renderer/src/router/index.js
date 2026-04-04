import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@renderer/layouts/index.vue'
import { useTabsStore, useMenuStore } from '@renderer/stores'
const routes = [
  {
    path: '/',
    // name: 'dashboard',
    component: Layout,
    meta: {
      title: {
        zh_CN: '仪表盘',
        en_US: 'Dashboard'
      },
      icon: 'icon-dashboard'
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@renderer/pages/dashboard/index.vue'),
        meta: {
          title: {
            zh_CN: '仪表盘',
            en_US: 'Dashboard'
          },
          icon: 'icon-dashboard'
        }
      }
    ]
  },

  // {
  //   path: '/goods',
  //   name: 'goods',
  //   component: Layout,
  //   meta: {
  //     title: 'aside.goods',
  //     icon: 'icon-goods'
  //   },
  //   children: [
  //     {
  //       path: 'categories',
  //       name: 'goods-categories',
  //       component: () => import('@renderer/pages/goods/categories.vue'),
  //       meta: {
  //         title: 'aside.category',
  //         icon: 'icon-category'
  //       }
  //     },
  //     {
  //       path: 'list',
  //       name: 'goods-list',
  //       component: () => import('@renderer/pages/goods/list.vue'),
  //       meta: {
  //         title: 'aside.goodsList',
  //         icon: 'icon-list'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/perchase',
  //   name: 'perchase',
  //   component: () => import('@renderer/pages/perchase/index.vue'),
  //   meta: {
  //     title: 'aside.perchase',
  //     icon: 'icon-perchase'
  //   },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'perchase-list',
  //       component: () => import('@renderer/pages/perchase/list.vue'),
  //       meta: {
  //         title: 'aside.purchaseOrder',
  //         icon: 'icon-caigoudan'
  //       }
  //     },
  //     {
  //       path: 'detail',
  //       name: 'perchase-detail',
  //       component: () => import('@renderer/pages/perchase/detail.vue'),
  //       meta: {
  //         title: 'aside.purchaseOrderDetail',
  //         hide: true
  //       }
  //     },
  //     {
  //       path: 'supplier',
  //       name: 'perchase-supplier',
  //       component: () => import('@renderer/pages/perchase/supplier.vue'),
  //       meta: {
  //         title: 'aside.supplier',
  //         icon: 'icon-supplier'
  //       }
  //     },
  //     {
  //       path: 'purchaser',
  //       name: 'perchase-purchaser',
  //       component: () => import('@renderer/pages/perchase/purchaser.vue'),
  //       meta: {
  //         title: 'aside.purchaser',
  //         icon: 'icon-caigouyuan'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/sale',
  //   name: 'sale',
  //   component: () => import('@renderer/pages/sale/index.vue'),
  //   meta: {
  //     title: 'aside.sale',
  //     icon: 'icon-caigoudan'
  //   },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'sale-list',
  //       component: () => import('@renderer/pages/sale/list.vue'),
  //       meta: {
  //         title: 'aside.saleOrder',
  //         icon: 'icon-xiaoshoudingdanguanli'
  //       }
  //     },
  //     {
  //       path: 'detail',
  //       name: 'sale-detail',
  //       component: () => import('@renderer/pages/sale/detail.vue'),
  //       meta: {
  //         title: 'aside.saleOrderDetail',
  //         hide: true
  //       }
  //     },
  //     {
  //       path: 'saler',
  //       name: 'sale-saler',
  //       component: () => import('@renderer/pages/sale/saler.vue'),
  //       meta: {
  //         title: 'aside.saler',
  //         icon: 'icon-xiaoshouyuan'
  //       }
  //     },
  //     {
  //       path: 'customer',
  //       name: 'sale-customer',
  //       component: () => import('@renderer/pages/sale/customer.vue'),
  //       meta: {
  //         title: 'aside.customer',
  //         icon: 'icon-kehuguanli'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/warehouse',
  //   name: 'warehouse',
  //   component: () => import('@renderer/pages/warehouse/index.vue'),
  //   meta: {
  //     title: 'aside.warehouseManagement',
  //     icon: 'icon-cangku'
  //   },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'warehouse-list',
  //       component: () => import('@renderer/pages/warehouse/list.vue'),
  //       meta: {
  //         title: 'aside.warehouse',
  //         icon: 'icon-cangku'
  //       }
  //     }
  //   ]
  // },
  {
    path: '/user',
    name: 'user',
    component: Layout,
    meta: {
      title: 'userCenter',
      hide: true
    },
    children: [
      {
        path: '',
        name: 'userIndex',
        component: () => import('@renderer/pages/user/index.vue'),
        meta: {
          title: 'userCenter',
          hide: true
        }
      }
    ]
  },
  {
    path: '/blank',
    name: 'blank',
    component: Layout,
    meta: {
      title: 'aside.setting',
      icon: 'icon-setting',
      hide: true
    },
    children: [
      {
        path: '',
        name: 'blankIndex',
        component: () => import('@renderer/pages/blank/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const tabStore = useTabsStore()
  const menuStore = useMenuStore()

  // 只有在路由初始化完成后，且路由有 name 时才记录 tab
  // 这样可以避免应用刚启动时的默认路由（如 '/' 或无 name 的路由）覆盖掉 pinia 中持久化恢复的 currentTab
  if (menuStore.isInitRoutes && to.name) {
    // 检查目标路由和当前 store 中保存的是否完全一致
    // 主要是为了避免刷新页面时，初始路由（不带参数）覆盖掉 store 中原本带着参数的同名 tab
    const existingTab = tabStore.tabs.find((t) => t.name === to.name)
    const isSameRouteButWithoutParams =
      existingTab &&
      Object.keys(to.query).length === 0 &&
      Object.keys(existingTab.query).length > 0 &&
      from.name === undefined // 代表是页面刷新或初始加载

    if (!isSameRouteButWithoutParams) {
      tabStore.addTab(to)
    }
    tabStore.setCurrentTab(to.name)
  }

  next()
})
const staticRoutes = [...routes]
export { staticRoutes }
export default router
