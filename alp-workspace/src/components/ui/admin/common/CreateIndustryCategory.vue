<template>
  <modal @close="$emit('close')" :headingTitle="'Create Industry Category'">
    <modal-form @cancel="$emit('close')" @submit="createIndustryCategory">
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field type="text" placeholder="Name" name="name" rules="required" />
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
import { IndustryCategoryInput } from "@/network/dtos/base-entity";
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

    function createIndustryCategory(values: IndustryCategoryInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_INDUSTRY_CATEGORY,
          IndustryCategoryInput.fromJS(values)
        )
        .then(() => {
          store.dispatch(CommonStore.actions.GET_INDUSTRY_CATEGORIES, {
            limit: 50,
            offset: 0
          });

          emit("close");
        });
    }

    return { createIndustryCategory };
  }
});
</script>
