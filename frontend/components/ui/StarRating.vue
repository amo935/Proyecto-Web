<script setup lang="ts">
interface Props {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 10,
  size: 'md',
  interactive: false
})

const emit = defineEmits<{ (e: 'update', value: number): void }>()

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

function onClick(n: number) {
  if (props.interactive) emit('update', n)
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      :disabled="!interactive"
      @click="onClick(n)"
      class="focus:outline-none transition-transform"
      :class="interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="[sizeClasses[size], n <= rating ? 'text-amber-400' : 'text-slate-700']"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
    <span v-if="$slots.label" class="text-xs text-slate-400 ml-1">
      <slot name="label" />
    </span>
  </div>
</template>
