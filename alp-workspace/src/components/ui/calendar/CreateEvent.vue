<template>
  <shad-modal-form
    :modalTitle="props.matterId ? 'Create Matter Critical Date Event' : 'Create Event'"
    modalDescription=""
    @submitValue="createEvent"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField, value }" name="title">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Title</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Title"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="calendarId">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Select Calendar</shad-form-label>
          <shad-select
            v-bind="componentField"
            v-model="state.selectedCalendarId"
            class="z-10"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Select Calendar" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Available Calendars</shad-select-label>
                <shad-select-item
                  v-for="calendar in state.calendars"
                  :key="calendar.id"
                  :value="calendar.id"
                >
                  <div class="flex items-center gap-2">
                    {{ calendar.name }}
                  </div>
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex" v-if="!state.isAllDay">
      <shad-form-field v-slot="{ componentField }" name="timeSlot">
        <shad-form-item class="w-full">
          <shad-form-label>Time Slot</shad-form-label>
          <shad-select
            v-bind="componentField"
            class="z-0"
            v-model="selectedTimeSlot"
            @update:modelValue="onChange($event)"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Time Slot" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Time Slot</shad-select-label>

                <shad-select-item default value="15">
                  15 mins
                </shad-select-item>
                <shad-select-item value="30"> 30 mins</shad-select-item>
                <shad-select-item value="45"> 45 mins </shad-select-item>
                <shad-select-item value="60">60 mins</shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>

          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex gap-3">
      <shad-form-field name="startDate">
        <shad-form-item class="w-2/3">
          <shad-form-label class="mr-3 w-full inline-block"
            >Start Time</shad-form-label
          >
          <shad-form-control>
            <DateTimePicker
              v-model="state.dayDate"
              :isAllDay="state.isAllDay"
              @updateDate="updateDate('start', $event)"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field name="endDate">
        <shad-form-item class="w-2/3">
          <shad-form-label class="mr-3 w-full inline-block"
            >End Time</shad-form-label
          >
          <shad-form-control>
            <DateTimePicker
              v-model="state.endTime"
              :isAllDay="state.isAllDay"
              @updateDate="updateDate('end', $event)"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ value, handleChange }" name="isAllDay">
        <shad-form-item
          class="w-1/1 flex gap-3 flex-nowrap items-center pt-[38px]"
        >
          <shad-form-control class="">
            <Switch
              :checked="value"
              @update:checked="(val) => handleSwitchChange(val, handleChange)"
            />
            <shad-form-label class="!m-0 whitespace-nowrap"
              >All day</shad-form-label
            >
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>
<script setup lang="ts">
import DateTimePicker from "@/components/common/layout/DateTime/DateTimePicker.vue";
import { reactive, ref, watch, onMounted } from "vue";
import { useForm } from "vee-validate";
import {
  CalendarServiceProxy
} from "@/network/accounts-service-proxies";
import { CalendarEventDto } from "@/network/dtos/calendar-dto";

import { DateTime } from "luxon";
import store from "@/store";
import { ModalStore } from "@/store/modules/modals";
import { useNotify } from "@/composable/notify";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Switch } from "@/lib/registry/new-york/ui/switch";
import { CalendarDto, CalendarGroupWithCalendarsDto } from "@/store/modules/calendar";
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectGroup as ShadSelectGroup,
  SelectItem as ShadSelectItem,
  SelectLabel as ShadSelectLabel,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/lib/registry/new-york/ui/select";

const eventFormSchema = toTypedSchema(
  z.object({
    title: z
      .string({ required_error: "Title is required" })
      .nonempty({ message: "Title is required" }),
    isAllDay: z.boolean().default(false).optional(),
    calendarId: z.string({ required_error: "Calendar is required" })
      .nonempty({ message: "Calendar is required" })
  })
);
const { fireWarningToast } = useNotify();

const props = defineProps<{
  dayDate: any;
  matterId?: string;
}>();
const state = reactive({
  dayDate: props.dayDate ? new Date(props.dayDate) : new Date(),
  endTime: DateTime.local().plus({ minutes: 15 }).toJSDate(),
  startDate: new Date(),
  endDate: new Date(),
  closeModel: false,
  isLoading: false,
  isAllDay: false,
  calendars: [] as CalendarDto[],
  selectedCalendarId: "",
  title: props.matterId ? `[${props.matterId}] - ` : ""
});
let selectedTimeSlot = ref("15");
const handleSubmit = useForm({
  validationSchema: eventFormSchema,
  initialValues: {
    title: state.title,
    isAllDay: false
  }
});

