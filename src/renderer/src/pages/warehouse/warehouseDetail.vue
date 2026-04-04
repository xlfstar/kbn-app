<template>
  <div class="warehouse-detail">
    <div ref="container" class="three-container" @mousemove="onMouseMove" @mouseleave="hideTooltip">
      <div class="stats-panel">
        <div class="stats-title">货位状态统计</div>
        <div class="stats-row full">
          <span class="stats-label">已满</span><span class="stats-value">{{ stats.full }}</span>
        </div>
        <div class="stats-row partial">
          <span class="stats-label">部分</span><span class="stats-value">{{ stats.partial }}</span>
        </div>
        <div class="stats-row empty">
          <span class="stats-label">空闲</span><span class="stats-value">{{ stats.empty }}</span>
        </div>
        <div class="stats-divider"></div>
        <div class="total flex justify-between">
          <span class="stats-label">总计</span>
          <span class="stats-value">{{ stats.full + stats.partial + stats.empty }}</span>
        </div>
      </div>

      <div
        v-if="tooltip.visible"
        class="tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        {{ tooltip.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { warehouseLocationApi } from '@renderer/api/warehouse'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const route = useRoute()
const router = useRouter()
let animationId = null
const container = ref(null)

const message = useMessage()

// 仓库ID
const warehouseId = computed(() => route.query.id)

// 动态计算布局参数
const layoutParams = reactive({
  shelvesPerRow: [],
  rows: 0,
  maxRowWidth: 0,
  depthSpan: 0,
  zOffset: 0,
  xOffset: 0
})

function updateLayoutParamsFromData(data) {
  if (!data || data.length === 0) return

  // 找出最大的排数（如果依然有排的概念的话，没有的话统一算）
  // 由于没有row了，我们只根据shelf来确定货架
  // 但为了兼容原有代码结构，我们先找出唯一的货架标识

  // 修改布局逻辑：现在只显示一列（纵向排列），所有货架前后放置
  // 也就是说，X轴位置固定（或居中），Z轴位置根据顺序递增

  // 计算总的货架数量（以shelfNo为唯一标识）
  const uniqueShelves = new Set()
  data.forEach((d) => {
    uniqueShelves.add(d.shelf)
  })
  const totalShelves = uniqueShelves.size

  // 布局参数调整：
  // maxRowWidth: 取决于单个货架的最大宽度（而不是所有货架宽度的总和）
  // depthSpan: 取决于所有货架的总深度（每个货架深度 + 通道间隔）

  // 计算单个货架的最大可能宽度（这里简化为最大列数对应的宽度，虽然现在是一列列放，但每个货架本身有宽度）
  const maxShelfWidth = SHELF_WIDTH // 假设所有货架标准宽度一致

  const totalDepth = totalShelves * (BAY_DEPTH + AISLE_WIDTH) - AISLE_WIDTH

  layoutParams.rows = totalShelves // 逻辑上变为了 totalShelves "排"
  layoutParams.shelvesPerRow = new Array(totalShelves).fill(1) // 每排只有1个货架

  layoutParams.maxRowWidth = maxShelfWidth
  layoutParams.depthSpan = totalDepth
  layoutParams.zOffset = -layoutParams.depthSpan / 2
  layoutParams.xOffset = -layoutParams.maxRowWidth / 2
}

