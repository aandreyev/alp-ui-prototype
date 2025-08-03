<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Sub Capability'">
    <modal-form @cancel="$emit('close')" @submit="createSubCapability">
      <alp-form-container>
        <field-label class="w-full" name="Capability" :isRequired="true">
          <capability-selector-field name="capability" rules="required" />
          <error-message class="error-message" name="capability" />
        </field-label>

        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Description">
          <v-field type="text" placeholder="Description" name="description" />
          <error-message class="error-message" name="description" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import CapabilitySelectorField from "@/components/forms/selectors/CapabilitySelectorField.vue";
import { SubCapabilityInput } from "@/network/dtos/base-entity";
import { CommonStore } from "@/store/modules/common";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    CapabilitySelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createSubCapability(values: any) {
      store
        .dispatch(
          CommonStore.actions.CREATE_SUB_CAPABILITY,
          new SubCapabilityInput({
            name: values.name,
            capabilityId: values.capability?.id,
            description: values.description
          })
        )
        .then(() => {
          emit("close");
        });
    }

    return { createSubCapability };
  }
});
</script>
