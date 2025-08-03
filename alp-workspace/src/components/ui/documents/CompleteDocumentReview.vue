<template>
  <modal @close="$emit('close')" :headingTitle ="'Complete Document Review'">
    <modal-form @cancel="$emit('close')" @submit="createRequest">
      <alp-form-container>
        <field-label class="w-full" name="Message">
          <v-field type="text" placeholder="Message" name="message" />
          <error-message class="error-message" name="message" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { DocumentStore } from "@/store/modules/documents";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

interface FormValues {
  message: string;
}

export default defineComponent({
  props: {
    id: {
      types: [String, Number],
      required: true
    }
  },
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    VField,
    FieldLabel,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    function createRequest(values: FormValues) {
      store
        .dispatch(DocumentStore.actions.COMPLETE_DOCUMENT_REVIEW_REQUEST, {
          id: props.id,
          message: values.message
        })
        .then(() => {
          emit("close");
        });
    }

    return {
      createRequest
    };
  }
});
</script>
