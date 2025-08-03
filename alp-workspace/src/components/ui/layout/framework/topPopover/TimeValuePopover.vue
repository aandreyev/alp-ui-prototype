<template>
  <Popover>
    <PopoverTrigger as-child>
      <shad-button class="relative mr-2" :variant="'outline'">
        <div class="flex flex-col justify-center">
          <div class="flex items-center">
            <Scale class="w-3 h-3 mr-2" />
            <span class="text-xs">
              {{ state.TotalSalesTimeEntry + state.TotalMatterTimeEntry }} units
            </span>
          </div>

          <div class="flex items-center">
            <Kanban class="w-3 h-3 mr-2" />
            <span class="text-xs">
              {{ state.TotalProjectTimeEntry }} units
            </span>
          </div>
        </div>
      </shad-button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Time Value of the Day</h4>
          <p class="text-sm text-muted-foreground">
            Here is the time value of the day
          </p>
        </div>
        <div class="grid gap-2">
          <Alert>
            <Scale class="h-4 w-4" />
            <AlertTitle>
              {{ state.TotalSalesTimeEntry }} Sales Units</AlertTitle
            >
            <AlertDescription>
              all sales (can not be invoiced) units for your day
            </AlertDescription>
          </Alert>

          <Alert>
            <Hourglass class="h-4 w-4" />
            <AlertTitle>
              {{ state.TotalMatterTimeEntry }} Matter Units
            </AlertTitle>
            <AlertDescription>
              all matters (includes billable/non-billable) units for your day
            </AlertDescription>
          </Alert>
          <Alert>
            <Kanban class="h-4 w-4" />
            <AlertTitle>
              {{ state.TotalProjectTimeEntry }} Project Units</AlertTitle
            >
            <AlertDescription>
              all projects units for your day
            </AlertDescription>
          </Alert>
          <Alert>
            <Timer class="h-4 w-4" />
            <AlertTitle>
              {{
                state.TotalMatterTimeEntry +
                state.TotalSalesTimeEntry +
                state.TotalProjectTimeEntry
              }}
              Units</AlertTitle
            >
            <AlertDescription>
              all time entry units for your day
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
import { Hourglass, Kanban, Scale, Timer } from "lucide-vue-next";
import { computed, defineComponent, onMounted, reactive, watch } from "vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/registry/new-york/ui/popover";
import { TimeEntryServiceProxy } from "@/network/common-service-proxies";

import { DateTime } from "luxon";
import { useStore } from "vuex";
import { UserStore } from "@/store/modules/users";
import { TimeEntryStore } from "@/store/modules/time-entries";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/lib/registry/new-york/ui/alert";
import {
  TimeEntryStatsDto,
  TypeTotalUnitsDto
} from "@/network/dtos/time-entry-dto";
import { CurrentUserDto } from "@/network/dtos/user-dto";

const store = useStore();
onMounted(() => {
  store.dispatch(UserStore.actions.GET_ME);
  store.dispatch(TimeEntryStore.actions.GET_TIMERS);
});

const state = reactive({
  TotalTimeEntry: new TimeEntryStatsDto(),
  TotalSalesTimeEntry: 0,
  TotalMatterTimeEntry: 0,
  TotalProjectTimeEntry: 0
});

const unitsCreateCount = computed(
  () => store.getters[TimeEntryStore.getters.CREATE_COUNT]
);

const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

function getTimersData() {
  store.dispatch(TimeEntryStore.actions.GET_TIMERS);
}

function FetchUnitData() {
  fetchTimeEntryData();
}

async function fetchTimeEntryData() {
  if (currentUser?.value?.id) {
    await new TimeEntryServiceProxy()
      .getTimeEntryStats(
        DateTime.local().startOf("day"),
        DateTime.local().endOf("day"),
        currentUser?.value?.id
      )
      .then(async (result) => {
        state.TotalTimeEntry.typeTotalUnits = result!
          .typeTotalUnits as TypeTotalUnitsDto[];

        state.TotalSalesTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[0].totalUnits!;
        state.TotalMatterTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[1].totalUnits!;
        state.TotalProjectTimeEntry =
          state.TotalTimeEntry.typeTotalUnits[2].totalUnits!;
      });
  }
}

watch(
  () => currentUser.value,
  () => {
    FetchUnitData();
  },
  { immediate: true, deep: true }
);

watch(
  () => unitsCreateCount,
  () => {
    FetchUnitData();
  },
  { immediate: true, deep: true }
);
</script>
