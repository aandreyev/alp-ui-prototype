<template>
  <span
    class="flex items-center border-2 border-slate-300 hover:border-indigo-300 hover:bg-blue-100 rounded py-1"
  >
    <span class="w-8 flex items-center justify-center">
      <input
        class="form-checkbox text-green-400"
        type="checkbox"
        v-model="state.complete"
        @change="handleCompletedChange"
      />
    </span>
    <span
      class="flex-1 grid grid-cols-12 gap-px items-center text-sm font-medium py-1"
    >
      <span class="col-span-4 flex items-center px-1">
        <edit-inline-input
          class="flex-1 truncate"
          v-model="state.name"
          placeholder="Enter a name"
          selectable
          @valueUpdated="updateName"
          @selected="$emit('selected')"
        />
      </span>

      <div class="col-span-2 px-1 flex justify-center">
        <transition name="fade-fast" mode="out-in">
          <inline-timer
            v-if="activeTimer"
            :timer="activeTimer"
            :projectId="projectId"
            @updated="$emit('updated')"
          />

          <alp-button v-else variant="success" @click="startTimer">
            <font-awesome-icon icon="fa-solid fa-play" />
          </alp-button>
        </transition>
      </div>

      <div class="col-span-2 pr-1">
        <multi-user-selector
          class="w-full"
          :value="state.assigned"
          @selected="addTeamMember"
          @removed="removeTeamMember"
        />
      </div>

      <!-- <inline-input
        class="col-span-1 bg-gray-100 outline-none text-gray-400"
        type="number"
        placeholder="Est. Units"
        v-model="state.estimatedTime"
        rules="min_value:0"
      /> -->

      <div class="col-span-1 pl-3">
        {{ state.totalUnits }} / {{ state.estimatedTime }} units
      </div>
      <div class="col-span-2 pr-2">
        <select
          v-model="state.status"
          @change="handleStatusChange"
          class="w-full"
        >
          <option :value="ProjectTaskStatus.ToDo">To Do</option>
          <option :value="ProjectTaskStatus.Doing">Doing</option>
          <option :value="ProjectTaskStatus.Done">Done</option>
        </select>
      </div>
      <date-input
        class="col-span-1"
        v-model="state.dueDate"
        @triggerFilter="updateTask"
      />
      <!-- {{state.dueDate}} -->
    </span>
    <div class="ml-1 px-2 w-10 flex items-center justify-end pr-1">
      <alp-options>
        <span
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="deleteProjectTask"
        >
          Delete
        </span>
      </alp-options>
    </div>
  </span>
</template>

<script lang="ts">
import InlineTimer from "@/components/common/InlineTimer.vue";
import DateInput from "@/components/inputs/DateInput.vue";
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import MultiUserSelector from "@/components/inputs/selectors/MultiUserSelector.vue";
import { toDateTime } from "@/composable/date";
import { ProjectStore } from "@/store/modules/projects";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { DateTime } from "luxon";
import { computed, defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { ApiStore } from "@/store/utils";
import { useNotify } from "@/composable/notify";
import { TimerType, ProjectTaskStatus } from "@/network/dtos/enumTypes";
import { ProjectTaskDto } from "@/network/dtos/project-dto";
import { CreateTimerInput } from "@/network/dtos/timer-dto";
import { UserListDto } from "@/network/dtos/user-dto";

export default defineComponent({
  emits: ["updated", "selected"],
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
    DateInput,
    EditInlineInput,
    MultiUserSelector,
    InlineTimer
  },
  setup(props, { emit }) {
    const { fireConfirm } = useNotify();
    // const overdue = computed<boolean>(() => {
    //   const dueDate = toDateTime(props.projectTask?.dueDate);
    //   if (!dueDate) {
    //     return false;
    //   }
    //   return dueDate < DateTime.fromJSDate(new Date());
    // });

    const state = computed(() => props.projectTask);

    // const { state } = usePatchable<ProjectTaskDto>({
    //   original: computed(() => props.projectTask),
    //   patchQuery: ProjectStore.actions.PATCH_PROJECT_TASK,
    //   patchQueryParams: () => ({
    //     projectId: props.projectId,
    //     id: props.projectTask.id
    //   })
    // });
    let projectOriginalState = reactive({
      ...JSON.parse(JSON.stringify(props.projectTask))
    });
    const store = useStore();

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

    const activeTimer = computed(() =>
      store.getters[TimeEntryStore.getters.GET_TIMER_FOR_TYPE](
        TimerType.ProjectTask,
        props.projectTask.id
      )
    );

    function deleteProjectTask() {
      fireConfirm("Are you sure you want to delete this task?").then(
        (result) => {
          if (result.isConfirmed) {
            store.dispatch(ProjectStore.actions.DELETE_PROJECT_TASK, {
              projectId: props.projectId,
              id: props.projectTask.id
            });
          }
        }
      );
    }

    function addTeamMember(user: UserListDto) {
      store
        .dispatch(ProjectStore.actions.ADD_PROJECT_TASK_TEAM_MEMBER, {
          projectId: props.projectId,
          id: props.projectTask.id,
          userId: user.id
        })
        .then(() => emit("updated"));
    }

    function removeTeamMember(user: UserListDto) {
      store
        .dispatch(ProjectStore.actions.REMOVE_PROJECT_TASK_TEAM_MEMBER, {
          projectId: props.projectId,
          id: props.projectTask.id,
          userId: user.id
        })
        .then(() => emit("updated"));
    }

    function updateTask() {
      store
        .dispatch(ProjectStore.actions.PATCH_PROJECT_TASK, {
          projectId: props.projectId,
          id: props.projectTask.id,
          original: projectOriginalState,
          updated: state.value
        })
        .then(() => {
          resetState();
          emit("updated");
        });
    }

    function handleCompletedChange() {
      if (state.value.complete === true)
        state.value.status = ProjectTaskStatus.Done;
      else if (
        state.value.status === ProjectTaskStatus.Done &&
        state.value.complete === false
      )
        state.value.status = ProjectTaskStatus.Doing;
      state.value.order = getProjectTasksStatus(state.value.status ?? 0);
      updateTask();
    }
    function getProjectTasksStatus(newStatus: number): number {
      let tasks =
        ApiStore.toData<ProjectTaskDto[]>(
          store.getters[ProjectStore.getters.GET_PROJECT_TASKS](props.projectId)
        ) || [];
      return tasks.filter((x) => x.status === newStatus).length;
    }

    function handleStatusChange() {
      if (state.value.status === ProjectTaskStatus.Done)
        state.value.complete = true;
      else if (
        state.value.status !== ProjectTaskStatus.Done &&
        state.value.complete === true
      )
        state.value.complete = false;
      state.value.order = getProjectTasksStatus(state.value.status ?? 0);
      updateTask();
    }

    function resetState() {
      projectOriginalState = JSON.parse(JSON.stringify(props.projectTask));
    }

    function updateName() {
      if (projectOriginalState.name !== state.value.name) updateTask();
    }

    return {
      state,
      //overdue,
      startTimer,
      activeTimer,
      deleteProjectTask,
      addTeamMember,
      removeTeamMember,
      ProjectTaskStatus,
      handleStatusChange,
      handleCompletedChange,
      updateTask,
      updateName
    };
  }
});
</script>
