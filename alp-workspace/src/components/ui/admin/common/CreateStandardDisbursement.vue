<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Standard Disbursement'">
    <modal-form @cancel="$emit('close')" @submit="createStandardDisbursement">
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

        <field-label class="w-full" name="Description" :isRequired="true">
          <v-field
            type="text"
            placeholder="Description"
            name="description"
            rules="required"
          />
          <error-message class="error-message" name="description" />
        </field-label>

        <field-label class="w-full" name="Cost" :isRequired="true">
          <v-field
            type="text"
            placeholder="Cost"
            name="cost"
            rules="required"
          />
          <error-message class="error-message" name="cost" />
        </field-label>

        <field-label name="GST Type" class="w-full">
          <v-field name="gstType" as="select" rules="required" :isRequired="true">
            <option disabled value="">Select a GST type</option>
            <option :value="GstTypes.Gst">GST (10%)</option>
            <option :value="GstTypes.GstExport">GST Export (0%)</option>
            <option :value="GstTypes.GstBasExclude">BAS Excluded (0%)</option>
          </v-field>
          <error-message class="error-message" name="gstType" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { StandardDisbursementInput } from "@/network/dtos/base-entity";
import { GstTypes } from "@/network/dtos/enumTypes";
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
    FieldLabel
  },
  setup(props, { emit }) {
    const store = useStore();

    function createStandardDisbursement(values: StandardDisbursementInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_STANDARD_DISBURSEMENT,
          StandardDisbursementInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { createStandardDisbursement, GstTypes };
  }
});
</script>
