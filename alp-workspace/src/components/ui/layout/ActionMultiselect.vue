<template>
  <modal @close="$emit('close')" :headingTitle="'Batch operation'">
    <modal-form @cancel="$emit('close')" @submit="handleSubmit">
      <alp-form-container>
        <field-label class="w-1/2" name="Status">
          <select
            v-model="state.selectedOption"
            @onChange="changeActionDynamically($event)"
          >
            <option
              v-for="option in status"
              :key="option.value"
              :value="option.value"
            >
              {{ option.key }}
            </option>
          </select>
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
import { defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";

import { ContactStore } from "@/store/modules/contacts";
import { useEnum } from "@/composable/enum";
import { OrganisationStore } from "@/store/modules/organisations";
import { ClientStore } from "@/store/modules/clients";
import { OrganisationsStatusType } from "@/network/dtos/enumTypes";

export default defineComponent({
  props: {
    page: {
      type: String,
      default: ""
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

    const { toDropdownOptions: toStatusOptions } = useEnum(
      OrganisationsStatusType
    );

    const state = reactive({
      selectedOption: ""
    });

    function changeActionDynamically(event) {
      state.selectedOption = `${event.target.value}`;
    }

    function handleSubmit() {
      const ComponentPage = props.page;
      if (ComponentPage == "Organisation") {
        store
          .dispatch(OrganisationStore.actions.SELECTED_CHANGE_ORGANISATIONS, {
            statusId: state.selectedOption
          })
          .then(() => {
            store.commit(
              OrganisationStore.mutations
                .SET_ORGANISATIONS_STATUS_CHANGE_CLOSE_COUNT
            );
            emit("close");
          });
      } else if (ComponentPage == "Contact") {
        store
          .dispatch(ContactStore.actions.SELECTED_CHANGE_CONTACTS, {
            statusId: state.selectedOption
          })
          .then(() => {
            store.commit(
              ContactStore.mutations.SET_COTACT_STATUS_CHANGE_CLOSE_COUNT
            );
            emit("close");
          });
      } else if (ComponentPage == "Client") {
        store
          .dispatch(ClientStore.actions.SELECTED_CHANGE_CLIENTS, {
            statusId: state.selectedOption
          })
          .then(() => {
            store.commit(
              ClientStore.mutations.SET_CLIENTS_STATUS_CHANGE_CLOSE_COUNT
            );
            emit("close");
          });
      }
    }

    const status = toStatusOptions();

    return {
      state,
      status,
      changeActionDynamically,
      handleSubmit
    };
  }
});
</script>
