<script setup lang="ts">
interface Props {
  label: string
  hours: number
  maxHours: number
  colorClass: string
}

const props = defineProps<Props>()

const percentage = computed(() => {
  if (!props.maxHours) return 0
  return Math.min(100, Math.round((props.hours / props.maxHours) * 100))
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" :class="colorClass.replace('bg-', 'bg-').split(' ')[0]" />
        <span class="font-medium text-slate-200">{{ label }}</span>
      </div>
      <span class="text-2xl font-bold" :class="colorClass.split(' ')[0].replace('bg-', 'text-')">{{ hours }}h</span>
    </div>
    <div class="h-3 bg-slate-800 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-1000"
        :class="colorClass.split(' ')[0]"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>
