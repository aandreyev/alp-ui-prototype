<template>
  <modal @close="closeModal" :headingTitle="'Event List'" class="responsive-modal">
    <div class="overflow-auto event-list-container" style="max-height: 80vh;">
      <shad-data-table
        class="event-table"
        :columns="columns"
        :data="state.dateEvents"
        :count="0"
        :columnFilter="columnFilterValues"
        @selected-row="rowClick"
      >
        <template v-slot:action="{ row }">
          <div class="flex items-center justify-end">
            <shad-button
              size="sm"
              variant="outline"
              class="record-time-btn hover:bg-primary/90 transition-colors"
              @click.stop.prevent="submitEventTime(row)"
            >
              Record my time
            </shad-button>
          </div>
        </template>
      </shad-data-table>
    </div>
  </modal>
  <Popover v-model:open="state.showEventDetailModal">
    <PopoverTrigger as-child>
      <div style="display: none"></div>
    </PopoverTrigger>
    <PopoverContent
      :style="{ width: '800px', border: 'none' }"
      :sideOffset="50"
    >
      <Event
        :key="state.event?.id"
        :event="state.event"
        @updateEvent="updateEvent"
        @closePopover="closePopover"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import {
  CalendarServiceProxy
} from "@/network/accounts-service-proxies";
import { CalendarEventDto } from "@/network/dtos/calendar-dto";
import store from "@/store";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { h, reactive, ref, watch } from "vue";
import { ColumnDef } from "@tanstack/vue-table";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import Event from "@/components/ui/calendar/Event.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import { useEnum } from "@/composable/enum";

const props = defineProps<{
  dateEvents: CalendarEventDto[];
}>();

const emit = defineEmits(["close", "updateEvent"]);

const state = reactive({
  dateEvents: props.dateEvents,
  event: {} as CalendarEventDto,
  showEventDetailModal: false
});

const columns: ColumnDef<CalendarEventDto>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Title" }),
    cell: ({ row }) => h("div", { class: "font-semibold" }, row.getValue("title")),
    enableSorting: true
  },
  {
    accessorKey: "start",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Start Time", class: "w-[30px]" }),
    cell: ({ row }) => h("div", fmtToLocalDateTime(row.getValue("start"))),
    enableSorting: true
  },
  {
    accessorKey: "end",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "End Time", class: "w-[30px]" }),
    cell: ({ row }) => h("div", fmtToLocalDateTime(row.getValue("end"))),
    enableSorting: true
  }
];

function deleteListEvent(id: string) {
  new CalendarServiceProxy().deleteCalendarEvent(id).then(() => {
    emit("close");
    let tempItems = state.dateEvents as CalendarEventDto[];
    const index = tempItems.findIndex((x) => x.id === id);
    if (index !== -1) {
      tempItems.splice(index, 1);
      state.dateEvents = [...tempItems];
    }
    emit("updateEvent");
  });
}

function closeModal() {
  emit("close");
  state.showEventDetailModal = false;
}

enum ColumnFilter {
  Title = 0,
  Start = 1,
  End = 2
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

function fmtToLocalDateTime(datetime: string | number | Date) {
  const date = new Date(datetime);

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${day} ${month}, ${year}, ${time}`;
}

function rowClick(event: any) {
  state.showEventDetailModal = true;
  state.event = event;
}

let calendarModalValue: any;
watch(
  [
    () =>
      (calendarModalValue =
        store.getters[ModalStore.getters.GET_EVENTS_UPDATE_MODAL])
  ],
  () => {
    if (!calendarModalValue) {
      state.showEventDetailModal = false;
    }
  },
  { immediate: true, deep: true }
);

function updateEvent(id: any) {
  state.showEventDetailModal = false;
  let tempItems = state.dateEvents as CalendarEventDto[];
  const index = tempItems.findIndex((x) => x.id === id);
  if (index !== -1) {
    tempItems.splice(index, 1);
    state.dateEvents = [...tempItems];
  }
}

function submitEventTime(event: any) {
  //get units based on event time frame

  console.log(event);

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
}

function closePopover(event: any) {
  state.showEventDetailModal = false;
}
</script>

<style scoped>
.responsive-modal {
  width: 90vw;
  max-width: 1600px;
  height: 85vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.event-list-container {
  padding: 1rem;
}

.event-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.event-table :deep(th) {
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.event-table :deep(td) {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.event-table :deep(tr:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

.record-time-btn {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.record-time-btn:hover {
  background-color: #f3f4f6;
}

@media (max-width: 1200px) {
  .responsive-modal {
    width: 95vw;
    max-width: 1200px;
    height: 80vh;
  }
  
  .event-list-container {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .responsive-modal {
    width: 100vw;
    max-width: 768px;
    height: 75vh;
  }
  
  .event-list-container {
    padding: 0.5rem;
  }
  
  .event-table :deep(th),
  .event-table :deep(td) {
    padding: 0.75rem;
  }
}
</style>
