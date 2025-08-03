<template>
  <shad-modal-form
    modalTitle="Create Support Ticket"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="CreateSupportTicket"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField, errorMessage }" name="shortDescription">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Short Description</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Short Description"
              v-bind="componentField"
              :class="{ 'border-red-500': errorMessage }"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField, errorMessage }" name="reportingType">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Reporting Type</shad-form-label>
          <shad-select v-bind="componentField" class="z-0" :class="{ 'border-red-500': errorMessage }">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Reporting Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Reporting Type</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in reportingType"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.key }}
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField, errorMessage }" name="priority">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Priority</shad-form-label>
          <shad-select v-bind="componentField" class="z-0" :class="{ 'border-red-500': errorMessage }">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Priority" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Priority</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in priorities"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.key }}
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField, errorMessage }" name="description">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Description</shad-form-label>
          <shad-form-control>
            <editor-field
              type="text"
              placeholder="Description"
              v-bind="componentField"
              v-model="state.description"
              :class="{ 'border-red-500': errorMessage }"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import EditorField from "@/components/forms/EditorField.vue";
import { BugPriorityType, ReportingTypes } from "@/network/dtos/enumTypes";
import { FeedbackStore } from "@/store/modules/feedback";
import { reactive, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

const emit = defineEmits(["created", "close"]);

const bugReportFormSchema = toTypedSchema(
  z.object({
    shortDescription: z
      .string({ required_error: "Short Description is required" })
      .nonempty({ message: "Short Description is required" }),
    reportingType: z
      .string({ required_error: "Reporting Type is required" })
      .nonempty({ message: "Reporting Type is required" }),
    priority: z
      .string({ required_error: "Priority is required" })
      .nonempty({ message: "Priority is required" }),
    description: z
      .string({ required_error: "Description is required" })
      .nonempty({ message: "Description is required" })
  })
);

const defaultDescription = `<div>
  <h3>Issue System (Syntaq or Portal): </h3>
  <p>
    <br data-mce-bogus="1">
  </p>
</div>
<h3>What am I expecting to happen </h3>
<p>
  <br data-mce-bogus="1">
</p>
<h3>What I saw instead&nbsp; </h3>
<p>
  <br data-mce-bogus="1">
</p>
<h3>Steps to Reproduce </h3>`;

const state: any = reactive({
  documents: [],
  closeModel: false,
  isLoading: false,
  description: defaultDescription,
});

const handleSubmit = useForm({
  validationSchema: bugReportFormSchema,
  initialValues: {
    description: defaultDescription,
    shortDescription: "",
    reportingType: "",
    priority: "",
  },
});

onMounted(() => {
  state.description = defaultDescription;
});

function resetForm() {
  handleSubmit.resetForm({
    values: {
      description: defaultDescription,
      shortDescription: "",
      reportingType: "",
      priority: "",
    },
  });
  state.description = defaultDescription;
}

let dropzoneFile = ref("");
const drop = (e: any) => {
  dropzoneFile.value = e.dataTransfer.files;
  if (e.dataTransfer && e.dataTransfer.files) {
    state.documents.push(Array.from(e.dataTransfer.files));
  }
};

const upload = ref<HTMLInputElement | null>(null);
const store = useStore();

const priorities = Object.keys(BugPriorityType)
  .filter((s) => !isNaN(parseInt(s)))
  .map((s) => ({ value: s, key: BugPriorityType[parseInt(s)] }));

const reportingType = Object.keys(ReportingTypes)
  .filter((s) => !isNaN(parseInt(s)))
  .map((s) => ({ value: s, key: ReportingTypes[parseInt(s)] }));

const CreateSupportTicket = handleSubmit.handleSubmit(async (values) => {
  try {
    state.isLoading = true;
    const result = await store.dispatch(FeedbackStore.actions.CREATE_BUG_REPORT, values);
    emit("created", result);
    state.closeModel = true;
    resetForm();
    emit("close");
  } catch (error) {
    console.error("Error creating bug report:", error);
  } finally {
    state.isLoading = false;
  }
});
function deleteBugDocument(index: number) {
  state.documents.splice(index, 1);
}

function getFile(info: string, fileName: string) {
  let file = fileName.split(".");
  if (info == "name") {
    return file[0];
  } else {
    return "." + file[1];
  }
}
function closeDialog() {
  resetForm();
  emit("close");
}
</script>
