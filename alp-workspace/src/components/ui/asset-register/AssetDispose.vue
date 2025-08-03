<template>
  <modal @close="$emit('close')" :headingTitle="'Asset Dispose'">
    <modal-form @cancel="$emit('close')" @submit="assetDispose">
      <alp-form-container>
        <field-label
          class="w-full"
          name="Condition Check Notes"
          :isRequired="true"
        >
          <v-field
            as="textarea"
            placeholder="Condition Notes"
            name="notes"
            rules="required"
          />
          <error-message class="error-message" name="notes" />
        </field-label>
        <field-label class="w-full" name="Dispose Reason" :isRequired="true">
          <v-field
            as="textarea"
            placeholder="Dispose Reason"
            name="disposeReason"
            rules="required"
          />
          <error-message class="error-message" name="disposeReason" />
        </field-label>
        <field-label class="w-1/2" name="Dispose Price">
          <v-field
            type="number"
            placeholder="Dispose Price"
            name="disposePrice"
          />
        </field-label>
        <field-label class="w-1/2" name="Dispose Date">
          <date-field name="disposeDate" placeholder="Dispose Date" />
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
import DateInput from "@/components/inputs/DateInput.vue";

import { toDateTime } from "@/composable/date";
import { DisposeAssetInput } from "@/network/dtos/asset-dto";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    owner: {
      type: Object as PropType<UserListDto>,
      required: true
    }
  },
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    UserSelector,
    VField,
    ErrorMessage,
    DateInput
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      DisposeDate: ""
    });
    function assetDispose(values: DisposeAssetInput) {
      if (values != undefined) {
        values.disposeDate = toDateTime(values.disposeDate)?.toUTC();

        store
          .dispatch(AssetRegisterStore.actions.ASSET_DISPOSE, {
            id: props.id,
            asset: values
          })
          .then(() => {
            emit("close");
          });
      }
    }
    return { state, assetDispose };
  }
});
</script>
