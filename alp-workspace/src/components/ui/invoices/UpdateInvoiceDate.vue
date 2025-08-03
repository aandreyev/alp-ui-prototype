<template>
  <modal @close="$emit('close')" :headingTitle="'Update Invoice Date'">
    <modal-form
      @cancel="$emit('close')"
      @submit="updateInvoiceDate()"
      :initial-values="{}"
    >
      <alp-form-container>
        <field-label
          name="New Invoice Date"
          class="w-full sm:w-1/2"
          :isRequired="true"
        >
          <!-- <v-field name="date" type="date" placeholder="Invoice Date" /> -->

          <date-field
            name="invoiceDate"
            rules="required"
            placeholder="invoiceDate"
            v-model="state.invoiceDate"
          />
          <error-message class="error-message" name="invoiceDate" />
        </field-label>

        <field-label
          name="Invoice Due Date (Ready Only)"
          class="w-full sm:w-1/2"
          :isRequired="true"
        >
          <date-field
            name="invoiceDueDate"
            rules="required"
            placeholder="invoiceDueDate"
            :modelValue="invoiceDueDate"
            :disabled="true"
          />
          <error-message class="error-message" name="invoiceDueDate" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useNotify } from "@/composable/notify";
import { InvoiceStore } from "@/store/modules/invoices";
import { DateTime } from "luxon";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { UpdateInvoiceDateInput } from "@/network/dtos/invoice-dto";
import { BillableTypes, GstTypes } from "@/network/dtos/enumTypes";
import { InvoiceServiceProxy } from "@/network/invoice-service-proxies";

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
    const state = reactive({
      showUpdateInvoiceDate: false,
      invoiceDate: new Date()
    });

    const store = useStore();
    const { fireErrorToast } = useNotify();

    const invoiceDueDate = computed(() => {
      console.log(state.invoiceDate);

      if (!state.invoiceDate) {
        fireErrorToast("Please choose a valid invoice date!");
        return;
      }

      return DateTime.fromJSDate(state.invoiceDate)
        .plus({ days: 7 })
        .toJSDate();
    });

    function updateInvoiceDate() {
      if (!state.invoiceDate) {
        fireErrorToast("Please choose a valid invoice date before submit !");
      } else {
        new InvoiceServiceProxy()
          .updateInvoiceDate(
            props.id,
            new UpdateInvoiceDateInput({
              newInvoiceDate: DateTime.fromJSDate(state.invoiceDate).toUTC()
            })
          )
          .then(() => {
            store.dispatch(InvoiceStore.actions.GET_INVOICE, { id: props.id });
            emit("close");
          });
      }
    }

    return {
      state,
      updateInvoiceDate,
      invoiceDueDate
    };
  }
});
</script>
