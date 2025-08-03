<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Organisation Type'">
    <modal-form @cancel="$emit('close')" @submit="createOrganisationType">
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

        <label class="form-checkbox-field w-full">
          <v-field
            class="checkbox"
            name="hasAcn"
            type="checkbox"
            :value="true"
          />
          <span class="form-label mr-2">Has ACN</span>
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { OrganisationTypeInput } from "@/network/dtos/organisation-dto";
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

    function createOrganisationType(values: OrganisationTypeInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_ORGANISATION_TYPE,
          OrganisationTypeInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { createOrganisationType };
  }
});
</script>
