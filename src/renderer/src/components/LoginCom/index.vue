<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import EyeBall from './eyeBall.vue'
import Pupil from './pupil.vue'
import { useBlinking } from '@renderer/hooks'
import { t } from '@renderer/locales'
import { Icon } from '@renderer/components'
import { useAuthStore } from '@renderer/stores'
import { NForm, NInput, NFormItem, NButton, NCheckbox, NSpace } from 'naive-ui'

const authStore = useAuthStore()
const { isBlinking: isPurpleBlinking } = useBlinking()
const { isBlinking: isBlackBlinking } = useBlinking()
const showPassword = ref(false)
const username = ref(authStore.initLoginForm.username)
const password = ref(authStore.initLoginForm.password)
const remember = ref(authStore.rememberMe)
const error = ref('')
const isLoading = ref(false)

const mouseX = ref(0)
const mouseY = ref(0)

const isTyping = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)
const purpleRef = ref(null)
const blackRef = ref(null)
const yellowRef = ref(null)
const orangeRef = ref(null)
const handleMouseMove = (event) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}
const calculatePosition = (ref) => {
  if (!ref.value) return { faceX: 0, faceY: 0, bodyRotation: 0 }

  const rect = ref.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3 // Focus on head area

  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY

  // Face movement (limited range)
  const faceX = Math.max(-15, Math.min(15, deltaX / 20))
  const faceY = Math.max(-10, Math.min(10, deltaY / 30))

  // Body lean (skew for lean while keeping bottom straight) - negative to lean towards mouse
  const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120))

  return { faceX, faceY, bodySkew }
}
const purplePos = computed(() => calculatePosition(purpleRef))
const blackPos = computed(() => calculatePosition(blackRef))
const yellowPos = computed(() => calculatePosition(yellowRef))
const orangePos = computed(() => calculatePosition(orangeRef))
const handleSubmit = async (e) => {
  e.preventDefault()
  error.value = ''
  isLoading.value = true
  try {
    const res = await authStore.login({
      username: username.value,
      password: password.value,
      rememberMe: remember.value
    })
    if (!res) {
      error.value = t('login.loginFailed')
    }
  } catch (err) {
    console.log('errr')
  } finally {
    isLoading.value = false
  }
}
watch(
  isTyping,
  (newVal) => {
    if (newVal) {
      isLookingAtEachOther.value = true
      setTimeout(() => {
        isLookingAtEachOther.value = false
      }, 800)
    } else {
      isLookingAtEachOther.value = false
    }
  },
  {
    immediate: true
  }
)

let peekTimeout = null
let innerTimeout = null

