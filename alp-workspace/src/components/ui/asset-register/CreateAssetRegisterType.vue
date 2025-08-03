<template>
  <modal @close="$emit('close')" :headingTitle="'Add Asset Register Type'">
    <modal-form @cancel="$emit('close')" @submit="createAssetType">
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="Name"
            rules="required"
          />
          <error-message class="error-message" name="Name" />
        </field-label>
        <field-label class="w-full" name="Default Deprecation Date (in Years)">
          <v-field
            type="text"
            placeholder="Default Deprecation Date"
            name="DefaultDeprecationYear"
          />
          <error-message class="error-message" name="DefaultDeprecationYear" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>
<script lang="ts">
import ModalForm from "@/components/common/layout/ModalForm.vue";
import Modal from "@/components/common/layout/Modal.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";
import { AssetRegisterStore } from "@/store/modules/asset";
import { CreateAssetTypeInput } from "@/network/dtos/asset-dto";

export default defineComponent({
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField
  },
  setup(props, { emit }) {
    const store = useStore();
    function createAssetType(values: CreateAssetTypeInput) {
      store
        .dispatch(AssetRegisterStore.actions.CREATE_ASSET_REGISTER_TYPE, values)
        .then(() => {
          emit("close");
        })
        .then();
    }
    return { createAssetType };
  }
});
</script>
