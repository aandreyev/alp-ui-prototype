<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Role'">
    <modal-form @cancel="$emit('close')" @submit="createRole">
      <label class="form-field">
        <span class="form-label">Name</span>
        <v-field type="text" placeholder="Name" name="name" rules="required" />
        <error-message name="name" />
      </label>

      <alp-form-container>
        <label class="form-checkbox-field w-full sm:w-1/2">
          <v-field
            name="isDefaultRole"
            type="checkbox"
            :value="true"
          />
          <span class="form-label">Default Role</span>
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { RoleStore } from "@/store/modules/roles";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

interface CreateRoleValues {
  name: string;
  isDefaultRole: boolean;
}

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    function createRole(values: CreateRoleValues) {
      store.dispatch(RoleStore.actions.CREATE_ROLE, values).then(() => {
        emit("close");
      });
    }

    return { createRole };
  }
});
</script>
