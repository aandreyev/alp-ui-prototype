<template>
  <modal @close="$emit('close')" :headingTitle="'Create Project Task'">
    <modal-form @cancel="$emit('close')" :confirmText="-1">
      <alp-form-container>
        <alp-button
          class="mr-1"
          variant="tabs"
          :active="state.showStandardTaskSelector"
          @click="
            state.showStandardTaskSelector = !state.showStandardTaskSelector
          "
        >
          <font-awesome-icon icon="fa-solid fa-list" />
        </alp-button>
        <standard-task-selector
          v-if="state.showStandardTaskSelector"
          class="flex-1"
          @selected="createProjectTaskFromStandard"
        />
        <inline-input
          v-else
          class="flex-1"
          placeholder="Type to create a Task"
          @create="createProjectTask"
          keep-focus
        />
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { ProjectStore } from "@/store/modules/projects";
import StandardTaskSelector from "@/components/inputs/selectors/StandardTaskSelector.vue";
import { defineComponent, reactive } from "vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import { useStore } from "vuex";
import { StandardTaskDto } from "@/network/dtos/project-dto";

export default defineComponent({
  props: {
    projectId: {
      type: [Number],
      required: true
    },
    status: {
      type: [Number],
      required: true
    }
  },
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    StandardTaskSelector,
    InlineInput
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      showStandardTaskSelector: false
    });
    function createProjectTask(name: string) {
      store
        .dispatch(ProjectStore.actions.CREATE_PROJECT_TASK, {
          projectId: props.projectId,
          projectTask: { name, status: props.status }
        })
        .then(() => {
          emit("close");
        });
    }

    function createProjectTaskFromStandard(standardTask: StandardTaskDto) {
      if (standardTask) {
        store
          .dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_FROM_STANDARD, {
            projectId: props.projectId,
            standardTaskId: standardTask.id,
            status: props.status
          })
          .then(() => {
            emit("close");
          });
      }
      state.showStandardTaskSelector = false;
    }
    return {
      state,
      createProjectTask,
      createProjectTaskFromStandard
    };
  }
});
</script>