async function fetchCalendars() {
  try {
    const response = await new CalendarServiceProxy().getCalendarGroupWithCalendars();
    const allCalendars: CalendarDto[] = [];
    if (Array.isArray(response)) {
      response.forEach((group: CalendarGroupWithCalendarsDto) => {
        if (group.calendars && Array.isArray(group.calendars)) {
          allCalendars.push(...group.calendars);
        }
      });
      state.calendars = allCalendars;
      
      // If matterId is present, select Critical Date calendar if available
      if (props.matterId) {
        const criticalDateCalendar = allCalendars.find(cal => cal.name === 'Critical Dates');
        if (criticalDateCalendar) {
          state.selectedCalendarId = criticalDateCalendar.id;
        } else if (allCalendars.length > 0) {
          state.selectedCalendarId = allCalendars[0].id;
        }
      } else if (allCalendars.length > 0) {
        state.selectedCalendarId = allCalendars[0].id;
      }
    }
  } catch (error) {
    console.error('Error fetching calendars:', error);
  }
}

onMounted(() => {
  fetchCalendars();
});

const createEvent = handleSubmit.handleSubmit((values) => {
  let eventTitle = values.title;
  const matterPrefix = props.matterId ? `[${props.matterId}] - ` : "";
  
  if (props.matterId && !eventTitle.startsWith(matterPrefix)) {
    eventTitle = matterPrefix + eventTitle;
  }

  if (state.startDate.getFullYear() === 1970) {
    fireWarningToast("Start Date is required");
    return;
  }
  if (state.endDate.getFullYear() === 1970) {
    fireWarningToast("End Date is required");
    return;
  }
  if (state.endDate < state.startDate) {
    fireWarningToast("End Date cannot be smaller than Start Date");
    return;
  }
  state.isLoading = true;
  if (values.isAllDay) {
    state.startDate.setHours(0, 0, 0, 0);
    state.endDate.setHours(23, 59, 59, 999);
  } else {
    state.startDate?.setSeconds(0);
    state.endDate?.setSeconds(0);
    state.startDate?.setMilliseconds(0);
    state.endDate?.setMilliseconds(0);
  }

  const calendarEvent = new CalendarEventDto({
    subject: eventTitle,
    isAllDay: values.isAllDay,
    startTime: state.isAllDay
      ? DateTime.fromJSDate(state.startDate)
          .setZone("local")
          .startOf("day")
          .setZone("UTC", { keepLocalTime: true })
      : DateTime.fromJSDate(state.startDate),
    endTime: state.isAllDay
      ? DateTime.fromJSDate(state.endDate)
          .setZone("local")
          .startOf("day")
          .plus({ days: 1 })
          .setZone("UTC", { keepLocalTime: true })
      : DateTime.fromJSDate(state.endDate)
  });

  new CalendarServiceProxy()
    .createCalendarEventByCalendarId(state.selectedCalendarId, calendarEvent)
    .then(() => {
      (state.dayDate = props.dayDate ? new Date(props.dayDate) : new Date()),
        (state.endTime = DateTime.local().plus({ minutes: 15 }).toJSDate());
      selectedTimeSlot = ref("15");
      state.closeModel = true;
      state.isLoading = false;
      store.commit(ModalStore.mutations.SET_EVENTS_UPDATE_MODAL, true);
      state.isAllDay = false;
    });
});
function closeDialog() {
  (state.dayDate = props.dayDate ? new Date(props.dayDate) : new Date()),
    (state.endTime = DateTime.local().plus({ minutes: 15 }).toJSDate());
  selectedTimeSlot = ref("15");
  state.closeModel = false;
  state.isLoading = false;
  state.isAllDay = false;
  state.title = props.matterId ? `[${props.matterId}] - ` : "";
}
let modalValue: any;
watch(
  [() => (modalValue = store.getters[ModalStore.getters.GET_MODAL_VALUE])],
  () => {
    if (modalValue) {
      state.startDate = new Date();
      state.endDate = new Date();
      state.dayDate = props.dayDate;
      
      // Reset the title with the matter ID prefix if available
      state.title = props.matterId ? `[${props.matterId}] - ` : "";
      
      // Reset the form values
      handleSubmit.resetForm({
        values: {
          title: state.title,
          isAllDay: false,
          calendarId: state.selectedCalendarId
        }
      });
    }
  },
  { immediate: true, deep: true }
);
function updateDate(dateInput: string, value: any) {
  if (dateInput == "start") state.startDate = new Date(value);
  else if (dateInput == "end") state.endDate = new Date(value);
}
watch(
  () => props.dayDate,
  (newDayDate) => {
    if (newDayDate) {
      const currentEndTime = DateTime.fromJSDate(newDayDate);
      state.endTime = currentEndTime.plus({ minutes: 15 }).toJSDate();
    } else {
      state.endTime = DateTime.local().plus({ minutes: 15 }).toJSDate();
    }
  },
  { immediate: true, deep: true }
);
function onChange(time: string) {
  state.endTime = state.dayDate;
  const currentEndTime = DateTime.fromJSDate(state.endTime);
  
  // Convert string to number for calculation
  state.endTime = currentEndTime.plus({ minutes: parseInt(time) }).toJSDate();
}
function handleSwitchChange(val: any, handleChange: any) {
  state.isAllDay = val;
  handleChange(val);
}
</script>
