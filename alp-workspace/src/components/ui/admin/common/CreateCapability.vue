<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Capability'">
    <modal-form @cancel="$emit('close')" @submit="createCapability">
      <alp-form-container>
        <field-label class="w-full" name="Business Area">
          <business-area-selector-field name="businessArea" rules="required" />
          <error-message class="error-message" name="businessArea" />
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
import BusinessAreaSelectorField from "@/components/forms/selectors/BusinessAreaSelectorField.vue";
import { CapabilityInput } from "@/network/dtos/base-entity";
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
    BusinessAreaSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createCapability(values: any) {
      store
        .dispatch(
          CommonStore.actions.CREATE_CAPABILITY,
          new CapabilityInput({
            name: values.name,
            description: values.description,
            businessAreaId: values.businessArea?.id
          })
        )
        .then(() => {
          emit("close");
        });
    }

    return { createCapability };
  }
});
</script>
