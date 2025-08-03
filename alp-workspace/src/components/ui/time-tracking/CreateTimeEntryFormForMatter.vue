<template>
  <modal-form
    class="flex flex-col bg-white"
    @cancel="$emit('close')"
    @submit="submit"
    :initial-values="{
      timeEntryType:
        state.selectedType == 'sales'
          ? TimeEntryTypes.Sales
          : TimeEntryTypes.MatterComponent,
      date: fmtToLocalDate(new Date()),
      units: null,
      rate: getCurrentUserRate(),
      //billableType: BillableTypes.Billable,
      gstType: GstTypes.Gst
    }"
    v-slot="{ values }"
  >
    <span class="mx-6 flex items-center justify-center">
      <v-field name="timeEntryType" type="hidden" />

      <!-- Sales Time Entry  -->

      <alp-button
        type="button"
        variant="inverse"
        :active="state.timeEntryType == TimeEntryTypes.Sales"
        class="mr-1 text-xs"
        @click="
          () => {
            state.timeEntryType = TimeEntryTypes.Sales;
            state.entityId = null;
          }
        "
      >
        Sales
      </alp-button>

      <!-- Matter Time Entry       -->

      <alp-button
        type="button"
        variant="inverse"
        :active="state.timeEntryType == TimeEntryTypes.MatterComponent"
        class="mx-1 text-xs"
        @click="
          () => {
            state.timeEntryType = TimeEntryTypes.MatterComponent;
            state.entityId = null;
          }
        "
      >
        Matter
      </alp-button>
    </span>

    <div
      v-if="state.timeEntryType == TimeEntryTypes.MatterComponent"
      class="flex flex-wrap py-3 px-3"
    >
      <matter-component-selector-field
        name="entity"
        rules="required"
        :matterId="matterId"
        :column="column"
      />
    </div>

    <alp-form-container>
      <field-label class="w-full" name="Staff" :isRequired="true">
        <user-selector
          name="staff"
          :placeholder="currentUserFullName"
          v-model="state.selectedUser[0]"
          @update:modelValue="getBillingRate"
        />
      </field-label>
      <field-label name="Date" class="w-full sm:w-1/2" :isRequired="true">
        <date-field name="date" placeholder="Date" rules="required" />
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
      <field-label
        name="Rate (Hourly)"
        labelColor="bg-green-600"
        :label="state.matterapplyRateAdjustment"
        class="w-1/2 sm:w-1/2"
        :isRequired="true"
      >
        <v-field
          name="rate"
          type="number"
          placeholder="Rate"
          rules="required"
          v-model="state.billingRate"
        />
        <error-message class="error-message" name="rate" />
      </field-label>
      <template v-if="state.timeEntryType == TimeEntryTypes.MatterComponent">
        <field-label name="Billable" class="w-full sm:w-1/2" :isRequired="true">
          <v-field
            name="billableType"
            v-model="state.billableType"
            as="select"
            rules="required"
          >
            <option disabled value="">Select a billable type</option>
            <option
              :value="BillableTypes.Billable"
              :disabled="state.billingRate > 0 ? false : true"
            >
              Billable
            </option>
            <option :value="BillableTypes.NonBillable">Non Billable</option>
            <option :value="BillableTypes.NonChargeable">Non Chargeable</option>
            <option :value="BillableTypes.ProBono">Pro Bono</option>
          </v-field>
          <error-message class="error-message" name="billableType" />
        </field-label>
        <field-label name="GST Type" class="w-full" :isRequired="true">
          <v-field name="gstType" as="select" rules="required">
            <option disabled value="">Select a GST type</option>
            <option :value="GstTypes.Gst">GST (10%)</option>
            <option :value="GstTypes.GstExport">GST Export (0%)</option>
            <option :value="GstTypes.GstBasExclude">BAS Excluded (0%)</option>
          </v-field>
          <error-message class="error-message" name="gstType" />
        </field-label>
      </template>

      <field-label class="w-full" name="Description" :isRequired="true">
        <v-field
          name="description"
          as="textarea"
          placeholder="Description"
          rules="required"
        />
        <error-message class="error-message" name="description" />
      </field-label>
    </alp-form-container>
  </modal-form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, watch } from "vue";

import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useStore } from "vuex";
import { fmtToLocalDate, toDateTime } from "@/composable/date";
import {
  TimeEntryTypes,
  GstTypes,
  BillableTypes
} from "@/network/dtos/enumTypes";
import { TimeEntryInput } from "@/network/dtos/time-entry-dto";
import { TimeEntryStore } from "@/store/modules/time-entries";

import { Field as VField, ErrorMessage } from "vee-validate";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import MatterComponentSelectorField from "@/components/forms/selectors/MatterComponentSelectorField.vue";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import { UserStore } from "@/store/modules/users";

