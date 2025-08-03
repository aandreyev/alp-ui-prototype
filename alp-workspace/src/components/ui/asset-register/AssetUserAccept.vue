<template>
  <modal @close="$emit('close')" :headingTitle="'Asset Acceptance'">
    <modal-form @cancel="$emit('close')" @submit="assetAccept">
      <alp-form-container class="py-0">
        <label class="form-checkbox-field w-1/2">
          <input class="checkbox" type="checkbox" v-model="state.isCheck" />

          <span
            class="form-label mr-2 hover:cursor-pointer hover:underline hover:text-blue-500"
          >
            <a
              href="https://wiki.adlvlaw.com.au/en/BusOps/IT/Security/Communication-Security"
              target="_blank"
            >
              Email computer internet and telephone use Policy
            </a>
          </span>
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { AssetRegisterStore } from "@/store/modules/asset";
import { ErrorMessage, Field as VField } from "vee-validate";
import { useNotify } from "@/composable/notify";

export default defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: String,
      required: true
    }
  },

  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      isCheck: false
    });

    const { fireErrorToast } = useNotify();
    function assetAccept() {
      if (state.isCheck) {
        store
          .dispatch(AssetRegisterStore.actions.SELECTED_CHANGE_ASSET, {})
          .then(() => {
            store.commit(
              AssetRegisterStore.mutations.SET_ASSET_STATUS_CHANGE_CLOSE_COUNT
            );
            emit("close");
          });
      } else {
        fireErrorToast("Please read and agree to the policy");
      }
    }
    return { state, assetAccept };
  }
});
</script>
