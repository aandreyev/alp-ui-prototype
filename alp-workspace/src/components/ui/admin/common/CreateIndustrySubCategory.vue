<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Industry Sub Category'">
    <modal-form @cancel="$emit('close')" @submit="createIndustrySubCategory">
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <industry-category-selector-field
            name="industryCategory"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

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
import IndustryCategorySelectorField from "@/components/forms/selectors/IndustryCategorySelectorField.vue";
import { IndustrySubCategoryInput } from "@/network/dtos/base-entity";
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
    FieldLabel,
    IndustryCategorySelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createIndustrySubCategory(values: any) {
      store
        .dispatch(
          CommonStore.actions.CREATE_INDUSTRY_SUB_CATEGORY,
          new IndustrySubCategoryInput({
            name: values.name,
            industryCategoryId: values.industryCategory?.id
          })
        )
        .then(() => {
          emit("close");
        });
    }

    return { createIndustrySubCategory };
  }
});
</script>
