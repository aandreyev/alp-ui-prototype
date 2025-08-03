<template>
  <modal-form
    class="flex flex-col bg-white"
    @cancel="$emit('close')"
    @submit="submit"
    :initial-values="{
      timeEntryType: TimeEntryTypes.ProjectTask,
      date: fmtToLocalDate(new Date()),
      units: null
    }"
    v-slot="{ values }"
  >
    <span class="mx-6 flex items-center justify-center">
      <v-field name="timeEntryType" type="hidden" />

      <alp-button
        type="button"
        variant="inverse"
        :active="values.timeEntryType == TimeEntryTypes.ProjectTask"
        class="mr-1 text-xs"
        @click="
          () => {
            values.timeEntryType = TimeEntryTypes.ProjectTask;
            values.entityId = null;
          }
        "
      >
        Project
      </alp-button>
    </span>

    <div
      v-if="values.timeEntryType == TimeEntryTypes.ProjectTask"
      class="flex flex-wrap py-3 px-3 mt-3 mb-3"
    >
      <project-task-selector-field
        name="entity"
        rules="required"
        :column="true"
        :projectId="projectId"
      />
    </div>

    <alp-form-container>
      <field-label class="w-full" name="Staff">
        <user-selector
          name="staff"
          :placeholder="currentUserFullName"
          v-model="state.selectedUser[0]"
          @update:modelValue="updateUser"
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
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import { UserStore } from "@/store/modules/users";
import { offset } from "@popperjs/core";

import { ApiStore } from "@/store/utils";

import { MatterStore } from "@/store/modules/matters";
import { MatterDto } from "@/network/dtos/matter-dto";
import { UserDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["updated", "close"],
  props: {
    column: Boolean,
    modal: Boolean,
    projectId: Number,
    selectedType: String,
    startDate: Date,
    endDate: Date,
    userId: Number
  },
  components: {
    ModalForm,
    VField,
    ErrorMessage,
    ProjectTaskSelectorField,
    FieldLabel,
    UserSelector
  },
  setup(props, { emit }) {
    const store = useStore();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);

    const matter = computed(() =>
      ApiStore.toData<MatterDto>(
        store.getters[MatterStore.getters.GET_MATTER](props.projectId)
      )
    );

    const currentUserFullName =
      currentUser?.value.firstName + " " + currentUser?.value.lastName;

    const formComponent = computed(() =>
      props.modal ? "modal-form" : "v-form"
    );

    async function updateUser() {
      state.userId = state.selectedUser[0].id;
    }

    const state = reactive({
      selectedUser: [] as UserDto[],
      userId: currentUser.value.id,
      getRate: currentUser.value.ra,
      matterapplyRateAdjustment: matter.value?.applyRateAdjustment
        ? "Rate Changed (" + matter.value?.rateAdjustmentPercentage + " %)"
        : "",
      selectedType: props.selectedType
    });

    function submit(values: any, { resetForm }: { resetForm: () => void }) {
      let entityId = values.entity?.id;
      let timeEntryType = values.timeEntryType;
      if (timeEntryType == TimeEntryTypes.Sales) {
        entityId = props.projectId;
      }
      store
        .dispatch(TimeEntryStore.actions.CREATE_TIME_ENTRY, {
          timeEntryType,
          input: TimeEntryInput.fromJS({
            entityId,
            date: toDateTime(values.date)?.toUTC(),
            units: values.units,
            description: values.description,
            userId: state.userId
          })
        })
        .then(() => {
          emit("close");
          emit("updated");
          resetForm();
        })
        .then(() =>
          store.dispatch(
            TimeEntryStore.getters.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT,
            {
              projectId: props.projectId,
              limit: 50,
              offset: 0,
              startDate: props.startDate,
              endDate: props.endDate
              // userId: props.userId
            }
          )
        )
        .then(() => {
          resetForm();
        })
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
      matter,
      updateUser
    };
  }
});
</script>
