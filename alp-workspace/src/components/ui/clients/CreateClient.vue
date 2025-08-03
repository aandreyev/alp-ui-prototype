<template>
  <shad-modal-form
    modalTitle="Create Client"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createClient"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="primaryContact">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Primary Contact</shad-form-label>
          <shad-form-control>
            <contact-selector-field
              name="primaryContact"
              rules="required|distinctEntity:secondaryContact"
              v-bind="componentField"
              @selected="updateSelector($event, 'primaryContact')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="secondaryContact">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label>Secondary Contact</shad-form-label>
          <shad-form-control>
            <contact-selector-field
              name="secondaryContact"
              rules="distinctEntity:primaryContact"
              v-bind="componentField"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="organisation">
        <shad-form-item class="w-full mr-3">
          <shad-form-label>Organisation</shad-form-label>
          <shad-form-control>
            <organisation-selector-field name="organisation" v-bind="componentField" />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import ContactSelectorField from "@/components/forms/selectors/ContactSelectorField.vue";
import OrganisationSelectorField from "@/components/forms/selectors/OrganisationSelectorField.vue";
import { ClientStore } from "@/store/modules/clients";
import { reactive } from "vue";
import { useStore } from "vuex";

import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { ClientInput } from "@/network/dtos/client-dto";
import { ContactListDto } from "@/network/dtos/contact-dto";
import { OrganisationListDto } from "@/network/dtos/organisation-dto";

const clientFormSchema = toTypedSchema(
  z.object({
    primaryContact: z.union([
      z.object({
        id: z.number().optional(),
      }),
      z.null(),
    ]),
    secondaryContact: z.union([
      z
        .object({
          id: z.number().optional(),
        })
        .optional(),
      z.null(),
    ]),
    organisation: z.union([
      z
        .object({
          id: z.number().optional(),
        })
        .optional(),
      z.null(),
    ]),
  })
);
interface CreateClientInput {
  primaryContact: ContactListDto;
  secondaryContact: ContactListDto | null;
  organisation: OrganisationListDto | null;
}
const handleSubmit = useForm({
  validationSchema: clientFormSchema,
});

const emit = defineEmits(["created", "close"]);
const state = reactive({
  closeModel: false,
  isLoading: false,
});
const store = useStore();

const createClient = handleSubmit.handleSubmit((values) => {
  state.isLoading = true;
  const input = new ClientInput({
    primaryContactId: values.primaryContact?.id,
    secondaryContactId: values.secondaryContact?.id,
    organisationId: values.organisation?.id,
  });

  store.dispatch(ClientStore.actions.CREATE_CLIENT, input).then((client) => {
    emit("created", client);
    emit("close");
    state.closeModel = true;
    state.isLoading = false;
  });
});
function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
}
function updateSelector(value: any, fieldName: any) {
  if (value == null) handleSubmit.resetField(fieldName);
}
</script>
