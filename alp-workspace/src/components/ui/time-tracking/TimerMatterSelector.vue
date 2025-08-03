<template>
  <div class="flex p-3">
    <field-label class="w-full sm:w-1/2" name="Matter">
      <matter-selector v-model="state.selectedMatter" />
    </field-label>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

import FieldLabel from "@/components/forms/FieldLabel.vue";
import MatterSelector from "@/components/inputs/selectors/MatterSelector.vue";

export default defineComponent({
  emits: ["selected"],
  components: {
    FieldLabel,
    MatterSelector,
  },
  setup() {
    const state = reactive({
      selectedMatter: null,
    });

    return { state };
  },
});
</script>
