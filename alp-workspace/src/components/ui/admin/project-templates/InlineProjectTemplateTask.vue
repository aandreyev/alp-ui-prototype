<template>
  <div
    class="flex items-center border hover:border-indigo-300 hover:bg-blue-50 rounded py-2 px-3 mb-2 cursor-pointer"
    @click="$emit('selected')"
  >
    <!-- ST Badge -->
    <div class="flex-shrink-0 mr-3" @click.stop>
      <router-link
        v-if="state.standardTaskId"
        :to="{
          name: 'Standard Task',
          params: { id: state.standardTaskId }
        }"
        class="inline-flex justify-center px-2 py-0.5 border rounded border-blue-400 bg-blue-50 text-blue-800 font-semibold text-xs"
      >
        ST
      </router-link>
      <div v-else class="w-6"></div>
    </div>

    <!-- Task name - takes most of the space -->
    <div class="flex-1 min-w-0 flex">
      <div class="flex-grow flex items-center w-full">
        <edit-inline-text-area
          class="text-sm w-full"
          v-model="state.name"
          placeholder="Enter a task name"
          selectable
          @selected="$emit('selected')"
        />
      </div>
    </div>

    <!-- Assignee - fixed width column -->
    <div class="w-48 flex-shrink-0 px-2" @click.stop>
      <multi-user-selector
        class="w-full"
        :value="state.assigned"
        @selected="addTeamMember"
        @removed="removeTeamMember"
      />
    </div>

    <!-- Delete button -->
    <div class="flex-shrink-0 ml-2" @click.stop>
      <button
        class="text-red-500 hover:text-red-700"
        @click="deleteProjectTemplateTask"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import EditInlineTextArea from "@/components/inputs/EditInlineTextArea.vue";
import MultiUserSelector from "@/components/inputs/selectors/MultiUserSelector.vue";
import { usePatchable } from "@/composable/patchable";
import { ProjectTemplateTaskDto } from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["updated", "selected"],
  props: {
    projectTemplateId: {
      type: [String, Number],
      required: true
    },
    projectTemplateTask: {
      type: Object as PropType<ProjectTemplateTaskDto>,
      required: true
    }
  },
  components: {
    EditInlineTextArea,
    MultiUserSelector
  },
  setup(props) {
    const { state } = usePatchable<ProjectTemplateTaskDto>({
      original: computed(() => props.projectTemplateTask),
      patchQuery: ProjectTemplateStore.actions.PATCH_PROJECT_TEMPLATE_TASK,
      patchQueryParams: () => ({
        projectTemplateId: props.projectTemplateId,
        id: props.projectTemplateTask.id
      })
    });

    const store = useStore();

    function addTeamMember(user: UserListDto) {
      store.dispatch(
        ProjectTemplateStore.actions.ADD_PROJECT_TEMPLATE_TASK_TEAM_MEMBER,
        {
          projectTemplateId: props.projectTemplateId,
          id: props.projectTemplateTask.id,
          userId: user.id
        }
      );
    }

    function removeTeamMember(user: UserListDto) {
      store.dispatch(
        ProjectTemplateStore.actions.REMOVE_PROJECT_TEMPLATE_TASK_TEAM_MEMBER,
        {
          projectTemplateId: props.projectTemplateId,
          id: props.projectTemplateTask.id,
          userId: user.id
        }
      );
    }

    function deleteProjectTemplateTask() {
      store
        .dispatch(ProjectTemplateStore.actions.DELETE_PROJECT_TEMPLATE_TASK, {
          projectTemplateId: props.projectTemplateId,
          id: props.projectTemplateTask.id
        })
        .then(fetchProjectTemplateTasks);
    }

    function fetchProjectTemplateTasks() {
      store.dispatch(ProjectTemplateStore.actions.GET_PROJECT_TEMPLATE_TASKS, {
        projectTemplateId: props.projectTemplateId
      });
    }

    return {
      state,
      addTeamMember,
      removeTeamMember,
      deleteProjectTemplateTask,
      fetchProjectTemplateTasks
    };
  }
});
</script>
