<template>
  <shad-modal-form
    modalTitle="Add Outgoing Mail"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createOutgoingMail"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="entryType">
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
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Matter </shad-form-label>
          <shad-form-control>
            <matter-selector-field
              name="matter"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'matter')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-slot="{ componentField }"
        name="otherRecipientType"
        class=""
        v-if="state.entryType == 2"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Other Type</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Other Type"
              v-bind="componentField"
              v-model="state.otherRecipientType"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="office">
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
      <shad-form-field name="sentDate">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Sent Date</shad-form-label>
          <date-field
            v-slot="{ componentField, value }"
            placeholder="Sent Date"
            name="sentDate"
            rules="required"
            :modelValue="state.sentDate"
          />
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="recipientType">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Recipient Type</shad-form-label>
          <shad-select
            v-bind="componentField"
            class="z-0"
            @update:modelValue="onChangeRecipientType($event)"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Recipient Type" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Recipient Type</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in RecipientTypes"
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
        v-if="state.recipientType == 1"
        v-slot="{ componentField }"
        name="recipientContact"
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true"
            >Recipient (Contact)
          </shad-form-label>
          <shad-form-control>
            <contact-selector-field
              name="recipientContact"
              rules="required"
              v-bind="componentField"
              @selected="updateSelector($event, 'recipientContact')"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field
        v-else-if="state.recipientType == 2"
        v-slot="{ componentField }"
        name="recipientStaff"
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
      <shad-form-field
        v-else-if="state.recipientType == 3"
        v-slot="{ componentField }"
        name="recipientOthers"
        class=""
      >
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Other Recipient</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Other Recipient"
              v-bind="componentField"
              v-model="state.recipientOthers"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="senderStaff">
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
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="forAttentionOf">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">For Attention of</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="For Attention of"
              v-bind="componentField"
              v-model="state.forAttentionOf"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="description" class="">
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
    <alp-form-divider name="Delivery Information" class="w-full" />
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="deliveryMethod">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Delivery Method</shad-form-label>
          <shad-select v-bind="componentField" class="z-0">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Delivery Method" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Delivery Method</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in DeliveryMethods"
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
        v-slot="{ componentField }"
        name="deliveryNotes"
        class=""
      >
        <shad-form-item class="w-full">
          <shad-form-label>Notes</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Notes"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>
    <alp-form-divider
      :modelImage="false"
      :modelDescription="false"
      name="Address"
    />
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="addressLookup">
        <shad-form-item class="w-full">
          <shad-form-label>Address Lookup</shad-form-label>
          <shad-form-control>
            <google-places-autocomplete
              class="w-full"
              placeholder="Address Lookup"
              @selected="setAddress($event)"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="address1" class="">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label>Address</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Address"
              v-bind="componentField"
              v-model="state.address.address1"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="address2" class="">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label>Address 2</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Address 2"
              v-bind="componentField"
              v-model="state.address.address2"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="suburb" class="">
        <shad-form-item class="w-1/3 mr-3">
          <shad-form-label>Suburb</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Suburb"
              v-bind="componentField"
              v-model="state.address.suburb"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="state" class="">
        <shad-form-item class="w-1/3 mr-3">
          <shad-form-label :isRequired="true">State</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="State"
              v-bind="componentField"
              v-model="state.address.state"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="postcode" class="">
        <shad-form-item class="w-1/3 mr-3">
          <shad-form-label>Postcode</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Postcode"
              v-bind="componentField"
              v-model="state.address.postcode"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
      <shad-form-field v-slot="{ componentField }" name="country" class="">
        <shad-form-item class="w-1/3 mr-3">
          <shad-form-label :isRequired="true">Country</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Country"
              v-bind="componentField"
              v-model="state.address.country"
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
import { reactive, ref } from "vue";
import { useStore } from "vuex";

import { toDateTime } from "@/composable/date";

import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import ContactSelectorField from "@/components/forms/selectors/ContactSelectorField.vue";
import GooglePlacesAutocomplete from "@/components/inputs/GooglePlacesAutocomplete.vue";
import { OutgoingMailStore } from "@/store/modules/outgoingmail";
import { DateTime } from "luxon";

import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

