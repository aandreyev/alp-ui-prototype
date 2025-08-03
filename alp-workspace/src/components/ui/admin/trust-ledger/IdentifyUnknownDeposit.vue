<template>
  <modal @close="$emit('close')" :headingTitle="'Identify Unknown Deposit'">
    <modal-form
      @cancel="$emit('close')"
      @submit="submit"
      :initialValues="{}"
      v-slot="{ values }"
    >
      <alp-form-container>
        <field-label
          class="w-full"
          name="Trust Transaction Id"
          :isRequired="true"
        >
          <v-field
            type="text"
            placeholder="Trust Transaction ID"
            name="trustTransactionId"
            rules="required"
            v-model="state.transactionId"
          />
          <error-message class="error-message" name="trustTransactionId" />
        </field-label>

        <div class="flex items-center space-x-2">
          <shad-checkbox
            id="check"
            @update:checked="state.check = !state.check"
          />
          <label
            for="check"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I checked the matter transaction id that I entered is correct.
          </label>
        </div>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { TrustStore } from "@/store/modules/trust";
import { ErrorMessage, Field as VField } from "vee-validate";
import { reactive } from "vue";
import { useStore } from "vuex";
import { useNotify } from "@/composable/notify";
import { TrustLedgersListDto } from "@/network/dtos/trust-dto";

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  amount: {
    type: Number
  },
  description: {
    type: String
  },
  trustLedger: {
    type: TrustLedgersListDto
  }
});

const emit = defineEmits(["close"]);

const store = useStore();
const state = reactive({
  transactionId: "",
  check: false
});

const { fireErrorToast } = useNotify();

function submit(values: any) {
  if (state.check) {
    store
      .dispatch(TrustStore.actions.IDENTIFY_UNKNOWN_DEPOSIT, {
        id: props.trustLedger?.id,
        transactionId: values.trustTransactionId
      })
      .then(() => {
        emit("close");
      });
  } else {
    fireErrorToast("Please double check the trust transaction id");
  }
}
</script>
