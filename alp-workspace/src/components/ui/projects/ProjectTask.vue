<template>
  <slide-over heading="Project Task" @close="$emit('close')">
    <div class="flex justify-end space-x-2 mx-3">
      <alp-button-with-text
        context="Delete"
        :color="'red'"
        description="Permanently Delete"
        icon-name="fa-solid fa-trash fa-2xl"
        @click.stop="deleteProjectTask"
      />
    </div>

    <div class="flex-1 space-y-4 p-8 pt-6">
      <Tabs default-value="info">
        <TabsList>
          <TabsTrigger value="info" @click="tabState.selectedType = 'info'">
            Info
          </TabsTrigger>
          <TabsTrigger value="steps" @click="tabState.selectedType = 'steps'">
            Steps
          </TabsTrigger>
          <TabsTrigger
            value="time-entries"
            @click="tabState.selectedType = 'time-entries'"
          >
            Time Entries
          </TabsTrigger>
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
                  <shad-label for="project-task-name">Description</shad-label>
                  <inline-text-area
                    name="description"
                    v-model="state.description"
                  />
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
                  <field-label class="w-full" name="Due Date">
                    <date-field
                      name="dueDate"
                      rules="required"
                      placeholder="Due Date"
                      v-model="state.dueDate"
                    />
                  </field-label>
                </div>

                <div class="col-span-full">
                  <div class="grid gap-1">
                    <span class="font-semibold text-sm mb-2">Assignees</span>
                    <ShadMultiUserSelector
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
                    <project-task-metadata :project-id="projectId" :id="id" />
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
                  <div class="flex items-center space-x-2 my-2">
                    <shad-switch
                      id="step-checklist"
                      :checked="state.isStepsCheckList"
                      @update:checked="
                        state.isStepsCheckList = !state.isStepsCheckList
                      "
                    />
                    <shad-label for="step-checklist">Checklist</shad-label>
                    <shad-switch
                      id="is-draggable"
                      :checked="isDraggable"
                      @update:checked="isDraggable = !isDraggable"
                    />
                    <shad-label for="is-draggable">Enable Draggable</shad-label>
                  </div>

                  <div class="flex flex-col max-h-65vh overflow-y-auto">
                    <alp-draggable
                      :values="[
                        {
                          title: '',
                          tasks: stepState.steps,
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
                        <inline-project-task-step
                          :project-id="projectId"
                          :project-task-id="id"
                          :project-task-step="value"
                          class="bg-white flex items-center py-2 mb-1 border border-gray-300 rounded"
                          :key="value.id"
                          :isStepsCheckList="state.isStepsCheckList"
                          @updated="$emit('stepUpdated')"
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
        <TabsContent value="time-entries">
          <shad-card class="col-span-4">
            <shad-card-content class="pl-2">
              <project-task-time-entries :id="id" />
            </shad-card-content>
          </shad-card>
        </TabsContent>
      </Tabs>
    </div>
  </slide-over>
</template>

<script setup lang="ts">
import InlineInput from "@/components/inputs/InlineInput.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import InlineProjectTaskStep from "@/components/ui/projects/InlineProjectTaskStep.vue";
import ProjectTaskMetadata from "@/components/ui/projects/ProjectTaskMetadata.vue";
import { toDateTime } from "@/composable/date";
import { usePatchable } from "@/composable/patchable";

import { ProjectStore } from "@/store/modules/projects";
import { ApiStore } from "@/store/utils";
import { computed, onMounted, unref, reactive, watch, ref } from "vue";
import { useStore } from "vuex";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import AlpDraggable from "@/components/common/layout/AlpDraggable.vue";
import _ from "lodash";
import { useNotify } from "@/composable/notify";
import ProjectTaskTimeEntries from "@/components/ui/projects/ProjectTaskTimeEntries.vue";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import ShadMultiUserSelector from "@/components/inputs/selectors/ShadMultiUserSelector.vue";
import { ProjectTaskDto, ProjectTaskStepDto } from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";
const props = defineProps<{
  projectId: String;
  id: String;
}>();
const emit = defineEmits(["close", "stepUpdated"]);

const projectTaskFormSchema = toTypedSchema(
  z.object({
    description: z.string({ required_error: "description field is required" })
  })
);

const store = useStore();
const { fireConfirm, fireInfoToast } = useNotify();
const { state } = usePatchable<ProjectTaskDto>({
  identifier: props.id,
  getter: ProjectStore.getters.GET_PROJECT_TASK,
  query: ProjectStore.actions.GET_PROJECT_TASK,
  queryParams: () => ({
    projectId: props.projectId,
    id: props.id
  }),
  patchQuery: ProjectStore.actions.PATCH_PROJECT_TASK,
  patchQueryParams: () => ({
    projectId: props.projectId,
    id: props.id
  })
});

const isDraggable = ref(false);

const { handleSubmit } = useForm({
  validationSchema: projectTaskFormSchema
});
const stepState = reactive({
  steps: [] as ProjectTaskStepDto[]
});

const tabState = reactive({
  selectedType: "info"
});

const projectTaskSteps = computed(
  () =>
    ApiStore.toData<ProjectTaskStepDto[]>(
      store.getters[ProjectStore.getters.GET_PROJECT_TASK_STEPS](props.id)
    ) || []
);

onMounted(() => {
  store.dispatch(ProjectStore.actions.GET_PROJECT_TASK_STEPS, {
    projectId: props.projectId,
    projectTaskId: props.id
  });
});

//

const overdue = computed<boolean>(() =>
  unref(state)?.dueDate
    ? unref(state).dueDate! < toDateTime(new Date())!
    : false
);

function createStep(description: string) {
  store
    .dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_STEP, {
      projectId: props.projectId,
      projectTaskId: props.id,
      projectTaskStep: {
        description
      }
    })
    .then(() => {
      emit("stepUpdated");
    });
}

