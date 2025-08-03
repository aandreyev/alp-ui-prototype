<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave.prevent="toggleActive"
    @dragover.prevent
    @drop.prevent="toggleActive"
    :class="{ ' text-white	border-white bg-gray-300 ': active }"
    class="dropzone w-full flex flex-col justify-center items-center gap-4 border-2 border-dashed border-gray-300 bg-white transition-all duration-300 ease-linear"
  >
    <span class="flex flex-col items-center py-5">
      <!-- <alp-icon-button class="h-20" icon-name="arcticons:gallery" /> -->
      <span> 
        <font-awesome-icon icon="fa-solid fa-2xl fa-file-image" class="h-10" />
      </span>
      <span class="span pt-4 font-sans"> Drop files to Upload</span>
    </span>
    <input class="hidden" type="file" id="dropzonefile" />
  </div>
</template>

<script lang="ts">
import { ref, reactive } from "vue";
import AlpIconButton from "@/components/common/AlpIconButton.vue";
export default {
  name: "UploadDocument",
  components: {
    AlpIconButton
  },
  setup() {
    const active = ref(false);
    const toggleActive = () => {
      active.value = !active.value;
    };
    return { active, toggleActive };
  }
};
</script>
