<template>
  <section
    class="fixed inset-y-0 right-0 pl-10 max-w-full flex z-20"
    @keyup.esc="$emit('close')"
    tabindex="0"
  >
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-gray-500 opacity-50"></div>
    </div>

    <div class="relative w-screen max-w-6xl">
      <div class="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
        <span
          aria-label="Close panel"
          class="flex cursor-pointer text-white transition ease-in-out duration-150 rounded-full bg-red-600 bg-opacity-100 hover:bg-opacity-75 hover:text-white p-1 justify-items-center"
          @click="$emit('close')"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" class="w-5 h-5" />
        </span>
      </div>
      <div class="h-full flex flex-col pt-6 bg-white shadow-md overflow-y-auto">
        <!-- <div class="relative flex-1"> -->

        <div class="flex flex-col">
          <span class="flex items-center justify-center py-3 border-l-4 border-indigo-500">
            <alp-default-badge class="flex" v-if="badge" :text= badge :color="color" />
            <span class="text-lg font-bold">{{ heading }}</span>
          </span>
        </div>

        <slot />
        <!-- </div> -->
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";


export default defineComponent({
  emits: ["close"],
  props: {
    color: String,
    badge: String,
    heading: String
  }
});
</script>
