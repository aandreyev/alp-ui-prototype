<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Deposit Interest in Controlled Money'"
  >
    <modal-form
      @cancel="$emit('close')"
      @submit="createRequest"
      :initialValues="{
        transactionDate: DateTime.now().toISODate(),
        transactionType: '1',
        transactionMethod: '1',
        depositPurpose: '3',
        description: 'Interest gained on controlled money'
      }"
      v-slot="{ values }"
      :confirmButtonLoading="state.buttonLoading"
    >
      <alp-form-container>
        <field-label class="w-1/2" name="Transaction Type" :isRequired="true">
          <v-field as="select" name="transactionType" rules="required">
            <option value="" disabled>Transaction Type</option>
            <option
              v-for="option in transactionTypes"
              :key="option.value"
              :value="option.value"
              disabled
            >
              {{ option.key }}
            </option>
          </v-field>

          <error-message class="error-message" name="transactionType" />
        </field-label>

        <!-- Transfer -->
        <template v-if="values.transactionType == TransactionType.Transfer">
          <field-label
            name="Transfer To Matter"
            class="w-full"
            :isRequired="true"
          >
            <matter-selector-field name="transferToMatter" rules="required" />
          </field-label>
        </template>

        <!-- Deposit -->
        <template v-if="values.transactionType == TransactionType.Deposit">
          <field-label
            class="w-1/2"
            name="Transaction Method"
            :isRequired="true"
          >
            <v-field as="select" name="transactionMethod" rules="required">
              <option value="" disabled>Transaction Method</option>
              <option
                v-for="option in transactionMethods"
                :key="option.value"
                :value="option.value"
                disabled
              >
                {{ option.key }}
              </option>
            </v-field>

            <error-message class="error-message" name="transactionMethod" />
          </field-label>

          <template v-if="values.transactionMethod == TransactionMethod.Cheque">
            <field-label
              class="w-full sm:w-1/2"
              name="Cheque Name"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Cheque Name"
                name="depositChequeName"
                rules="required"
              />
              <error-message class="error-message" name="depositChequeName" />
            </field-label>
            <field-label
              class="w-full sm:w-1/2"
              name="Cheque Bank"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Cheque Bank"
                name="depositChequeBank"
                rules="required"
                :disabled="true"
              />
              <error-message class="error-message" name="depositChequeBank" />
            </field-label>
            <field-label
              class="w-full sm:w-1/2"
              name="Cheque BSB"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Cheque BSB"
                name="depositChequeBsb"
                rules="required"
              />
              <error-message class="error-message" name="depositChequeBsb" />
            </field-label>
            <field-label
              class="w-full sm:w-1/2"
              name="Cheque Number"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Cheque Number"
                name="depositChequeNumber"
                rules="required"
              />
              <error-message class="error-message" name="depositChequeNumber" />
            </field-label>
          </template>

          <field-label class="w-1/2" name="Deposit Purpose" :isRequired="true">
            <v-field as="select" name="depositPurpose" rules="required">
              <option value="" disabled>Deposit Purpose</option>
              <option
                v-for="option in depositPurposes"
                :key="option.value"
                :value="option.value"
                disabled
              >
                {{ option.key }}
              </option>
            </v-field>

            <error-message class="error-message" name="depositPurpose" />
          </field-label>

          <template
            v-if="values.depositPurpose == DepositPurpose.InvoicePayment"
          >
            <field-label class="w-1/2" name="Invoice Number">
              <v-field
                type="text"
                placeholder="Invoice Number"
                name="invoiceNumber"
              />
            </field-label>
          </template>

          <field-label class="w-1/2" name="Payable From" :isRequired="true">
            <v-field
              type="text"
              placeholder="Payable From"
              name="depositPayableFrom"
              rules="required"
            />
            <error-message class="error-message" name="depositPayableFrom" />
          </field-label>

          <field-label
            class="w-1/2"
            name="Depositor Address"
            :isRequired="true"
          >
            <v-field
              type="text"
              placeholder="Depositor Address"
              name="depositAddress"
              rules="required"
            />
            <error-message class="error-message" name="depositAddress" />
          </field-label>
        </template>

        <!-- Withdrawal -->
        <template v-if="values.transactionType == TransactionType.Withdrawal">
          <field-label
            class="w-1/2"
            name="Transaction Method"
            :isRequired="true"
          >
            <v-field as="select" name="transactionMethod" rules="required">
              <option value="" disabled>Transaction Method</option>
              <option
                v-for="option in transactionMethods"
                :key="option.value"
                :value="option.value"
              >
                {{ option.key }}
              </option>
            </v-field>

            <error-message class="error-message" name="transactionMethod" />
          </field-label>

          <field-label
            class="w-1/2"
            name="Payment Direction"
            :isRequired="true"
          >
            <v-field
              as="select"
              name="withdrawalPaymentDirection"
              rules="required"
            >
              <option value="" disabled>Payment Direction</option>
              <option
                v-for="option in paymentDirections"
                :key="option.value"
                :value="option.value"
              >
                {{ option.key }}
              </option>
            </v-field>

            <error-message
              class="error-message"
              name="withdrawalPaymentDirection"
            />
          </field-label>

          <field-label
            class="w-1/2"
            name="Withdrawal Purpose"
            :isRequired="true"
          >
            <v-field as="select" name="withdrawalPurpose" rules="required">
              <option value="" disabled>Withdrawal Purpose</option>
              <option
                v-for="option in withdrawalPurposes"
                :key="option.value"
                :value="option.value"
              >
                {{ option.key }}
              </option>
            </v-field>

            <error-message class="error-message" name="withdrawalPurpose" />
          </field-label>

          <template
            v-if="values.withdrawalPurpose == WithdrawalPurpose.InvoicePayment"
          >
            <field-label class="w-1/2" name="Invoice Number" :isRequired="true">
              <v-field
                type="text"
                placeholder="Invoice Number"
                name="invoiceNumber"
                rules="required"
              />
            </field-label>
            <error-message class="error-message" name="invoiceNumber" />
          </template>

          <field-label class="w-1/2" name="Payable To" :isRequired="true">
            <v-field
              type="text"
              placeholder="Payable To"
              name="withdrawalPayableTo"
              rules="required"
            />
            <error-message class="error-message" name="withdrawalPayableTo" />
          </field-label>

          <template v-if="values.transactionMethod == TransactionMethod.EFT">
            <field-label class="w-1/2" name="Payee BSB" :isRequired="true">
              <v-field
                type="text"
                placeholder="Payee BSB"
                name="withdrawalPayeeBsb"
                rules="required"
              />
              <error-message class="error-message" name="withdrawalPayeeBsb" />
            </field-label>
            <field-label
              class="w-1/2"
              name="Payee Account Number"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Payee Account Number"
                name="withdrawalPayeeAccountNumber"
                rules="required"
              />
              <error-message
                class="error-message"
                name="withdrawalPayeeAccountNumber"
              />
            </field-label>
            <field-label
              class="w-1/2"
              name="Payee EFT Reference"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="EFT Reference"
                name="withdrawalEftReference"
                rules="required"
              />
              <error-message
                class="error-message"
                name="withdrawalEftReference"
              />
            </field-label>
          </template>
          <template v-if="values.transactionMethod == TransactionMethod.Cheque">
            <field-label
              class="w-1/2"
              name="Cheque Reference"
              :isRequired="true"
            >
              <v-field
                type="text"
                placeholder="Cheque Reference"
                name="withdrawalChequeReference"
                rules="required"
              />
              <error-message
                class="error-message"
                name="withdrawalChequeReference"
              />
            </field-label>
          </template>
        </template>
        <!-- </alp-form-container>

      <alp-form-container> -->
        <field-label class="w-full" name="Description" :isRequired="true">
          <v-field
            as="textarea"
            placeholder="Description"
            name="description"
            rules="required"
          />
          <error-message class="error-message" name="description" />
        </field-label>

        <field-label
          class="w-full sm:w-1/2"
          name="Transaction Date"
          :isRequired="true"
        >
          <date-field
            placeholder="Transaction Date"
            name="transactionDate"
            rules="required"
          />
          <error-message class="error-message" name="transactionDate" />
        </field-label>

        <field-label class="w-full sm:w-1/2" name="Amount" :isRequired="true">
          <v-field
            placeholder="Amount"
            name="amount"
            type="number"
            rules="required"
          />
          <error-message class="error-message" name="amount" />
        </field-label>

        <field-label
          class="w-full flex"
          name="Supporting Document Links"
          :isRequired="true"
        >
          <span class="w-full flex flex-wrap">
            <span
              v-for="(item, index) in state.supportDocumentLinks"
              :key="index"
              class="w-full md:w-1/2 flex items-center"
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
                    state.supportDocumentLinks[index].description
                  }}</span>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <a
                    :href="item.url"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                    target="_blank"
                    >Preview</a
                  >
                </div>
              </div>

              <span
                class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                role="button"
                @click="removeInput(item)"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" />
              </span>
            </span>
          </span>

          <span class="w-full flex justify-start mt-2">
            <div class="w-11/12 flex-wrap justify-between space-x-2">
              <div class="grid grid-cols-2 gap-2">
                <v-field
                  type="text"
                  placeholder="Description"
                  name="linkDescription"
                  v-model="state.linkDescription"
                />
                <v-field
                  type="text"
                  placeholder="External Link"
                  name="externalLink"
                  v-model="state.externalLink"
                  rules="url"
                />
                <error-message class="error-message" name="externalLink" />
              </div>
            </div>
            <div
              class="w-1/12 mb-2 flex justify-center items-center cursor-pointer"
            >
              <font-awesome-icon
                icon="fa-plus"
                :class="state.colorChange"
                @click="addExternalLink"
                aria-hidden="true"
                class="h-4 w-4"
              />
            </div>
          </span>
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";

