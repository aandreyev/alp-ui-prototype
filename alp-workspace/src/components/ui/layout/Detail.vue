<template>
  <!-- <div v-if="!fill" class="flex-1 flex flex-col w-full min-w-0 flex-grow" 
      :class="colorClass">
    <div
      class="h-screen-nav flex-shrink-0"
    >
      <slot />
    </div>
  </div>
  <div v-else class="h-screen-nav flex flex-col relative overflow-y-auto"
    :class="colorClass"
  >
  <slot />
  </div> -->
  <!-- <div class="flex flex-col h-screen">
    
      <slot />
    
  </div> -->

  <ScrollArea class="flex flex-col h-screen">
    <slot />
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>

<script setup lang="ts">
import { computed, defineComponent } from "vue";
import { ScrollArea, ScrollBar } from "@/lib/registry/new-york/ui/scroll-area";

// export default defineComponent({
//   props: {
//     fill: {
//       type: Boolean,
//       default: false
//     },
//     bgColor: {
//       type: String,
//       default: "gray-100"
//     }
//   },

//   setup(props) {
//     const colorClass = computed(() => {
//       const color = `bg-${props.bgColor}`;
//       return color;
//     });

//     return {
//       colorClass
//     };
//   }
// });
</script>
