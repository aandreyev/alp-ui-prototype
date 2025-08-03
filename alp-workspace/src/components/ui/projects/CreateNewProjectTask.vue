<template>
  <shad-modal-form
    modalTitle="Create Project Task"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createProjectTask"
    :isLoading="state.isLoading"
  >
    <div class="flex justify-end">
      <shad-button
        v-if="state.showStandardTaskSelector"
        class="mr-1"
        variant="outline"
        :active="state.showStandardTaskSelector"
        v-on:click.prevent="
          state.showStandardTaskSelector = !state.showStandardTaskSelector
        "
      >
        Go Back
      </shad-button>
    </div>

    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="standard"
        v-if="state.showStandardTaskSelector"
      >
        <shad-form-item class="w-full">
          <shad-form-control>
            <standard-task-selector
              class="flex-1"
              @selected="createProjectTaskFromStandard"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div v-if="state.showStandardTaskSelector == false">
      <div class="flex gap-4 mb-4">
        <shad-form-field v-slot="{ componentField }" name="name">
          <shad-form-item class="w-1/2 space-y-2">
            <shad-form-label :isRequired="false">Name</shad-form-label>
            <shad-form-control>
              <div>
                <div class="flex justify-end">
                  <shad-button
                    class="mr-1 text-base bg-[#f4f4f5]"
                    variant="tabs"
                    :active="state.showStandardTaskSelector"
                    v-on:click.prevent="
                      state.showStandardTaskSelector =
                        !state.showStandardTaskSelector
                    "
                  >
                    <font-awesome-icon
                      :color="
                        state.showStandardTaskSelector == true ? 'blue' : ''
                      "
                      icon="fa-solid fa-list"
                    />
                  </shad-button>
                  <shad-input
                    type="text"
                    placeholder="Task Name "
                    v-bind="componentField"
                  />
                </div>
              </div>
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
        <shad-form-field v-slot="{ componentField }" name="estimatedtime">
          <shad-form-item class="w-1/2 space-y-2">
            <shad-form-label :isRequired="false">Est. Units</shad-form-label>
            <shad-form-control>
              <shad-input
                type="number"
                placeholder="Units"
                v-bind="componentField"
              />
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
      </div>
      <div class="flex gap-4 mb-4 items-center">
        <shad-form-field name="dueDate">
          <shad-form-item class="w-1/2">
            <shad-form-label>Due Date</shad-form-label>
            <shad-form-control>
              <date-field
                v-slot="{ componentField, value }"
                placeholder="Due Date"
                name="dueDate"
              />
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>

        <shad-form-field v-slot="{ componentField }" name="assigned">
          <shad-form-item class="w-1/2">
            <shad-form-label :isRequired="false">Assignees</shad-form-label>
            <shad-form-control>
              <span class="w-full flex flex-wrap">
                <span
                  v-for="(assignee, index) in state.userSelector"
                  :key="`business-${index}`"
                  class="w-full md:w-1/2 flex items-center py-1"
                >
                  <user-selector
                    class="flex-1"
                    v-model="state.userSelector[index]"
                    disabled
                  />
                  <span
                    class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                    role="button"
                    @click="removeAssignee(assignee)"
                  >
                    <font-awesome-icon icon="fa-solid fa-xmark" />
                  </span>
                </span>
              </span>
              <span class="w-full">
                <user-selector
                  @update:modelValue="addAssignee"
                  v-bind="componentField"
                ></user-selector>
              </span>
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
      </div>
      <div class="flex">
        <shad-form-field v-slot="{ componentField }" name="description">
          <shad-form-item class="w-full">
            <shad-form-label :isRequired="false">Description</shad-form-label>
            <shad-form-control>
              <text-area
                class="textarea-col"
                type="number"
                placeholder="Description"
                v-bind="componentField"
              />
            </shad-form-control>
            <shad-form-message />
          </shad-form-item>
        </shad-form-field>
      </div>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import { ProjectStore } from "@/store/modules/projects";

import StandardTaskSelector from "@/components/inputs/selectors/StandardTaskSelector.vue";
import { reactive } from "vue";
import { useStore } from "vuex";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";

import { toDateTime } from "@/composable/date";
import { ProjectTaskStatus } from "@/network/dtos/enumTypes";
import { StandardTaskDto } from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const props = defineProps<{
  projectId: Number;
  status: Number;
  cardType?: Number;
}>();
const emit = defineEmits(["created", "close"]);

const store = useStore();

const state = reactive({
  showStandardTaskSelector: false,
  closeModel: false,
  userSelector: [] as UserListDto[],
  isLoading: false
});
const taskFormSchema = toTypedSchema(
  z.object({
    name: z.string({ required_error: "name field is required" }),
    status: z.number().optional(),
    standared: z.union([
      z
        .object({
          id: z.number().optional()
        })
        .optional(),
      z.null()
    ]),
    estimatedtime: z.number({
      required_error: "estimated units field is required"
    }),
    dueDate: z.union([z.date().nullable().optional(), z.string()]),

    assigned: z.union([
      z
        .object({
          id: z.number().optional()
        })
        .optional(),
      z.null(),
      z.number().array().optional()
    ]),
    description: z.string({
      required_error: "description field is required"
    })
  })
);
const { handleSubmit } = useForm({
  validationSchema: taskFormSchema
});
const createProjectTask = handleSubmit((values) => {
  state.isLoading = true;
  values.assigned = state.userSelector?.map((a) => a.id!);

  if (values.dueDate) {
    values.dueDate = toDateTime(values.dueDate)?.toUTC();
  }

  if (props.cardType != undefined) values.status = props.cardType;
  store
    .dispatch(ProjectStore.actions.CREATE_PROJECT_TASK, {
      projectId: props.projectId,
      projectTask: values
    })
    .then(() => {
      state.userSelector.splice(0);
      state.closeModel = true;
      state.isLoading = false;
    });
});

function createProjectTaskFromStandard(standardTask: StandardTaskDto) {
  state.isLoading = true;
  if (standardTask) {
    store
      .dispatch(ProjectStore.actions.CREATE_PROJECT_TASK_FROM_STANDARD, {
        projectId: props.projectId,
        standardTaskId: standardTask.id,
        status:
          props.cardType != undefined ? props.cardType : ProjectTaskStatus.ToDo
      })
      .then(() => {
        state.closeModel = true;
        store
          .dispatch(ProjectStore.actions.GET_PROJECT_TASKS, {
            projectId: props.projectId
          })
          .then(() => {
            state.showStandardTaskSelector = false;
          });
      })
      .then(() => {
        state.isLoading = false;
      });
  }
}
function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
  state.userSelector.splice(0);
}
function addAssignee(user: UserListDto) {
  state.userSelector?.push(user);
}
function removeAssignee(user: UserListDto) {
  if (user) {
    const idx = state.userSelector.indexOf(user);
    state.userSelector.splice(idx, 1);
  }
}
</script>
<style>
.textarea-col {
  height: 40px !important;
}
</style>
