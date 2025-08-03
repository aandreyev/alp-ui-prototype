<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Project Routines Configuration'"
  >
    <modal-form
      @cancel="$emit('close')"
      @submit="createProjectTemplate"
      v-slot="{}"
      :initialValues="{ dueDate: new Date().toISOString().substr(0, 10) }"
    >
      <div class="pl-4">
        <label
          for="toggle-project-repeatable"
          class="flex relative items-center mb-2 cursor-pointer ml-2"
        >
          <input
            type="checkbox"
            id="toggle-project-repeatable"
            class="sr-only peer"
            v-model="project.Repeatable"
          />
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
          ></div>
          <span
            class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
            v-if="project.Repeatable"
            >Repeatable</span
          >
          <span
            class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
            v-else
            >Don't repeat</span
          >
        </label>
      </div>

      <alp-form-container v-if="project.Repeatable">
        <field-label
          class="w-1/2 sm:w-1/2"
          name="Initial date"
          :isRequired="true"
        >
          <date-field
            placeholder="Initial date"
            name="StartDate"
            v-model="project.StartDate"
          />
          <error-message
            class="error-message"
            name="Initial date was not setup"
          />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Last triggered date">
          <date-field
            name="LastTriggeredDate"
            v-model="project.LastTriggeredDate"
            disabled
          />
        </field-label>

        <field-label class="w-full sm:w-1/2" name="Every" :isRequired="true">
          <v-field
            type="number"
            min="1"
            placeholder="Repeat Frequency"
            name="repeatFrequency"
            v-model="project.RepeatFrequency"
          />
          <error-message class="error-message" name="repeatFrequency" />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Duration" :isRequired="true">
          <v-field
            as="select"
            name="repeatDate"
            v-model="project.WeekRepeatable"
          >
            <option value="" disabled>Repeat Date</option>
            <option
              v-for="option in TimeframeSchedules"
              :key="option.value"
              :value="option.value"
            >
              {{ option.key }}
            </option>
          </v-field>

          <error-message class="error-message" name="repeatDate" />
        </field-label>
      </alp-form-container>
      <div
        class="flex justify-center"
        v-if="project.Repeatable && project.WeekRepeatable == 2"
      >
        <div class="flex">
          <table id="table">
            <thead class="table-header">
              <tr>
                <th>SUN</th>
                <th>MON</th>
                <th>TUE</th>
                <th>WED</th>
                <th>THU</th>
                <th>FRI</th>
                <th>SAT</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr class="table-row">
                <input type="checkbox" class="hidden" />
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.sundayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.mondayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.tuesdayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.wednesdayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.thursdayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.fridayOption"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    v-model="daySchedule.value.saturdayOption"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";

import DateInput from "@/components/inputs/DateInput.vue";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useEnum } from "@/composable/enum";
import {
  fmtToLocalDatetimeForScheduler,
  toDateTime,
  fmtToLocalISO
} from "@/composable/date";
import { ApiStore } from "@/store/utils";
import { DateTime } from "luxon";
import { TimeframeSchedule } from "@/network/dtos/enumTypes";
import {
  DaySchedule,
  ProjectTemplateSchedulerDto,
  ProjectTemplateSchedulerInput
} from "@/network/dtos/project-dto";

interface ProjectTemplateValues {
  startDate: DateTime;
  lastTriggeredDate?: DateTime;
  repeatFrequency: number;
  repeatDate: TimeframeSchedule;
}

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
  emits: ["created", "close"],
  components: {
    DateInput,
    Modal,
    ModalForm,
    VField,
    FieldLabel,
    ErrorMessage
  },
  setup(props, { emit }) {
    const project = reactive({
      Repeatable: false,
      WeekRepeatable: 0,
      StartDate: "",
      LastTriggeredDate: "",
      RepeatFrequency: 0
    });

    const store = useStore();

    let daySchedule = {
      value: new DaySchedule()
    };

    const { toDropdownOptions: toTimeframeSchedule } =
      useEnum(TimeframeSchedule);
    const TimeframeSchedules = toTimeframeSchedule();

    const projectTemplateScheduler = computed(() =>
      ApiStore.toData<ProjectTemplateSchedulerDto>(
        store.getters[
          ProjectTemplateStore.getters.GET_PROJECT_TEMPLATE_SCHEDULER
        ](props.id)
      )
    );

    function fetchProjectTemplateScheduler() {
      store
        .dispatch(ProjectTemplateStore.actions.GET_PROJECT_TEMPLATE_SCHEDULER, {
          id: props.id
        })
        .then(
          (values) => (
            (project.Repeatable = values.repeatable),
            (project.WeekRepeatable = values.repeatDate),
            (project.StartDate = fmtToLocalISO(
              DateTime.fromISO(values.startDate.toString(), {
                zone: "UTC"
              })
            )),
            (project.LastTriggeredDate = fmtToLocalISO(
              DateTime.fromISO(values.lastTriggeredDate?.toString(), {
                zone: "UTC"
              })
            )),
            (project.RepeatFrequency = values.repeatFrequency),
            (daySchedule.value = values.daySchedule)
          )
        );
    }

    onMounted(fetchProjectTemplateScheduler);

    function createProjectTemplate(values: ProjectTemplateValues) {
      const scheduler = ProjectTemplateSchedulerInput.fromJS({
        templateId: props.id,
        repeatable: project.Repeatable,
        startDate: toDateTime(project.StartDate)?.toUTC(),
        repeatFrequency: values.repeatFrequency,
        repeatDate: values.repeatDate,
        daySchedule: daySchedule.value
      });

      if (project.Repeatable && values.repeatFrequency <= 0) {
        scheduler.repeatFrequency = 1;
      }
      store
        .dispatch(
          ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE_SCHEDULER,
          {
            id: props.id,
            scheduler: scheduler
          }
        )
        .then((scheduler) => {
          emit("created", scheduler);
          emit("close");
        });
      // if (values.owner.id) {
      //   store
      //     .dispatch(
      //       ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE,
      //       new ProjectTemplateInput({
      //         name: values.name,
      //         ownerId: values.owner.id,
      //         businessAreaId: values.businessArea?.id
      //       })
      //     )
      //     .then((project) => {
      //       emit("created", project);
      //       emit("close");
      //     });
      // }
    }

    return {
      projectTemplateScheduler,
      TimeframeSchedules,
      daySchedule,
      project,
      createProjectTemplate,
      fmtToLocalDatetimeForScheduler
    };
  }
});
</script>
