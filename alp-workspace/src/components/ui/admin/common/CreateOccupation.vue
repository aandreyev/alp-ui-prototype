<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Occupation'">
    <modal-form @cancel="$emit('close')" @submit="createOccupation">
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
import { OccupationInput } from "@/network/dtos/base-entity";
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

    function createOccupation(values: OccupationInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_OCCUPATION,
          OccupationInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { createOccupation };
  }
});
</script>
