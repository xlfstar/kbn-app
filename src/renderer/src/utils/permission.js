const LAYOUT_COMPONENT = () => import('@renderer/layouts/index.vue')
const ERROR_COMPONENT = () => import('@renderer/pages/error/index.vue')
// 组件映射表
const COMPONENT_MAP = {
  LAYOUT: LAYOUT_COMPONENT,
  ERROR: ERROR_COMPONENT
}

/**
 * 转换后端菜单数据为路由配置
 * @param {Array} menuData 后端菜单数据
 * @returns {Array} 路由配置数组
 */
export function generateRoutes(menuData) {
  const pages = import.meta.glob('../pages/**/*.vue')

  return menuData
    .filter((item) => item.status !== 0) // 排除 status 为 0 的项
    .map((item) => {
      const route = {
        path: item.path,
        name: item.code,
        meta: {
          title: {
            zh_CN: item.name,
            en_US: item.enName
          },
          icon: item.icon,
          hide: item.show !== 1,
          sort: item.sort
        },
        redirect: item.redirect || undefined,
        status: item.status
      }

      // 处理组件
      if (item.component) {
        if (COMPONENT_MAP[item.component]) {
          // 映射特殊组件（如 LAYOUT）
          route.component = COMPONENT_MAP[item.component]
        } else {
          // 动态导入组件，处理路径前缀问题
          const normalizedPath = item.component.startsWith('/') ? item.component : `/${item.component}`
          const componentPath = `../pages${normalizedPath}.vue`
          
          if (pages[componentPath]) {
            route.component = pages[componentPath]
          } else {
            // 匹配不到的组件全部重定向到 error/index.vue
            route.component = COMPONENT_MAP.ERROR
          }
        }
      }

      // 处理子路由
      if (item.children && item.children.length > 0) {
        route.children = generateRoutes(item.children)

        // 如果父路由使用 LAYOUT 但没有默认子路由，添加重定向
        if (item.component === 'LAYOUT' && !route.redirect && route.children.length > 0) {
          route.redirect = route.children[0].path
        }
      }
      return route
    })
}

/**
 * 扁平化路由（用于路由守卫、面包屑等）
 * @param {Array} routes 路由数组
 * @returns {Array} 扁平化后的路由
 */
export function flattenRoutes(routes) {
  const result = []

  routes.forEach((route) => {
    result.push({
      path: route.path,
      name: route.name,
      meta: route.meta
    })

    if (route.children) {
      result.push(...flattenRoutes(route.children))
    }
  })

  return result
}
// utils/menuGenerator.js
/**
 * 转换后端菜单数据为前端菜单树
 * @param {Array} menuData 后端菜单数据
 * @returns {Array} 前端菜单树
 */
export function generateMenuTree(menuData) {
  // 过滤显示状态和排序
  const filteredData = menuData.filter((item) => !item.hide).sort((a, b) => a.sort - b.sort)
  return filteredData.map((item) => {
    const menuItem = {
      label: item.title || item.meta?.title || item.name,
      icon: item.icon || item.meta?.icon,
      path: item.path,
      menuType: item.menuType || item.meta?.menuType
    }

    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      menuItem.children = generateMenuTree(item.children)
    }

    return menuItem
  })
}

/**
 * 过滤菜单类型
 * @param {Array} menuTree 菜单树
 * @param {string|Array} menuTypes 允许的菜单类型
 * @returns {Array} 过滤后的菜单树
 */
export function filterMenuByType(menuTree) {
  return menuTree
    .filter((item) => item.menuType !== 3)
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuByType(item.children)
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren
          }
        }
        return null
      }
      return item
    })
    .filter(Boolean)
}
/**
 * 转换静态路由为菜单项
 * @param {Array} routes 静态路由数组
 * @returns {Array} 菜单项数组
 */
export function convertStaticRoutesToMenu(routes) {
  const menuItems = []

  routes.forEach((route) => {
    // 跳过隐藏的路由
    if (route.meta?.hide === true) {
      return
    }

    const menuItem = {
      label: route.meta?.title || route.name,
      icon: route.meta?.icon,
      path: route.path,
      menuType: route.meta?.menuType || '1',
      sort: route.meta?.sort || 0,
      isStatic: true, // 标记为静态路由
      name: route.code || route.name
    }

    // 处理子路由
    if (route.children && route.children.length > 0) {
      menuItem.children = convertStaticRoutesToMenu(route.children)

      // 如果子菜单全部隐藏，则不显示父菜单
      if (menuItem.children.length === 0) {
        return
      }
    }

    menuItems.push(menuItem)
  })

  // 按 sort 排序
  return menuItems
}
