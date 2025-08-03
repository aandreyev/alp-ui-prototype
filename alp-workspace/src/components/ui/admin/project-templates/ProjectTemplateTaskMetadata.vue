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

import { ProjectTemplateTaskServiceProxy } from "@/network/projects-service-proxies";
import { defineComponent, onMounted, reactive } from "vue";

export default defineComponent({
  props: {
    projectTemplateId: {
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
      new ProjectTemplateTaskServiceProxy()
        .getProjectTemplateTaskMetadataValues(
          parseInt(props.projectTemplateId),
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
      new ProjectTemplateTaskServiceProxy()
        .setProjectTemplateTaskMetadataValue(
          parseInt(props.projectTemplateId),
          parseInt(props.id),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function addDynamicValue(parameterId: number, value: string) {
      new ProjectTemplateTaskServiceProxy()
        .addProjectTemplateTaskMetadataValue(
          parseInt(props.projectTemplateId),
          parseInt(props.id),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function removeDynamicValue(id: number) {
      new ProjectTemplateTaskServiceProxy()
        .removeProjectTemplateTaskMetadataValue(
          parseInt(props.projectTemplateId),
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
