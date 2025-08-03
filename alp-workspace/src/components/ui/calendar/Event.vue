<template>
  <span v-if="event">
    <div class="grid gap-4">
      <div class="space-y-2">
        <h4 class="font-medium leading-none">Event Information</h4>
        <p class="text-sm text-muted-foreground">Update your calendar Event.</p>
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <shad-label :isRequired="true">Title</shad-label>
          <inline-shad-input
            type="text"
            class="outline-none text-gray-400 text-sm"
            v-model="state.event.title"
            @blur="validateTitle"
            @input="handleTitleInput"
          />
          <span v-if="validationErrors.title" class="text-red-500 text-sm">
            {{ validationErrors.title }}
          </span>
        </div>
      </div>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <shad-label>Location</shad-label>
          <inline-shad-input
            type="text"
            class="outline-none text-gray-400 text-sm"
            v-model="state.event.location"
            placeholder="Location"
            :disabled="true"
          />
        </div>
      </div>
      <div class="grid gap-4">
        <div class="grid col-span-2">
          <shad-form-field
            v-slot="{ componentField }"
            name="timeSlot"
            v-if="!state.event.isAllDay"
          >
            <shad-form-item class="w-full">
              <shad-form-label>Time Slot</shad-form-label>
              <shad-select
                v-bind="componentField"
                class="z-0"
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

                    <shad-select-item default :value="15">
                      15 mins
                    </shad-select-item>
                    <shad-select-item :value="30"> 30 mins</shad-select-item>
                    <shad-select-item :value="45"> 45 mins </shad-select-item>
                    <shad-select-item :value="60">60 mins</shad-select-item>
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>

        <shad-form-field name="startDate">
          <shad-form-item>
            <shad-form-label>Start Time</shad-form-label>
            <shad-form-control>
              <DateTimePicker
                v-model="state.event.start"
                :isAllDay="state.event.isAllDay"
                :disabled="false"
                @updateDate="updateDate('start', $event)"
              />
            </shad-form-control>
          </shad-form-item>
        </shad-form-field>

        <shad-form-field name="endDate">
          <shad-form-item>
            <shad-form-label>End Time</shad-form-label>
            <shad-form-control>
              <DateTimePicker
                v-model="state.event.end"
                :isAllDay="state.event.isAllDay"
                :disabled="false"
                @updateDate="updateDate('end', $event)"
              />
            </shad-form-control>
          </shad-form-item>
        </shad-form-field>

        <shad-form-field name="isAllDay">
          <shad-form-item class="flex items-center gap-2">
            <shad-form-control>
              <Switch
                :checked="state.event.isAllDay"
                @update:checked="(val) => handleSwitchChange(val, state.event)"
              />
            </shad-form-control>
            <shad-form-label class="!m-0">All day</shad-form-label>
          </shad-form-item>
        </shad-form-field>
      </div>
    </div>

    <div class="h-1/2 flex flex-col bg-white min-h-0 max-w-2xl pt-10">
      <div class="flex flex-wapper gap-3 justify-between">
        <div class="flex">
          <shad-button variant="destructive" @click="deleteEvent(event)"
            >Delete
          </shad-button>
        </div>

        <div class="flex justify-center space-x-2">
          <shad-button variant="ghost" @click.stop="closeEventPopover(event)"
            >Close
          </shad-button>
          <shad-button variant="outline" @click="submitEventTime(event)"
            >Record my time
          </shad-button>
        </div>
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
import DateTimePicker from "@/components/common/layout/DateTime/DateTimePicker.vue";
import {
  CalendarServiceProxy
} from "@/network/accounts-service-proxies";
import { CalendarEventDto } from "@/network/dtos/calendar-dto";
import store from "@/store";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { reactive, ref, watch } from "vue";
import { DateTime } from "luxon";
import { useNotify } from "@/composable/notify";
import { Switch } from "@/lib/registry/new-york/ui/switch";

const props = defineProps<{
  event: any;
}>();
const isOpen = ref(true);

