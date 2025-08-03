<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Offering Outcome'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createOfferingOutcome"
      v-slot="{}"
    >
      <alp-form-container>
        <field-label class="w-full" name="Description" :isRequired="true">
          <v-field
            as="textarea"
            placeholder="Description"
            name="description"
            rules="required"
          />
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
import { OfferingOutcomeInput } from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "CreateOfferingOutcome",
  emits: ["close"],
  props: {
    offeringId: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    function createOfferingOutcome(values: OfferingOutcomeInput) {
      store
        .dispatch(OfferingStore.actions.CREATE_OFFERING_OUTCOME, {
          offeringId: props.offeringId,
          values
        })
        .then(() => emit("close"));
    }

    return { createOfferingOutcome };
  }
});
</script>

<style scoped></style>
