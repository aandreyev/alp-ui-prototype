<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Assign Email To Chosen Project'"
  >
    <modal-form @cancel="$emit('close')" @submit="assignEmailToProject">
      <alp-form-container>
        <field-label name="Select a Project" class="w-full">
          <project-selector
            v-model:modelValue="state.project"
            can-clear
            placeholder="Select a project to assign"
            @update:modelValue="selectProject"
          />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import FieldLabel from "@/components/forms/FieldLabel.vue";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import ProjectSelector from "@/components/inputs/selectors/ProjectSelector.vue";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { ProjectStore } from "@/store/modules/projects";
import { EmailStore } from "@/store/modules/emails";

export default defineComponent({
  emits: ["close"],
  props: {
    oldMatterId: Number,
    emailIdList: Array as PropType<Array<number>>
  },
  components: {
    Modal,
    ModalForm,
    ProjectSelector,
    FieldLabel
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      projectId: Number
    });

    function selectProject(values: any) {
      state.projectId = values.id;
    }

    function assignEmailToProject() {
      store
        .dispatch(ProjectStore.actions.ASSIGN_SELECTED_EMAIL_TO_PROJECT, {
          emailId: props.emailIdList,
          projectId: state.projectId
        })
        .then(() => {
          store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
          emit("close");
        });
    }

    return {
      state,
      selectProject,
      assignEmailToProject
    };
  }
});
</script>
