<template>
  <modal @close="$emit('close')" :headingTitle="'Create User'">
    <modal-form @cancel="$emit('close')" @submit="createUser">
      <alp-form-container>
        <field-label class="w-full" name="Email" :isRequired="true">
          <v-field
            type="text"
            placeholder="Email"
            name="email"
            rules="email|required"
          />
          <error-message class="error-message" name="email" />
        </field-label>

        <field-label class="w-1/2" name="First Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="First Name"
            name="firstName"
            rules="required"
          />
          <error-message class="error-message" name="firstName" />
        </field-label>

        <field-label class="w-1/2" name="Last Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Last Name"
            name="lastName"
            rules="required"
          />
          <error-message class="error-message" name="lastName" />
        </field-label>

        <field-label class="w-full" name="Office" :isRequired="true">
          <office-selector-field name="office" rules="required" />
        </field-label>

        <field-label class="w-full" name="Password" :isRequired="true">
          <v-field
            type="password"
            placeholder="Password"
            name="password"
            rules="required"
          />
          <error-message class="error-message" name="password" />
        </field-label>

        <field-label class="w-full" name="Confirm Password" :isRequired="true">
          <v-field
            type="password"
            placeholder="Confirm Password"
            name="passwordConfirm"
            rules="required"
          />
          <error-message class="error-message" name="passwordConfirm" />
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
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { UserInput } from "@/network/dtos/user-dto";

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

    function createUser(values: any) {
      if (values.password != values.passwordConfirm) {
        return;
      }
      let userData = UserInput.fromJS(values);
      userData.officeId = values.office.id;
      store.dispatch(UserStore.actions.CREATE_USER, userData).then(() => {
        emit("close");
      });
    }

    return { createUser };
  }
});
</script>