const clearPeekTimeout = () => {
  if (peekTimeout) {
    clearTimeout(peekTimeout)
    peekTimeout = null
  }
  if (innerTimeout) {
    clearTimeout(innerTimeout)
    innerTimeout = null
  }
}
watch(
  [password, showPassword, isPurplePeeking],
  ([newPassword, newShow, newPeeking]) => {
    if (newPassword.length > 0 && newShow) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(
          () => {
            isPurplePeeking.value = true
            innerTimeout = setTimeout(() => {
              isPurplePeeking.value = false
            }, 800)
          },
          Math.random() * 3000 + 2000
        )
        return peekInterval
      }

      clearPeekTimeout() // 清理之前的定时器
      peekTimeout = schedulePeek()
    } else {
      clearPeekTimeout()
      isPurplePeeking.value = false
    }
  },
  { immediate: true }
)
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})
onBeforeUnmount(() => {
  clearPeekTimeout()
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>
<template>
  <div class="min-h-full grid lg:grid-cols-2">
    <div
      class="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground"
    >
      <div class="relative z-20 flex items-end justify-center h-[500px]">
        <div class="relative" style="width: 550px; height: 400px">
          <div
            ref="purpleRef"
            class="absolute bottom-0 transition-all duration-700 ease-in-out"
            :style="{
              left: '70px',
              width: '180px',
              height: isTyping || (password.length > 0 && !showPassword) ? '440px' : '400px',
              backgroundColor: '#6C3FF5',
              borderRadius: '10px 10px 0 0',
              zIndex: 1,
              transform:
                password.length > 0 && showPassword
                  ? `skewX(0deg)`
                  : isTyping || (password.length > 0 && !showPassword)
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center'
            }"
          >
            <div
              class="absolute flex gap-8 transition-all duration-700 ease-in-out"
              :style="{
                left:
                  password.length > 0 && showPassword
                    ? `${20}px`
                    : isLookingAtEachOther
                      ? `${55}px`
                      : `${45 + purplePos.faceX}px`,
                top:
                  password.length > 0 && showPassword
                    ? `${35}px`
                    : isLookingAtEachOther
                      ? `${65}px`
                      : `${40 + purplePos.faceY}px`
              }"
            >
              <EyeBall
                :size="18"
                :pupilSize="7"
                :maxDistance="5"
                eyeColor="white"
                pupilColor="#2D2D2D"
                :isBlinking="isPurpleBlinking"
                :forceLookX="
                  password.length > 0 && showPassword
                    ? isPurplePeeking
                      ? 4
                      : -4
                    : isLookingAtEachOther
                      ? 3
                      : undefined
                "
                :forceLookY="
                  password.length > 0 && showPassword
                    ? isPurplePeeking
                      ? 5
                      : -4
                    : isLookingAtEachOther
                      ? 4
                      : undefined
                "
              />
              <EyeBall
                :size="18"
                :pupilSize="7"
                :maxDistance="5"
                eyeColor="white"
                pupilColor="#2D2D2D"
                :isBlinking="isPurpleBlinking"
                :forceLookX="
                  password.length > 0 && showPassword
                    ? isPurplePeeking
                      ? 4
                      : -4
                    : isLookingAtEachOther
                      ? 3
                      : undefined
                "
                :forceLookY="
                  password.length > 0 && showPassword
                    ? isPurplePeeking
                      ? 5
                      : -4
                    : isLookingAtEachOther
                      ? 4
                      : undefined
                "
              />
            </div>
          </div>

          <div
            ref="blackRef"
            class="absolute bottom-0 transition-all duration-700 ease-in-out"
            :style="{
              left: '240px',
              width: '120px',
              height: '310px',
              backgroundColor: '#2D2D2D',
              borderRadius: '8px 8px 0 0',
              zIndex: 2,
              transform:
                password.length > 0 && showPassword
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : isTyping || (password.length > 0 && !showPassword)
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center'
            }"
          >
            <div
              class="absolute flex gap-6 transition-all duration-700 ease-in-out"
              :style="{
                left:
                  password.length > 0 && showPassword
                    ? `${10}px`
                    : isLookingAtEachOther
                      ? `${32}px`
                      : `${26 + blackPos.faceX}px`,
                top:
                  password.length > 0 && showPassword
                    ? `${28}px`
                    : isLookingAtEachOther
                      ? `${12}px`
                      : `${32 + blackPos.faceY}px`
              }"
            >
              <EyeBall
                :size="16"
                :pupilSize="6"
                :maxDistance="4"
                eyeColor="white"
                pupilColor="#2D2D2D"
                :isBlinking="isBlackBlinking"
                :forceLookX="
                  password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined
                "
                :forceLookY="
                  password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined
                "
              />
              <EyeBall
                :size="16"
                :pupilSize="6"
                :maxDistance="4"
                eyeColor="white"
                pupilColor="#2D2D2D"
                :isBlinking="isBlackBlinking"
                :forceLookX="
                  password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined
                "
                :forceLookY="
                  password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined
                "
              />
            </div>
          </div>

          <div
            ref="orangeRef"
            class="absolute bottom-0 transition-all duration-700 ease-in-out"
            :style="{
              left: '0px',
              width: '240px',
              height: '200px',
              zIndex: 3,
              backgroundColor: '#FF9B6B',
              borderRadius: '120px 120px 0 0',
              transform:
                password.length > 0 && showPassword
                  ? `skewX(0deg)`
                  : `skewX(${orangePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center'
            }"
          >
            <div
              class="absolute flex gap-8 transition-all duration-200 ease-out"
              :style="{
                left:
                  password.length > 0 && showPassword
                    ? `${50}px`
                    : `${82 + (orangePos.faceX || 0)}px`,
                top:
                  password.length > 0 && showPassword
                    ? `${85}px`
                    : `${90 + (orangePos.faceY || 0)}px`
              }"
            >
              <Pupil
                :size="12"
                :maxDistance="5"
                pupilColor="#2D2D2D"
                :forceLookX="password.length > 0 && showPassword ? -5 : undefined"
                :forceLookY="password.length > 0 && showPassword ? -4 : undefined"
              />
              <Pupil
                :size="12"
                :maxDistance="5"
                pupilColor="#2D2D2D"
                :forceLookX="password.length > 0 && showPassword ? -5 : undefined"
                :forceLookY="password.length > 0 && showPassword ? -4 : undefined"
              />
            </div>
          </div>

          <div
            ref="yellowRef"
            class="absolute bottom-0 transition-all duration-700 ease-in-out"
            :style="{
              left: '310px',
              width: '140px',
              height: '230px',
              backgroundColor: '#E8D754',
              borderRadius: '70px 70px 0 0',
              zIndex: 4,
              transform:
                password.length > 0 && showPassword
                  ? `skewX(0deg)`
                  : `skewX(${yellowPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center'
            }"
          >
            <div
              class="absolute flex gap-6 transition-all duration-200 ease-out"
              :style="{
                left:
                  password.length > 0 && showPassword
                    ? `${20}px`
                    : `${52 + (yellowPos.faceX || 0)}px`,
                top:
                  password.length > 0 && showPassword
                    ? `${35}px`
                    : `${40 + (yellowPos.faceY || 0)}px`
              }"
            >
              <Pupil
                :size="12"
                :maxDistance="5"
                pupilColor="#2D2D2D"
                :forceLookX="password.length > 0 && showPassword ? -5 : undefined"
                :forceLookY="password.length > 0 && showPassword ? -4 : undefined"
              />
              <Pupil
                :size="12"
                :maxDistance="5"
                pupilColor="#2D2D2D"
                :forceLookX="password.length > 0 && showPassword ? -5 : undefined"
                :forceLookY="password.length > 0 && showPassword ? -4 : undefined"
              />
            </div>

            <div
              class="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
              :style="{
                left:
                  password.length > 0 && showPassword
                    ? `${10}px`
                    : `${40 + (yellowPos.faceX || 0)}px`,
                top:
                  password.length > 0 && showPassword
                    ? `${88}px`
                    : `${88 + (yellowPos.faceY || 0)}px`
              }"
            />
          </div>
        </div>
      </div>

      <div class="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div
        class="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl"
      />
      <div
        class="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl"
      />
    </div>

    <div class="flex items-center justify-center p-8 bg-background relative">
      <div class="w-full max-w-[420px]">
        <form>
          <div class="w-full flex flex-col justify-center gap-8">
            <div class="text-3xl font-bold tracking-tight mb-2">{{ t('login.login') }}</div>
            <n-input
              v-model:value="username"
              :placeholder="t('login.username')"
              style="border-radius: 0; height: 48px; line-height: 48px; -webkit-app-region: no-drag"
            >
              <template #prefix>
                <Icon name="icon-yonghu" size="16px" />
              </template>
            </n-input>
            <n-input
              v-model:value="password"
              :placeholder="t('login.password')"
              type="password"
              show-password-on="click"
              style="border-radius: 0; height: 48px; line-height: 48px; -webkit-app-region: no-drag"
            >
              <template #prefix>
                <Icon name="icon-lock" size="16px" />
              </template>
              <template #password-visible-icon>
                <Icon name="icon-yanjing" size="20px" @click="showPassword = false" />
              </template>
              <template #password-invisible-icon>
                <Icon name="icon-yanjing_yincang_o" size="20px" @click="showPassword = true" />
              </template>
            </n-input>

            <div class="flex justify-end">
              <n-checkbox v-model:checked="remember" style="-webkit-app-region: no-drag">
                <span> {{ t('login.rememberMe') }}</span>
              </n-checkbox>
            </div>
            <div
              v-if="error"
              class="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30"
            >
              {{ error }}
            </div>

            <div>
              <n-button
                type="primary"
                block
                :loading="isLoading"
                :disabled="isLoading || !username || !password"
                style="
                  height: 48px;
                  font-size: 20px;
                  font-weight: bold;
                  border-radius: 0;
                  -webkit-app-region: no-drag;
                "
                @click="handleSubmit"
              >
                {{ t('login.login') }}
              </n-button>
            </div>
          </div>
        </form>
        <!----
          <form onSubmit={handleSubmit} class="space-y-5">
            <div class="space-y-2">
              <Label htmlFor="email" class="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="anna@gmail.com"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                class="h-12 bg-background border-border/60 focus:border-primary"
              />
            </div>

            <div class="space-y-2">
              <Label htmlFor="password" class="text-sm font-medium">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  class="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff class="size-5" />
                  ) : (
                    <Eye class="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  class="text-sm font-normal cursor-pointer"
                >
                  Remember for 30 days
                </Label>
              </div>
              <a
                href="#"
                class="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div class="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              class="w-full h-12 text-base font-medium" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Log in"}
            </Button>
          </form>
        -->
      </div>
    </div>
  </div>
</template>
