<template>
  <modal @close="$emit('close')" :headingTitle ="'Unsubscribe Newsletter'">
    <modal-form @cancel="$emit('close')" @submit="unsubscribe_ac">
      <alp-form-container>
        <field-label class="w-full sm:w-5/6" name="Reason for Unsubscribe" :isRequired="true">
          <span class="flex flex-col text-xs">
            <v-field
              as="select"
              name="UnsubscribeReason"
              rules="required"
            >
              <option value="" disabled>Choose reason for Unsubscribe</option>
              <option value="Conflict party">Conflict party</option>
              <option value="Not Suitable">Not suitable</option>
              <option value="Requested unsubscribe">
                Requested unsubscribe
              </option>
            </v-field>
          </span>
          <error-message class="error-message" name="UnsubscribeReason" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useEnum } from "@/composable/enum";
import { ContactServiceProxy } from "@/network/crm-service-proxies";
import { ContactStore } from "@/store/modules/contacts";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { router } from "@/router";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    VField,
    FieldLabel,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      checked: false
    });

    // Need to resolve id issue
    function unsubscribe_ac(value: any) {
      var response = new ContactServiceProxy().UnsubscribeActiveCampaign(
        props.id,
        value.UnsubscribeReason,
       '1'
      );
      router.push({ name: "Contacts" });
      {
        emit("close");
      }
      return response;
    }

    return {
      unsubscribe_ac,
      state
    };
  }
});
</script>
