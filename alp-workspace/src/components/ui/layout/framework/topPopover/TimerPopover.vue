<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button class="w-9 h-9 relative" :variant="'ghost'" :size="'icon'">
        <Timer class="w-5 h-5" />
        <alp-loader
          v-if="hasActiveTimer"
          class="absolute animate-spin text-blue-600"
          size="30"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent :side-offset="8" align="end" class="w-96">
      <div class="flex justify-between items-center">
        <div class="space-y-2 flex-grow">
          <h4 class="font-medium leading-none">Timers</h4>
          <p class="text-sm text-muted-foreground">Select a timer to start or lodge.</p>
        </div>
        <shad-button variant="outline" size="icon" @click="createTimer" class="ml-4">
          <font-awesome-icon icon="fa-solid fa-plus" />
        </shad-button>
      </div>

      <!-- migrated from old timer popover -->
      <div class="flex flex-col py-4">
        <div class="h-[24rem] overflow-y-auto">
          <div v-if="timers != undefined && timers.length > 0">
            <alp-timer
              v-for="timer in timers"
              :key="timer.id"
              :timer="timer"
              class="mb-4 last:mb-0"
            />
          </div>
          <alp-empty
            :content="'No active timer added'"
            :subContent="'You have not added any timer. Add one.'"
            v-else
          >
          </alp-empty>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
import { Timer } from "lucide-vue-next";
import { computed, defineComponent, onMounted } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/registry/new-york/ui/popover";
import AlpTimer from "@/components/common/Timer.vue";
//migrated from old timer popover
import { TimerType } from "@/network/dtos/enumTypes";
import { CreateTimerInput, TimerDto } from "@/network/dtos/timer-dto";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { ApiStore } from "@/store/utils";
import { useStore } from "vuex";

const store = useStore();

const timers = computed(
  () =>
    ApiStore.toData<TimerDto[]>(store.getters[TimeEntryStore.getters.GET_TIMERS]) || []
);

onMounted(() => {
  store.dispatch(TimeEntryStore.actions.GET_TIMERS);
});

function createTimer() {
  store.dispatch(
    TimeEntryStore.actions.CREATE_TIMER,
    new CreateTimerInput({
      type: TimerType.Free,
    })
  );
}
const hasActiveTimer = computed(
  () => store.getters[TimeEntryStore.getters.HAS_ACTIVE_TIMER]
);
</script>
