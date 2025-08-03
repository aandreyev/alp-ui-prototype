<template>
  <div class="flex p-3" :class="{ 'flex-col': column }">
    <field-label
      :class="{ 'w-full': column, 'w-full sm:w-1/2': !column }"
      name="Project"
    >
      <project-selector v-model="state.selectedProject" />
    </field-label>
    <field-label
      :class="{ 'w-full': column, 'w-full sm:w-1/2': !column }"
      name="Project Task"
    >
      <project-task-selector
        :disabled="!state.selectedProject"
        :project-id="state.selectedProject?.id"
        v-model="state.selectedProjectTask"
      />
    </field-label>
  </div>
</template>

<script lang="ts">
import { useListable } from "@/composable/listable";
import { ProjectStore } from "@/store/modules/projects";
import { defineComponent, PropType, reactive, watch } from "vue";

import FieldLabel from "@/components/forms/FieldLabel.vue";
import ProjectSelector from "@/components/inputs/selectors/ProjectSelector.vue";
import ProjectTaskSelector from "@/components/inputs/selectors/ProjectTaskSelector.vue";
import { ProjectTaskDto } from "@/network/projects-service-proxies";

export default defineComponent({
  emits: ["update:modelValue"],
  props: {
    modelValue: Object as PropType<ProjectTaskDto>,
    column: Boolean
  },
  components: {
    FieldLabel,
    ProjectSelector,
    ProjectTaskSelector
  },
  setup(props, { emit }) {
    const state = reactive({
      selectedProject: null,
      selectedProjectTask: null
    });

    watch(
      () => state.selectedProjectTask,
      () => emit("update:modelValue", state.selectedProjectTask)
    );

    return { state };
  }
});
</script>
