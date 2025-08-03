<template>
  <shad-modal-form
    :modalTitle="state.modalTitle"
    :modalDescription="state.modalDescription"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="submit"
    :isLoading="state.isLoading"
  >
    <Tabs :default-value="state.selectedTab" v-model="state.selectedTab">
      <div class="mx-auto w-10 flex items-center justify-center">
        <TabsList>
          <TabsTrigger
            value="sales"
            v-if="!props.projectId && !props.projectTaskId"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="matter"
            v-if="!props.projectId && !props.projectTaskId"
          >
            Matter
          </TabsTrigger>
          <TabsTrigger value="project" v-if="!props.matterId">
            Project
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent class="space-y-4" value="sales"> </TabsContent>

      <TabsContent class="space-y-4" value="matter"> </TabsContent>

      <TabsContent class="space-y-4" value="project"> </TabsContent>
    </Tabs>
    <div class="flex" v-if="state.selectedTab == 'sales'">
      <shad-form-field
        v-slot="{ componentField }"
        name="entity"
        v-if="!matterId"
      >
        <shad-form-item class="w-full" @click="onChange('Sales')">
          <shad-form-label :isRequired="true">Matter</shad-form-label>
          <shad-form-control>
            <matter-selector-field
              name="entity"
              rules="required"
              @updateValue="updateForm"
              @selected="getSelectedMatter"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex" v-if="state.selectedTab == 'matter'">
      <shad-form-field v-slot="{ componentField }" name="entity">
        <shad-form-item class="w-full" @click="onChange('Matter')">
          <shad-form-control>
            <matter-component-selector-field
              name="entity"
              rules="required"
              :column="true"
              :matterId="matterId"
              @emitSelectedMatter="getSelectedMatter"
              @updateValue="updateForm"
              @update:modelValue="getBillingRate"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex" v-if="state.selectedTab == 'project'">
      <shad-form-field
        v-slot="{ componentField }"
        name="entity"
        v-if="!projectTaskId"
      >
        <shad-form-item
          class="w-full flex flex-wrap"
          @click="onChange('Project')"
        >
          <shad-form-control>
            <project-task-selector-field
              name="entity"
              rules="required"
              :column="true"
              :projectId="props.projectId"
              @updateValue="updateForm"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="staff">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Staff</shad-form-label>
          <shad-form-control>
            <user-selector
              name="staff"
              :placeholder="currentUserFullName"
              v-model="state.staffUser"
              @selected="selectedStaff($event)"
              @update:modelValue="getBillingRate"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field name="date">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Date</shad-form-label>
          <date-field
            v-slot="{ componentField, value }"
            placeholder="Date"
            name="date"
            rules="required"
            :modelValue="state.date"
          />
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="units">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Units</shad-form-label>
          <shad-form-control>
            <shad-input
              type="number"
              placeholder="Units"
              v-bind="componentField"
              v-model="state.units"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="rate"
        v-if="state.selectedTab == 'sales' || state.selectedTab == 'matter'"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Rate (Hourly)
            <shad-badge
              v-if="state?.applyRateAdjustment"
              variant="destructive"
              class="ml-2"
            >
              Rate Change Applied
            </shad-badge>
          </shad-form-label>
          <shad-form-control>
            <shad-input
              type="number"
              placeholder="Rates"
              v-model="state.getRate"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-slot="{ componentField }"
        name="billableType"
        v-if="state.selectedTab == 'matter'"
        v-model="state.billableType"
      >
        <shad-form-item class="w-full mr-3">
          <shad-form-label :isRequired="true">Billable</shad-form-label>
          <shad-select v-bind="componentField" class="z-0">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Billable" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select a billable type</shad-select-label>
                <shad-select-item
                  :value="BillableTypes.Billable"
                  :disabled="state.getRate > 0 ? false : true"
                >
                  Billable
                </shad-select-item>
                <shad-select-item :value="BillableTypes.NonBillable">
                  Non Billable
                </shad-select-item>
                <shad-select-item :value="BillableTypes.NonChargeable">
                  Non Chargeable</shad-select-item
                >
                <shad-select-item :value="BillableTypes.ProBono">
                  Pro Bono
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>

          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="gstType"
        v-if="state.selectedTab == 'matter'"
      >
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">GST Type</shad-form-label>
          <shad-select v-bind="componentField" class="z-0">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="GST Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select a GST type</shad-select-label>

                <shad-select-item :value="GstTypes.Gst">
                  GST (10%)
                </shad-select-item>
                <shad-select-item :value="GstTypes.GstExport">
                  GST Export (0%)</shad-select-item
                >
                <shad-select-item :value="GstTypes.GstBasExclude">
                  BAS Excluded (0%)
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
              placeholder="Time entry description"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, reactive, watch } from "vue";

