<template>
  <shad-modal-form
    modalTitle="Create Matter"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createMatter"
    :isLoading="state.isSubmitting"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="client">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Client</shad-form-label>
          <shad-form-control>
            <client-selector-field
              name="client"
              rules="required"
              :can-create="true"
              @selected="updateSelector($event, 'client')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="office">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Office</shad-form-label>
          <shad-form-control>
            <office-selector-field
              name="office"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'office')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="offering">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Offering</shad-form-label>
          <shad-form-control>
            <span class="w-full flex flex-wrap">
              <span
                v-for="(offering, index) in state.offerings"
                :key="`offering-${index}`"
                class="w-full md:w-1/2 flex items-center py-1"
              >
                <offering-selector
                  class="flex-1"
                  v-model="state.offerings[index]"
                  disabled
                />

                <span
                  class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                  role="button"
                  @click="removeOffering(offering)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" />
                </span>
              </span>
            </span>
            <span class="w-full">
              <offering-selector @update:modelValue="addOffering" />
            </span>
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="name" class="">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Matter Name</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Matter Name"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="description" class="">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true"
            >Matter Description</shad-form-label
          >
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Matter Description"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="reviewer">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Reviewer</shad-form-label>
          <shad-form-control>
            <reviewer-selector-field
              :offering-ids="
                state.offerings.map((o) => o?.id).filter((o) => o != null)
              "
              name="reviewer"
              rules="required"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="coordinator">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Coordinator</shad-form-label>
          <shad-form-control>
            <user-selector-field
              name="coordinator"
              rules="required"
              v-bind="componentField"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="team">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="false">Team</shad-form-label>
          <shad-form-control>
            <span class="w-full flex flex-wrap">
              <span
                v-for="(user, index) in state.team"
                :key="user.id"
                class="w-full md:w-1/2 flex items-center py-1"
              >
                <user-selector
                  class="flex-1"
                  v-model="state.team[index]"
                  disabled
                />

                <span
                  class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                  role="button"
                  @click="removeTeamMember(user)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" />
                </span>
              </span>
            </span>
            <span class="w-full">
              <user-selector @update:modelValue="addTeamMember" />
            </span>
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="conflictParties"
        class=""
      >
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Conflict Parties</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Conflict Parties"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="estimatedBudget"
        class=""
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Estimated Budget</shad-form-label>
          <shad-form-control>
            <shad-input
              type="number"
              placeholder="Estimated Budget"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field name="firstContactDate">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >First Contact Date</shad-form-label
          >
          <date-field
            v-slot="{ componentField, value }"
            placeholder="First Contact Date"
            name="firstContactDate"
            rules="required"
            :model-value="state.firstContactDate"
          />
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="opposingCounsels">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="false"
            >Opposing Counsels</shad-form-label
          >
          <shad-form-control>
            <span class="w-full flex flex-wrap">
              <span
                v-for="(contact, index) in state.opposingCounsels"
                :key="`contact-${index}`"
                class="w-full md:w-1/2 flex items-center py-1"
              >
                <contact-selector
                  class="flex-1"
                  :model-value="state.opposingCounsels[index]"
                  @update:model-value="
                    (val) =>
                      updateSelectorArray(val, state.opposingCounsels, index)
                  "
                  disabled
                  :can-create="false"
                />
                <span
                  class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                  role="button"
                  @click="removeOpposingCounsel(contact)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" />
                </span>
              </span>
            </span>
            <span class="w-full">
              <contact-selector @update:modelValue="addOpposingCounsel" />
            </span>
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="Other Parties">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="false">Other Parties</shad-form-label>
          <shad-form-control>
            <span class="w-full flex flex-wrap">
              <span
                v-for="(otherParty, index) in state.otherParties"
                :key="`otherParty-${index}`"
                class="w-full md:w-1/2 flex items-center py-1"
              >
                <contact-selector
                  class="flex-1"
                  :model-value="state.otherParties[index]"
                  @update:model-value="
                    (val) => updateSelectorArray(val, state.otherParties, index)
                  "
                  disabled
                  :can-create="false"
                />
                <span
                  class="h-6 w-6 relative flex-none flex items-center justify-center mx-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                  role="button"
                  @click="removeOtherParties(otherParty)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" />
                </span>
              </span>
            </span>
            <span class="w-full">
              <contact-selector @update:modelValue="addOtherParty" />
            </span>
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import ContactSelector from "@/components/inputs/selectors/ContactSelector.vue";
import ClientSelectorField from "@/components/forms/selectors/ClientSelectorField.vue";
import OfferingSelector from "@/components/inputs/selectors/OfferingSelector.vue";
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import UserSelector from "@/components/inputs/selectors/UserSelector.vue";
import ReviewerSelectorField from "@/components/forms/selectors/ReviewerSelectorField.vue";
import { toDateTime } from "@/composable/date";

