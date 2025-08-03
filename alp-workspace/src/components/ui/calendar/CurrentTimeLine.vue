<template>
  <div class="current-time-line-container" :style="containerStyle">
    <div class="current-time-dot-wrapper" :style="dotWrapperStyle">
      <div class="current-time-dot">
        <div class="dotted-line" :style="dottedLineStyle">
          <div :style="currentTimeStyle" class="text-xs text-gray-800 font-semibold">{{ state.currentTimeText }}</div>
        </div>
      </div>
    </div>
    <div class="current-time-line"></div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  reactive,
  watch,
  nextTick
} from "vue";
import { DateTime } from "luxon";

const props = defineProps<{
  startWeek: any;
  calendarView: any;
  calculateDays: any;
}>();
const state = reactive({
  isSameWeekStart: false,
  dottedLineWidth: 0,
  currentTimeText: DateTime.local().toFormat("HH:mm")
});
const position = ref(0);
const dottedLineWidth = ref(0);

const updatePosition = () => {
  const now = DateTime.local();
  const startOfDay = now.startOf("day");
  const minutesSinceMidnight = now.diff(startOfDay, "minutes").minutes;
  const percentage = (minutesSinceMidnight / (24 * 60)) * 100;
  position.value = percentage;

  if (props.calendarView === "week") {
    const startOfWeek = props.startWeek.startOf("week");
    const endOfWeek = startOfWeek.endOf("week");
    const minutesSinceWeekStart = now.diff(startOfWeek, "minutes").minutes;
    const totalMinutesInWeek = endOfWeek.diff(startOfWeek, "minutes").minutes;
    const weekProgress = (minutesSinceWeekStart / totalMinutesInWeek) * 100;

    const container = document.querySelector(".current-time-line-container") as HTMLElement;
    if (container) {
      state.dottedLineWidth = props.calculateDays * container.getBoundingClientRect().width;
    }
  } else if (props.calendarView === "day") {
    const container = document.querySelector(".current-time-line-container") as HTMLElement;
    if (container) {
      const totalWidth = container.getBoundingClientRect().width;
      dottedLineWidth.value = ((100 - percentage) / 100) * totalWidth;
    }
  }
  state.currentTimeText = DateTime.local().toFormat("HH:mm");
};

const containerStyle = computed(() => ({
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: `${position.value}%`,
  zIndex: 10
}));

const dotWrapperStyle = computed(() => ({
  position: "absolute" as const,
  left: "-6px",
  top: "-6px"
}));

const dottedLineStyle = computed(() => ({
  width: `${state.dottedLineWidth}px`
}));

const currentTimeStyle = computed(() => ({
  position: "absolute" as const,
  left: "-5px",
  transform: "translateX(-100%)",
  whiteSpace: "nowrap" as const,
  top: "-10px"
}));

let interval: any;

onMounted(() => {
  updatePosition();

  interval = setInterval(updatePosition, 60000);
  window.addEventListener("resize", updatePosition);
});

onUnmounted(() => {
  clearInterval(interval);
  window.removeEventListener("resize", updatePosition);
});

watch(
  [() => props.startWeek],
  () => {
    updatePosition();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.current-time-line-container {
  pointer-events: none;
  height: 2px;
  display: flex;
  align-items: center;
}

.current-time-line {
  position: absolute;
  left: 6px;
  right: 0;
  height: 2px;
  background-color: #0078d4;
}

.current-time-dot-wrapper {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 0 1px #0078d4;
  z-index: 2;
}

.current-time-dot {
  width: 8px;
  height: 8px;
  background-color: #0078d4;
  border-radius: 50%;
  position: relative;
}

.dotted-line {
  position: absolute;
  top: 50%;
  right: 100%;
  height: 2px;
  background-image: linear-gradient(
    to right,
    #0078d4 33%,
    rgba(255, 255, 255, 0) 0%
  );
  background-position: bottom;
  background-size: 6px 2px;
  background-repeat: repeat-x;
  transform: translateY(-50%);
}
</style>
