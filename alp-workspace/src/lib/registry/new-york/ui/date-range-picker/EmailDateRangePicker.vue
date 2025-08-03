<script setup lang="ts">
import { format } from "date-fns";
import { onMounted, ref, watch } from "vue";
import { CalendarIcon } from "@radix-icons/vue";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-icons/vue";
import { FilterState, enumFilterState } from "@/store/filterState";
import { TimeEntryStore } from "@/store/modules/time-entries";
import store from "@/store";

const emits = defineEmits(["selected-range", "selected", "sprint-selection"]);

interface DateRange {
  start: Date;
  end: Date;
}
const props = defineProps({
  resetFilter: Boolean,
  showAllRange: {
    type: Boolean,
    default: false
  },
  sprintRange: {
    type: Object,
    default: {}
  },
  openPicker: {
    type: Boolean,
    default: false
  }
});

let isReset = ref(false);
const date = ref<DateRange>({
  start: new Date(),
  end: new Date()
});
const calendarKey = ref(0);
const setDate = (newRange: DateRange) => {
  date.value = { ...newRange };
};
onMounted(() => {
  if (props.showAllRange) {
    setPreset("all");
  } else {
    if (GetFilterState().dateRange == undefined) {
      setPreset("today");
    }
  }
});
let filterState = new FilterState();
function GetFilterState() {
  let filterData = filterState.getItem(enumFilterState.EmailDateRangePicker);
  if (filterData) return filterData;
  return {
    search: "",
    dateRange: undefined
  };
}

function SetFilterState() {
  let filterStateData = {
    dateRange: date.value
  };
  filterState.setItem(enumFilterState.EmailDateRangePicker, filterStateData);
}
watch(
  [() => GetFilterState()],
  () => {
    let range = GetFilterState();
    if (range.dateRange && range.dateRange.start && range.dateRange.end) {
      date.value.start = new Date(range.dateRange.start);
      date.value.end = new Date(range.dateRange.end);
    }
  },
  { immediate: true, deep: true }
);

// define Presets

interface Preset {
  name: string;
  label: string;
}
const PRESETS: Preset[] = [
  { name: "today", label: "Today" },
  { name: "yesterday", label: "Yesterday" },
  { name: "last7", label: "Last 7 days" },
  { name: "last30", label: "Last 30 days" },
  { name: "thisMonth", label: "This Month" },
  { name: "lastMonth", label: "Last Month" },
  { name: "all", label: "All Range" }
];

const selectedPreset = ref<string | undefined>(undefined);
const setSelectedPreset = (value: string | undefined) => {
  selectedPreset.value = value;
};

const getPresetRange = (presetName: string): DateRange => {
  const preset = PRESETS.find(({ name }) => name === presetName);
  if (!preset) throw new Error(`Unknown date range preset: ${presetName}`);
  const start = new Date();
  const end = new Date();
  const first = start.getDate() - start.getDay();

  switch (preset.name) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "last7":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "last30":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "thisMonth":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "lastMonth":
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "all":
      start.setFullYear(1900, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(2200, 0, 1);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

const checkPreset = (): void => {
  for (const preset of PRESETS) {
    const presetRange = getPresetRange(preset.name);
    const normalizedRangeFrom = new Date(
      new Date(date.value.start).setHours(0, 0, 0, 0)
    );
    const normalizedPresetFrom = new Date(
      presetRange.start.setHours(0, 0, 0, 0)
    );

    const normalizedRangeTo = new Date(
      new Date(date.value.end ? date.value.end : "").setHours(0, 0, 0, 0) ?? 0
    );
    const normalizedPresetTo = new Date(
      presetRange.end?.setHours(0, 0, 0, 0) ?? 0
    );

    if (
      normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
      normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
    ) {
      setSelectedPreset(preset.name);
      return;
    }
  }

  setSelectedPreset(undefined);
};
watch(
  () => date.value,
  () => {
    checkPreset();
    date.value.start.setHours(0, 0, 0, 0);
    date.value.end.setHours(23, 59, 59, 999);
    emits("selected-range", date.value);

    // Force re-render
    calendarKey.value++;

    if (!props.showAllRange) {
      SetFilterState();
    }
  },
  { deep: true }
);

const setPreset = (preset: string): void => {
  const range = getPresetRange(preset);
  setDate(range);
  emits("sprint-selection", false);
};
let resetValue: any;
watch(
  [() => (resetValue = store.getters[TimeEntryStore.getters.GET_RESET_FILTER])],
  () => {
    const date = {
      start: new Date(),
      end: new Date()
    };
    if (resetValue) {
      setDate(date);
    }
  },
  { immediate: true, deep: true }
);
function isValidDate(dateString: any) {
  // Attempt to create a new Date object
  const date = new Date(dateString);

  // Check if the date is valid by comparing it to NaN
  return !isNaN(date.getTime());
}
watch(
  [() => props.resetFilter, () => props.sprintRange],
  () => {
    if (
      props.sprintRange &&
      isValidDate(props.sprintRange.startDate) &&
      isValidDate(props.sprintRange.endDate)
    ) {
      const date = {
        start: new Date(props.sprintRange.startDate),
        end: new Date(props.sprintRange.endDate)
      };

      setDate(date);
      emits("sprint-selection", true);
    }
    isReset.value = props.resetFilter;
    if (isReset.value) {
      isReset.value = false;
      if (props.showAllRange) {
        setPreset("all");
      } else {
        const date = {
          start: new Date(),
          end: new Date()
        };
        setDate(date);
      }
    }
  },
  { immediate: true, deep: true }
);

function fetchValue() {
  emits("sprint-selection", date.value);
}
</script>

<template>
  <div :class="cn('grid gap-2', $attrs.class ?? '')">
    <shad-popover v-if="props.openPicker" :open="props.openPicker">
      <shad-popover-trigger as-child>
        <shad-button
          id="date"
          :variant="'outline'"
          :class="
            cn(
              'w-[280px] justify-start text-left font-normal h-8 px-3 !border-0 !bg-transparent',
              !date && 'text-muted-foreground'
            )
          "
        >
          <CalendarIcon class="mr-2 h-4 w-4" />

          <span>
            {{
              date.start
                ? date.end
                  ? `${format(date.start, "LLL dd, y")} - ${format(
                      date.end,
                      "LLL dd, y"
                    )}`
                  : format(date.start, "LLL dd, y")
                : "Pick a date"
            }}
          </span>
        </shad-button>
      </shad-popover-trigger>
      <shad-popover-content class="w-auto p-0" align="start">
        <div class="flex space-x-2">
          <shad-calendar
            :key="calendarKey"
            v-model.range="date"
            @update:model-value="fetchValue"
            :columns="2"
            initial-focus
          />

          <div class="flex flex-col items-end gap-1 pr-2 pl-6 pb-6">
            <div class="flex w-full flex-col items-end gap-1 pr-2 pl-6 py-4">
              <shad-button
                v-for="preset in PRESETS"
                :class="{
                  'pointer-events-none': selectedPreset === preset.name
                }"
                variant="ghost"
                @click="(value: any) => { setPreset(preset.name) }"
              >
                <span
                  :class="{
                    'pr-2 opacity-0': true,
                    'opacity-70': selectedPreset === preset.name
                  }"
                >
                  <CheckIcon width="18" height="18" />
                </span>
                {{ preset.label }}
              </shad-button>
            </div>
          </div>
        </div>
      </shad-popover-content>
    </shad-popover>
  </div>
</template>
