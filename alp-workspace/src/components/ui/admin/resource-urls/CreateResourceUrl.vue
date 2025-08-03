<template>
  <modal @close="$emit('close')" :headingTitle="'Create a URL'">
    <modal-form @cancel="$emit('close')" @submit="createResourceUrl">
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
          <v-field
            type="text"
            placeholder="Description"
            name="description"
            rules=""
          />
          <error-message class="error-message" name="description" />
        </field-label>

        <field-label class="w-full" name="Url">
          <v-field
            as="textarea"
            placeholder="Url"
            name="url"
            rules="required|url"
          />
          <error-message class="error-message" name="url" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ResourceUrlInput } from "@/network/dtos/resource-dto";
import { ResourceStore } from "@/store/modules/resources";
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

    function createResourceUrl(values: ResourceUrlInput) {
      store
        .dispatch(ResourceStore.actions.CREATE_RESOURCE_URL, values)
        .then(() => {
          emit("close");
        });
    }

    return { createResourceUrl };
  }
});
</script>