const showEventModel = () => {
  isOpen.value = true;
};
const isPopoverVisible = ref(true);
const emit = defineEmits([
  "close",
  "updateEvent",
  "updateEventValue",
  "closePopover"
]);
const state = reactive({
  event: { ...props.event },
  updateEvent: true,
  startDate: new Date(),
  endDate: new Date()
});
const validationErrors = reactive({
  title: ""
});
function validateTitle() {
  if (!state.event.title) {
    validationErrors.title = "Title is required";
  } else {
    validationErrors.title = "";
  }
}
let eventOriginalState = { ...props.event };
function deleteEvent(event: any) {
  new CalendarServiceProxy().deleteCalendarEvent(event.id).then(() => {
    emit("close");
    emit("updateEvent", event);
    store.commit(ModalStore.mutations.SET_EVENTS_UPDATE_MODAL, true);
  });
}
function closeEventPopover(event: any) {
  emit("closePopover", event);
}
function clearTitleError() {
  if (validationErrors.title) {
    validationErrors.title = "";
  }
}
const { fireWarningToast, fireSuccessToast, fireErrorToast } = useNotify();
function updateEvent() {
  validateTitle();
  if (validationErrors.title) {
    return;
  }
  if (state.event.title == "") {
    fireErrorToast("Title is required");
    return;
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

  state.startDate?.setSeconds(0);
  state.endDate?.setSeconds(0);
  state.startDate?.setMilliseconds(0);
  state.endDate?.setMilliseconds(0);

  if (state.updateEvent) {
    const input = new CalendarEventDto({
      subject: state.event.title,
      locationName: state.event.location,
      startTime: state.event.isAllDay
        ? DateTime.fromJSDate(state.startDate)
            .setZone("local")
            .startOf("day")
            .setZone("UTC", { keepLocalTime: true })
        : DateTime.fromJSDate(state.startDate).toUTC(),
      endTime: state.event.isAllDay
        ? DateTime.fromJSDate(state.endDate)
            .setZone("local")
            .startOf("day")
            .plus({ days: 1 })
            .setZone("UTC", { keepLocalTime: true })
        : DateTime.fromJSDate(state.endDate).toUTC(),
      isAllDay: state.event.isAllDay
    });

    new CalendarServiceProxy()
      .updateCalendarEvent(props.event.id, input)
      .then(() => {
        fireSuccessToast("Updated!");
        emit("updateEventValue");
        closeEventPopover(state.event);
        //store.commit(ModalStore.mutations.SET_EVENTS_UPDATE_MODAL, true);
      });
    state.updateEvent = false;
  }
}
function updateDate(dateInput: any, value) {
  if (dateInput == "start") state.startDate = new Date(value);
  else if (dateInput == "end") state.endDate = new Date(value);
}

watch(
  () => state.event,
  (newEvent) => {
    if (JSON.stringify(eventOriginalState) !== JSON.stringify(newEvent)) {
      updateEvent();
    }
  },
  { immediate: true, deep: true }
);
function onChange(time: number) {
  let currentStartTime = state.event.start;

  if (!(currentStartTime instanceof DateTime)) {
    currentStartTime = DateTime.fromJSDate(currentStartTime);
  }

  // Add time and update state
  const newEndTime = currentStartTime.plus({ minutes: time });
  state.endDate = newEndTime.toJSDate();
  state.event.end = newEndTime.toJSDate();
  state.updateEvent = true;
}
function submitEventTime(event: any) {
  //get units based on event time frame

  const event_minutes = event.end.diff(event.start, "minutes").minutes;
  const calc_units = Math.ceil(event_minutes / 6);

  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.SubmitEventTime,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true),
      eventId: event.id,
      units: calc_units,
      description: event.title,
      date: event.end.toJSDate()
    }
  });
  emit("closePopover", event);
}
function handleSwitchChange(val: any, event: any) {
  state.event.isAllDay = val;
}
</script>