import { ApiStore } from "@/store/utils";

import { MatterStore } from "@/store/modules/matters";
import { MatterDto } from "@/network/dtos/matter-dto";
import { UserDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["updated", "close"],
  props: {
    column: Boolean,
    modal: Boolean,
    matterId: Number,
    selectedType: String,
    startDate: Date,
    endDate: Date
  },
  components: {
    ModalForm,
    VField,
    ErrorMessage,
    MatterComponentSelectorField,
    FieldLabel,
    UserSelector
  },
  setup(props, { emit }) {
    const store = useStore();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);

    const matter = computed(() =>
      ApiStore.toData<MatterDto>(
        store.getters[MatterStore.getters.GET_MATTER](props.matterId)
      )
    );

    const currentUserFullName =
      currentUser?.value.firstName + " " + currentUser?.value.lastName;

    const formComponent = computed(() =>
      props.modal ? "modal-form" : "v-form"
    );

    const state = reactive({
      selectedUser: [] as UserDto[],
      userId: currentUser.value.id,
      getRate: currentUser.value.ra,
      matterapplyRateAdjustment: matter.value?.applyRateAdjustment
        ? "Rate Changed (" + matter.value?.rateAdjustmentPercentage + " %)"
        : "",
      selectedType: props.selectedType,
      billableType: BillableTypes.Billable,
      timeEntryType: TimeEntryTypes.Sales,
      entityId: null as number | null,
      billingRate: 0
    });

    let rateValue: any;
    watch(
      [() => (rateValue = state.billingRate)],
      () => {
        if (rateValue == 0) state.billableType = BillableTypes.NonBillable;
        else if (rateValue == null) state.billableType = BillableTypes.Billable;
        else if (rateValue > 0) state.billableType = BillableTypes.Billable;
      },
      { immediate: true, deep: true }
    );

    function getCurrentUserRate() {
      if (matter.value != null) {
        if (
          matter.value.applyRateAdjustment == true &&
          matter.value.rateAdjustmentPercentage != null
        ) {
          state.billingRate = Math.ceil(
            currentUser.value.billingRate *
              (1 + matter.value.rateAdjustmentPercentage / 100)
          );
        } else {
          state.billingRate = currentUser.value.billingRate;
        }
      } else {
        state.billingRate = currentUser.value.billingRate;
      }
    }

    async function getBillingRate() {
      state.userId = state.selectedUser[0].id;
      return await store
        .dispatch(UserStore.getters.GET_USER, {
          id: state.selectedUser[0].id
        })
        .then((values) => {
          if (matter.value != null) {
            if (
              matter.value.applyRateAdjustment === true &&
              matter.value.rateAdjustmentPercentage != null
            ) {
              state.billingRate = Math.ceil(
                values.billingRate *
                  (1 + matter.value.rateAdjustmentPercentage / 100)
              );
            } else {
              state.billingRate = values.billingRate;
            }
          } else {
            state.billingRate = values.billingRate;
          }
        });
    }

    function submit(values: any, { resetForm }: { resetForm: () => void }) {
      let entityId = values.entity?.id;

      if (state.timeEntryType == TimeEntryTypes.Sales) {
        entityId = props.matterId;
      }
      store
        .dispatch(TimeEntryStore.actions.CREATE_TIME_ENTRY, {
          timeEntryType: state.timeEntryType,
          input: TimeEntryInput.fromJS({
            entityId,
            date: toDateTime(values.date)?.toUTC(),
            units: values.units,
            rate: values.rate,
            description: values.description,
            userId: state.userId, //values.staff?.id,
            gstType: values.gstType,
            billableType: state.billableType
          })
        })
        .then(() => {
          emit("close");
          emit("updated");
          resetForm();
        })
        .then(() =>
          store.dispatch(
            TimeEntryStore.getters.GET_MATTER_TIME_ENTRIES_FOR_MATTER,
            {
              id: props.matterId,
              limit: 50,
              offset: 0,
              startDate: props.startDate,
              endDate: props.endDate
            }
          )
        )
        .then(() => {
          resetForm();
        })
        .then(() =>
          store.dispatch(
            TimeEntryStore.getters.GET_SALES_TIME_ENTRIES_FOR_MATTER,
            {
              id: props.matterId,
              limit: 50,
              offset: 0,
              startDate: props.startDate,
              endDate: props.endDate
            }
          )
        )
        .then(() => {
          resetForm();
        });
    }

    watch(
      () => props.selectedType,
      () => {
        console.log();
      }
    );

    onMounted(() => currentUser);

    return {
      currentUser,
      currentUserFullName,
      formComponent,
      TimeEntryTypes,
      GstTypes,
      BillableTypes,
      fmtToLocalDate,
      submit,
      state,
      getBillingRate,
      matter,
      getCurrentUserRate
    };
  }
});
</script>
