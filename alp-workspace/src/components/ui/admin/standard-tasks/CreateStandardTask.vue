<template>
  <modal @close="$emit('close')" :headingTitle="'Create Standard Task'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createStandardTask"
      v-slot="{}"
    >
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
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
import { BusinessAreaDto } from "@/network/dtos/base-entity";
import { StandardTaskInput } from "@/network/dtos/project-dto";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

interface StandardTaskValues {
  name: string;
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
    BusinessAreaSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createStandardTask(values: StandardTaskValues) {
      store
        .dispatch(
          ProjectTemplateStore.actions.CREATE_STANDARD_TASK,
          new StandardTaskInput({
            name: values.name,
            businessAreaId: values.businessArea?.id
          })
        )
        .then((task) => {
          emit("created", task);
          emit("close");
        });
    }

    return {
      createStandardTask
    };
  }
});
</script>