import { useStore } from "vuex";
import { toDateTime } from "@/composable/date";
import {
  TimeEntryTypes,
  GstTypes,
  BillableTypes
} from "@/network/dtos/enumTypes";
import { TimeEntryInput } from "@/network/dtos/time-entry-dto";
import { TimeEntryStore } from "@/store/modules/time-entries";

import ProjectTaskSelectorField from "@/components/forms/selectors/ProjectTaskSelectorField.vue";
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import MatterComponentSelectorField from "@/components/forms/selectors/MatterComponentSelectorField.vue";
import { UserStore } from "@/store/modules/users";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import { DateTime } from "luxon";
import { useNotify } from "@/composable/notify";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { ApiStore } from "@/store/utils";
import { MatterStore } from "@/store/modules/matters";
import { MatterDto } from "@/network/dtos/matter-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const { fireSuccessToast, fireErrorToast } = useNotify();

const baseSchema = {
  staff: z
    .object({
      id: z.number().optional()
    })
    .nullable(),
  date: z.date({ required_error: "Date is required" }),
  units: z
    .number({ required_error: "Units is required" })
    .min(1, "Units must be greater than 0"),
  description: z.string({ required_error: "Description is required" })
};
const salesSchema = {
  ...baseSchema,
  entity: z.object({ id: z.number().optional() }).nullable(),
  rate: z.number({ required_error: "Rate is required" }).optional()
};

const matterSchema = {
  ...baseSchema,
  entity: z.object({ id: z.number().optional() }).nullable(),
  rate: z.number({ required_error: "Rate is required" }).optional(),
  billableType: z.number({ required_error: "Billable Type is required" }),
  gstType: z.number({ required_error: "GST Type is required" })
};

const projectSchema = {
  ...baseSchema,
  entity: z.object({ id: z.number().optional() }).nullable()
};

const salesSchemaWithMatter = {
  ...baseSchema,
  rate: z.number({ required_error: "Rate is required" }).optional()
};

const dynamicSchema = computed(() => {
  switch (state.selectedTab) {
    case "sales":
      if (props.matterId != null) {
        return toTypedSchema(z.object(salesSchemaWithMatter));
      } else {
        return toTypedSchema(z.object(salesSchema));
      }
    case "matter":
      return toTypedSchema(z.object(matterSchema));
    case "project":
      if (props.projectTaskId != null) {
        return toTypedSchema(z.object(baseSchema));
      } else {
        return toTypedSchema(z.object(projectSchema));
      }
    default:
      return toTypedSchema(z.object(baseSchema));
  }
});

const props = defineProps<{
  column: Boolean;
  modal: Boolean;
  timeEntryType: {
    type: PropType<TimeEntryTypes>;
    required: false;
    default: TimeEntryTypes.MatterComponent;
  };
  entityId?: number;
  startDate?: PropType<DateTime | null>;
  endDate?: PropType<DateTime | null>;
  matterId?: number;
  outcomeId?: number;
  componentId?: number;
  projectId?: number;
  projectTaskId?: number;
  defaultSelectedTab: string;
}>();
const emit = defineEmits(["close"]);
const store = useStore();
const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);
const getStaffBillingRate = reactive({
  billingRate: currentUser.value.billingRate
});
const state = reactive({
  staffUser: null as UserListDto | null,
  userId: currentUser.value.id,
  getRate: getStaffBillingRate.billingRate,
  applyRateAdjustment: false,
  rateAdjustmentPercentage: 0,
  timeEntryType: "",
  units: 0,
  date: new Date(),
  description: "",
  billableType: BillableTypes.Billable,
  closeModel: false,
  isLoading: false,
  matter: null as MatterDto | null,
  selectedTab: "" as string,
  modalTitle: "",
  modalDescription: ""
});