function clear3DScene() {
  if (!scene) return

  // 清理现有网格
  bayMeshes.forEach((mesh) => {
    scene.remove(mesh)
    if (mesh.geometry) mesh.geometry.dispose()
    if (mesh.material) mesh.material.dispose()
  })
  bayMeshes = []

  const objectsToRemove = []
  scene.traverse((obj) => {
    if (obj.userData && (obj.userData.type === 'bay' || obj.userData.type === 'shelf_part')) {
      objectsToRemove.push(obj)
    }
    if (obj.isCSS2DObject) {
      objectsToRemove.push(obj)
    }
    // Remove grid and ground to rebuild them
    if (
      obj.isGridHelper ||
      (obj.geometry &&
        obj.geometry.type === 'PlaneGeometry' &&
        obj.material &&
        obj.material.color &&
        obj.material.color.getHex() === 0x112233)
    ) {
      objectsToRemove.push(obj)
    }
  })

  objectsToRemove.forEach((obj) => {
    scene.remove(obj)
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
}

function renderSceneFromData(data) {
  console.log({ data })

  if (!scene) return
  clear3DScene()

  // 重置整个场景（包括灯光、地面、粒子），因为布局参数变了
  updateLayoutParamsFromData(data)

  const { maxRowWidth, depthSpan, zOffset, xOffset } = layoutParams
  const gridSize = Math.max(maxRowWidth, depthSpan) + 10
  const centerZ = zOffset + depthSpan / 2

  // 创建新的 Grid
  const gridDivisions = Math.max(10, Math.round(gridSize / 2))
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x88aaff, 0x335588)
  gridHelper.position.set(xOffset, 0, centerZ)
  scene.add(gridHelper)

  // 创建新的 Ground
  const groundGeometry = new THREE.PlaneGeometry(gridSize, gridSize)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x112233,
    emissive: 0x112244,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(xOffset, 0.01, centerZ)
  scene.add(ground)

  // 更新相机目标点，使其对准新布局的中心
  if (controls) {
    controls.target.set(xOffset, 2, 0)
    controls.update()
  }

  // 使用 Set 加速查找，这里 key 改为 shelf-layer-position (忽略 row)
  const locationMap = new Map()
  data.forEach((d) => {
    locationMap.set(`${d.shelf}-${d.layer}-${d.position}`, d)
  })

  // 预计算每列的统计信息，避免循环内过滤
  const shelfStats = {} // "shelf" -> { maxLayer, maxPos }
  data.forEach((d) => {
    const key = `${d.shelf}`
    if (!shelfStats[key]) shelfStats[key] = { maxLayer: 0, maxPos: 0 }
    if (d.layer > shelfStats[key].maxLayer) shelfStats[key].maxLayer = d.layer
    if (d.position > shelfStats[key].maxPos) shelfStats[key].maxPos = d.position
  })

  // 对货架进行排序，确保按照货架号顺序排列
  const sortedShelfKeys = Object.keys(shelfStats).sort((a, b) => {
    return Number(a) - Number(b)
  })

  // 强制单列纵向布局（前后放置）
  const shelvesInThisColumn = sortedShelfKeys.length

  // 计算起始位置
  // X轴固定居中
  const startX = xOffset
  // Z轴起始位置
  let currentZOffset = zOffset

  // 遍历所有货架（扁平化处理）
  for (let i = 0; i < shelvesInThisColumn; i++) {
    const key = sortedShelfKeys[i]
    const s = Number(key) // 现在 key 就是 shelf 编号
    const stats = shelfStats[key]

    // X轴位置固定
    const baseX = startX
    // Z轴位置随索引递增（前后放置）
    const baseZ = currentZOffset

    // 绘制货架支柱（因为需要知道货架的最终宽高深，所以移到了货位计算之后进行绘制）
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      roughness: 0.4,
      metalness: 0.8
    })

    const maxLayerInShelf = stats.maxLayer || 1
    const maxPosInShelf = stats.maxPos || 1

    // 确定货架所属的区域类型(常温/冷藏/冷冻)
    let zoneType = '未知区域'
    let zoneColorHex = '#ffffff'

    // 查找该货架下的任意一个有效库位以确定区域
    for (let l = 0; l < maxLayerInShelf; l++) {
      for (let p = 0; p < maxPosInShelf; p++) {
        const codeKey = `${s}-${l + 1}-${p + 1}`
        if (locationMap.has(codeKey)) {
          const loc = locationMap.get(codeKey)
          if (loc.zoneName) {
            zoneType = loc.zoneName
            // 根据zoneName简单映射颜色，如果匹配不上则随机或默认
            if (loc.zoneName.includes('常温')) {
              zoneColorHex = '#88ff88'
            } else if (loc.zoneName.includes('冷藏')) {
              zoneColorHex = '#8888ff'
            } else if (loc.zoneName.includes('冷冻')) {
              zoneColorHex = '#ff88ff'
            } else {
              zoneColorHex = '#88aaff' // 默认蓝
            }
            break
          }
        }
      }
      if (zoneType !== '未知区域') break
    }

    if (zoneType === '未知区域') {
      zoneType = '普通区'
      zoneColorHex = '#88aaff'
    }

    // 先绘制货位，并在绘制过程中累加真实的宽高深
    let currentY = 0 // 动态计算当前层的高度起点
    let actualMaxX = 0 // 记录该货架的最远X坐标，用来确定支柱宽度
    let actualMaxZ = 0 // 记录该货架的最远Z坐标，用来确定支柱深度
    let totalShelfHeight = 0 // 记录总高度

    for (let l = 0; l < maxLayerInShelf; l++) {
      let currentX = baseX // 动态计算当前位的X坐标起点
      let maxLayerHeight = 0 // 记录当前层中最高的库位，用于下一层起点的计算

      for (let p = 0; p < maxPosInShelf; p++) {
        const codeKey = `${s}-${l + 1}-${p + 1}`
        if (locationMap.has(codeKey)) {
          const locationData = locationMap.get(codeKey)

          // 将后端的 cm 单位转换为 Three.js 的场景单位 (假设 100cm = 1 场景单位 = 1米)
          const bayW = locationData.length / 100 // 库位宽度 (X轴方向)
          const bayH = locationData.height / 100 // 库位高度 (Y轴方向)
          const bayD = locationData.width / 100 // 库位深度 (Z轴方向)

          // 更新当前层最大高度
          if (bayH > maxLayerHeight) maxLayerHeight = bayH

          // 更新当前货架的最大深度 (假设所有层起始Z相同，直接取单位最大深度)
          if (bayD > actualMaxZ) actualMaxZ = bayD

          // 库位中心点坐标 (基于其真实尺寸)
          const xCenter = currentX + bayW / 2
          const yCenter = currentY + bayH / 2
          const zCenter = baseZ + bayD / 2

          // status: 1=空, 2=未满, 3=满, 0=不可用
          let color = 0x44ff44 // 默认绿色
          if (locationData.status === 1)
            color = 0x44ff44 // 空 -> 绿
          else if (locationData.status === 2)
            color = 0xffff44 // 未满 -> 黄
          else if (locationData.status === 3)
            color = 0xff4444 // 满 -> 红
          else if (locationData.status === 0) color = 0x999999 // 不可用 -> 灰

          const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
          })

          // 按照真实比例创建几何体，稍微留一点空隙 (-0.05) 以便区分相邻货位
          const geometry = new THREE.BoxGeometry(
            Math.max(0.1, bayW - 0.05),
            Math.max(0.1, bayH - 0.05),
            Math.max(0.1, bayD - 0.05)
          )
          const bayMesh = new THREE.Mesh(geometry, material)
          bayMesh.position.set(xCenter, yCenter, zCenter)
          bayMesh.userData = {
            type: 'bay',
            state: locationData.status,
            info: locationData.code,
            shelf: s,
            level: l + 1,
            bay: p + 1,
            data: locationData,
            sizeStr: `${locationData.length}x${locationData.width}x${locationData.height}cm`
          }
          scene.add(bayMesh)
          bayMeshes.push(bayMesh)

          // 边框
          const edges = new THREE.EdgesGeometry(geometry)
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff })
          )
          line.position.copy(bayMesh.position)
          line.userData = { type: 'shelf_part' }
          scene.add(line)

          // 为下一个库位累加X坐标
          currentX += bayW
        } else {
          // 如果该位置没有数据，我们默认预留标准宽度（避免后续库位错位）
          currentX += BAY_WIDTH
        }
      }

      // 记录货架实际的最大宽度 (相对于起点的偏移量)
      if (currentX - baseX > actualMaxX) {
        actualMaxX = currentX - baseX
      }

      // 这一层循环结束后，更新下一层的Y起点

      // 绘制层板 (Separator)
      // 在当前层货位的下方绘制一个托板，或者在上方
      // 通常现实货架是在货位底部有横梁/层板
      // 我们在 currentY (当前层底部) 绘制一个层板
      // 层板尺寸: 宽=actualMaxX, 深=actualMaxZ, 高=0.05
      if (actualMaxX > 0 && actualMaxZ > 0) {
        const separatorGeo = new THREE.BoxGeometry(actualMaxX, 0.05, actualMaxZ)
        const separatorMat = new THREE.MeshStandardMaterial({
          color: 0x88aaff,
          roughness: 0.5,
          metalness: 0.7
        })
        const separator = new THREE.Mesh(separatorGeo, separatorMat)
        // 层板位置: X中心, Y在当前层底部, Z中心
        // baseX是左边缘，所以中心是 baseX + actualMaxX / 2
        separator.position.set(baseX + actualMaxX / 2, currentY - 0.025, baseZ + actualMaxZ / 2)
        separator.userData = { type: 'shelf_part' }
        scene.add(separator)
      }

      // 如果整层都没有数据，默认增加标准高度
      currentY += maxLayerHeight > 0 ? maxLayerHeight : BAY_HEIGHT
    }

    // 顶层再加盖一个层板 (可选，或者只在底部加)
    if (actualMaxX > 0 && actualMaxZ > 0) {
      const topSeparatorGeo = new THREE.BoxGeometry(actualMaxX, 0.05, actualMaxZ)
      const topSeparatorMat = new THREE.MeshStandardMaterial({
        color: 0x88aaff,
        roughness: 0.5,
        metalness: 0.7
      })
      const topSeparator = new THREE.Mesh(topSeparatorGeo, topSeparatorMat)
      topSeparator.position.set(baseX + actualMaxX / 2, currentY - 0.025, baseZ + actualMaxZ / 2)
      topSeparator.userData = { type: 'shelf_part' }
      scene.add(topSeparator)
    }

    totalShelfHeight = currentY
    const totalShelfWidth = actualMaxX > 0 ? actualMaxX : maxPosInShelf * BAY_WIDTH
    const totalShelfDepth = actualMaxZ > 0 ? actualMaxZ : BAY_DEPTH

    // 在算出真实总宽高深后，再绘制四个角的支柱
    for (let corner = 0; corner < 4; corner++) {
      const pillarGeo = new THREE.BoxGeometry(0.15, totalShelfHeight, 0.15)
      const pillar = new THREE.Mesh(pillarGeo, pillarMaterial)
      pillar.userData = { type: 'shelf_part' }
      let px = baseX
      let pz = baseZ

      if (corner === 1 || corner === 3) px += totalShelfWidth
      if (corner === 2 || corner === 3) pz += totalShelfDepth
      pillar.position.set(px, totalShelfHeight / 2, pz)
      scene.add(pillar)
    }

    // 绘制独立立牌 (放置在货架左侧前方)
    const signBoardWidth = 1.0
    const signBoardHeight = 0.6
    const signPoleHeight = 2.0

    // 牌子支柱位置 (货架左前方稍微偏移一点)
    const poleX = baseX - 0.5
    const poleZ = baseZ - 0.5

    // 绘制牌子支柱
    const signPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, signPoleHeight, 8)
    const signPoleMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2
    })
    const signPole = new THREE.Mesh(signPoleGeo, signPoleMat)
    signPole.position.set(poleX, signPoleHeight / 2, poleZ)
    scene.add(signPole)

    // 绘制牌子面板
    const signBoardGeo = new THREE.BoxGeometry(signBoardWidth, signBoardHeight, 0.05)
    // 面板颜色与区域颜色保持一致，稍微调暗一点
    const signBoardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(zoneColorHex).multiplyScalar(0.8),
      roughness: 0.6
    })
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat)
    // 面板放在支柱顶部，并稍微向外倾斜或朝向通道
    signBoard.position.set(poleX, signPoleHeight, poleZ)
    // 让牌子面向Z轴正方向 (通道方向)
    signBoard.rotation.y = 0
    scene.add(signBoard)

    // 添加 CSS2DObject 标签到牌子面板上
    const div = document.createElement('div')
    div.innerHTML = `<div style="font-weight:bold; font-size:16px;">${s} 号货架</div><div style="font-size:12px; margin-top:2px;">${zoneType}</div>`
    div.style.color = '#fff'
    div.style.textAlign = 'center'
    div.style.textShadow = '0 1px 2px rgba(0,0,0,0.8)'
    div.style.width = '100px' // 固定宽度防止文字换行影响布局

    const label = new CSS2DObject(div)
    // 将标签紧贴在牌子面板的正面
    label.position.set(poleX, signPoleHeight, poleZ + 0.03)
    scene.add(label)

    // 更新下一个货架的 Z 轴起点（当前货架深度 + 货架间距）
    currentZOffset += totalShelfDepth + AISLE_WIDTH
  }
}

