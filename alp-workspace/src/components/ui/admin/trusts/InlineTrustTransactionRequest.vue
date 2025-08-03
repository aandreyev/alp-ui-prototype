<style>
.pointer {
  cursor: pointer;
}
</style>

<template>
  <div
    class="block bg-white rounded-md border border-gray-300 m-1 p-2"
    style="min-width: 750px"
  >
    <div class="flex flex-col mb-3">
      <div class="flex justify-between text-base font-medium">
        <router-link
          :to="{
            name: 'Matter',
            params: { id: trust?.matterId }
          }"
          target="_blank"
        >
          <alp-default-badge
            :text="trust.id + ' (ledger #' + trust.trustLedgerId + ')'"
            :color="'green'"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Deposit'"
            :color="'indigo'"
            v-if="trust.transactionType == TransactionType.Deposit"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Withdrawal'"
            :color="'pink'"
            v-else-if="trust.transactionType == TransactionType.Withdrawal"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Transfer Out'"
            :color="'yellow'"
            v-if="trust.transactionType == TransactionType.TransferOut"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Transfer In'"
            :color="'yellow'"
            v-if="trust.transactionType == TransactionType.TransferIn"
          >
          </alp-default-badge>

          <span class="hover:text-blue-500 pl-2" v-if="trust?.matterId">
            {{ trust.matter.name }} - [{{ trust.matterId }}]
          </span>
        </router-link>
        <div class="flex items-center justify-end space-x-2">
          <alp-button-with-text
            context="Approve"
            :color="'green'"
            icon-name="fa-solid fa-check fa-2xl"
            @click.stop="approveRequest(trust.id)"
          />

          <alp-button-with-text
            context="Reject"
            :color="'red'"
            icon-name="fa-solid fa-xmark fa-2xl"
            @click.stop="state.showRejectModal = true"
          />
        </div>
      </div>
      <div class="flex text-sm">
        <span>
          <span class="text-gray-600 text-sm">Purpose: </span>

          <span
            class="text-black text-sm font-semibold"
            v-if="trust.transactionType == TransactionType.Deposit"
            >{{ depositPurpose }}</span
          >
          <span
            class="text-black text-sm font-semibold"
            v-else-if="trust.transactionType == TransactionType.Withdrawal"
            >{{ withdrawalPurpose }}</span
          >
        </span>
        &nbsp; | &nbsp;
        <span>
          <span class="text-gray-600 text-sm">Requested By: </span>
          <span class="text-black text-sm font-semibold">{{
            trust.requestedBy.fullName
          }}</span>
        </span>
      </div>

      <div
        class="flex text-xs font-semibold mt-2 mb-2 space-x-2 items-baseline dsd"
      >
        <div class="flex w-1/2 text-xs mb-1">
          <span
            className="min-w-0 text-sm border-l-4 border-indigo-600 pl-4 pt-2 pb-2"
          >
            {{ trust?.description }}
          </span>
        </div>
        <div class="flex w-1/2 text-xs mb-1">
          <span class="w-full flex flex-wrap">
            <span
              v-for="(item, index) in trust?.supportDocumentLinks"
              :key="index"
              class="w-full md:w-1/2 flex items-center px-1"
            >
              <div
                class="w-full flex items-center justify-between py-2 pl-3 pr-4 text-sm border-solid border-2 border-gray-200 rounded-lg my-1"
              >
                <div class="flex w-0 flex-1 items-center">
                  <font-awesome-icon
                    icon="fa-solid fa-paperclip"
                    class="h-5 w-5 flex-shrink-0 text-gray-400"
                  />
                  <span class="ml-2 w-0 flex-1 truncate">{{
                    trust.supportDocumentLinks[index].description
                  }}</span>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <a
                    :href="trust.supportDocumentLinks[index].url"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                    target="_blank"
                    >Preview</a
                  >
                </div>
              </div>
            </span>
          </span>
        </div>
      </div>

      <div class="flex mt-1 justify-between space-x-5">
        <div
          class="flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
        >
          <span
            class="text-xl font-sans font-bold"
            :class="trust.amount >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ fmtCurrency(trust.amount) }}
          </span>
          <span class="text-gray-500">Amount</span>
        </div>

        <div
          class="flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
        >
          <span class="text-xl font-sans font-bold">{{
            transactionMethod
          }}</span>

          <!-- <span v-if="transactionMethod == 'EFT' &&  trust.transactionType == TransactionType.Withdrawal"> 
              <span class="text-xs"> {{trust.withdrawalPayableTo}} - {{trust.withdrawalPayeeBsb}} - {{trust.withdrawalPayeeAccountNumber}}</span>
            </span> -->
          <span class="text-gray-500">Payment Method </span>
        </div>

        <div
          class="flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          v-if="trust.transactionType == TransactionType.Withdrawal"
        >
          <span class="text-xl font-sans font-bold"
            >To: {{ trust.withdrawalPayableTo }}</span
          >
          <span class="text-gray-500"
            >{{ trust.withdrawalPayeeBsb }} -
            {{ trust.withdrawalPayeeAccountNumber }}
          </span>
        </div>

        <div
          class="flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
          v-if="trust.transactionType == TransactionType.Deposit"
        >
          <span class="text-xl font-sans font-bold"
            >From: {{ trust.depositPayableFrom }}</span
          >
          <span class="text-gray-500">Address: {{ trust.depositAddress }}</span>
        </div>

        <div
          class="flex-1 flex flex-col items-center rounded bg-gray-100 text-sm p-2"
        >
          <span class="text-xl font-sans font-bold">{{
            fmtToLocalShortDate(trust.transactionDate)
          }}</span>
          <span class="text-gray-500">Transaction Date </span>
        </div>
      </div>
    </div>
  </div>

  <modal
    :headingTitle="'Reject Trust'"
    v-if="state.showRejectModal"
    @close="state.showRejectModal = false"
  >
    <modal-form @cancel="state.showRejectModal = false" @submit="rejectRequest">
      <alp-form-container>
        <div class="bg-white px-4 w-full">
          <div class="sm:flex justify-items-center items-center space-x-4">
            <field-label class="w-full" name="Reject Reason" :isRequired="true">
              <v-field
                type="text"
                placeholder="Reject Reason"
                name="reason"
                rules="required"
              />
              <error-message class="error-message" name="name" />
            </field-label>
          </div>
        </div>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { computed, defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { fmtToLocalDatetime, fmtToLocalShortDate } from "@/composable/date";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { TrustStore } from "@/store/modules/trust";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { useNotify } from "@/composable/notify";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import {
  TransactionMethod,
  WithdrawalPurpose,
  DepositPurpose,
  MatterStatusTypes,
  TransactionType
} from "@/network/dtos/enumTypes";
import { TrustTransactionDto } from "@/network/dtos/trust-dto";

export default defineComponent({
  props: {
    trust: {
      type: Object as PropType<TrustTransactionDto>,
      required: true
    }
  },
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Modal,
    ModalForm,
    VField,
    FieldLabel
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      showCompleted: false,
      showRejectModal: false
    });

    const { fireErrorToast } = useNotify();

    const transactionMethod = computed(() => {
      switch (props.trust.transactionMethod) {
        case TransactionMethod.EFT:
          return "EFT";
        case TransactionMethod.Cheque:
          return "Cheque";
        case TransactionMethod.Cash:
          return "Cash";
        default:
          return "";
      }
    });

    const withdrawalPurpose = computed(() => {
      switch (props.trust.withdrawalPurpose) {
        case WithdrawalPurpose.InvoicePayment:
          return "Invoice Payment";
        case WithdrawalPurpose.ThirdPartyPayment:
          return "Third Party Payment";
        case WithdrawalPurpose.ClientDirection:
          return "Client Direction";
        default:
          return "";
      }
    });

    const depositPurpose = computed(() => {
      switch (props.trust.depositPurpose) {
        case DepositPurpose.InvoicePayment:
          return "Invoice Payment";
        case DepositPurpose.ThirdPartyPayment:
          return "Third Party Payment";
        case DepositPurpose.HoldInTrust:
          return "Hold In Trust";
        default:
          return "";
      }
    });

    function approveRequest(requestId: number) {
      store.dispatch(TrustStore.actions.APPROVE_TRUST_REQUEST, {
        id: props.trust.id,
        requestId
      });
    }

    function rejectRequest(value: any) {
      store.commit(TrustStore.mutations.SET_TRUST_SELECTION, "Table");
      store
        .dispatch(TrustStore.actions.REJECT_TRUST_REQUEST, {
          id: props.trust.id,
          requestId: props.trust.id,
          reason: value.reason
        })
        .then(() => {
          fireErrorToast("Transaction Rejected !");
          state.showRejectModal = false;
          store.commit(TrustStore.mutations.SET_TRUST_SELECTION, "List");
        });
    }

    return {
      state,
      fmtCurrency,
      MatterStatusTypes,
      fmtToLocalShortDate,
      fmtToLocalDatetime,
      approveRequest,
      rejectRequest,
      TransactionType,
      transactionMethod,
      withdrawalPurpose,
      depositPurpose
    };
  }
});
</script>
