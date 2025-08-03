<template>
  <modal @close="$emit('close')" :headingTitle="'Change Password'">
    <modal-form @cancel="$emit('close')" @submit="changePassword">
      <alp-form-container>
        <field-label class="w-full" name="New Password" :isRequired="true">
          <v-field
            type="password"
            placeholder="New Password"
            name="password"
            rules="required"
          />
          <error-message class="error-message" name="password" />
        </field-label>

        <field-label class="w-full" name="Re-Enter Password" :isRequired="true">
          <v-field
            type="password"
            placeholder="Re-Enter Password"
            name="passwordConfirm"
            rules="required"
          />
          <error-message class="error-message" name="passwordConfirm" />
          <span v-if="state.passwordNotMatch" class="error-message"
            >Password doesn't match</span
          >
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { UserStore } from "@/store/modules/users";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
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
    const state = reactive({
      passwordNotMatch: false
    });
    function changePassword(values: any) {
      if (values.password != values.passwordConfirm) {
        state.passwordNotMatch = true;
        return;
      }
      values.id = props.id;
      store
        .dispatch(UserStore.actions.CHANGE_PASSWORD, {
          user: values
        })
        .then(() => {
          emit("close");
        });
    }

    return { changePassword, state };
  }
});
</script>
