<template>
  <div
    class="relative flex flex-col space-y-2 rounded-lg border bg-card p-2 shadow-sm transition-colors hover:bg-accent/20"
    @click.stop.prevent="cardClicked(projectTask)"
  >
    <div class="flex flex-col space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-sm leading-none break-all">
          {{ projectTask.name }}
        </h3>

        <!-- setp check list -->
        <div
          v-if="
            projectTask.totalSteps &&
            projectTask.totalSteps > 0 &&
            projectTask.isStepsCheckList
          "
          class="flex items-center rounded-md px-2 py-1 text-xs font-medium space-x-1"
          :class="{
            'bg-green-100 text-green-600':
              projectTask.totalSteps &&
              projectTask.completedSteps !== undefined &&
              projectTask.totalSteps == projectTask.completedSteps,
            'bg-destructive/15 text-destructive':
              projectTask.totalSteps &&
              projectTask.completedSteps !== undefined &&
              projectTask.totalSteps != projectTask.completedSteps
          }"
        >
          <iconify-icon icon="lucide:circle-check" class="h-4 w-4" />
          <span
            >{{ projectTask.completedSteps }}/{{ projectTask.totalSteps }}</span
          >
        </div>
      </div>

      <div
        class="text-muted-foreground text-xs break-all"
        v-html="projectTask.description"
      ></div>

      <div class="flex items-center justify-between">
        <transition name="fade-fast" mode="out-in">
          <div>
            <inline-timer
              v-if="activeTimer"
              :timer="activeTimer"
              @updated="$emit('updated')"
              :is-added-in-card="true"
              :projectTaskId="projectTask.id"
            />

            <button
              v-else
              variant="secondary"
              class="text-green-600 items-center"
              @click.stop.prevent="startTimer"
            >
              <iconify-icon icon="lucide:play" class="h-5 w-5" />
            </button>
          </div>
        </transition>

        <div
          class="rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary"
        >
          {{ projectTask.totalUnits }} / {{ projectTask.estimatedTime }} units
        </div>
      </div>

      <div
        v-if="projectTask.dueDate !== undefined && projectTask.dueDate !== null"
        class="flex justify-end"
      >
        <div
          class="flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground"
        >
          <font-awesome-icon
            icon="fa-regular fa-clock"
            class="mr-1.5 h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span>{{ fmtToLocalShortDate(projectTask.dueDate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { fmtToLocalShortDate } from "@/composable/date";
import { ProjectStore } from "@/store/modules/projects";

import { TimeEntryStore } from "@/store/modules/time-entries";

import InlineTimer from "@/components/common/InlineTimer.vue";
import { TimerType } from "@/network/dtos/enumTypes";
import { ProjectTaskDto } from "@/network/dtos/project-dto";
import { CreateTimerInput } from "@/network/dtos/timer-dto";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["userRemoved", "selected", "updated", "cardClicked"],
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    projectTask: {
      type: Object as PropType<ProjectTaskDto>,
      required: true
    }
  },
  components: {
    //MultiUserSelector,
    InlineTimer
  },
  setup(props, { emit }) {
    function cardClicked(element: any) {
      emit("cardClicked", element);
    }
    const activeTimer = computed(() =>
      store.getters[TimeEntryStore.getters.GET_TIMER_FOR_TYPE](
        TimerType.ProjectTask,
        props.projectTask.id
      )
    );

    const store = useStore();
    function removeTeamMember(user: UserListDto) {
      store
        .dispatch(ProjectStore.actions.REMOVE_PROJECT_TASK_TEAM_MEMBER, {
          projectId: props.projectId,
          id: props.projectTask.id,
          userId: user.id
        })
        .then(() => {
          emit("userRemoved");
        });
    }

    function startTimer() {
      store
        .dispatch(
          TimeEntryStore.actions.CREATE_TIMER,
          new CreateTimerInput({
            type: TimerType.ProjectTask,
            entityId: props.projectTask.id
          })
        )
        .then(() => emit("updated"));
    }

    return {
      fmtToLocalShortDate,
      removeTeamMember,
      activeTimer,
      startTimer,
      cardClicked
    };
  }
});
</script>
