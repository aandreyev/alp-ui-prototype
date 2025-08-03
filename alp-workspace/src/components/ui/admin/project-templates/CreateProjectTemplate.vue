<template>
  <modal @close="$emit('close')" :headingTitle="'Create Project Template'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createProjectTemplate"
      v-slot="{}"
      :initialValues="{ dueDate: new Date().toISOString().substr(0, 10) }"
    >
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full sm:w-1/2" name="Owner" :isRequired="true">
          <user-selector-field name="owner" rules="required" />
        </field-label>

        <field-label class="w-full" name="Business Area">
          <business-area-selector-field name="businessArea" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import BusinessAreaSelectorField from "@/components/forms/selectors/BusinessAreaSelectorField.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import { BusinessAreaDto } from "@/network/dtos/base-entity";
import { ProjectTemplateInput } from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

interface ProjectTemplateValues {
  name: string;
  owner: UserListDto;
  businessArea: BusinessAreaDto;
}

export default defineComponent({
  props: {},
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    VField,
    FieldLabel,
    ErrorMessage,
    UserSelectorField,
    BusinessAreaSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createProjectTemplate(values: ProjectTemplateValues) {
      if (values.owner.id) {
        store
          .dispatch(
            ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE,
            new ProjectTemplateInput({
              name: values.name,
              ownerId: values.owner.id,
              businessAreaId: values.businessArea?.id
            })
          )
          .then((project) => {
            emit("created", project);
            emit("close");
          });
      }
    }

    return {
      createProjectTemplate
    };
  }
});
</script>
