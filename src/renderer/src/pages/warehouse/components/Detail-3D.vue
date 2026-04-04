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
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
let animationId = null
const container = ref(null)

let scene, camera, renderer, labelRenderer, controls
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
let bayMeshes = []
let isHoveringBay = false

// 货架布局：5排，每排货架数分别为 2,2,2,2,1 (共9个)
const SHELVES_PER_ROW = [2, 2, 2, 2, 1]
const ROWS = SHELVES_PER_ROW.length
// const TOTAL_SHELVES = SHELVES_PER_ROW.reduce((sum, count) => sum + count, 0) // 9

const BAYS_PER_LEVEL = 20 //每层货架的货位数
const LEVELS = 5 //货架的层数
const BAY_WIDTH = 2.0 //货位的宽度单位m
const BAY_HEIGHT = 1.0 //货位的高度
const BAY_DEPTH = 1.0 //货位的长度
const SHELF_GAP_X = 1 //货架列之间的距离
const AISLE_WIDTH = 3.0 //货架排之间的距离

const SHELF_WIDTH = BAYS_PER_LEVEL * BAY_WIDTH
const ROW_WIDTHS = SHELVES_PER_ROW.map((count) => count * (SHELF_WIDTH + SHELF_GAP_X) - SHELF_GAP_X)
const MAX_ROW_WIDTH = Math.max(...ROW_WIDTHS)
const DEPTH_SPAN = (ROWS - 1) * (BAY_DEPTH + AISLE_WIDTH) + BAY_DEPTH
const Z_OFFSET = -DEPTH_SPAN / 2
const X_OFFSET = -MAX_ROW_WIDTH / 4
const rowStartX = (row) => X_OFFSET - ROW_WIDTHS[row] / 2

const ZONE_COLORS = {
  normal: 0x88ff88,
  cold: 0x8888ff,
  frozen: 0xff88ff
}

const SKU_POOL = [
  '苹果',
  '香蕉',
  '牛奶',
  '牛肉',
  '鸡肉',
  '饮料',
  '蔬菜',
  '冷冻水饺',
  '冰激凌',
  '可乐'
]

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

// 随机生成货位状态
function getRandomState() {
  const r = Math.random()
  if (r < 0.3) {
    stats.empty++
    return 0 // 空闲
  }
  if (r < 0.6) {
    stats.partial++
    return 1 // 部分
  }
  stats.full++
  return 2 // 满
}

function getColorByState(state) {
  switch (state) {
    case 0:
      return 0x44ff44
    case 1:
      return 0xffff44
    case 2:
      return 0xff4444
    default:
      return 0x44ff44
  }
}

function generateCargoInfo(state) {
  if (state === 0) return '空货位'
  const sku = SKU_POOL[Math.floor(Math.random() * SKU_POOL.length)]
  const quantity =
    state === 1 ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 100) + 50
  return `${sku} x${quantity}`
}

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

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(
    X_OFFSET + MAX_ROW_WIDTH * 0.6,
    Math.max(18, LEVELS * BAY_HEIGHT * 8),
    DEPTH_SPAN * 2.2
  )
  camera.lookAt(X_OFFSET, 2, 0)

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
  controls.target.set(X_OFFSET, 2, 0)
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

  const gridSize = Math.max(MAX_ROW_WIDTH, DEPTH_SPAN) + 10
  const gridDivisions = Math.max(10, Math.round(gridSize / 2))
  const centerZ = Z_OFFSET + DEPTH_SPAN / 2
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x88aaff, 0x335588)
  gridHelper.position.set(X_OFFSET, 0, centerZ)
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
  ground.position.set(X_OFFSET, 0.01, centerZ)
  scene.add(ground)

  const particleCount = 800
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = X_OFFSET + (Math.random() - 0.5) * gridSize
    positions[i * 3 + 1] = Math.random() * 20
    positions[i * 3 + 2] = centerZ + (Math.random() - 0.5) * gridSize
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

