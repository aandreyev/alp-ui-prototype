<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Safe Storage Document Types'">
    <modal-form @cancel="$emit('close')" @submit="createSafeStorageDocumentType">
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
import { useNotify } from "@/composable/notify";
import { SafeStorageDocumentTypeInput } from "@/network/dtos/safe-storage-dto";
import { CommonStore } from "@/store/modules/common";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

const { fireSuccessToast } = useNotify();

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

    function createSafeStorageDocumentType(values: SafeStorageDocumentTypeInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_SAFE_STORAGE_DOCUMENT_TYPE,
          SafeStorageDocumentTypeInput.fromJS(values)
        )
        .then(() => {
          fireSuccessToast("Create Successfully !");
          emit("close");
        });
    }

    return { createSafeStorageDocumentType };
  }
});
</script>
