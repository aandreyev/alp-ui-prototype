<template>
  <shad-modal-form
    modalTitle="Create Project"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createProject"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="projectTemplate">
        <shad-form-item class="w-full">
          <shad-form-label>Project Template (Optional)</shad-form-label>
          <shad-form-control>
            <project-template-selector-field
              name="projectTemplate"
              @selected="getSelectedProjectTemplate($event)"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="name" class="">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Name</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Name"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="owner">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Owner</shad-form-label>
          <shad-form-control>
            <user-selector-field
              name="owner"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'owner')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="isSharePointChecked">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-control>
            <div class="space-x-2">
              <shad-checkbox
                :checked="state.isSharePointChecked"
                @update:checked="handleChangeCheckbox"
              />
              <shad-form-label>Provision SharePoint Folder</shad-form-label>
            </div>
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="isBAU">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-control>
            <div class="space-x-2">
              <shad-checkbox
                :checked="state.isBAU"
                @update:checked="handleChangeCheckboxBusiness"
              />
              <shad-form-label>Business As Usual</shad-form-label>
            </div>
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import ProjectTemplateSelectorField from "@/components/forms/selectors/ProjectTemplateSelectorField.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";

import { ProjectStore } from "@/store/modules/projects";
import { reactive } from "vue";
import { useStore } from "vuex";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { ProjectTemplateDto, ProjectInput } from "@/network/dtos/project-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const projectFormSchema = toTypedSchema(
  z.object({
    name: z.string({ required_error: "Name  is required" }),
    projectTemplate: z.union([
      z
        .object({
          id: z.number().optional()
        })
        .optional(),
      z.null()
    ]),
    owner: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ])
  })
);

const emit = defineEmits(["created", "close"]);
interface ProjectValues {
  projectTemplate: ProjectTemplateDto;
  name: string;
  owner: UserListDto;
}

const handleSubmit = useForm({
  validationSchema: projectFormSchema,
  initialValues: {
    // gender: state.genders
  }
});
const store = useStore();

const state = reactive({
  isSharePointChecked: false,
  isBAU: false,
  closeModel: false,
  isLoading: false
});

const createProject = handleSubmit.handleSubmit((values) => {
  state.isLoading = true;
  if (values.owner.id) {
    store
      .dispatch(
        ProjectStore.actions.CREATE_PROJECT,
        ProjectInput.fromJS({
          projectTemplateId: values.projectTemplate?.id,
          name: values.name,
          ownerId: values.owner.id,
          isSharePointChecked: state.isSharePointChecked,
          isBAU: state.isBAU
        })
      )
      .then((project) => {
        emit("created", project);
        emit("close");
        state.closeModel = true;
        state.isLoading = false;
      });
  }
});
function closeDialog() {
  state.closeModel = false;
  state.isSharePointChecked = false;
  state.isBAU = false;
  state.isLoading = false;
}
function handleChangeCheckbox(event: any) {
  state.isSharePointChecked = !state.isSharePointChecked;
  state.isSharePointChecked = event;
}
function handleChangeCheckboxBusiness(event: any) {
  state.isBAU = !state.isBAU;
  state.isBAU = event;
}
function updateSelector(value: any, fieldName: any) {
  if (value == null) handleSubmit.resetField(fieldName);
}


function getSelectedProjectTemplate(param: ProjectTemplateDto) {
  // If Project Template is selected, set value to Name and Owner
  if (param) {
    handleSubmit.setFieldValue("name", param.name);
    handleSubmit.setFieldValue("owner", param.owner);
  }

}

</script>
