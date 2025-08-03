<template>
  <modal-form
    class="flex flex-col bg-white"
    @cancel="$emit('close')"
    @submit="submit"
    :initial-values="{
      timeEntryType,
      date: fmtToLocalDate(new Date()),
      units: null,
      gstType: GstTypes.Gst
    }"
    v-slot="{ values }"
  >
    <template v-if="!entityId">
      <span class="mx-6 mb-3 flex items-center justify-center">
        <v-field name="timeEntryType" type="hidden" />

        <alp-button
          type="button"
          variant="inverse"
          :active="state.timeEntryType == TimeEntryTypes.Sales"
          class="mr-1 text-xs"
          @click="
            () => {
              state.timeEntryType = TimeEntryTypes.Sales;
              values.entityId = null;
              state.matterapplyRateAdjustment = null;
            }
          "
        >
          Sales
        </alp-button>
        <alp-button
          type="button"
          variant="inverse"
          :active="state.timeEntryType == TimeEntryTypes.MatterComponent"
          class="mx-1 text-xs"
          @click="
            () => {
              state.timeEntryType = TimeEntryTypes.MatterComponent;
              values.entityId = null;
            }
          "
        >
          Matter
        </alp-button>
        <alp-button
          type="button"
          variant="inverse"
          :active="state.timeEntryType == TimeEntryTypes.ProjectTask"
          class="ml-1 text-xs"
          @click="
            () => {
              state.timeEntryType = TimeEntryTypes.ProjectTask;
              values.entityId = null;
              state.matterapplyRateAdjustment = null;
            }
          "
        >
          Project
        </alp-button>
      </span>
      <div class="py-3 px-3 flex flex-wrap">
        <field-label
          v-if="state.timeEntryType == TimeEntryTypes.Sales"
          name="Matter"
          class="w-full"
          :isRequired="true"
        >
          <matter-selector-field name="entity" rules="required" />
        </field-label>
        <!-- Matter Selection for Matter Time Entry -->
        <matter-component-selector-field
          v-else-if="state.timeEntryType == TimeEntryTypes.MatterComponent"
          name="entity"
          rules="required"
          :column="column"
          @emitSelectedMatter="getSelectedMatter"
        />
        <project-task-selector-field
          v-else-if="state.timeEntryType == TimeEntryTypes.ProjectTask"
          name="entity"
          rules="required"
          :column="column"
        />
      </div>
    </template>

    <alp-form-container>
      <field-label class="w-full" name="Staff" :isRequired="true">
        <user-selector
          name="staff"
          :placeholder="currentUserFullName"
          v-model="state.staffUser"
          @selected="selectedStaff($event)"
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

      <!-- Rate and Billable for Matter Only -->

      <field-label
        name="Rate (Hourly)"
        class="w-full sm:w-1/2"
        v-if="
          state.timeEntryType === TimeEntryTypes.MatterComponent ||
          state.timeEntryType === TimeEntryTypes.Sales
        "
        labelColor="bg-green-600"
        :label="state.matterapplyRateAdjustment"
        :isRequired="true"
      >
        <v-field
          name="rate"
          type="number"
          placeholder="Rate"
          rules="required"
          v-model="state.getRate"
        />
        <error-message class="error-message" name="rate" />
      </field-label>
      <field-label
        name="Billable"
        class="w-full sm:w-1/2"
        v-if="state.timeEntryType == TimeEntryTypes.MatterComponent"
      >
        <v-field
          name="billableType"
          v-model="state.billableType"
          as="select"
          rules="required"
        >
          <option disabled value="">Select a billable type</option>
          <option
            :value="BillableTypes.Billable"
            :disabled="state.getRate > 0 ? false : true"
          >
            Billable
          </option>
          <option :value="BillableTypes.NonBillable">Non Billable</option>
          <option :value="BillableTypes.NonChargeable">Non Chargeable</option>
          <option :value="BillableTypes.ProBono">Pro Bono</option>
        </v-field>
        <error-message class="error-message" name="billableType" />
      </field-label>
      <field-label
        name="GST Type"
        class="w-full"
        v-if="state.timeEntryType == TimeEntryTypes.MatterComponent"
      >
        <v-field name="gstType" as="select" rules="required">
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
        />
        <error-message class="error-message" name="description" />
      </field-label>
    </alp-form-container>
  </modal-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  watch
} from "vue";

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
import ProjectTaskSelectorField from "@/components/forms/selectors/ProjectTaskSelectorField.vue";
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import MatterComponentSelectorField from "@/components/forms/selectors/MatterComponentSelectorField.vue";
import { UserStore } from "@/store/modules/users";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import { DateTime } from "luxon";
import { useNotify } from "@/composable/notify";
import { MatterDto } from "@/network/dtos/matter-dto";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["close"],
  props: {
    column: Boolean,
    modal: Boolean,
    timeEntryType: {
      type: Object as PropType<TimeEntryTypes>,
      default: TimeEntryTypes.MatterComponent
    },
    entityId: Number,
    startDate: Object as PropType<DateTime | null>,
    endDate: Object as PropType<DateTime | null>,
    matterId: Number,
    outcomeId: Number,
    componentId: Number
  },
  components: {
    ModalForm,
    VField,
    ErrorMessage,
    ProjectTaskSelectorField,
    MatterSelectorField,
    //MatterSelector,
    MatterComponentSelectorField,
    FieldLabel,
    UserSelector
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fireErrorToast } = useNotify();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);
    const getStaffBillingRate = reactive({
      billingRate: currentUser.value.billingRate
    });

    const currentUserFullName =
      currentUser?.value.firstName + " " + currentUser?.value.lastName;

    const formComponent = computed(() =>
      props.modal ? "modal-form" : "v-form"
    );

    const state = reactive({
      staffUser: null as UserListDto | null,
      userId: currentUser.value.id,
      getRate: getStaffBillingRate.billingRate,
      matterapplyRateAdjustment: "",
      applyRateAdjustment: false,
      rateAdjustmentPercentage: 0,
      timeEntryType: TimeEntryTypes.MatterComponent,
      billableType: BillableTypes.NonBillable
    });

    async function getBillingRate() {
      return await store
        .dispatch(UserStore.getters.GET_USER, {
          id:
            state.staffUser == undefined
              ? currentUser?.value.id
              : state.staffUser?.id
        })
        .then((values) => {
          if (state.applyRateAdjustment == true) {
            state.getRate = Math.ceil(
              values.billingRate * (1 + state.rateAdjustmentPercentage / 100)
            );
          } else {
            state.getRate = values.billingRate;
          }
        });
    }

    function selectedStaff(user: UserListDto) {
      state.userId = user.id;
      getBillingRate();
    }

    function getSelectedMatter(param: MatterDto) {
      if (state.timeEntryType == TimeEntryTypes.MatterComponent) {
        if (param.applyRateAdjustment != null) {
          state.applyRateAdjustment = param.applyRateAdjustment;

          state.rateAdjustmentPercentage =
            param.rateAdjustmentPercentage != null
              ? param.rateAdjustmentPercentage
              : 0;

          state.matterapplyRateAdjustment = param.applyRateAdjustment
            ? "Rate Changed (" + param.rateAdjustmentPercentage + " %)"
            : "";

          getBillingRate();
        } else {
          state.applyRateAdjustment = false;
        }
      }
    }

    function submit(values: any, { resetForm }: { resetForm: () => void }) {
      const entityId = props.entityId ?? values.entity.id;
      let timeEntryType = state.timeEntryType ?? props.timeEntryType;

      if (entityId != null) {
        store
          .dispatch(TimeEntryStore.actions.CREATE_TIME_ENTRY, {
            timeEntryType,
            input: new TimeEntryInput({
              entityId,
              date: toDateTime(values.date)?.toUTC(),
              units: values.units,
              rate: values.rate,
              description: values.description,
              userId: state.userId,
              gstType: values.gstType,
              billableType: state.billableType
            })
          })
          .then(() => {
            emit("close");
            resetForm();
            //store.commit(TimeEntryStore.mutations.SET_RESET_FILTER, true);
            store.commit(TimeEntryStore.getters.CREATE_COUNT);
            if (timeEntryType == 1) {
              store.dispatch(TimeEntryStore.getters.GET_PROJECT_TIME_ENTRIES, {
                limit: 50,
                offset: 0,
                startDate: props.startDate,
                endDate: props.endDate,
                userId: currentUser.value.id
              });
            } else if (timeEntryType == 2) {
              store.dispatch(TimeEntryStore.getters.GET_SALES_TIME_ENTRIES, {
                limit: 50,
                offset: 0,
                startDate: props.startDate,
                endDate: props.endDate,
                userId: currentUser.value.id
              });
            } else if (timeEntryType == 3) {
              store.dispatch(TimeEntryStore.getters.GET_MATTER_TIME_ENTRIES, {
                limit: 50,
                offset: 0,
                startDate: props.startDate,
                endDate: props.endDate,
                userId: currentUser.value.id
              });
              store.dispatch(
                TimeEntryStore.getters.GET_MATTER_COMPONENT_TIME_ENTRIES,
                {
                  limit: 50,
                  offset: 0,
                  matterId: props.matterId,
                  outcomeId: props.outcomeId,
                  componentId: props.componentId,
                  startDate: undefined,
                  endDate: undefined
                }
              );
            }
          });
      } else {
        () => {
          fireErrorToast("Invalidate input");
        };
      }
    }

    onMounted(() => currentUser);
    let rateValue: any;
    watch(
      [() => (rateValue = state.getRate)],
      () => {
        if (rateValue == 0) state.billableType = BillableTypes.NonBillable;
        else if (rateValue == null) state.billableType = BillableTypes.Billable;
        else if (rateValue > 0) state.billableType = BillableTypes.Billable;
      },
      { immediate: true, deep: true }
    );
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
      selectedStaff,

      getBillingRate,
      getStaffBillingRate,
      getSelectedMatter
    };
  }
});
</script>
