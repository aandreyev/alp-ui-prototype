<template>
  <modal @close="$emit('close')" :headingTitle="'Create Discount Item'" :description="'You can apply service discount here.'">
    <shad-form @submit="onSubmit" :initial-values="initialValues">
      <div class="flex-col space-y-2">
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="discountType">
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true"
                >Discount Type</shad-form-label
              >
              <shad-select
                v-bind="componentField"
                @update:modelValue="updateValidationSchema"
                :disabled="true"
              >
                <shad-form-control>
                  <shad-select-trigger>
                    <shad-select-value placeholder="Select Discount Type" />
                  </shad-select-trigger>
                </shad-form-control>
                <shad-select-content>
                  <shad-select-group>
                    <shad-select-label>Select Discount Type</shad-select-label>
                    <shad-select-item
                      class="select-items"
                      v-for="option in discountTypes"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.key }}
                    </shad-select-item>
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>

        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="gstType">
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true"
                >GST Type</shad-form-label
              >
              <shad-select
                v-bind="componentField"
                @update:modelValue="handleGSTSelectionChange"
              >
                <shad-form-control>
                  <shad-select-trigger>
                    <shad-select-value placeholder="Select GST Type" />
                  </shad-select-trigger>
                </shad-form-control>
                <shad-select-content>
                  <shad-select-group>
                    <shad-select-label>Select GST Type</shad-select-label>
                    <shad-select-item
                      class="select-items"
                      v-for="option in gstTypes"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.key }}
                    </shad-select-item>
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>

        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="description">
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true">Description</shad-form-label>
              <shad-form-control>
                <text-area
                  type="text"
                  placeholder="Description"
                  v-bind="componentField"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>

        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="amount" class="">
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true">Amount</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="number"
                  placeholder="Amount"
                  v-bind="componentField"
                  @update:modelValue="handleUpdateAmount"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
        <div class="flex">
          <shad-form-field
            v-if="state.currentDiscountType === DiscountTypes.Percentage"
            v-slot="{ componentField }"
            name="percentage"
            class=""
          >
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true">Percentage</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="percentage"
                  v-bind="componentField"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>

        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="totalAmountIncGST" class="">
            <shad-form-item class="w-full">
              <shad-form-label>This amount will be deducted from the invoice as a discount</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder=""
                  v-bind="componentField"
                  disabled
                  :model-value="calculateTotalWithGST"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
      </div>
    </shad-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import { useEnum } from "@/composable/enum";
import { DiscountTypes, GstTypes } from "@/network/dtos/enumTypes";
import { InvoiceStore } from "@/store/modules/invoices";
import { useForm } from "vee-validate";
import { computed, reactive } from "vue";
import { useStore } from "vuex";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useNotify } from "@/composable/notify";

interface CreateInvoiceDiscountForm {
  amount: number;
  percentage: number;
  description: string;
  discountType: DiscountTypes;
  gstType: GstTypes;
}
const state = reactive({
  currentAmount: 0,
  currentGSTType: GstTypes.Gst,
  currentDiscountType: DiscountTypes.FixedPrice
});

const emit = defineEmits(["close"]);
const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
});
const { fireSuccessToast } = useNotify();




const createValidationSchema = (discountType: DiscountTypes) => {
  const baseSchema = {
    discountType: z.string({ required_error: "Discount Type is required" }),
    gstType: z.string({ required_error: "GST Type is required" }),
    description: z
      .string({ required_error: "Description is required" })
      .min(1, "Description is required"),
    amount: z
      .number({ required_error: "Amount is required" })
      .min(1, "Amount is required")
  };

  if (discountType === DiscountTypes.Percentage) {
    return toTypedSchema(
      z.object({
        ...baseSchema,
        percentage: z
          .string({ required_error: "Percentage is required" })
          .min(1, "Percentage is required")
          .regex(/^\d*\.?\d*$/, "Must be a valid number")
      })
    );
  }

  return toTypedSchema(z.object(baseSchema));
};

const initialValues = {
  discountType: DiscountTypes.FixedPrice.toString(),
  gstType: GstTypes.Gst.toString(),
  description: "",
  amount: 0,
  percentage: ""
};

const { isFieldDirty, handleSubmit, resetForm } = useForm({
  validationSchema: createValidationSchema(DiscountTypes.FixedPrice),
  initialValues
});

const discountTypeEnum = useEnum(DiscountTypes);
const gstTypeEnum = useEnum(GstTypes);

const discountTypes = discountTypeEnum.toDropdownOptions();
const gstTypes = gstTypeEnum.toDropdownOptions();

const store = useStore();


// Calculate total amount including GST
const calculateTotalWithGST = computed(() => {


  switch (state.currentGSTType) {
    case GstTypes.Gst:
      return (state.currentAmount * 1.1).toFixed(2); // 10% GST
    case GstTypes.GstBasExclude:
      return state.currentAmount.toFixed(2);
    case GstTypes.GstExport:
      return state.currentAmount.toFixed(2);
    default:
      return state.currentAmount.toFixed(2);
  }
});

function updateValidationSchema(value: string) {
  const discountType = parseInt(value) as DiscountTypes;
  state.currentDiscountType = discountType;

  resetForm({
    validationSchema: createValidationSchema(discountType),
    values: {
      ...initialValues,
      discountType: value
    }
  });
}


function handleGSTSelectionChange(value: string) {
  state.currentGSTType = parseInt(value) as GstTypes;
}


function handleUpdateAmount(value: any) {
  state.currentAmount = value;
}



const onSubmit = handleSubmit((values) => {
  const body = {
    discountType: parseInt(values.discountType) as DiscountTypes,
    gstType:  parseInt(values.gstType) as GstTypes,
    description: values.description,
    amount: values.amount
  } as CreateInvoiceDiscountForm;

  store
    .dispatch(InvoiceStore.actions.ADD_INVOICE_DISCOUNT_ITEM, {
      id: props.id,
      body
    })
    .then(() => {
      fireSuccessToast("Submitted !");
      emit("close");
    });
});




</script>