import FieldLabel from "@/components/forms/FieldLabel.vue";
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import { useEnum } from "@/composable/enum";

import { TrustStore } from "@/store/modules/trust";
import { ErrorMessage, Field as VField } from "vee-validate";
import { reactive, watch } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { toDateTime } from "@/composable/date";
import {
  TransactionType,
  TransactionMethod,
  DepositPurpose,
  PaymentDirection,
  WithdrawalPurpose
} from "@/network/dtos/enumTypes";
import { MatterListDto } from "@/network/dtos/matter-dto";
import { ResourceUrlDto } from "@/network/dtos/resource-dto";
import { TrustTransactionRequestInput } from "@/network/dtos/trust-dto";

interface CreateRequestValues {
  description: string;
  transactionDate: string;
  amount: number;
  transactionType: TransactionType;

  // Transfer
  transferToMatter?: MatterListDto;

  // Common
  transactionMethod?: TransactionMethod;
  invoiceNumber?: string;
  externalLinks?: string[];

  // Deposit
  depositChequeName?: string;
  depositChequeBank?: string;
  depositChequeBsb?: string;
  depositChequeNumber?: string;
  depositPurpose?: DepositPurpose;
  depositPayableFrom?: string;
  depositAddress?: string;

  // Withdrawal
  withdrawalPaymentDirection?: PaymentDirection;
  withdrawalPurpose?: WithdrawalPurpose;
  withdrawalPayableTo?: string;
  withdrawalPayeeBsb?: string;
  withdrawalPayeeAccountNumber?: string;
  withdrawalEftReference?: string;
  withdrawalChequeReference?: string;
}

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(["close"]);

