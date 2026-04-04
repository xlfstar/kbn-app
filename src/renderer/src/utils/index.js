export function convertMenuWithDepth(menuArray, maxDepth = 2) {
  const convert = (items, currentDepth = 0) => {
    if (!Array.isArray(items) || currentDepth >= maxDepth) return []

    return items.map((item) => {
      const converted = {
        label: item.code,
        value: item.id,
        depth: currentDepth // 记录当前深度
      }

      // 只有当深度小于 maxDepth-1 时才递归处理子节点
      if (item.children && item.children.length > 0 && currentDepth < maxDepth - 1) {
        converted.children = convert(item.children, currentDepth + 1)
      } else {
        // 如果不继续递归，可以给一个标记或者直接不添加 children 属性
        converted.hasMoreChildren = item.children && item.children.length > 0
      }

      return converted
    })
  }

  return convert(menuArray)
}
export function convertMenuTwoLevels(menuArray) {
  const locale = localStorage.getItem('locale')
  if (!Array.isArray(menuArray)) return []

  return menuArray.map((item) => {
    const converted = {
      label: locale === 'zh_CN' ? item.name : item.enName,
      value: item.id
    }

    // 只处理第一级子节点（第二层）
    if (item.children && Array.isArray(item.children)) {
      converted.children = item.children.map((child) => ({
        label: locale === 'zh_CN' ? child.name : child.enName,
        value: child.id
      }))
    }

    return converted
  })
}
export const flatten = (nodes, parent = null) => {
  let res = []
  nodes.forEach((node) => {
    res.push({ ...node, parent })
    if (node.children && node.children.length) {
      res = res.concat(flatten(node.children, node))
    }
  })
  return res
}
export const arrayToTree = (items) => {
  const itemMap = {}
  const tree = []

  // 创建映射
  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [] }
  })

  // 构建树
  items.forEach((item) => {
    const node = itemMap[item.id]

    if (item.parentId === null || item.parentId === undefined) {
      // 根节点
      tree.push(node)
    } else {
      // 子节点
      const parent = itemMap[item.parentId]
      if (parent) {
        parent.children.push(node)
      } else {
        // 如果没有找到父节点，作为根节点
        tree.push(node)
      }
    }
  })

  return tree
}
// 将数字补零到5位（例如 123 → "00123"）
export function padZero(num, length = 5) {
  return String(num).padStart(length, '0')
}
