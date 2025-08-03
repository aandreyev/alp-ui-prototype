<style>
.pointer {
  cursor: pointer;
}
</style>

<template>
  <div class="block bg-white rounded-md p-3 border border-gray-200">
    <div class="flex flex-col mb-3">
      <div class="flex justify-between text-base font-medium flex-wrap">
        <div>
          <alp-default-badge :text="trust.id" :color="'green'">
          </alp-default-badge>
          <router-link
            :to="{
              name: 'Trust Ledger',
              params: { id: trust.trustLedgerId }
            }"
            target="_blank"
          >
            <alp-default-badge
              :text="'ledger #' + trust.trustLedgerId"
              :color="'green'"
              class="hover:text-blue-600"
            >
            </alp-default-badge>
          </router-link>

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

          <span
            v-if="
              trust.transactionType == TransactionType.Deposit ||
              trust.transactionType == TransactionType.Withdrawal
            "
          >
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
            &nbsp; | &nbsp;
          </span>

          <span>
            <span class="text-gray-600 text-sm">Requested By: </span>
            <span class="text-black text-sm font-semibold">{{
              trust.requestedBy.fullName
            }}</span>
          </span>
        </div>
        <div>
          <alp-default-badge
            :text="'Pending'"
            :color="'yellow'"
            v-if="trust.approved == null"
          >
          </alp-default-badge>
          <alp-default-badge
            :text="'Approved'"
            :color="'green'"
            v-else-if="trust.approved == true"
          >
          </alp-default-badge>
          <alp-default-badge :text="'Rejected'" :color="'red'" v-else>
          </alp-default-badge>
          <alp-can permission="TrustRequestNotification.ReSend">
            <button
              type="button"
              class="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              v-if="trust.approved != false"
              @click="reSendTrustRequestNotification"
            >
              Resend Notification
            </button>
          </alp-can>
        </div>
      </div>

      <div
        class="flex text-xs font-semibold mt-2 mb-2 space-x-2 items-baseline flex-wrap"
      >
        <div class="flex w-full sm:w-1/2 text-xs mb-1">
          <span
            className="min-w-0 text-sm border-l-4 border-indigo-600 pl-4 pt-2 pb-2"
          >
            {{ trust?.description }}
          </span>
        </div>
        <div class="flex w-full sm:w-1/2 text-xs mb-1">
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

      <div
        class="flex mt-1 justify-between sm:space-x-5 flex-wrap gap-2 sm:gap-0"
      >
        <div
          class="w-full sm:flex-1 flex flex-col items-center justify-center rounded bg-gray-100 text-sm p-2"
        >
          <span
            class="text-base md:text-xl font-sans font-bold text-center"
            :class="trust.amount >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ fmtCurrency(trust.amount) }}
          </span>
          <span class="text-gray-500 text-center">Amount</span>
        </div>

        <div
          class="w-full sm:flex-1 flex flex-col items-center justify-center rounded bg-gray-100 text-sm p-2"
          v-if="
            trust.transactionType == TransactionType.Withdrawal ||
            trust.transactionType == TransactionType.Deposit
          "
        >
          <span class="text-base md:text-xl font-sans font-bold text-center">{{
            transactionMethod
          }}</span>

          <!-- <span v-if="transactionMethod == 'EFT' &&  trust.transactionType == TransactionType.Withdrawal"> 
              <span class="text-xs"> {{trust.withdrawalPayableTo}} - {{trust.withdrawalPayeeBsb}} - {{trust.withdrawalPayeeAccountNumber}}</span>
            </span> -->
          <span class="text-gray-500 text-center">Payment Method </span>
        </div>

        <div
          class="w-full sm:flex-1 flex flex-col items-center justify-center rounded bg-gray-100 text-sm p-2"
          v-if="trust.transactionType == TransactionType.Withdrawal"
        >
          <span class="text-base md:text-xl font-sans font-bold text-center"
            >To: {{ trust.withdrawalPayableTo }}</span
          >
          <span class="text-gray-500 text-center"
            >{{ trust.withdrawalPayeeBsb }} -
            {{ trust.withdrawalPayeeAccountNumber }}
          </span>
        </div>

        <div
          class="w-full sm:flex-1 flex flex-col items-center justify-center rounded bg-gray-100 text-sm p-2"
          v-if="trust.transactionType == TransactionType.Deposit"
        >
          <span class="text-base md:text-xl font-sans font-bold text-center"
            >From: {{ trust.depositPayableFrom }}</span
          >
          <span class="text-gray-500 text-center"
            >Address: {{ trust.depositAddress }}</span
          >
        </div>

        <div
          class="w-full sm:flex-1 flex flex-col items-center justify-center rounded bg-gray-100 text-sm p-2"
        >
          <span class="text-base md:text-xl font-sans font-bold text-center">{{
            fmtToLocalShortDate(trust.transactionDate)
          }}</span>
          <span class="text-gray-500 text-center">Transaction Date </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { fmtCurrency } from "@/composable/currency";

import { computed, defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { fmtToLocalDatetime, fmtToLocalShortDate } from "@/composable/date";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { TrustStore } from "@/store/modules/trust";
import {
  TransactionMethod,
  WithdrawalPurpose,
  DepositPurpose,
  MatterStatusTypes,
  TransactionType
} from "@/network/dtos/enumTypes";
import { TrustTransactionRequestDto } from "@/network/dtos/trust-dto";

export default defineComponent({
  props: {
    trust: {
      type: Object as PropType<TrustTransactionRequestDto>,
      required: true
    }
  },
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
  },
  setup(props, { emit }) {
    const store = useStore();

    const matterOutcomeState = reactive({
      showCompleted: false
    });

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

    function rejectRequest(requestId: number) {
      store.dispatch(TrustStore.actions.REJECT_TRUST_REQUEST, {
        id: props.trust.id,
        requestId
      });
    }
    function reSendTrustRequestNotification() {
      store.dispatch(TrustStore.actions.RESEND_TRUST_REQUEST_NOTIFICATION, {
        id: 0,
        requestId: props.trust.id
      });
    }

    return {
      matterOutcomeState,
      fmtCurrency,
      MatterStatusTypes,
      fmtToLocalShortDate,
      fmtToLocalDatetime,
      approveRequest,
      rejectRequest,
      reSendTrustRequestNotification,
      TransactionType,
      transactionMethod,
      withdrawalPurpose,
      depositPurpose
    };
  }
});
</script>
