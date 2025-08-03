<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Email Template'">
    <modal-form @cancel="$emit('close')" @submit="createEmailTemplate">
      <alp-form-container>
        <field-label class="w-full" name="Offering Category">
          <span class="justify-between w-full">
            <offering-category-selector
              class="mb-1"
              :canClear="true"
              v-model="state.offeringCategory"
            />
          </span>
        </field-label>

        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
            v-model="state.name"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Content">
          <!-- <v-field type="text" placeholder="Content" name="content" rules="" /> -->

          <editor
            class="flex-1 h-64 mx-3"
            v-model="state.content"
            v-on:keydown="onKeyDown"
          />

          <error-message class="error-message" name="content" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import OfferingCategorySelector from "@/components/inputs/selectors/OfferingCategorySelector.vue";
import { OfferingCategoryDto } from "@/network/dtos/offering-dto";
import { EmailStore } from "@/store/modules/emails";
import { EmailTemplateListDto } from "@/network/dtos/email-dto";
import Editor from "@/components/inputs/Editor.vue";

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    OfferingCategorySelector,
    Editor
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      offeringCategory: null as OfferingCategoryDto | null,
      content: ""
    });

    function createEmailTemplate(values: EmailTemplateListDto) {
      values.OfferingCategoryId = state.offeringCategory?.id;
      values.content = state.content;
      store
        .dispatch(EmailStore.actions.CREATE_EMAIL_TEMPLATE, { values })
        .then(() => {
          emit("close");
        });
    }

    return {
      createEmailTemplate,
      state
    };
  }
});
</script>
