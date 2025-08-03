<template>
  <shad-modal-form
    modalTitle="Create Invoice"
    modalDescription="You won't able to create a invoice for a lead, closed or finalised matter"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createInvoice"
    :isLoading="state.isLoading"
  >
    <div class="flex" v-if="!matterId">
      <shad-form-field v-slot="{ componentField }" name="matter">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Matter </shad-form-label>
          <shad-form-control>
            <matter-selector-field
              name="matter"
              rules="required"
              @selected="updateSelector($event, 'matter')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="invoiceType">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Invoice Type</shad-form-label>
          <shad-select
            v-bind="componentField"
            @update:modelValue="updateValidationSchema()"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Select Invoice Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Invoice Type</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in invoiceTypes"
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

    <shad-form-field
      v-slot="{ componentField }"
      name="isInvoiceAutomationEnabled"
    >
      <shad-form-item
        class="flex flex-row items-center justify-between rounded-lg border p-4"
      >
        <div class="space-y-0.5">
          <shad-form-label class="text-base flex flex-row items-center gap-2">
            <iconify-icon
              icon="lucide:sparkles"
              :class="{
                'animate-pulse text-amber-500': state.isInvoiceAutomationEnabled
              }"
            />
            Invoice Automation
          </shad-form-label>
          <shad-form-description>
            Enable this option to automatically add matter disbursements and
            time entries to the invoice. You can still manually add or remove
            disbursements and time entries to the invoice after it is created.
          </shad-form-description>
        </div>
        <shad-form-control>
          <shad-switch
            :checked="state.isInvoiceAutomationEnabled"
            v-model="state.isInvoiceAutomationEnabled"
            @update:checked="updateInvoiceAutomation"
          />
        </shad-form-control>
      </shad-form-item>
    </shad-form-field>
  </shad-modal-form>
</template>

<script setup lang="ts">
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import { useEnum } from "@/composable/enum";
import { useNotify } from "@/composable/notify";
import { InvoiceType } from "@/network/dtos/enumTypes";
import { MatterListDto, MatterDto } from "@/network/dtos/matter-dto";
import { InvoiceStore } from "@/store/modules/invoices";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import * as z from "zod";

interface CreateInvoiceForm {
  matter: MatterListDto;
  type: InvoiceType;
}
const props = defineProps<{
  matterId: number;
  buttonName: string;
}>();

let invoiceObject = z.object({
  invoiceType: z.string({ required_error: "types field is required" })
});

let initialSchema = ref(toTypedSchema(invoiceObject));

function updateValidationSchema() {
  let schema = invoiceObject;
  if (!props.matterId) {
    schema = schema.extend({
      matter: z.union([
        z.object({
          id: z.number().optional()
        }),
        z.null()
      ])
    });
  }
}

const { fireErrorToast } = useNotify();

const { handleSubmit } = useForm({
  validationSchema: initialSchema
});

const emit = defineEmits(["close"]);

const { toDropdownOptions } = useEnum(InvoiceType);
const invoiceTypes = toDropdownOptions();

const store = useStore();
const state = reactive({
  closeModel: false,
  matter: new MatterDto(),
  isLoading: false,
  isInvoiceAutomationEnabled: true
});

const createInvoice = handleSubmit((values) => {
  state.isLoading = true;
  var m_id: number | undefined;
  if (props.matterId != undefined) {
    m_id = props.matterId;

    store
      .dispatch(InvoiceStore.actions.CREATE_INVOICE, {
        matterId: m_id,
        type: values.invoiceType,
        isInvoiceAutomationEnabled: state.isInvoiceAutomationEnabled
      })
      .then(() => {
        state.closeModel = true;
      });
  } else {
    if (state.matter == null || state.matter.id == undefined) {
      //fire error message
      fireErrorToast("Please select a matter");
    } else {
      m_id = state.matter.id;
      store
        .dispatch(InvoiceStore.actions.CREATE_INVOICE, {
          matterId: m_id,
          type: values.invoiceType,
          isInvoiceAutomationEnabled: state.isInvoiceAutomationEnabled
        })
        .then(() => {
          state.closeModel = true;
          state.isLoading = false;
        });
    }
  }
});

function updateSelector(value: any, fieldName: any) {
  if (fieldName == "matter") {
    state.matter = value;
  }
}

function updateInvoiceAutomation(value: any) {
  state.isInvoiceAutomationEnabled = value;
}

function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
}
</script>