const handleSubmit = useForm({
  validationSchema: dynamicSchema,
  initialValues: {
    rate: getStaffBillingRate.billingRate,
    units: 0,
    date: new Date(),
    staff: currentUser.value,
    gstType: GstTypes.Gst,
    billableType: BillableTypes.Billable
  }
});

const currentUserFullName =
  currentUser?.value.firstName + " " + currentUser?.value.lastName;

const formComponent = computed(() => (props.modal ? "modal-form" : "v-form"));

const matter = computed(() =>
  ApiStore.toData<MatterDto>(
    store.getters[MatterStore.getters.GET_MATTER](props.matterId)
  )
);

async function getBillingRate() {
  return await store
    .dispatch(UserStore.getters.GET_USER, {
      id:
        state.staffUser == undefined
          ? currentUser?.value.id
          : state.staffUser?.id
    })
    .then((values) => {
      if (props.matterId != null) {
        if (matter.value != null) {
          if (
            matter.value.applyRateAdjustment === true &&
            matter.value.rateAdjustmentPercentage != null
          ) {
            state.getRate = Math.ceil(
              values.billingRate *
                (1 + matter.value.rateAdjustmentPercentage / 100)
            );
            state.applyRateAdjustment = true;
          } else {
            state.getRate = values.billingRate;
          }
        } else {
          state.getRate = values.billingRate;
        }
      } else {
        if (state.applyRateAdjustment == true) {
          state.getRate = Math.ceil(
            values.billingRate * (1 + state.rateAdjustmentPercentage / 100)
          );
        } else {
          state.getRate = values.billingRate;
        }
      }
    });
}

function selectedStaff(user: UserListDto) {
  state.userId = user.id;
  getBillingRate();
}

function getSelectedMatter(param: MatterDto) {
  if (param != null) {
    if (param.applyRateAdjustment != null) {
      state.applyRateAdjustment = param.applyRateAdjustment;

      state.rateAdjustmentPercentage =
        param.rateAdjustmentPercentage != null
          ? param.rateAdjustmentPercentage
          : 0;
      getBillingRate();
    }
  } else {
    handleSubmit.resetField("entity");
    state.applyRateAdjustment = false;
    state.getRate = getStaffBillingRate.billingRate;
  }
}