import { AddressInput, AddressDto } from "@/network/dtos/address-dto";
import { ContactDto, ContactListDto } from "@/network/dtos/contact-dto";
import {
  EntryType,
  RecipientType,
  DeliveryMethod
} from "@/network/dtos/enumTypes";
import { MatterDto } from "@/network/dtos/matter-dto";
import { OfficeDto } from "@/network/dtos/office-dto";
import { UserDto, UserListDto } from "@/network/dtos/user-dto";

let outgoingMailObject = z.object({
  entryType: z.string({ required_error: "Entry Type is required" }),
  office: z.union([
    z.object({
      id: z.number().optional()
    }),
    z.null()
  ]),
  sentDate: z.date({ required_error: "sent Date is required" }),
  recipientType: z.string({ required_error: "recipientType is required" }),
  description: z.string({
    required_error: "description  is required"
  }),
  senderStaff: z.union([
    z.object({
      id: z.number().optional()
    }),
    z.null()
  ]),
  forAttentionOf: z.string({
    required_error: "For Attention Of is required"
  }),
  deliveryMethod: z.string({
    required_error: "Delivery Method is required"
  }),
  deliveryNotes: z.string().optional(),
  state: z.string({ required_error: "State  is required" }),
  country: z.string({ required_error: "Country  is required" }),
  address1: z.string().optional(),
  address2: z.string().optional(),
  postcode: z.string().optional(),
  suburb: z.string().optional()
});

let initialSchema = ref(toTypedSchema(outgoingMailObject));

const emit = defineEmits(["created", "close"]);
const handleSubmit = useForm({
  validationSchema: initialSchema.value
});

function updateValidationSchema() {
  let schema = outgoingMailObject;

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
      otherRecipientType: z.string({
        required_error: "Other Sender Type is required"
      })
    });
  }

  if (state.recipientType == 1) {
    schema = schema.extend({
      recipientContact: z.union([
        z.object({
          id: z.number().optional()
        }),
        z.null()
      ])
    });
  } else if (state.recipientType == 2) {
    schema = schema.extend({
      recipientStaff: z.union([
        z.object({
          id: z.number().optional()
        }),
        z.null()
      ])
    });
  } else if (state.recipientType == 3) {
    schema = schema.extend({
      recipientOthers: z.string({
        required_error: "Other Recipient is required"
      })
    });
  }

  initialSchema.value = toTypedSchema(schema);
}

interface createOutgoingMailInputs {
  entryType: EntryType;
  recipientType: RecipientType;
  office: OfficeDto;
  sentDate: DateTime;
  otherRecipientType: string | null;
  matter: MatterDto;
  senderStaff: UserDto;
  recipientStaff: UserDto;
  recipientContact: ContactDto | null;
  recipientOthers: string | null;
  forAttentionOf: string | null;
  description: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryNotes: string | null;
  address: AddressInput;
}

const { toDropdownOptions: toEntryOptions } = useEnum(EntryType);
const EntryTypes = toEntryOptions();

const { toDropdownOptions: toRecipientOptions } = useEnum(RecipientType);
const RecipientTypes = toRecipientOptions();

const { toDropdownOptions: toDeliveryMethodOptions } = useEnum(DeliveryMethod);
const DeliveryMethods = toDeliveryMethodOptions();

const store = useStore();

const state = reactive({
  selectedContact: null as ContactListDto | null,
  address: new AddressDto(),
  closeModel: false,
  entryType: 0,
  recipientType: 0,
  matter: new MatterDto(),
  office: new OfficeDto(),
  recipientContact: new ContactDto(),
  recipientStaff: new UserDto(),
  senderStaff: new UserDto(),
  recipientOthers: "",
  otherRecipientType: "",
  forAttentionOf: "",
  sentDate: new Date(),
  isLoading: false
});