// 排标识
function addRowMarkers() {
  for (let row = 0; row < ROWS; row++) {
    const shelfCount = SHELVES_PER_ROW[row]
    const rowWidth = shelfCount * (SHELF_WIDTH + SHELF_GAP_X) - SHELF_GAP_X
    const z = Z_OFFSET + row * (BAY_DEPTH + AISLE_WIDTH)
    const startX = rowStartX(row)
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? startX - 0.5 : startX + rowWidth + 0.5
      const hue = row / ROWS
      const color = new THREE.Color().setHSL(hue, 1, 0.6)

      const sphereGeo = new THREE.SphereGeometry(0.25)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(x, 0.5, z)
      scene.add(sphere)

      const div = document.createElement('div')
      div.textContent = `R${row + 1}`
      div.style.color = '#fff'
      div.style.textShadow = '0 0 8px #88aaff'
      div.style.fontFamily = 'Arial, sans-serif'
      div.style.fontSize = '14px'
      div.style.fontWeight = 'bold'
      div.style.background = 'rgba(20,30,50,0.7)'
      div.style.padding = '2px 8px'
      div.style.borderRadius = '12px'
      div.style.border = '1px solid #88aaff'
      div.style.backdropFilter = 'blur(4px)'
      const label = new CSS2DObject(div)
      label.position.set(x, 1.3, z)
      scene.add(label)
    }
  }
}

// 分区地面标识
function addZoneIndicators() {
  const shelfDepth = BAY_DEPTH
  let shelfIndex = 0
  for (let row = 0; row < ROWS; row++) {
    const shelfCount = SHELVES_PER_ROW[row]
    for (let j = 0; j < shelfCount; j++) {
      shelfIndex++
      const indexInRow = j
      const baseX = rowStartX(row) + indexInRow * (SHELF_WIDTH + SHELF_GAP_X)
      const baseZ = Z_OFFSET + row * (shelfDepth + AISLE_WIDTH)

      let zoneColor
      if (shelfIndex <= 3) zoneColor = ZONE_COLORS.normal
      else if (shelfIndex <= 6) zoneColor = ZONE_COLORS.cold
      else zoneColor = ZONE_COLORS.frozen

      const planeGeo = new THREE.PlaneGeometry(SHELF_WIDTH, shelfDepth)
      const planeMat = new THREE.MeshStandardMaterial({
        color: zoneColor,
        emissive: zoneColor,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      })
      const plane = new THREE.Mesh(planeGeo, planeMat)
      plane.rotation.x = -Math.PI / 2
      plane.position.set(baseX + SHELF_WIDTH / 2, 0.02, baseZ + shelfDepth / 2)
      scene.add(plane)
    }
  }
}

// 库区文字标签
function addZoneLabels() {
  const shelfDepth = BAY_DEPTH
  const shelfHeight = LEVELS * BAY_HEIGHT
  let shelfIndex = 0
  for (let row = 0; row < ROWS; row++) {
    const shelfCount = SHELVES_PER_ROW[row]
    for (let j = 0; j < shelfCount; j++) {
      shelfIndex++
      const indexInRow = j
      const baseX = rowStartX(row) + indexInRow * (SHELF_WIDTH + SHELF_GAP_X)
      const baseZ = Z_OFFSET + row * (shelfDepth + AISLE_WIDTH)

      let zoneName, zoneColor
      if (shelfIndex <= 3) {
        zoneName = '常温区'
        zoneColor = '#88ff88'
      } else if (shelfIndex <= 6) {
        zoneName = '冷藏区'
        zoneColor = '#8888ff'
      } else {
        zoneName = '冷冻区'
        zoneColor = '#ff88ff'
      }

      const div = document.createElement('div')
      div.textContent = zoneName
      div.style.color = '#fff'
      div.style.textShadow = `0 0 10px ${zoneColor}`
      div.style.fontSize = '16px'
      div.style.fontWeight = 'bold'
      div.style.background = 'rgba(10,20,40,0.7)'
      div.style.padding = '6px 16px'
      div.style.borderRadius = '20px'
      div.style.border = `1px solid ${zoneColor}`
      div.style.backdropFilter = 'blur(8px)'
      div.style.boxShadow = `0 0 20px ${zoneColor}`
      const label = new CSS2DObject(div)
      label.position.set(baseX + SHELF_WIDTH / 2, shelfHeight + 1.0, baseZ + shelfDepth / 2)
      scene.add(label)
    }
  }
}