const submit = handleSubmit.handleSubmit((values) => {
  let timeEntryType: any;
  let entityId: number | null;

  switch (state.selectedTab) {
    case "sales":
      if (props.matterId != null) {
        entityId = props.matterId;
      } else {
        entityId = props.entityId ?? values.entity.id;
      }
      state.timeEntryType = "Sales";
      break;
    case "matter":
      if (props.componentId != null) {
        entityId = props.componentId;
      } else {
        entityId = props.entityId ?? values.entity.id;
      }
      state.timeEntryType = "Matter";
      break;
    case "project":
      if (props.projectTaskId != null) {
        entityId = props.projectTaskId;
      } else {
        entityId = props.entityId ?? values.entity.id;
      }
      state.timeEntryType = "Project";
      break;
  }

  switch (state.timeEntryType) {
    case "Project":
      timeEntryType = 1;
      break;
    case "Sales":
      timeEntryType = 2;
      break;
    case "Matter":
      timeEntryType = 3;
      break;
    default:
      timeEntryType = 0;
  }

  if (entityId != null) {
    state.isLoading = true;
    store
      .dispatch(TimeEntryStore.actions.CREATE_TIME_ENTRY, {
        timeEntryType,
        input: new TimeEntryInput({
          entityId,
          date: toDateTime(values.date)?.toUTC(),
          units: state.units,
          rate: state.getRate,
          description: values.description,
          userId: state.userId,
          gstType: values.gstType,
          billableType: state.billableType
        })
      })
      .then(() => {
        emit("close");
        state.closeModel = true;

        fireSuccessToast("Time entry submitted.");

        handleSubmit.resetForm();
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
          store.dispatch(
            TimeEntryStore.getters.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT,
            {
              projectId: props.projectId || undefined,
              limit: 50,
              offset: 0,
              startDate: undefined,
              endDate: undefined,
              userId: currentUser.value.id
            }
          );
          if (props.projectTaskId != undefined) {
            store.dispatch(
              TimeEntryStore.getters.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT_TASK,
              {
                projectTaskId: props.projectTaskId || undefined,
                limit: 50,
                offset: 0,
                startDate: undefined,
                endDate: undefined
              }
            );
          }
        } else if (timeEntryType == 2) {
          store.dispatch(TimeEntryStore.getters.GET_SALES_TIME_ENTRIES, {
            limit: 50,
            offset: 0,
            startDate: props.startDate,
            endDate: props.endDate,
            userId: currentUser.value.id
          });
          store.dispatch(
            TimeEntryStore.getters.GET_SALES_TIME_ENTRIES_FOR_MATTER,
            {
              id: props.matterId || undefined,
              limit: 50,
              offset: 0,
              startDate: undefined,
              endDate: undefined,
              userId: currentUser.value.id
            }
          );
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
          store.dispatch(
            TimeEntryStore.getters.GET_MATTER_TIME_ENTRIES_FOR_MATTER,
            {
              id: props.matterId || undefined,
              limit: 50,
              offset: 0,
              startDate: undefined,
              endDate: undefined,
              invoiced: undefined,
              billableType: undefined,
              userId: currentUser.value.id
            }
          );
        }
        state.isLoading = false;
      });
  } else {
    () => {
      fireErrorToast("You haven't choose any of matter or project");
    };
  }
});

onMounted(() => currentUser);

onMounted(() => {
  state.selectedTab = props.defaultSelectedTab || "matter";
  updateModalDescription(state.selectedTab);
  getBillingRate();
});

let rateValue: any;

function updateModalDescription(newTab: string) {
  switch (newTab) {
    case "sales":
      state.modalTitle = "Record Sales Time";
      state.modalDescription =
        "You can add a sales time entry here. Please fill in the required fields and click on the confirm button to add the time entry.";
      break;
    case "matter":
      state.modalTitle = "Record Matter Time";
      state.modalDescription =
        "You can add a matter time entry here. Please fill in the required fields and click on the confirm button to add the time entry.";
      break;
    case "project":
      state.modalTitle = "Record Project Time";
      state.modalDescription =
        "You can add a project time entry here. Please fill in the required fields and click on the confirm button to add the time entry.";
      break;
    default:
      state.modalDescription =
        "You can add a time entry here. Please fill in the required fields and click on the confirm button to add the time entry.";
  }
}

watch(
  () => state.selectedTab,
  (newTab) => {
    updateModalDescription(newTab);
    handleSubmit.resetForm();
  }
);

watch(
  [() => (rateValue = state.getRate)],
  () => {
    if (rateValue == 0) state.billableType = BillableTypes.NonBillable;
    else if (rateValue == null) state.billableType = BillableTypes.Billable;
    else if (rateValue > 0) state.billableType = BillableTypes.Billable;
  },
  { immediate: true, deep: true }
);

watch(
  () => props.defaultSelectedTab,
  () => {
    state.selectedTab = props.defaultSelectedTab || "matter";
  }
);

function closeDialog(value: any) {
  state.closeModel = false;
  state.isLoading = false;
  state.selectedTab = props.defaultSelectedTab || "matter";
  state.description = "";
  state.date = new Date();
  state.units = 0;
}
function onChange(event: any) {
  state.timeEntryType = event;
}
function updateForm(value: any) {
  state.applyRateAdjustment = false;
  state.getRate = getStaffBillingRate.billingRate;
  state.staffUser = currentUser.value;
  handleSubmit.resetForm();
}
</script>
