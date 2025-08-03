<template>
  <slide-over heading="Project Template Task" @close="$emit('close')">
    <div class="flex-1 space-y-4 p-8 pt-6">
      <Tabs default-value="steps">
        <TabsList>
          <TabsTrigger value="info"> Info </TabsTrigger>
          <TabsTrigger value="steps"> Steps </TabsTrigger>
        </TabsList>
        <TabsContent class="space-y-4" value="info">
          <shad-card class="col-span-4">
            <shad-card-header>
              <shad-card-title>General Information</shad-card-title>
            </shad-card-header>
            <shad-card-content class="grid gap-6">
              <div class="grid gap-4">
                <div class="col-span-full grid gap-1">
                  <shad-label for="project-task-name">Name</shad-label>
                  <inline-text-area
                    class="outline-none text-gray-400 text-sm"
                    v-model="state.name"
                    placeholder="Task Name"
                  />
                </div>

                <div class="col-span-full">
                  <field-label class="w-full p-0" name="Description">
                    <inline-editor
                      name="description"
                      v-model="state.description"
                    />
                  </field-label>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <field-label class="w-full" name="Est. Units">
                    <inline-shad-input
                      class="outline-none text-gray-400 text-sm"
                      type="number"
                      v-model="state.estimatedTime"
                      placeholder="Est. Units"
                      rules="min_value:0"
                    />
                  </field-label>
                  <field-label class="w-full" name="Default Completion Days">
                    <inline-input
                      class="text-gray-400 text-sm"
                      type="number"
                      v-model="state.defaultCompletionDays"
                      placeholder="Default Completion Days"
                    />
                  </field-label>
                </div>

                <div class="col-span-full">
                  <div class="grid gap-1">
                    <span class="font-semibold text-sm">Assignees</span>
                    <multi-user-selector-for-project-task
                      class="w-full"
                      :value="state.assigned"
                      @selected="addTeamMember"
                      @removed="removeTeamMember"
                    />
                  </div>
                </div>

                <div class="col-span-full">
                  <div class="grid gap-1">
                    <span class="font-semibold text-sm">Metadata</span>
                    <project-template-task-metadata
                      :project-template-id="projectTemplateId"
                      :id="id"
                    />
                  </div>
                </div>
              </div>
            </shad-card-content>
          </shad-card>
        </TabsContent>

        <TabsContent value="steps">
          <shad-card class="col-span-4">
            <shad-card-header>
              <shad-card-title>Steps</shad-card-title>
            </shad-card-header>
            <shad-card-content class="pl-2">
              <!-- Steps -->
              <div class="col col-span-2 border-gray-300">
                <div class="p-2">
                  <span class="flex relative items-center mb-2 cursor-pointer">
                    <shad-switch
                      :checked="state.isStepsCheckList"
                      @update:checked="
                        state.isStepsCheckList = !state.isStepsCheckList
                      "
                    />
                    <shad-label class="form-label mr-2"
                      >Step checklist</shad-label
                    >
                    <shad-switch
                      id="is-draggable"
                      :checked="isDraggable"
                      @update:checked="isDraggable = !isDraggable"
                    />
                    <shad-label for="is-draggable" class="form-label mr-2"
                      >Enable Draggable</shad-label
                    >
                  </span>

                  <div class="flex flex-col">
                    <alp-draggable
                      :values="[
                        {
                          title: '',
                          tasks: stepsState.steps,
                          isShowAddNewCardButton: false,
                          typeId: 0
                        }
                      ]"
                      :isFullWidth="true"
                      :isGaryBackground="false"
                      @OnMove="stepMoved"
                      :disabled="!isDraggable"
                    >
                      <template v-slot:card="{ value }">
                        <inline-project-template-task-step
                          :project-template-id="projectTemplateId"
                          :project-template-task-id="id"
                          :project-template-task-step="value"
                          class="flex items-center py-2 mb-1 border border-gray-300 hover:border-indigo-300 hover:bg-blue-100 rounded"
                          :key="value.id"
                          :is-steps-check-list="state.isStepsCheckList"
                        />
                      </template>
                    </alp-draggable>
                  </div>
                  <inline-input
                    class="my-1 py-1 text-xs"
                    placeholder="Type to create a Step"
                    @create="createStep"
                    keep-focus
                  />
                </div>
              </div>
            </shad-card-content>
          </shad-card>
        </TabsContent>
      </Tabs>
    </div>
  </slide-over>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import InlineProjectTemplateTaskStep from "@/components/ui/admin/project-templates/InlineProjectTemplateTaskStep.vue";