let scene, camera, renderer, labelRenderer, controls
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
let bayMeshes = []
let isHoveringBay = false

// 货架布局：默认初始值
let SHELVES_PER_ROW = []
let ROWS = SHELVES_PER_ROW.length

const BAYS_PER_LEVEL = 20 //每层货架的货位数
let LEVELS = 5 //货架的层数
const BAY_WIDTH = 2.0 //货位的宽度单位m
const BAY_HEIGHT = 1.0 //货位的高度
const BAY_DEPTH = 1.0 //货位的长度
const SHELF_GAP_X = 1 //货架列之间的距离
const AISLE_WIDTH = 5.0 //货架排之间的距离 (前后间隔)

const SHELF_WIDTH = BAYS_PER_LEVEL * BAY_WIDTH
// 这里的计算改为函数或响应式，以便更新
const getRowWidth = (shelfCount) => shelfCount * (SHELF_WIDTH + SHELF_GAP_X) - SHELF_GAP_X
let ROW_WIDTHS = SHELVES_PER_ROW.map(getRowWidth)
let MAX_ROW_WIDTH = ROW_WIDTHS.length > 0 ? Math.max(...ROW_WIDTHS) : 20
let DEPTH_SPAN = ROWS > 0 ? (ROWS - 1) * (BAY_DEPTH + AISLE_WIDTH) + BAY_DEPTH : 20
let Z_OFFSET = -DEPTH_SPAN / 2
let X_OFFSET = -MAX_ROW_WIDTH / 4

