<template>
  <modal @close="$emit('close')" :headingTitle="'Create Disbursement'">
    <modal-form
      class="flex flex-col bg-white"
      @cancel="$emit('close')"
      @submit="submit"
      :initial-values="{
        date: new Date(),
        billableType: BillableTypes.Billable,
        gstType: GstTypes.Gst,
        cost: state.cost,
        description: '',
        units: 1
      }"
      v-slot="{ values }"
    >
      <alp-form-container>
        <field-label class="w-full" name="Standard Disbursement">
          <standard-disbursement-selector-field
            name="standardDisbursement"
            @selected="
              (disbursement) => {
                state.description = disbursement.description;
                state.gstType = disbursement.gstType;
                state.cost = disbursement.cost;
                values.userId = disbursement.staff;
                values.units = disbursement.units;
              }
            "
          />
        </field-label>
        <field-label class="w-full" name="Staff">
          <user-selector-field name="staff" placeholder="Me" />
        </field-label>
        <field-label name="Date" class="w-full sm:w-1/2" :isRequired="true">
          <date-field
            name="date"
            placeholder="Date"
            rules="required"
            :modelValue="state.date"
          />
          <error-message class="error-message" name="date" />
        </field-label>
        <field-label name="Units" class="w-full sm:w-1/2" :isRequired="true">
          <v-field
            name="units"
            type="number"
            placeholder="Units"
            rules="required"
          />
          <error-message class="error-message" name="units" />
        </field-label>
        <field-label name="Cost" class="w-full sm:w-1/2" :isRequired="true">
          <v-field
            name="cost"
            type="number"
            placeholder="Cost"
            rules="required"
            v-model="state.cost"
          />
          <error-message class="error-message" name="rate" />
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
        <field-label name="GST Type" class="w-full">
          <v-field
            name="gstType"
            as="select"
            rules="required"
            v-model="state.gstType"
          >
            <option disabled value="">Select a GST type</option>
            <option :value="GstTypes.Gst">GST (10%)</option>
            <option :value="GstTypes.GstExport">GST Export (0%)</option>
            <option :value="GstTypes.GstBasExclude">BAS Excluded (0%)</option>
          </v-field>
          <error-message class="error-message" name="gstType" />
        </field-label>

        <field-label class="w-full" name="Description" :isRequired="true">
          <v-field
            name="description"
            as="textarea"
            placeholder="Description"
            rules="required"
            v-model="state.description"
          />
          <error-message class="error-message" name="description" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, watch } from "vue";

import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useStore } from "vuex";
import { fmtToLocalDate, toDateTime } from "@/composable/date";

import { Field as VField, ErrorMessage } from "vee-validate";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import StandardDisbursementSelectorField from "@/components/forms/selectors/StandardDisbursementSelectorField.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import { UserStore } from "@/store/modules/users";
import { MatterStore } from "@/store/modules/matters";
import { GstTypes, BillableTypes } from "@/network/dtos/enumTypes";
import { DisbursementInput } from "@/network/dtos/invoice-dto";
import { UserDto } from "@/network/dtos/user-dto";

interface CreateDisbursementValues {
  date: Date;
  units: 1;
  cost: number;
  description: string;
  staff: UserDto;
  gstType: number;
  billableType: number;
}

export default defineComponent({
  emits: ["close"],
  props: {
    matterId: Number
  },
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    StandardDisbursementSelectorField,
    FieldLabel,
    UserSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);

    const state = reactive({
      date: new Date(),
      cost: 0,
      description: "",
      gstType: GstTypes.Gst
    });

    watch(
      () => state.cost,
      (newVal, oldVal) => {
        console.log("Cost changed from", oldVal, "to", newVal);
      }
    );

    function submit(
      values: CreateDisbursementValues,
      { resetForm }: { resetForm: () => void }
    ) {
      store
        .dispatch(MatterStore.actions.CREATE_MATTER_DISBURSEMENT, {
          matterId: props.matterId,
          disbursement: new DisbursementInput({
            date: toDateTime(values.date)?.toUTC(),
            units: values.units,
            cost: values.cost,
            description: values.description,
            userId:
              values.staff == null ? currentUser.value.id : values.staff.id,
            gstType: values.gstType,
            billableType: values.billableType
          })
        })
        .then(() => {
          emit("close");
          resetForm();
        });
    }

    return {
      currentUser,
      GstTypes,
      BillableTypes,
      fmtToLocalDate,
      submit,
      state
    };
  }
});
</script>