// 生成所有货架和货位
function generateShelves() {
  bayMeshes = []

  const shelfDepth = BAY_DEPTH
  let shelfIndex = 0

  for (let row = 0; row < ROWS; row++) {
    const shelfCount = SHELVES_PER_ROW[row]
    for (let j = 0; j < shelfCount; j++) {
      shelfIndex++
      const indexInRow = j
      const baseX = rowStartX(row) + indexInRow * (SHELF_WIDTH + SHELF_GAP_X)
      const baseZ = Z_OFFSET + row * (shelfDepth + AISLE_WIDTH)
      const baseY = 0

      // 根据 shelfIndex 确定分区颜色
      let zoneColor
      if (shelfIndex <= 3) zoneColor = ZONE_COLORS.normal
      else if (shelfIndex <= 6) zoneColor = ZONE_COLORS.cold
      else zoneColor = ZONE_COLORS.frozen

      for (let level = 0; level < LEVELS; level++) {
        const yCenter = baseY + level * BAY_HEIGHT + BAY_HEIGHT / 2

        for (let bay = 0; bay < BAYS_PER_LEVEL; bay++) {
          const xCenter = baseX + bay * BAY_WIDTH + BAY_WIDTH / 2
          const zCenter = baseZ + BAY_DEPTH / 2

          const state = getRandomState()
          const color = getColorByState(state)
          const cargoInfo = generateCargoInfo(state)

          // 核心货位实体
          const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.9,
            roughness: 0.2,
            metalness: 0.1
          })
          const geometry = new THREE.BoxGeometry(BAY_WIDTH, BAY_HEIGHT, BAY_DEPTH)
          const bayMesh = new THREE.Mesh(geometry, material)
          bayMesh.position.set(xCenter, yCenter, zCenter)

          bayMesh.userData = {
            type: 'bay',
            state: state,
            info: cargoInfo,
            shelf: shelfIndex,
            row: row + 1,
            level: level + 1,
            bay: bay + 1
          }

          // 发光边框
          const edges = new THREE.EdgesGeometry(geometry)
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xaaccff })
          )
          line.position.copy(bayMesh.position)
          scene.add(line)

          // 外发光光晕
          const glowGeometry = new THREE.BoxGeometry(
            BAY_WIDTH + 0.08,
            BAY_HEIGHT + 0.08,
            BAY_DEPTH + 0.08
          )
          const glowMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
          })
          const glowCube = new THREE.Mesh(glowGeometry, glowMaterial)
          glowCube.position.copy(bayMesh.position)
          scene.add(glowCube)

          scene.add(bayMesh)
          bayMeshes.push(bayMesh)
        }
      }

      // 货架支柱
      const pillarMaterial = new THREE.MeshStandardMaterial({
        color: zoneColor,
        emissive: zoneColor,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.8
      })
      for (let corner = 0; corner < 4; corner++) {
        const pillarGeo = new THREE.BoxGeometry(0.15, LEVELS * BAY_HEIGHT, 0.15)
        const pillar = new THREE.Mesh(pillarGeo, pillarMaterial)
        let px = baseX
        let pz = baseZ
        if (corner === 1 || corner === 3) px += SHELF_WIDTH
        if (corner === 2 || corner === 3) pz += shelfDepth
        pillar.position.set(px, (LEVELS * BAY_HEIGHT) / 2, pz)
        scene.add(pillar)
      }
    }
  }
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
    if (data.state === 0) statusText = '空闲'
    else if (data.state === 1) statusText = '部分占用'
    else statusText = '已满'

    tooltip.content = `货架${data.shelf} (排${data.row}) - ${data.level}层${data.bay}号\n状态: ${statusText}\n货物: ${data.info}`
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
  generateShelves()
  addZoneIndicators()
  addZoneLabels()
  addRowMarkers()
  animate()

  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  // 1. 取消动画循环
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  // 2. 隐藏 Vue tooltip
  tooltip.visible = false

  // 3. 移除事件监听
  window.removeEventListener('resize', onWindowResize)
  hideTooltip() // 内部会重置 autoRotate 和悬停状态

  // 4. 销毁 WebGL 渲染器并移除 DOM
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement && container.value) {
      container.value.removeChild(renderer.domElement)
    }
    renderer = null
  }

  // 5. 清理 CSS2 渲染器（无 dispose，仅移除 DOM）
  if (labelRenderer) {
    if (labelRenderer.domElement && container.value) {
      container.value.removeChild(labelRenderer.domElement)
    }
    labelRenderer = null
  }
  console.log({ scene })
  const sceneToDispose = scene
  scene = null
  if (sceneToDispose && typeof sceneToDispose.traverse === 'function') {
    const css2d = []
    sceneToDispose.traverse((obj) => {
      if (obj?.isCSS2DObject) css2d.push(obj)
    })
    css2d.forEach((obj) => sceneToDispose.remove(obj))

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

  // 7. 释放控制器
  if (controls) {
    controls.dispose?.() // 如果有 dispose 方法则调用
    controls = null
  }

  // 8. 清空引用数组
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
  border-radius: 12px;
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
  border-radius: 12px;
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