const stats = reactive({
  full: 0,
  partial: 0,
  empty: 0
})

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  content: ''
})

function createParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(16, 16, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = '#88aaff'
  ctx.beginPath()
  ctx.arc(16, 16, 6, 0, Math.PI * 2)
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

function initScene() {
  if (!container.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)

  const currentMaxRowWidth = MAX_ROW_WIDTH
  const currentDepthSpan = DEPTH_SPAN
  const currentXOffset = X_OFFSET
  const currentLevels = LEVELS

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(
    currentXOffset + currentMaxRowWidth * 0.6,
    Math.max(18, currentLevels * BAY_HEIGHT * 8),
    currentDepthSpan * 2.2
  )
  camera.lookAt(currentXOffset, 2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.domElement.classList.add('three-canvas')
  container.value.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.classList.add('three-label-layer')
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'
  container.value.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.0
  controls.target.set(currentXOffset, 2, 0)
  controls.maxPolarAngle = Math.PI / 2

  const ambientLight = new THREE.AmbientLight(0x40406b)
  scene.add(ambientLight)

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight1.position.set(10, 20, 10)
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight(0x4466aa, 0.8)
  dirLight2.position.set(-10, 5, 20)
  scene.add(dirLight2)

  const pointLight1 = new THREE.PointLight(0x3366ff, 0.5, 30)
  pointLight1.position.set(5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xff66aa, 0.3, 30)
  pointLight2.position.set(20, 3, 15)
  scene.add(pointLight2)

  // Initial empty grid/ground
  const gridSize = 100
  const gridDivisions = 50
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x88aaff, 0x335588)
  scene.add(gridHelper)

  const groundGeometry = new THREE.PlaneGeometry(gridSize, gridSize)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x112233,
    emissive: 0x112244,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(0, 0.01, 0)
  scene.add(ground)

  const particleCount = 800
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * gridSize
    positions[i * 3 + 1] = Math.random() * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * gridSize
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particleMat = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.15,
    map: createParticleTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
  }
}