import { useStore } from "vuex";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import InlineEditor from "@/components/inputs/InlineEditor.vue";
import { ApiStore } from "@/store/utils";

import { usePatchable } from "@/composable/patchable";
import { ProjectTemplateStore } from "@/store/modules/project-templates";
import MultiUserSelectorForProjectTask from "@/components/inputs/selectors/MultiUserSelectorForProjectTask.vue";
import ProjectTemplateTaskMetadata from "@/components/ui/admin/project-templates/ProjectTemplateTaskMetadata.vue";
import AlpDraggable from "@/components/common/layout/AlpDraggable.vue";
import _ from "lodash";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";
import {
  ProjectTemplateTaskDto,
  ProjectTemplateTaskStepDto
} from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const props = defineProps<{
  projectTemplateId: number;
  id: number;
}>();
const emit = defineEmits(["close"]);

const store = useStore();
const isDraggable = ref(true);
const { state } = usePatchable<ProjectTemplateTaskDto>({
  identifier: props.id,
  getter: ProjectTemplateStore.getters.GET_PROJECT_TEMPLATE_TASK,
  query: ProjectTemplateStore.actions.GET_PROJECT_TEMPLATE_TASK,
  queryParams: () => ({
    projectTemplateId: props.projectTemplateId,
    id: props.id
  }),
  patchQuery: ProjectTemplateStore.actions.PATCH_PROJECT_TEMPLATE_TASK,
  patchQueryParams: () => ({
    projectTemplateId: props.projectTemplateId,
    id: props.id
  })
});
const stepsState = reactive({
  steps: Array<ProjectTemplateTaskStepDto>()
});
const projectTemplateTaskSteps = computed(
  () =>
    ApiStore.toData<ProjectTemplateTaskStepDto[]>(
      store.getters[
        ProjectTemplateStore.getters.GET_PROJECT_TEMPLATE_TASK_STEPS
      ](props.id)
    ) || []
);

onMounted(() => {
  store.dispatch(ProjectTemplateStore.actions.GET_PROJECT_TEMPLATE_TASK_STEPS, {
    projectTemplateId: props.projectTemplateId,
    projectTemplateTaskId: props.id
  });
});

function createStep(description: string) {
  store.dispatch(
    ProjectTemplateStore.actions.CREATE_PROJECT_TEMPLATE_TASK_STEP,
    {
      projectTemplateId: props.projectTemplateId,
      projectTemplateTaskId: props.id,
      projectTemplateTaskStep: {
        description
      }
    }
  );
}

function addTeamMember(user: UserListDto) {
  store.dispatch(
    ProjectTemplateStore.actions.ADD_PROJECT_TEMPLATE_TASK_TEAM_MEMBER,
    {
      projectTemplateId: props.projectTemplateId,
      id: props.id,
      userId: user.id
    }
  );
}

function removeTeamMember(user: UserListDto) {
  store.dispatch(
    ProjectTemplateStore.actions.REMOVE_PROJECT_TEMPLATE_TASK_TEAM_MEMBER,
    {
      projectTemplateId: props.projectTemplateId,
      id: props.id,
      userId: user.id
    }
  );
}
function orderProjectTemplateTaskSteps() {
  stepsState.steps = _.orderBy(
    projectTemplateTaskSteps.value,
    ["order"],
    ["asc"]
  );
}

async function handleStepSortig(e: any, newIndex: any) {
  let originalData = JSON.parse(JSON.stringify(e));
  let updatedData = JSON.parse(JSON.stringify(originalData));
  if (updatedData != null) {
    updatedData.order = newIndex + 1;
  }
  store
    .dispatch(ProjectTemplateStore.actions.PATCH_PROJECT_TEMPLATE_TASK_STEP, {
      projectTemplateId: props.projectTemplateId,
      projectTemplateTaskId: props.id,
      id: originalData.id,
      original: originalData,
      updated: updatedData
    })
    .then(() => {
      originalData.order = newIndex + 1;
    });
}
function stepMoved(e: any, typeId: any) {
  if (e.moved) {
    e = e.moved;
    handleStepSortig(e.element, e.newIndex);
  }
}
watch(
  [() => projectTemplateTaskSteps],
  () => {
    orderProjectTemplateTaskSteps();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.profile-picture {
  @apply inline-block h-8 w-8 rounded-full;
}
</style>
