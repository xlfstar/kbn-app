<template>
  <nav>
    <ul class="flex flex-col items-center justify-center">
      <li class="mb-4">
        <a href="#" class="text-gray-800 hover:text-gray-600">
          <i class="fas fa-home"></i>
          <span>{{ t('home') }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<script setup>
import { t } from '@renderer/locales'
</script>
