<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Update Invoice Status'"
    :description="'You can update the invoice stautus here bypass the logical'"
  >
    <modal-form
      @cancel="$emit('close')"
      @submit="updateInvoiceStatus()"
      :initial-values="{}"
    >

      <Alert variant="destructive">
        <iconify-icon icon="lucide:octagon-x" class="mr-2 w-4 h-4" />

        <AlertTitle>Danger</AlertTitle>
        <AlertDescription>
          You are trying to <b>overwrite </b> the invoice status and bypass the
          logical check, this is a danger action, think carefully before you do.
        </AlertDescription>
      </Alert>

      <div class="flex">
        <shad-form-field v-slot="{ componentField }" name="confirmText">
          <shad-form-item class="w-full">
            <shad-form-label :isRequired="false"
              >Please enter 'confirm' to be able to submit your
              request</shad-form-label
            >
            <shad-form-control>
              <span class="flex items-center">
                <iconify-icon
                  v-if="isConfirmTextValid"
                  icon="lucide:circle-check"
                  class="mr-2 w-4 h-4 text-green-600"
                />
                <iconify-icon
                  v-else
                  icon="lucide:circle-x"
                  class="mr-2 w-4 h-4 text-red-600"
                />
                <shad-input
                  type="text"
                  placeholder="Type in here"
                  v-model="state.confirmText"
                />
              </span>
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
      </div>

      <div class="flex">
        <shad-form-field v-slot="{ componentField }" name="invoiceStatus" v-model="state.invoiceStatus">
          <shad-form-item class="w-full">
            <shad-form-label :isRequired="true"
              >Expected Invoice Status</shad-form-label
            >
            <shad-select v-bind="componentField">
              <shad-form-control>
                <shad-select-trigger>
                  <shad-select-value placeholder="Select Invoice Status" />
                </shad-select-trigger>
              </shad-form-control>
              <shad-select-content>
                <shad-select-group>
                  <shad-select-label>Select Invoice Status</shad-select-label>

                  <shad-select-item class="select-items" :key="InvoiceStatus.Draft" :value="InvoiceStatus.Draft">
                    Draft
                  </shad-select-item>

                  <shad-select-item class="select-items" :key="InvoiceStatus.Sent" :value="InvoiceStatus.Sent">
                    Sent
                  </shad-select-item>
                </shad-select-group>
              </shad-select-content>
            </shad-select>

            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
      </div>

    </modal-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { useNotify } from "@/composable/notify";
import { computed, reactive } from "vue";
import { useStore } from "vuex";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/lib/registry/new-york/ui/alert";
import { values } from "lodash";
import { BillableTypes, GstTypes } from "@/network/dtos/enumTypes";
import { InvoiceDto } from "@/network/dtos/invoice-dto";


interface CreateInvoiceForm {
  quantity: number;
  cost: number;
  description: string;
  billableType: BillableTypes;
  gstType: GstTypes;
}

const props = defineProps({
  invoice: {
    type: InvoiceDto,
    required: true
  }
});

const emit = defineEmits(["close"]);

const state = reactive({
  showUpdateInvoiceDate: false,
  confirmText: "",
  invoiceStatus: null,
});

const store = useStore();
const { fireErrorToast } = useNotify();



const isConfirmTextValid = computed(() => {
  return state.confirmText.toLowerCase() === 'confirm';
});


function updateInvoiceStatus() {



  if (!isConfirmTextValid.value) {
    fireErrorToast("Please type 'confirm' exactly and try again !");
  } 
  else {
    // change status logical
      console.log(state.invoiceStatus);
      emit("close");

  }
}
</script>
