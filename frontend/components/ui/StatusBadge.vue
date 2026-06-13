<script setup lang="ts">
import type { UserGameStatus } from '~/types/user'
import { STATUS_COLORS } from '~/constants/game'

interface Props {
  status: UserGameStatus
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const classes = computed(() => {
  const base = STATUS_COLORS[props.status] || STATUS_COLORS.backlog
  const sizing = props.size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-xs'
  return `${base} ${sizing} rounded-full font-bold border inline-flex items-center gap-1`
})
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