const store = useStore();

const state = reactive({
  externalLink: "",
  linkDescription: "",
  supportDocumentLinks: [] as ResourceUrlDto[],
  colorChange: "text-gray-400",
  buttonLoading: false
});

const { toDropdownOptions: toTransactionTypeOptions } =
  useEnum(TransactionType);
const transactionTypes = toTransactionTypeOptions();

const { toDropdownOptions: toTransactionMethodOptions } =
  useEnum(TransactionMethod);
const transactionMethods = toTransactionMethodOptions();

const { toDropdownOptions: toDepositPurposeOptions } = useEnum(DepositPurpose);
const depositPurposes = toDepositPurposeOptions();

const { toDropdownOptions: toWithdrawalPurposeOptions } =
  useEnum(WithdrawalPurpose);
const withdrawalPurposes = toWithdrawalPurposeOptions();

const { toDropdownOptions: toPaymentDirectionOptions } =
  useEnum(PaymentDirection);
const paymentDirections = toPaymentDirectionOptions();

function createRequest(values: CreateRequestValues) {
  state.buttonLoading = true;
  addExternalLink();
  // create request
  var request = new TrustTransactionRequestInput();
  request.init(values);
  request.trustAccountId = props.id;
  request.supportDocumentLinks = state.supportDocumentLinks;
  request.transactionDate = toDateTime(values.transactionDate)?.toUTC();
  store
    .dispatch(
      TrustStore.actions.CREATE_CONTROLLED_MONEY_TRUST_INTEREST_DEPOSIT_REQUEST,
      {
        request
      }
    )
    .then(() => {
      emit("close");
    });
}

function isEmptyOrSpaces(str: string) {
  return str === null || str.match(/^ *$/) !== null;
}

function validURL(str: string) {
  var expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  var pattern = new RegExp(expression); // fragment locator
  return !!pattern.test(str);
}

function addExternalLink() {
  var getLink = state.externalLink;
  var getDesc = state.linkDescription;
  if (
    !isEmptyOrSpaces(getDesc) &&
    !isEmptyOrSpaces(getLink) &&
    validURL(getLink)
  ) {
    // safeguard: replace all illegal chars
    var strippedLink = getLink.replace(/(\r\n|\n|\r)/gm, "");
    var strippedDesc = getDesc.replace(/(\r\n|\n|\r)/gm, "");

    var documentURL = new ResourceUrlDto();
    documentURL.name = strippedDesc;
    documentURL.description = strippedDesc;
    documentURL.url = strippedLink;
    state.supportDocumentLinks?.push(documentURL);

    state.linkDescription = "";
    state.externalLink = "";
  }
}

function colorChecker() {
  var getLink = state.externalLink;
  var getDesc = state.linkDescription;
  if (!isEmptyOrSpaces(getDesc) && !isEmptyOrSpaces(getLink)) {
    state.colorChange = "text-blue-600";
  } else {
    state.colorChange = "text-gray-400";
  }
}

watch([() => state.linkDescription, () => state.externalLink], colorChecker);

function removeInput(item: ResourceUrlDto) {
  if (item) {
    let index = state.supportDocumentLinks.indexOf(item);
    state.supportDocumentLinks.splice(index, 1);
  }
}
</script>
