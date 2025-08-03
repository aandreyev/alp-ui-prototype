<template>
  <modal @close="$emit('close')" :headingTitle="'Create Safe Storage Sections'">
    <modal-form @cancel="$emit('close')" @submit="createSafeSectionType">
      <alp-form-container>
        <field-label class="w-full" name="Storage Code" :isRequired="true">
          <v-field
            type="text"
            placeholder="Storage Code"
            name="storageCode"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Office" :isRequired="true">
          <office-selector-field name="office" rules="required" />
          <error-message class="error-message" name="Office" />
        </field-label>
        <error-message class="error-message" name="Office" />
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useNotify } from "@/composable/notify";
import { SafeStorageSectionInput } from "@/network/dtos/safe-storage-dto";
import { CommonStore } from "@/store/modules/common";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import { OfficeDto } from "@/network/dtos/office-dto";

interface createSafeSectionTypeInput {
  storageCode: string;
  office: OfficeDto;
}

const { fireSuccessToast } = useNotify();

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    OfficeSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createSafeSectionType(values: createSafeSectionTypeInput) {
      const safe_section_input = new SafeStorageSectionInput({
        storageCode: values.storageCode,
        officeId: values.office?.id ? values.office.id : -1
      });

      store
        .dispatch(
          CommonStore.actions.CREATE_SAFE_STORAGE_SECTION,
          safe_section_input
        )
        .then(() => {
          fireSuccessToast("Create Successfully !");
          emit("close");
        });
    }

    return {
      createSafeSectionType,
      OfficeSelectorField
    };
  }
});
</script>