import { MatterStore } from "@/store/modules/matters";
import { reactive, onMounted } from "vue";
import { useStore } from "vuex";
import { useNotify } from "@/composable/notify";
import { router } from "@/router";

import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { ClientDto } from "@/network/dtos/client-dto";
import { ContactListDto } from "@/network/dtos/contact-dto";
import { CreateMatterInput } from "@/network/dtos/matter-dto";
import { OfferingListDto } from "@/network/dtos/offering-dto";
import { OfficeDto } from "@/network/dtos/office-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const matterFormSchema = toTypedSchema(
  z.object({
    client: z
      .object({
        id: z.number()
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Client is required"
      }),
    office: z
      .object({
        id: z.number()
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Office is required"
      }),
    offering: z.string().optional(),
    name: z
      .string({ required_error: "Matter Name is required" })
      .nonempty({ message: "Matter Name is required" })
      .refine((val) => !/["*:<>?/\\|]/.test(val), {
        message:
          'Matter Name cannot contain special characters ( " * : < > ? / \\ | )'
      }),
    description: z
      .string({ required_error: "Matter Description is required" })
      .nonempty({ message: "Matter Description is required" }),
    reviewer: z
      .object({
        id: z.number()
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Reviewer is required"
      }),
    coordinator: z
      .object({
        id: z.number()
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Coordinator is required"
      }),
    team: z.string().optional(),
    conflictParties: z
      .string()
      .nonempty({ message: "Conflict Parties is required" }),
    estimatedBudget: z
      .number({
        required_error: "Estimated Budget is required"
      })
      .refine((val) => val >= 0, {
        message: "Estimated Budget must be greater than or equal to 0"
      }),
    firstContactDate: z.date({
      required_error: "First Contact Date is required"
    }),
    opposingCounsels: z.any().optional(),
    otherParties: z.any().optional()
  })
);

interface CreateMatterValues {
  name: string;
  description: string;
  client: ClientDto;
  reviewer: UserListDto;
  coordinator: UserListDto;
  estimatedBudget: number;
  firstContactDate: string;
  opposingCounsels: ContactListDto[];
  otherParties: ContactListDto[];
  conflictParties: string;
  offerings: OfferingListDto[];
  office: OfficeDto;
  team: UserListDto[];
}
const props = defineProps<{
  id?: String;
  client?: ClientDto;
  clientId?: string;
  modalOpen?: boolean;
}>();
const emit = defineEmits(["close"]);

const store = useStore();

const state = reactive({
  offerings: [] as OfferingListDto[],
  opposingCounsels: [] as ContactListDto[],
  otherParties: [] as ContactListDto[],
  team: [] as UserListDto[],
  closeModel: false,
  isLoading: false,
  firstContactDate: new Date(),
  isSubmitting: false
});
const { handleSubmit, resetForm, values } = useForm({
  validationSchema: matterFormSchema,
  initialValues: {
    client: props.client || null,
    office: null,
    offering: "",
    name: "",
    description: "",
    reviewer: null,
    coordinator: null,
    team: "",
    conflictParties: "",
    estimatedBudget: 0,
    firstContactDate: state.firstContactDate,
    opposingCounsels: [],
    otherParties: []
  }
});
const { fireConfirm, fireErrorToast } = useNotify();

