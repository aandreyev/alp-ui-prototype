<template>
  <div class="flex flex-wrap">
    <template v-for="parameter in state.parameters" :key="parameter.id">
      <dynamic-input
        class="w-1/2"
        :parameter="parameter"
        :entityId="id"
        :update-value="updateDynamicValue"
        :add-value="addDynamicValue"
        :remove-value="removeDynamicValue"
      />
    </template>
  </div>
</template>

<script lang="ts">
import DynamicInput from "@/components/inputs/DynamicInput.vue";
import {
  EntityDynamicParameterDto,
  EntityDynamicParameterValueInput
} from "@/network/dtos/dynamic-parameter-dto";

import { ProjectTaskServiceProxy } from "@/network/projects-service-proxies";
import { defineComponent, onMounted, reactive } from "vue";

export default defineComponent({
  props: {
    projectId: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  components: {
    DynamicInput
  },
  setup(props) {
    const state = reactive({
      parameters: [] as EntityDynamicParameterDto[]
    });

    function fetchDocumentParameters() {
      new ProjectTaskServiceProxy()
        .getProjectTaskMetadataValues(
          parseInt(props.projectId),
          parseInt(props.id)
        )
        .then((result) => {
          state.parameters = result;
        });
    }

    onMounted(() => {
      fetchDocumentParameters();
    });

    function updateDynamicValue(parameterId: number, value: string) {
      new ProjectTaskServiceProxy()
        .setProjectTaskMetadataValue(
          parseInt(props.projectId),
          parseInt(props.id),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function addDynamicValue(parameterId: number, value: string) {
      new ProjectTaskServiceProxy()
        .addProjectTaskMetadataValue(
          parseInt(props.projectId),
          parseInt(props.id),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function removeDynamicValue(id: number) {
      new ProjectTaskServiceProxy()
        .removeProjectTaskMetadataValue(
          parseInt(props.projectId),
          parseInt(props.id),
          id
        )
        .then(fetchDocumentParameters);
    }

    return {
      state,
      updateDynamicValue,
      addDynamicValue,
      removeDynamicValue
    };
  }
});
</script>
