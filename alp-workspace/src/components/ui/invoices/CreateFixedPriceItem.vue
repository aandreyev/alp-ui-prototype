<template>
  <modal @close="$emit('close')" :headingTitle="'Create Fixed Price Item'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createFixedPriceItem"
      :initial-values="{
        billableType: BillableTypes.Billable,
        gstType: GstTypes.Gst
      }"
    >
      <alp-form-container>
        <field-label name="Quantity" class="w-full sm:w-1/2">
          <v-field name="quantity" type="number" placeholder="Quantity" />
          <error-message class="error-message" name="quantity" />
        </field-label>
        <field-label name="Cost" class="w-full sm:w-1/2">
          <v-field name="cost" type="number" placeholder="Cost" />
          <error-message class="error-message" name="cost" />
        </field-label>

        <field-label name="Billable" class="w-full sm:w-1/2" :isRequired="true">
          <v-field name="billableType" as="select" rules="required">
            <option disabled value="">Select a billable type</option>
            <option :value="BillableTypes.Billable">Billable</option>
            <option :value="BillableTypes.NonBillable">Non Billable</option>
            <option :value="BillableTypes.NonChargeable">Non Chargeable</option>
          </v-field>
          <error-message class="error-message" name="billableType" />
        </field-label>
        <field-label name="GST Type" class="w-full sm:w-1/2" :isRequired="true">
          <v-field name="gstType" as="select" rules="required">
            <option disabled value="">Select a GST type</option>
            <option :value="GstTypes.Gst">GST (10%)</option>
            <option :value="GstTypes.GstExport">GST Export (0%)</option>
            <option :value="GstTypes.GstBasExclude">BAS Excluded (0%)</option>
          </v-field>
          <error-message class="error-message" name="gstType" />
        </field-label>

        <field-label class="w-full" name="Description" :isRequired="true">
          <textarea
            ref="textarea"
            name="description"
            placeholder="Description"
            rules="required"
            class="resize-none min-h-[100px] max-h-[300px] overflow-y-auto"
            v-model="input"
          />
          <error-message class="error-message" name="description" />
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
import { BillableTypes, GstTypes, InvoiceType } from "@/network/dtos/enumTypes";
import { InvoiceStore } from "@/store/modules/invoices";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useTextareaAutosize } from "@vueuse/core";

interface CreateInvoiceForm {
  quantity: number;
  cost: number;
  description: string;
  billableType: BillableTypes;
  gstType: GstTypes;
}

export default defineComponent({
  emits: ["close"],
  props: {
    id: { type: [Number, String], required: true }
  },
  components: {
    Modal,
    ModalForm,
    VField,
    FieldLabel,
    ErrorMessage
  },
  setup(props, { emit }) {
    const { toDropdownOptions } = useEnum(InvoiceType);
    const invoiceTypes = toDropdownOptions();

    const store = useStore();

    const { textarea, input } = useTextareaAutosize();

    function createFixedPriceItem(values: CreateInvoiceForm) {
      store
        .dispatch(InvoiceStore.actions.ADD_INVOICE_FIXED_PRICE_ITEM, {
          id: props.id,
          quantity: values.quantity,
          cost: values.cost,
          description: input.value,
          billableType: values.billableType,
          gstType: values.gstType
        })
        .then(() => emit("close"));
    }

    return {
      textarea,
      input,
      invoiceTypes,
      createFixedPriceItem,
      GstTypes,
      BillableTypes
    };
  }
});
</script>

<style>
textarea {
  -ms-overflow-style: auto; /* Show scrollbar in IE */
  scrollbar-width: thin; /* Firefox */
}

textarea::-webkit-scrollbar {
  display: block;
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
}

textarea::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
