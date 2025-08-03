<template>
  <shad-modal-form
    :modalTitle="'Allocate Support Tickets to Project Task'"
    :modalDescription="'Assign selected support tickets to a project task for tracking and resolution'"
    :closeModal="false"
    @closeModel="$emit('close')"
    @submitValue="onSubmit"
    :isLoading="isSubmitting"
    :modalIcon="'lucide:ticket'"
    :modalIconColor="'text-blue-500'"
    :confirmButtonText="'Allocate Tickets'"
    :confirmIcon="'lucide:check-circle'"
    :confirmButtonDisabled="isSubmitting || tickets.length === 0"
  >
    <!-- Project Task Selection -->
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="projectTask">
        <shad-form-item class="w-full">
          <shad-form-label>Project Task</shad-form-label>
          <shad-form-control>
            <project-selector
              v-model:modelValue="state.project"
              can-clear
              placeholder="Select a project to assign"
              @update:modelValue="updateProject"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>

    <!-- Selected Tickets List -->
    <div class="flex" v-if="tickets.length">
      <shad-form-item class="w-full">
        <div class="flex items-center justify-between">
          <p class="font-medium flex items-center">
            <iconify-icon
              icon="lucide:list-checks"
              class="mr-2 text-blue-500"
            />
            Selected Tickets: {{ tickets.length }}
          </p>
        </div>

        <ul
          class="list-none pl-2 mt-3 space-y-2 max-h-48 overflow-y-auto pr-2 border border-gray-100 rounded-md p-3 bg-gray-50"
        >
          <li
            v-for="(ticket, index) in tickets.slice(0, 5)"
            :key="index"
            class="text-sm p-2 rounded-md transition-colors duration-200 hover:bg-gray-100 flex justify-between"
            :class="{'bg-yellow-50 border border-yellow-200': hasProjectTask(ticket)}"
          >
            <div class="flex items-start space-x-2">
              <iconify-icon 
                :icon="hasProjectTask(ticket) ? 'lucide:alert-triangle' : 'lucide:ticket'" 
                :class="hasProjectTask(ticket) ? 'mt-0.5 text-yellow-500' : 'mt-0.5 text-blue-500'" 
              />
              <span>
                {{ truncateText(ticket.shortDescription || "", 40) }}
                <span v-if="hasProjectTask(ticket)" class="text-xs text-yellow-600 block">
                  Already assigned to a project
                </span>
              </span>
            </div>
            <span class="text-xs text-gray-500">
              #{{ ticket.id }} | {{ toPriorityDescription(ticket.priority) }}
            </span>
          </li>
          <li
            v-if="tickets.length > 5"
            class="text-center text-xs text-gray-500 italic mt-2"
          >
            And {{ tickets.length - 5 }} more tickets...
          </li>
        </ul>
      </shad-form-item>
    </div>
    <div
      v-else
      class="text-red-500 text-xs p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2"
    >
      <iconify-icon icon="lucide:alert-circle" class="mt-0.5" />
      <span>No tickets selected. Please select at least one ticket.</span>
    </div>

    <!-- Warning for tickets with project tasks -->
    <div
      v-if="getTicketsWithProjectTask().length > 0"
      class="text-yellow-600 text-xs p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start space-x-2 mt-3"
    >
      <iconify-icon icon="lucide:alert-triangle" class="mt-0.5" />
      <span>
        {{ getTicketsWithProjectTask().length }} ticket(s) already assigned to projects will be skipped.
      </span>
    </div>

    <!-- Note Field -->
    <div class="flex mt-4">
      <shad-form-field v-slot="{ componentField }" name="note">
        <shad-form-item class="w-full">
          <shad-form-label>Note (Optional)</shad-form-label>
          <shad-form-control>
            <text-area
              name="note"
              v-model="state.note"
              placeholder="Add a note about this allocation"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import { useNotify } from "@/composable/notify";
import { useStore } from "vuex";
import { computed, reactive, ref, watch } from "vue";
import ProjectSelector from "@/components/inputs/selectors/ProjectSelector.vue";
import TextArea from "@/components/inputs/TextArea.vue";
import { BugPriorityType } from "@/network/dtos/enumTypes";
import { FeedbackStore } from "@/store/modules/feedback";
import { BugReportDto } from "@/network/dtos/support-ticket-dto";
import { ProjectDto } from "@/network/dtos/project-dto";

interface Props {
  tickets: BugReportDto[];
}

const props = defineProps<Props>();
const emit = defineEmits(["close"]);
const store = useStore();
const { fireSuccessToast, fireErrorToast } = useNotify();
const isSubmitting = ref(false);

const state = reactive({
  project: null as ProjectDto | null,
  note: ""
});

// Function to get tickets that already have a project task
function getTicketsWithProjectTask(): BugReportDto[] {
  return props.tickets.filter(ticket => hasProjectTask(ticket));
}

// Function to check if a ticket already has a project task
function hasProjectTask(ticket: BugReportDto): boolean {
  return ticket.projectTask !== undefined && ticket.projectTask !== null;
}

function updateProject(project: ProjectDto) {
  state.project = project;
}

// watch(
//   () => state.project,
//   () => {
//     console.log("project", state.project);
//   }
// );

function toPriorityDescription(status: BugPriorityType | undefined): string {
  if (status === undefined) return "";
  const priorityDescription = BugPriorityType[status];
  return priorityDescription?.match(/[A-Z][a-z]+|[0-9]+/g)?.join(" ") || "";
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

async function onSubmit(): Promise<void> {
  if (!state.project) {
    fireErrorToast("Please select a project");
    return;
  }

  if (!props.tickets || props.tickets.length === 0) {
    fireErrorToast("No tickets selected for allocation");
    return;
  }

  // Check if any selected ticket already has a project task
  const ticketsWithProject = getTicketsWithProjectTask();
  if (ticketsWithProject.length > 0) {
    // Get tickets without project tasks
    const ticketsToAllocate = props.tickets.filter(ticket => !hasProjectTask(ticket));
    
    if (ticketsToAllocate.length === 0) {
      fireErrorToast("All selected tickets are already assigned to projects");
      return;
    }

    isSubmitting.value = true;

    if (state.project) {
      await store.dispatch(FeedbackStore.actions.ALLOCATE_TO_PROJECT, {
        bugReportIds: ticketsToAllocate.map((ticket) => ticket.id),
        projectId: state.project.id,
        note: state.note
      });
      isSubmitting.value = false;
      fireSuccessToast(`${ticketsToAllocate.length} ticket(s) allocated to project task successfully. ${ticketsWithProject.length} ticket(s) were skipped as they are already assigned.`);
      emit("close");
    } else {
      isSubmitting.value = false;
      fireErrorToast("Please select a project");
    }
  } else {
    isSubmitting.value = true;

    if (state.project) {
      await store.dispatch(FeedbackStore.actions.ALLOCATE_TO_PROJECT, {
        bugReportIds: props.tickets.map((ticket) => ticket.id),
        projectId: state.project.id,
        note: state.note
      });
      isSubmitting.value = false;
      fireSuccessToast("Tickets allocated to project task successfully");
      emit("close");
    } else {
      isSubmitting.value = false;
      fireErrorToast("Please select a project");
    }
  }
}
</script>