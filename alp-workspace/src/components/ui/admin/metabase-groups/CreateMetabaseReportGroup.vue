<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Metabase Report Group'">
    <modal-form @cancel="$emit('close')" @submit="createMetabase">
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

        <field-label class="w-full" name="Description">
          <v-field type="text" placeholder="Description" name="description" />
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
import { MetabaseReportGroupInput } from "@/network/dtos/metabase-dto";
import { MetabaseStore } from "@/store/modules/metabase";
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

    function createMetabase(values: MetabaseReportGroupInput) {
      store
        .dispatch(
          MetabaseStore.actions.CREATE_METABASE_GROUP,
          MetabaseReportGroupInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { createMetabase };
  }
});
</script>
