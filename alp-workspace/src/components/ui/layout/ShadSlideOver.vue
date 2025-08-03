<template>
  <shad-sheet v-model:open="$props.open" :modal="false" class="w-full">
    <shad-sheet-content
      class="max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-4xl 2xl:max-w-7xl timeentry-modal"
    >
      <shad-sheet-header>
        <shad-sheet-title class="text-center">
          <div class="col-12 flex flex-wrap justify-center items-center">
            <alp-default-badge
              class="flex"
              v-if="$props.badge"
              :text="$props.badge"
              :color="'blue'"
            />
            {{ $props.heading }}
          </div>
          <button
            class="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4"
            @click="$emit('close')"
          >
            <span
              aria-label="Close panel"
              class="flex cursor-pointer text-white transition ease-in-out duration-150 rounded-full bg-red-600 bg-opacity-100 hover:bg-opacity-75 hover:text-white p-1 justify-items-center"
              ><svg
                class="svg-inline--fa fa-xmark w-5 h-5"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="xmark"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
              >
                <path
                  class=""
                  fill="currentColor"
                  d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
                ></path></svg
            ></span>
          </button>
        </shad-sheet-title>
      </shad-sheet-header>
      <slot />
    </shad-sheet-content>
  </shad-sheet>
</template>
<script setup lang="ts">
import { reactive } from "vue";

const props = defineProps<{
  badge: string;
  heading: string;
  zindex: string;
  open: boolean;
}>();

const emits = defineEmits(["close"]);

const state = reactive({
  zindex: "z-40"
});

if (props.zindex != undefined) {
  state.zindex = props.zindex;
}
</script>
<style>
.timeentry-modal button.right-4 {
  display: none;
}
</style>
