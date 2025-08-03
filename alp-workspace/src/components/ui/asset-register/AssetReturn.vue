<template>
  <modal @close="$emit('close')" :headingTitle="'Asset Return'">
    <modal-form @cancel="$emit('close')" @submit="assetReturned">
      <alp-form-container class="py-0">
        <field-label
          v-if="pageName == 'User'"
          class="w-full"
          name="Do you want to return the asset?"
        ></field-label>
        <field-label v-else class="w-full" name="Have you recieved the asset?">
        </field-label>
        <field-label
          class="w-full"
          name="Condition Check Notes"
          :isRequired="true"
        >
          <v-field
            as="textarea"
            placeholder="Condition Notes"
            name="conditionNotes"
            rules="required"
          />
          <error-message class="error-message" name="conditionNotes" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { PropType, defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import { AssetRegisterStore } from "@/store/modules/asset";
import { ErrorMessage, Field as VField } from "vee-validate";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: String,
      required: true
    },
    owner: {
      type: Object as PropType<UserListDto>,
      required: true
    },
    pageName: {
      type: String,
      default: ""
    }
  },

  components: {
    Modal,
    ModalForm,
    FieldLabel,
    UserSelector,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      ownerValue: props.owner,
      conditionNotes: ""
    });
    function assetReturned(values: any) {
      store
        .dispatch(AssetRegisterStore.actions.SELECTED_RETURN_CHANGE_ASSET, {
          notes: values.conditionNotes,
          page: props.pageName
        })
        .then(() => {
          store.commit(
            AssetRegisterStore.mutations.SET_ASSET_STATUS_CHANGE_CLOSE_COUNT
          );
          emit("close");
        });
    }
    return { state, assetReturned };
  }
});
</script>
