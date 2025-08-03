<template>
  <shad-modal-form
    modalTitle="Add Incoming Mail"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createIncomingMail"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="entryType"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Entry Type</shad-form-label>
          <shad-select
            v-bind="componentField"
            class="z-0"
            @update:modelValue="onChangeEntryType($event)"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Entry Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Entry Type</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in EntryTypes"
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
      <shad-form-field
        v-if="state.entryType == 1"
        v-slot="{ componentField }"
        name="matter"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Matter </shad-form-label>
          <shad-form-control>
            <matter-selector-field
              name="matter"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'matter')"
              v-model="state.matter"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-slot="{ componentField }"
        name="otherSenderType"
        class=""
        v-if="state.entryType == 2"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Other Type</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Other Type"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-slot="{ componentField }"
        name="office"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Office </shad-form-label>
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
      <shad-form-field name="receivedDate" :rules="{ required: true }">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Received Date</shad-form-label>

          <date-field
            v-slot="{ componentField, value }"
            placeholder="Date of Documents"
            name="receivedDate"
            rules="required"
            :modelValue="state.receivedDate"
          />

          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-slot="{ componentField }"
        name="senderType"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Sender Type</shad-form-label>
          <shad-select
            v-bind="componentField"
            class="z-0"
            @update:modelValue="onChangeSenderType($event)"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Sender Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Sender Type</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in SenderTypes"
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
      <shad-form-field
        v-slot="{ componentField }"
        name="senderContact"
        :rules="{ required: true }"
        v-if="state.senderType == 1"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Sender (Contact)
          </shad-form-label>
          <shad-form-control>
            <contact-selector-field
              name="senderContact"
              rules="required"
              @selected="updateSelector($event, 'senderContact')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>

      <shad-form-field
        v-slot="{ componentField }"
        name="senderStaff"
        v-else-if="state.senderType == 2"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Sender (Staff)</shad-form-label>
          <shad-form-control>
            <user-selector-field
              name="senderStaff"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'senderStaff')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>

      <shad-form-field
        v-slot="{ componentField }"
        name="senderOthers"
        :rules="{ required: true }"
        v-else-if="state.senderType == 3"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Other Sender</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Other Sender"
              v-bind="componentField"
              v-model="state.senderOther"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>

      <shad-form-field
        v-slot="{ componentField }"
        name="recipientStaff"
        :rules="{ required: true }"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Recipient (Staff)</shad-form-label
          >
          <shad-form-control>
            <user-selector-field
              name="recipientStaff"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'recipientStaff')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex"></div>
    <div class="flex">
      <shad-form-field
        v-slot="{ componentField }"
        name="description"
        class=""
        :rules="{ required: true }"
      >
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Description</shad-form-label>
          <shad-form-control>
            <text-area
              type="text"
              placeholder="Description"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
  </shad-modal-form>
</template>

<script setup lang="ts">
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import { useEnum } from "@/composable/enum";
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import { reactive, ref, watch } from "vue";
import { useStore } from "vuex";

import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import ContactSelectorField from "@/components/forms/selectors/ContactSelectorField.vue";
import { DateTime } from "luxon";

import { IncomingMailStore } from "@/store/modules/incomingmail";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

import { toDateTime } from "@/composable/date";
import { ContactDto } from "@/network/dtos/contact-dto";
import { EntryType, SenderType } from "@/network/dtos/enumTypes";
import { IncomingMailInput } from "@/network/dtos/mail-register-dto";
import { MatterDto } from "@/network/dtos/matter-dto";
import { OfficeDto } from "@/network/dtos/office-dto";
import { UserDto } from "@/network/dtos/user-dto";

let incomingMailObject = z.object({
  entryType: z.string({ required_error: "Entry Type is required" }),
  receivedDate: z.date({ required_error: "Received Date is required" }),
  senderType: z.string({ required_error: "Sender Type is required" }),
  description: z.string({ required_error: "Description is required" }),
  recipientStaff: z.object({
    id: z.number()
  }),
  senderStaff: z
    .union([
      z
        .object({
          id: z.number().optional()
        })
        .optional(),
      z.null()
    ])
    .refine(
      (data) => {
        if (state.senderType === "2") {
          return data !== null && data !== undefined;
        }
        return true;
      },
      {
        message: "Staff is required" // Custom error message
      }
    ),

  senderContact: z
    .union([
      z
        .object({
          id: z.number().optional()
        })
        .optional(),
      z.null()
    ])
    .refine(
      (data) => {
        if (state.senderType === "1") {
          return data !== null && data !== undefined;
        }
        return true;
      },
      {
        message: "Contact is required" // Custom error message
      }
    ),

  senderOthers: z
    .string()
    .optional()
    .refine(
      (data) => {
        if (state.senderType === "3") {
          return data !== null && data !== undefined && data !== "";
        }
        return true;
      },
      {
        message: "Other is required" // Custom error message
      }
    )
});

