<template>
  <slide-over heading="Standard Task" @close="$emit('close')">
    <div class="py-3 px-6">
      <span class="flex justify-between mx-3">
        <span class="flex-1 flex justify-end">
          <alp-button-with-text
            context="Delete"
            :color="'red'"
            icon-name="fa-solid fa-trash fa-2xl"
            @click.stop="deleteStandardTask"
          />
        </span>
      </span>
    </div>

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
                  <shad-label for="project-task-name"
                    >Standard Task Name</shad-label
                  >
                  <inline-input
                    placeholder="Task Name"
                    v-model="state.name"
                    rules="required"
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
                  <field-label class="w-full" name="Business Area">
                    <business-area-selector v-model="state.businessArea" />
                  </field-label>
                </div>

                <div class="col-span-full">
                  <div class="grid gap-1">
                    <span class="font-semibold text-sm">Metadata</span>
                    <standard-task-metadata :id="id" />
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
                        <inline-standard-task-step
                          :standard-task-id="id"
                          :standard-task-step="value"
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
import FieldLabel from "@/components/forms/FieldLabel.vue";
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import InlineEditor from "@/components/inputs/InlineEditor.vue";
import InlineInput from "@/components/inputs/InlineInput.vue";
import BusinessAreaSelector from "@/components/inputs/selectors/BusinessAreaSelector.vue";
import InlineStandardTaskStep from "@/components/ui/admin/standard-tasks/InlineStandardTaskStep.vue";
import StandardTaskMetadata from "@/components/ui/admin/standard-tasks/StandardTaskMetadata.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { usePatchable } from "@/composable/patchable";

import { ProjectTemplateStore } from "@/store/modules/project-templates";
import { ApiStore } from "@/store/utils";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";
import AlpDraggable from "@/components/common/layout/AlpDraggable.vue";
import _ from "lodash";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";
import {
  StandardTaskDto,
  StandardTaskStepDto
} from "@/network/dtos/project-dto";

const props = defineProps<{
  id: number;
}>();
const emit = defineEmits(["close"]);

const store = useStore();
const isDraggable = ref(true);

const { state } = usePatchable<StandardTaskDto>({
  identifier: props.id,
  getter: ProjectTemplateStore.getters.GET_STANDARD_TASK,
  query: ProjectTemplateStore.actions.GET_STANDARD_TASK,
  queryParams: () => ({
    id: props.id
  }),
  patchQuery: ProjectTemplateStore.actions.PATCH_STANDARD_TASK,
  patchQueryParams: () => ({
    id: props.id
  })
});

const stepsState = reactive({
  steps: Array<StandardTaskStepDto>()
});
const standardTaskSteps = computed(
  () =>
    ApiStore.toData<StandardTaskStepDto[]>(
      store.getters[ProjectTemplateStore.getters.GET_STANDARD_TASK_STEPS](
        props.id
      )
    ) || []
);

onMounted(() => {
  store.dispatch(ProjectTemplateStore.actions.GET_STANDARD_TASK_STEPS, {
    standardTaskId: props.id
  });
});

function createStep(description: string) {
  store.dispatch(ProjectTemplateStore.actions.CREATE_STANDARD_TASK_STEP, {
    standardTaskId: props.id,
    standardTaskStep: {
      description
    }
  });
}

function deleteStandardTask() {
  store
    .dispatch(ProjectTemplateStore.actions.DELETE_STANDARD_TASK, {
      id: props.id
    })
    .then(() => {
      emit("close");
    });
}

async function handleStepSortig(e: any, newIndex: any) {
  let originalData = JSON.parse(JSON.stringify(e));
  let updatedData = JSON.parse(JSON.stringify(originalData));
  if (updatedData != null) {
    updatedData.order = newIndex + 1;
  }
  store
    .dispatch(ProjectTemplateStore.actions.PATCH_STANDARD_TASK_STEP, {
      standardTaskId: props.id,
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
function orderProjectSteps() {
  stepsState.steps = _.orderBy(standardTaskSteps.value, ["order"], ["asc"]);
}
watch(
  [() => standardTaskSteps],
  () => {
    orderProjectSteps();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.profile-picture {
  @apply inline-block h-8 w-8 rounded-full;
}
</style>
