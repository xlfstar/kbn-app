import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@renderer/layouts/index.vue'
const routes = [
  {
    path: '/',
    name: 'dashboard',
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
        name: 'dashboardIndex',
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
    component: () => import('@renderer/pages/user/index.vue'),
    meta: {
      title: 'userCenter',
      hide: true
    }
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
const staticRoutes = [...routes]
export { staticRoutes }
export default router
