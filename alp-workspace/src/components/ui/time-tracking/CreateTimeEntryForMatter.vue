<template>
  <modal @close="$emit('close')" :headingTitle ="'Add Time Entry'">
    <create-time-entry-form-for-matter
      v-bind="$attrs"
      @close="$emit('close')"
      modal
    />
  </modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Modal from "@/components/common/layout/Modal.vue";
import CreateTimeEntryFormForMatter from "@/components/ui/time-tracking/CreateTimeEntryFormForMatter.vue";

export default defineComponent({
  emits: ["close"],
  components: {
    Modal,
    CreateTimeEntryFormForMatter
  }
});
</script>
