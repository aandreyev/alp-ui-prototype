<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Business Entity'">
    <modal-form @cancel="$emit('close')" @submit="createBusinessEntity">
      <alp-form-container>
        <field-label class="w-full" name="Legal Entity" :isRequired="true">
          <v-field
            type="text"
            placeholder="Legal Entity"
            name="legalEntityName"
            rules="required"
          />
          <error-message class="error-message" name="legalEntity" />
        </field-label>

        <field-label class="w-full" name="A.B.N" :isRequired="true">
          <v-field
            type="number"
            placeholder="A.B.N"
            name="abn"
            rules="required"
          />
          <error-message class="error-message" name="abn" />
        </field-label>

        <field-label class="w-full" name="Bank A/C Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Bank A/C Name"
            name="bankAccountName"
            rules="required"
          />
          <error-message class="error-message" name="bankAccountName" />
        </field-label>

        <field-label class="w-full" name="BSB" :isRequired="true">
          <v-field
            type="text"
            placeholder="BSB"
            name="bankAccountBsb"
            rules="required"
          />
          <error-message class="error-message" name="bankAccountBsb" />
        </field-label>

        <field-label class="w-full" name="Bank A/C Number" :isRequired="true">
          <v-field
            type="text"
            placeholder="Bank A/C Number"
            name="bankAccountNumber"
            rules="required"
          />
          <error-message class="error-message" name="bankAccountNumber" />
        </field-label>

        <field-label class="w-full" name="Bpay Biller Code" :isRequired="true">
          <v-field
            type="text"
            placeholder="Bpay Biller Code"
            name="bpayBillerCode"
            rules="required"
          />
          <error-message class="error-message" name="bpayBillerCode" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { BusinessEntityInput } from "@/network/dtos/office-dto";
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

    function createBusinessEntity(values: BusinessEntityInput) {
      store
        .dispatch(CommonStore.actions.CREATE_BUSINESS_ENTITY, BusinessEntityInput.fromJS(values))
        .then(() => {
          emit("close");
        });
    }

    return { createBusinessEntity };
  }
});
</script>