function addTeamMember(user: UserListDto) {
  store.dispatch(ProjectStore.actions.ADD_PROJECT_TASK_TEAM_MEMBER, {
    projectId: props.projectId,
    id: props.id,
    userId: user.id
  });
}
function removeTeamMember(user: UserListDto) {
  store.dispatch(ProjectStore.actions.REMOVE_PROJECT_TASK_TEAM_MEMBER, {
    projectId: props.projectId,
    id: props.id,
    userId: user.id
  });
}
async function handleStepSortig(e: any, newIndex: any) {
  let originalData = e;
  let updatedData = JSON.parse(JSON.stringify(originalData));
  if (updatedData != null) {
    updatedData.order = newIndex + 1;
  }
  store
    .dispatch(ProjectStore.actions.PATCH_PROJECT_TASK_STEP, {
      projectId: props.projectId,
      projectTaskId: props.id,
      id: originalData.id,
      original: originalData,
      updated: updatedData
    })
    .then(() => {
      emit("stepUpdated");
    });
}
function stepMoved(e: any, typeId: any) {
  if (e.moved) {
    e = e.moved;
    handleStepSortig(e.element, e.newIndex);
  }
}

function markTaskCompleted(tempData: ProjectTaskDto) {
  tempData.complete = true;
  tempData.status = 3;
}
function reopenTask(tempData: ProjectTaskDto) {
  tempData.complete = false;
  tempData.status = 2;
}
function orderProjectSteps() {
  stepState.steps = _.orderBy(projectTaskSteps.value, ["order"], ["asc"]);
}
watch(projectTaskSteps, orderProjectSteps);

function deleteProjectTask() {
  fireConfirm("Are you sure you want to delete this task?").then((result) => {
    if (result.isConfirmed) {
      store
        .dispatch(ProjectStore.actions.DELETE_PROJECT_TASK, {
          projectId: props.projectId,
          id: props.id
        })
        .then(() => {
          emit("close");
        });
    }
  });
}
</script>
