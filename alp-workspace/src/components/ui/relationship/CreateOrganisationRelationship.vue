<template>
  <shad-modal-form
    modalTitle="Create Parent Organisation Relationship"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createRelationship"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="primaryOrganisation">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Primary Organisation
          </shad-form-label>
          <shad-form-control>
            <organisation-selector-field
              name="PrimaryOrganisation"
              v-bind="componentField"
              @selected="selectOrganisation"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="relationship">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Contact Relationships</shad-form-label
          >
          <shad-select v-bind="componentField" class="z-0">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Contact Relationships" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label
                  >Select Contact Relationships</shad-select-label
                >
                <shad-select-item
                  class="select-items"
                  v-for="option in OrganisationRelationshipTypes"
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
  </shad-modal-form>
</template>

<script setup lang="ts">
import { useEnum } from "@/composable/enum";
import OrganisationSelectorField from "@/components/forms/selectors/OrganisationSelectorField.vue";
import { useForm, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { OrganisationStore } from "@/store/modules/organisations";
import {
  OrganisationListDto,
  OrganisationRelationshipInput
} from "@/network/dtos/organisation-dto";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  OrganisationRelationshipType,
  OrganisationRelationships
} from "@/network/dtos/enumTypes";

interface CreateOrganisationRelationshipInput {
  PrimaryOrganisation: OrganisationListDto;
  relationshipType: OrganisationRelationshipType;
  relationship: OrganisationRelationships;
}
const relationshipFormSchema = toTypedSchema(
  z.object({
    relationship: z.string({
      required_error: "Relationship is required"
    }),

    primaryOrganisation: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ])
  })
);
const props = defineProps<{
  id: number;
}>();
const emit = defineEmits(["created", "close"]);
const handleSubmit = useForm({
  validationSchema: relationshipFormSchema,
  initialValues: {}
});
const store = useStore();
const state = reactive({
  closeModel: false,
  isLoading: false,
  organsation: new OrganisationListDto()
});
const { toDropdownOptions: toOrganisationRelationshipTypeOptions } = useEnum(
  OrganisationRelationships
);
const OrganisationRelationshipTypes = toOrganisationRelationshipTypeOptions();
const createRelationship = handleSubmit.handleSubmit((values) => {
  const relationships = new OrganisationRelationshipInput({
    primaryOrganisationId: values.primaryOrganisation?.id,
    primaryOrganisationFullName: state.organsation.name,
    organisationRelationshipType: OrganisationRelationshipType.Parent,
    organisationRelationship: values.relationship
  });
  store
    .dispatch(OrganisationStore.actions.CREATE_ORGANISATION_RELATIONSHIPS, {
      id: props.id,
      relationships
    })
    .then((contact) => {
      emit("created", contact);
      emit("close");
    });
});

function selectOrganisation(value: any) {
  state.organsation = value;
}
function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
}
</script>
