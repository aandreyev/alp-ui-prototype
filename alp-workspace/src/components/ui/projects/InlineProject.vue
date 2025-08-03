<template>
  <span class="block bg-white rounded-md m-1 p-3" style="min-width: 750px">
    <div class="flex flex-col mb-2">
      <div class="flex pb-2">
        <span
          v-if="currentUser?.id == state.owner.id"
          class="rounded-sm bg-indigo-500 text-white text-2xs uppercase px-2"
        >
          Owner
        </span>
      </div>

      <div class="flex justify-between text-base font-medium mb-2">
        <router-link
          :to="{ name: 'Project', params: { id: project.id } }"
          class="w-11/12"
        >
          <span class="flex pl-1 items-center">
            <alp-default-badge :text="state.id" :color="'purple'">
            </alp-default-badge>
            <alp-default-badge
              v-if="state?.businessArea"
              :text="state?.businessArea?.name"
              :color="'blue'"
              class="w-auto"
            >
            </alp-default-badge>

            <edit-inline-input
              placeholder="Name"
              v-model="state.name"
              rules="required"
              selectable
              @selected="navigate"
              class="w-1/2"
            />
          </span>
        </router-link>

        <span class="flex justify-end items-end text-xs w-1/12 pl-2">
          <alp-button
            :variant="state.complete ? 'danger' : 'success'"
            @click="state.complete = !state.complete"
          >
            {{ state.complete ? "Reopen" : "Complete" }}
          </alp-button>
        </span>
      </div>
      <div class="flex items-center text-xs">
        <label class="w-full md:w-1/2 mr-1">
          <span class="pl-1 text-2xs uppercase font-medium text-gray-400">
            Owner
          </span>
          <user-selector class="pt-2" v-model="state.owner" />
        </label>
        <label class="w-full md:w-1/2 flex flex-col ml-1" v-if="!state.isBAU">
          <span class="pl-1 pb-2 text-2xs uppercase font-medium text-gray-400"
            >Due Date</span
          >
          <date-input v-model="state.dueDate" placeholder="Due Date" />
        </label>
      </div>
    </div>

    <span class="flex items-center text-xs text-gray-500 mb-1">
      <label
        :for="'toggle-showAssignedToMe' + state.id"
        class="flex relative items-center mb-2 cursor-pointer"
      >
        <input
          type="checkbox"
          :id="'toggle-showAssignedToMe' + state.id"
          class="sr-only peer"
          v-model="taskState.showAssignedToMe"
        />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
        ></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Show Mine Only</span
        >
      </label>

      <label
        :for="'toggle-showCompleted' + state.id"
        class="flex relative items-center mb-2 cursor-pointer ml-3"
      >
        <input
          type="checkbox"
          :id="'toggle-showCompleted' + state.id"
          class="sr-only peer"
          v-model="taskState.showCompleted"
        />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
        ></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Show Completed</span
        >
      </label>

      <label
        :for="'toggle-isBAU' + state.id"
        class="flex relative items-center mb-2 cursor-pointer ml-3"
      >
        <input
          type="checkbox"
          :id="'toggle-isBAU' + state.id"
          class="sr-only peer"
          v-model="state.isBAU"
        />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
        ></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Business As Usual</span
        >
      </label>
    </span>
    <span class="mt-3 mb-1 grid grid-cols-1 items-center text-xs">
      <span class="flex items-center uppercase">
        <span class="w-8" />
        <span class="flex-1 grid grid-cols-12 gap-px">
          <div class="col-span-4 font-medium">Task</div>
          <div class="col-span-2"></div>
          <div class="col-span-2 font-medium">Assignee</div>
          <!-- <div class="col-span-2 font-medium">Total / Est. Units</div> -->
          <div class="col-span-1 font-medium">Est. Units</div>
          <div class="col-span-2 font-medium">Status</div>
          <div class="col-span-1 font-medium">Due Date</div>
        </span>
        <span class="w-8" />
      </span>

      <transition-group name="list-complete" tag="project-task">
        <inline-project-task
          class="mt-1 transition duration-200"
          v-for="item in projectTasks"
          :key="item.id"
          :project-id="project.id"
          :project-task="item"
          @selected="$emit('task-selected', item.id)"
          @updated="fetchProjectTasks"
        />
      </transition-group>

      <alp-can permission="Project.Create">
        <div class="flex items-center mb-1 mt-3">
          <alp-button
            class="mr-1"
            variant="tabs"
            :active="taskState.showStandardTaskSelector"
            @click="
              taskState.showStandardTaskSelector =
                !taskState.showStandardTaskSelector
            "
          >
            <font-awesome-icon icon="fa-solid fa-list" />
          </alp-button>
          <standard-task-selector
            v-if="taskState.showStandardTaskSelector"
            class="flex-1"
            @selected="createProjectTaskFromStandard"
          />
          <inline-input
            v-else
            class="flex-1"
            placeholder="Type to create a Task"
            @create="createProjectTask"
            keep-focus
          />
        </div>
      </alp-can>
    </span>
  </span>