function onMouseMove(event) {
  if (!container.value || !camera || !scene) return

  const rect = container.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(bayMeshes)

  if (intersects.length > 0 && !isHoveringBay) {
    controls.autoRotate = false
    isHoveringBay = true
  } else if (intersects.length === 0 && isHoveringBay) {
    controls.autoRotate = true
    isHoveringBay = false
  }

  if (intersects.length > 0) {
    const hit = intersects[0].object
    const data = hit.userData

    let statusText = ''
    if (data.state === 1) statusText = '空闲'
    else if (data.state === 2) statusText = '部分占用'
    else if (data.state === 3) statusText = '已满'
    else statusText = '不可用'

    tooltip.content = `第 ${data.shelf} 号货架 - ${data.level}层${data.bay}号\n尺寸: ${data.sizeStr}\n状态: ${statusText}\n编码: ${data.info}`
    tooltip.x = event.clientX - rect.left + 15
    tooltip.y = event.clientY - rect.top + 15
    tooltip.visible = true
  } else {
    tooltip.visible = false
  }
}

function hideTooltip() {
  tooltip.visible = false
  if (isHoveringBay) {
    controls.autoRotate = true
    isHoveringBay = false
  }
}

function onWindowResize() {
  if (!camera || !renderer || !labelRenderer || !container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  labelRenderer.setSize(width, height)
}

onMounted(async () => {
  await nextTick()
  initScene()
  if (!scene) return
  animate()
  window.addEventListener('resize', onWindowResize)
  loadWarehouseData()
})

async function loadWarehouseData() {
  if (!warehouseId.value) return
  try {
    const res = await warehouseLocationApi.getWarehouseLocationList({
      page: 1,
      pageSize: 2000,
      warehouseId: Number(warehouseId.value)
    })
    const list = res.data?.items || res.data?.list || res.data || []

    if (list.length > 0) {
      const formattedList = list.map((item) => {
        // Attempt to determine row
        // 既然没有row的概念，直接忽略row的解析，保留原数据或默认值
        // 修正属性名为 zoneId
        return {
          code: item.locationCode || item.code,
          shelf: item.shelfNo || item.shelf,
          layer: item.layerNo || item.layer,
          position: item.positionNo || item.position,
          status: item.status, // 1=empty, 2=partial, 3=full, 0=unavailable
          zoneId: item.zoneId,
          zoneName: item.zoneName, // 添加 zoneName
          length: Number(item.length) || 100, // 默认 100cm
          width: Number(item.width) || 100, // 默认 100cm
          height: Number(item.height) || 100, // 默认 100cm
          zoneName: item.zone?.name || ''
        }
      })

      // Update stats: 1=empty, 2=partial, 3=full
      stats.full = formattedList.filter((i) => i.status === 3).length
      stats.partial = formattedList.filter((i) => i.status === 2).length
      stats.empty = formattedList.filter((i) => i.status === 1).length

      renderSceneFromData(formattedList)
    } else {
      clear3DScene()
    }
  } catch (error) {
    console.error('Failed to load warehouse data', error)
    message.error('加载库位数据失败')
  }
}

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  tooltip.visible = false
  window.removeEventListener('resize', onWindowResize)
  hideTooltip()

  if (renderer) {
    renderer.dispose()
    if (renderer.domElement && container.value) {
      container.value.removeChild(renderer.domElement)
    }
    renderer = null
  }

  if (labelRenderer) {
    if (labelRenderer.domElement && container.value) {
      container.value.removeChild(labelRenderer.domElement)
    }
    labelRenderer = null
  }

  const sceneToDispose = scene
  scene = null
  if (sceneToDispose && typeof sceneToDispose.traverse === 'function') {
    sceneToDispose.traverse((obj) => {
      if (obj?.geometry) obj.geometry.dispose()
      if (obj?.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
    sceneToDispose.clear()
  }

  if (controls) {
    controls.dispose?.()
    controls = null
  }

  bayMeshes = []
  isHoveringBay = false
})
</script>

<style scoped lang="scss">
.warehouse-detail {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 6px;
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(64, 130, 255, 0.16), transparent 55%),
    radial-gradient(900px 500px at 90% 40%, rgba(180, 90, 255, 0.14), transparent 60%),
    radial-gradient(700px 500px at 50% 120%, rgba(0, 255, 180, 0.08), transparent 55%),
    var(--bg-color);
}

.three-container {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  background: linear-gradient(180deg, rgba(13, 16, 28, 0.88), rgba(8, 10, 18, 0.92));
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(120, 150, 255, 0.18);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 24px 80px rgba(0, 0, 0, 0.55),
    0 0 60px rgba(64, 130, 255, 0.1);
  contain: layout paint;
}

:deep(.three-canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

:deep(.three-label-layer) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.legend {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(12, 14, 26, 0.56);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(120, 150, 255, 0.18);
  border-radius: 12px;
  padding: 12px 18px;
  color: #fff;
  text-shadow: 0 0 12px rgba(136, 170, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 10;
  min-width: 150px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  box-shadow: 0 0 10px currentColor;
}

.color-box.ok {
  background: #44ff44;
  color: #44ff44;
}
.color-box.warn {
  background: #ffff44;
  color: #ffff44;
}
.color-box.danger {
  background: #ff4444;
  color: #ff4444;
}

.stats-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(12, 14, 26, 0.56);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(120, 150, 255, 0.18);
  border-radius: 12px;
  padding: 12px 18px;
  color: #fff;
  text-shadow: 0 0 12px rgba(136, 170, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 10;
  min-width: 160px;
}

.action-panel {
  position: absolute;
  top: 20px;
  right: 200px;
  z-index: 10;
}

.rule-group {
  background: rgba(120, 150, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(120, 150, 255, 0.15);
}

.group-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
  font-weight: 500;
}

.stats-title {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.stats-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  &::before {
    left: 0;
    position: absolute;
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  &.full {
    padding-left: 16px;
    &::before {
      background: #ff4444;
      box-shadow: 0 0 10px #ff4444;
    }
  }
  &.partial {
    padding-left: 16px;
    &::before {
      background: #ffff44;
      box-shadow: 0 0 10px #ffff44;
    }
  }
  &.empty {
    padding-left: 16px;
    &::before {
      background: #44ff44;
      box-shadow: 0 0 10px #44ff44;
    }
  }
}

.stats-row.total {
  font-size: 14px;
  font-weight: 700;
}

.stats-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}

.stats-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 10px rgba(136, 170, 255, 0.55);
}

.stats-divider {
  margin: 8px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(136, 170, 255, 0.6), transparent);
}

.tooltip {
  position: absolute;
  background: linear-gradient(180deg, rgba(20, 24, 40, 0.92), rgba(12, 14, 26, 0.9));
  color: rgba(255, 255, 255, 0.92);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  pointer-events: none;
  white-space: pre-line;
  z-index: 20;
  border: 1px solid rgba(120, 150, 255, 0.22);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  backdrop-filter: blur(10px);
}

.three-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(120, 150, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 150, 255, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.55;
  pointer-events: none;
  mask-image: radial-gradient(closest-side at 50% 40%, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
}

.three-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(800px 400px at 20% 15%, rgba(64, 130, 255, 0.12), transparent 60%),
    radial-gradient(700px 450px at 90% 70%, rgba(180, 90, 255, 0.12), transparent 55%),
    radial-gradient(1000px 600px at 50% 130%, rgba(0, 255, 180, 0.06), transparent 60%);
  pointer-events: none;
}

:deep(.three-canvas) {
  display: block;
  width: 100%;
  height: 100%;
  filter: saturate(1.08) contrast(1.06);
}

:deep(.three-label-layer) {
  mix-blend-mode: screen;
}
</style>