const createOutgoingMail = handleSubmit.handleSubmit((values) => {
  const addressInput = new AddressInput({
    address1: state.address.address1,
    address2: state.address.address2,
    state: state.address.state,
    country: state.address.country,
    suburb: state.address.suburb,
    postcode: state.address.postcode
  });

  store
    .dispatch(OutgoingMailStore.actions.CREATE_OUTGOING_MAIL, {
      ...values,
      entryType: values.entryType,
      recipientType: values.recipientType,
      officeId: state.office?.id,
      sentDate: toDateTime(values.sentDate)?.toUTC(),
      otherRecipientType: state.otherRecipientType,
      matterId: state.matter?.id,
      senderStaffId: state.senderStaff?.id,
      recipientStaffId: state.recipientStaff?.id,
      recipientContactId: state.recipientContact?.id,
      recipientOthers: state.recipientOthers,
      forAttentionOf: state.forAttentionOf,
      description: values.description,
      deliveryMethod: values.deliveryMethod,
      deliveryNotes: values?.deliveryNotes ? values.deliveryNotes : "",
      address: addressInput
    })
    .then(() => {
      emit("created", "Records Created!");
      emit("close");
    });
});

function setAddress(address: any) {
  state.address.address1 = address.address;
  state.address.address2 = address.address2;
  state.address.suburb = address.suburb;
  state.address.state = address.state;
  state.address.country = address.country;
  state.address.postcode = address.postalCode;
  handleSubmit.setFieldValue("state", address.state);
  handleSubmit.setFieldValue("country", address.country);
}

function setRecipientContactAddress(values: any) {
  const contactSelectedValues = values.recipientContact as ContactListDto;
  if (contactSelectedValues.postalSameAsAddress == true) {
    state.address.address1 = contactSelectedValues.address?.address1;
    state.address.address2 = contactSelectedValues.address?.address2;
    state.address.suburb = contactSelectedValues.address?.suburb;
    state.address.postcode = contactSelectedValues.address?.postcode;
    state.address.state = contactSelectedValues.address?.state;
    state.address.country = contactSelectedValues.address?.country;
  } else {
    if (
      contactSelectedValues.postalAddress?.address1 ||
      contactSelectedValues.postalAddress?.address2 ||
      contactSelectedValues.postalAddress?.suburb ||
      contactSelectedValues.postalAddress?.postcode ||
      contactSelectedValues.postalAddress?.state ||
      contactSelectedValues.postalAddress?.country
    ) {
      state.address.address1 = contactSelectedValues.postalAddress?.address1;
      state.address.address2 = contactSelectedValues.postalAddress?.address2;
      state.address.suburb = contactSelectedValues.postalAddress?.suburb;
      state.address.postcode = contactSelectedValues.postalAddress?.postcode;
      state.address.state = contactSelectedValues.postalAddress?.state;
      state.address.country = contactSelectedValues.postalAddress?.country;
    } else {
      state.address.address1 = contactSelectedValues.address?.address1;
      state.address.address2 = contactSelectedValues.address?.address2;
      state.address.suburb = contactSelectedValues.address?.suburb;
      state.address.postcode = contactSelectedValues.address?.postcode;
      state.address.state = contactSelectedValues.address?.state;
      state.address.country = contactSelectedValues.address?.country;
    }
  }
}
function setRecipientStaffAddress(values: any) {
  const staffSelectedValues = values.recipientStaff as UserListDto;
  state.address.address1 = staffSelectedValues.address?.address1;
  state.address.address2 = staffSelectedValues.address?.address2;
  state.address.suburb = staffSelectedValues.address?.suburb;
  state.address.postcode = staffSelectedValues.address?.postcode;
  state.address.state = staffSelectedValues.address?.state;
  state.address.country = staffSelectedValues.address?.country;
}
function closeDialog() {
  state.closeModel = false;
  state.isLoading = false;
}

function onChangeEntryType(event: any) {
  state.entryType = event;
  updateValidationSchema();
}

function onChangeRecipientType(event: any) {
  state.recipientType = event;
  updateValidationSchema();
}

function updateSelector(value: any, fieldName: any) {
  if (value == null) handleSubmit.resetField(fieldName);

  if (fieldName == "matter") {
    state.matter = value;
  } else if (fieldName == "office") {
    state.office = value;
  } else if (fieldName == "recipientContact") {
    state.recipientContact = value;
  } else if (fieldName == "recipientStaff") {
    state.recipientStaff = value;
  } else if (fieldName == "senderStaff") {
    state.senderStaff = value;
  }
}
</script>
