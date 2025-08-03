<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Offering Categoery'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createOfferingCategory"
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
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { OfferingCategoryInput } from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    function createOfferingCategory(values: OfferingCategoryInput) {
      store
        .dispatch(OfferingStore.actions.CREATE_OFFERING_CATEGORY, values)
        .then(() => {
          emit("close");
        });
    }

    return { createOfferingCategory };
  }
});
</script>

<style scoped></style>