</template>

<script lang="ts">
import DateInput from "@/components/inputs/DateInput.vue";
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import StandardTaskSelector from "@/components/inputs/selectors/StandardTaskSelector.vue";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import InlineProjectTask from "@/components/ui/projects/InlineProjectTask.vue";
import { fmtToLocalShortDate } from "@/composable/date";
import { usePatchable } from "@/composable/patchable";
import { ProjectTaskStatus } from "@/network/dtos/enumTypes";
import {
  ProjectDto,
  ProjectTaskDto,
  StandardTaskDto
} from "@/network/dtos/project-dto";

import { AuthStore } from "@/store/modules/auth";
import { ProjectStore } from "@/store/modules/projects";
import { UserStore } from "@/store/modules/users";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["task-selected"],
  props: {
    project: {
      type: Object as PropType<ProjectDto>,
      required: true
    }
  },
  components: {
    DateInput,
    InlineInput,
    InlineProjectTask,
    EditInlineInput,
    UserSelector,
    StandardTaskSelector
  },
  setup(props) {
    const { state } = usePatchable<ProjectDto>({
      original: computed(() => props.project),
      patchQuery: ProjectStore.actions.PATCH_PROJECT,
      patchQueryParams: () => ({ id: props.project.id })
    });

    const taskState = reactive({
      showCompleted: false,
      showAssignedToMe: true,
      showStandardTaskSelector: false
    });

    const store = useStore();

    const currentUser = computed(() => store.getters[UserStore.getters.GET_ME]);

    const projectTasks = computed(() =>
      ApiStore.toData<ProjectTaskDto[]>(
        store.getters[ProjectStore.getters.GET_PROJECT_TASKS](props.project.id)
      )
    );

    function fetchProjectTasks() {
      store.dispatch(ProjectStore.actions.GET_PROJECT_TASKS, {
        projectId: props.project.id,
        showCompleted: taskState.showCompleted,
        showAssignedToMe: taskState.showAssignedToMe
      });
    }

    watch(
      [() => taskState.showCompleted, () => taskState.showAssignedToMe],
      fetchProjectTasks,
      {
        immediate: true
      }
    );

    function createProjectTask(name: string) {
      if (name) {
        store.dispatch(ProjectStore.actions.CREATE_PROJECT_TASK, {
          projectId: props.project.id,
          projectTask: { name, status: ProjectTaskStatus.ToDo }
        });
      }
    }

    function createProjectTaskFromStandard(standardTask: StandardTaskDto) {
      if (standardTask) {
        store.dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_FROM_STANDARD, {
          projectId: props.project.id,
          standardTaskId: standardTask.id,
          status: ProjectTaskStatus.ToDo
        });
      }
      taskState.showStandardTaskSelector = false;
    }

    return {
      state,
      taskState,
      currentUser,
      projectTasks,
      fmtToLocalShortDate,
      createProjectTask,
      createProjectTaskFromStandard,
      fetchProjectTasks
    };
  }
});
</script>
