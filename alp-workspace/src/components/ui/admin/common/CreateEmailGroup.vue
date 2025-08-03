<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Email Group'">
    <modal-form @cancel="$emit('close')" @submit="createEmailGroup">
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

        <field-label class="w-full" name="Email" :isRequired="true">
          <v-field
            type="text"
            placeholder="Email"
            name="email"
            rules="required"
          />
          <error-message class="error-message" name="email" />
        </field-label>

        <field-label class="w-full" name="Description">
          <v-field
            type="text"
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
import { EmailGroupInput } from "@/network/dtos/email-dto";
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

    function createEmailGroup(values: EmailGroupInput) {
      store
        .dispatch(CommonStore.actions.CREATE_EMAILGROUP, EmailGroupInput.fromJS(values))
        .then(() => {
          emit("close");
        });
    }

    return { createEmailGroup };
  }
});
</script>