let initialSchema = ref(toTypedSchema(incomingMailObject));

const state = reactive({
  entryType: 0,
  senderType: 0,
  closeModel: false,
  removeValue: false,
  senderContact: new ContactDto(),
  senderStaff: new UserDto(),
  senderOther: "",
  recipientStaff: new UserDto(),
  matter: new MatterDto(),
  office: new OfficeDto(),
  isLoading: false,
  receivedDate: new Date()
});

//let initialSchema = ref(toTypedSchema(incomingMailObject));

const emit = defineEmits(["created", "close"]);

function updateValidationSchema() {
  let schema = incomingMailObject;

  if (state.entryType == 1) {
    schema = schema.extend({
      matter: z.union([
        z.object({
          id: z.number().optional()
        }),
        z.null()
      ])
    });
  } else if (state.entryType == 2) {
    schema = schema.extend({
      otherSenderType: z.string({
        required_error: "Other Sender Type is required"
      })
    });
  }

  if (state.senderType == 1) {
    schema = schema.extend({
      senderContact: z.union([
        z.object({
          id: z.number().optional()
        }),
        z.null()
      ])
    });
  } else if (state.senderType == 2) {
    schema = schema.extend({
      senderStaff: z.union([
        z.object({
          id: z.number().optional()
        }),

        z.null()
      ])
    });
  } else if (state.senderType == 3) {
    schema = schema.extend({
      senderOthers: z.string({ required_error: "Other Sender is required" })
    });
  }

  return schema;
}

const handleSubmit = useForm({
  validationSchema: initialSchema.value
});
interface createIncomingMailInput {
  entryType: EntryType;
  senderType: SenderType;
  matter: MatterDto | undefined;
  office: OfficeDto;
  otherSenderType: string | undefined;
  receivedDate: DateTime;
  senderContact: ContactDto | null;
  senderStaff: UserDto | null;
  senderOthers: string | null;
  recipientStaff: UserDto;
  description: string;
}

const store = useStore();
const { toDropdownOptions: toEntryOptions } = useEnum(EntryType);
const EntryTypes = toEntryOptions();

const { toDropdownOptions: toSenderOptions } = useEnum(SenderType);
const SenderTypes = toSenderOptions();

const createIncomingMail = handleSubmit.handleSubmit((values) => {
  const incomingmail_value = new IncomingMailInput({
    entryType: values.entryType,
    senderType: values.senderType,
    officeId: state.office?.id,
    receivedDate: toDateTime(values.receivedDate)?.toUTC(),
    otherSenderType: values?.otherSenderType,
    description: values.description,
    matterId: state.matter.id,
    recipientStaffId: state.recipientStaff?.id,
    senderContactId: state.senderContact?.id,
    senderStaffId: state.senderStaff?.id,
    senderOthers: state.senderOther
  });

  store
    .dispatch(
      IncomingMailStore.actions.CREATE_INCOMING_MAIL_NEW,
      incomingmail_value
    )
    .then(() => {
      emit("created", "Records Created!");
      emit("close");
      state.closeModel = true;
      state.isLoading = false;
    });
});
function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
}

function onChangeEntryType(event: any) {
  state.entryType = event;
  updateValidationSchema();
}
function onChangeSenderType(event: any) {
  state.senderType = event;
  state.senderOther = "";
}

function updateSelector(value: any, fieldName: any) {
  if (value == null) handleSubmit.resetField(fieldName);

  if (fieldName == "matter") {
    state.matter = value;
  } else if (fieldName == "office") {
    state.office = value;
  } else if (fieldName == "senderContact") {
    state.senderContact = value;
  } else if (fieldName == "senderStaff") {
    state.senderStaff = value;
  } else if (fieldName == "recipientStaff") {
    state.recipientStaff = value;
  }
}

watch(
  () => state.entryType,
  () => {
    updateValidationSchema();
  },
  { immediate: true }
);
</script>