function initializeFormWithClient() {
  if (props.client) {
    resetForm({
      values: {
        ...values,
        client: props.client
      }
    });
  }
}

onMounted(() => {
  initializeFormWithClient();
});

function addTeamMember(user: UserListDto) {
  state.team?.push(user);
}

function removeTeamMember(user: UserListDto) {
  if (user) {
    const idx = state.team.indexOf(user);
    state.team.splice(idx, 1);
  }
}

function addOffering(offering: OfferingListDto) {
  state.offerings?.push(offering);
}

function removeOffering(offering: OfferingListDto) {
  if (offering) {
    const idx = state.offerings.indexOf(offering);
    state.offerings.splice(idx, 1);
  }
}

function addOpposingCounsel(contact: ContactListDto) {
  state.opposingCounsels?.push(contact);
}

function addOtherParty(contact: ContactListDto) {
  state.otherParties?.push(contact);
}

function removeOpposingCounsel(contact: ContactListDto) {
  if (contact) {
    const idx = state.opposingCounsels.indexOf(contact);
    state.opposingCounsels.splice(idx, 1);
  }
}

function removeOtherParties(contact: ContactListDto) {
  if (contact) {
    const idx = state.otherParties.indexOf(contact);
    state.otherParties.splice(idx, 1);
  }
}

function updateSelector(value: any, fieldName: string) {
  if (value == null)
    resetForm({
      values: {
        ...values,
        [fieldName]: null
      }
    });
}

function updateSelectorArray(value: any, array: any[], index: number) {
  if (value == null) {
    array.splice(index, 1);
  } else {
    array[index] = value;
  }
}

const createMatter = handleSubmit((values) => {
  if (state.isSubmitting) return;
  state.isSubmitting = true;

  // Check if offerings array is empty
  if (state.offerings.length === 0) {
    fireErrorToast("At least one offering is required");
    state.isSubmitting = false;
    return;
  }

  const firstContactDate = toDateTime(values.firstContactDate)?.toUTC();
  if (
    values.reviewer?.id &&
    values.coordinator?.id &&
    firstContactDate &&
    values.client?.id
  ) {
    // Check duplication
    if (values.reviewer.id == values.coordinator.id) {
      fireErrorToast("Reviewer and Coordinator Cannot be the same person!");
      state.isSubmitting = false;
      return;
    }

    const input = new CreateMatterInput({
      clientId: values.client.id,
      name: values.name,
      description: values.description,
      reviewerId: values.reviewer.id,
      coordinatorId: values.coordinator.id,
      estimatedBudget: values.estimatedBudget,
      firstContactDate,
      offerings: state.offerings
        .filter((o) => o != null && o.id != null)
        .map((o) => o.id!),
      opposingCounsels: state.opposingCounsels
        .filter((o) => o != null && o.id != null)
        .map((o) => o.id!),
      officeId: values.office?.id as number,
      team: state.team
        .filter((o) => o != null && o.id != null)
        .map((o) => o.id!),
      otherParties: state.otherParties
        .filter((o) => o != null && o.id != null)
        .map((o) => o.id!),
      conflictParties: values.conflictParties
    });

    store.dispatch(MatterStore.actions.CREATE_MATTER, input).then((res) => {
      if (res.id != undefined) {
        router.push({
          name: "Matter",
          params: { id: res.id! }
        });
      }
      emit("close");
      state.closeModel = true;
      state.isSubmitting = false;
    });
  }
});

function closeDialog() {
  state.closeModel = false;
  state.isSubmitting = false;
  state.offerings = [];
  state.opposingCounsels = [];
  state.team = [];
  state.otherParties = [];

  emit("close");

  // Reset form when dialog closes
  resetForm({
    values: {
      client: null,
      office: null,
      offering: "",
      name: "",
      description: "",
      reviewer: null,
      coordinator: null,
      team: "",
      conflictParties: "",
      estimatedBudget: 0,
      firstContactDate: state.firstContactDate,
      opposingCounsels: [],
      otherParties: []
    }
  });
}
</script>
