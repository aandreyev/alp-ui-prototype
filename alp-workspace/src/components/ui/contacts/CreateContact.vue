<template>
  <shad-modal-form
    modalTitle="Create Contact"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createContact"
    :isLoading="state.isLoading"
  >
    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="salutation">
        <shad-form-item class="w-1/4 mr-3">
          <shad-form-label :isRequired="true">Salutation</shad-form-label>
          <shad-select
            @update:modelValue="onChange($event)"
            v-bind="componentField"
            class="z-0"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Salutation" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Salutation</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in salutations"
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

      <shad-form-field v-slot="{ componentField }" name="firstName">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">First Name</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="First Name"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>

      <shad-form-field v-slot="{ componentField }" name="middleName">
        <shad-form-item class="w-1/3 mr-3">
          <shad-form-label :isRequired="false">Middle Name</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Middle Name"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>

      <shad-form-field v-slot="{ componentField }" name="lastName">
        <shad-form-item class="w-1/2">
          <shad-form-label :isRequired="true">Last Name</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Last Name"
              v-bind="componentField"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="email">
        <shad-form-item class="w-1/2 mr-3">
          <shad-form-label :isRequired="true">Email</shad-form-label>
          <shad-form-control>
            <shad-input
              type="text"
              placeholder="Email"
              v-bind="componentField"
              v-model="state.email"
              :disabled="state.noEmail"
            />
          </shad-form-control>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex mb-4">
      <div class="w-1/2 flex items-center space-x-2">
        <shad-checkbox
          id="noEmail"
          :checked="state.noEmail"
          @update:checked="handleNoEmailChange"
        />
        <label
          for="noEmail"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I do not have email
        </label>
      </div>
    </div>

    <shad-form-field v-slot="{ componentField }" name="phoneNumbers">
      <shad-form-item class="w-full">
        <shad-form-label>Phone Numbers</shad-form-label>
        <shad-form-control>
          <div class="space-y-2">
            <div
              v-for="(phone, index) in state.phoneNumbers"
              :key="index"
              class="grid grid-cols-[1fr_auto_auto] items-center gap-2"
            >
              <ContactPhoneInput
                @update="updatePhoneNumber(index, $event)"
                :is-valid="phone.isValid && !phone.isDuplicate"
              />

              <shad-select v-model="phone.label" class="w-[100px]">
                <shad-form-control>
                  <shad-select-trigger>
                    <shad-select-value>
                      {{
                        phoneLabels.find(
                          (l) => Number(l.value) === Number(phone.label)
                        )?.key || "Select Label"
                      }}
                    </shad-select-value>
                  </shad-select-trigger>
                </shad-form-control>
                <shad-select-content>
                  <shad-select-group>
                    <shad-select-label>Select Label</shad-select-label>
                    <shad-select-item
                      v-for="label in phoneLabels"
                      :key="label.value"
                      :value="Number(label.value)"
                    >
                      {{ label.key }}
                    </shad-select-item>
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-button
                variant="destructive"
                size="icon"
                type="button"
                @click="removePhoneNumber(index)"
                v-if="state.phoneNumbers.length > 1"
              >
                <Trash2Icon class="h-4 w-4" />
              </shad-button>
              <span
                v-if="state.phoneNumbers[index].errorMessage"
                class="flex text-[0.8rem] font-medium text-destructive"
                >{{ state.phoneNumbers[index].errorMessage }}</span
              >
            </div>
          </div>

          <shad-button
            variant="outline"
            size="sm"
            class="mt-2"
            type="button"
            @click="addPhoneNumber"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Number
          </shad-button>
        </shad-form-control>
      </shad-form-item>
    </shad-form-field>

    <div class="flex">
      <shad-form-field v-slot="{ componentField }" name="gender">
        <shad-form-item class="w-1/5 mr-3">
          <shad-form-label :isRequired="true">Gender</shad-form-label>
          <shad-select
            v-if="state.genderOption"
            class="z-0"
            v-bind="componentField"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Gender" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Gender</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in genders"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.key }}
                </shad-select-item>
                <shad-select-item
                  v-if="!state.genderOption"
                  class="select-items"
                  v-for="option in genders"
                  :key="option.value"
                  :value="option.key"
                >
                  {{ option.key }}
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-select
            v-if="!state.genderOption"
            :modelValue="state.genders"
            class="z-0"
          >
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Gender" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Select Gender</shad-select-label>
                <shad-select-item
                  class="select-items"
                  v-for="option in genders"
                  :key="option.value"
                  :value="option.key"
                >
                  {{ option.key }}
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>

      <shad-form-field v-slot="{ componentField }" name="estimatedNetWorth">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true"
            >Estimated Net Worth</shad-form-label
          >
          <shad-select v-bind="componentField" class="z-0">
            <shad-form-control>
              <shad-select-trigger>
                <shad-select-value placeholder="Estimated Net Worth" />
              </shad-select-trigger>
            </shad-form-control>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label
                  >Select Estimated Net Worth</shad-select-label
                >
                <shad-select-item :value="EstimatedNetWorthType.Urban">
                  Urban Professionals (up to $1m in investment assets)
                </shad-select-item>
                <shad-select-item :value="EstimatedNetWorthType.Affluent">
                  Affluent (between $1m and $5m in investment assets)
                </shad-select-item>
                <shad-select-item :value="EstimatedNetWorthType.High">
                  High Net Worth (Between $5m and $30m in investment assets)
                </shad-select-item>
                <shad-select-item :value="EstimatedNetWorthType.Ultra">
                  Ultra Wealthy (>$30m in investment assets)
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>
          <shad-form-message />
        </shad-form-item>
      </shad-form-field>
    </div>

    <div class="flex space-x-2">
      <shad-form-field v-slot="{ componentField }" name="refererContact">
        <shad-form-item class="w-full">
          <shad-form-label :isRequired="true">Referer Contact</shad-form-label>
          <shad-form-control>
            <contact-selector-no-create
              name="referrer"
              rules="required"
              v-bind="componentField"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>

      <shad-form-field v-slot="{ componentField }" name="occupationId">
        <shad-form-item class="w-full">
          <shad-form-label>Occupation</shad-form-label>
          <shad-form-control>
            <occupation-selector
              name="occupation"
              v-model="state.occupation"
              :can-clear="true"
            />
          </shad-form-control>
        </shad-form-item>
      </shad-form-field>
    </div>

    <shad-form-field v-slot="{ componentField }" name="isActiveCampaignChecked">
      <shad-form-item
        class="flex flex-row items-center justify-between rounded-lg border p-4"
      >
        <div class="space-y-0.5">
          <shad-form-label class="text-base">Marketing emails</shad-form-label>
          <shad-form-description>
            Subscribe to our latest marketing newsletter.
          </shad-form-description>
        </div>
        <shad-form-control>
          <shad-switch
            :checked="state.isActiveCampaignChecked"
            :disabled="state.email == '' || state.noEmail"
            v-model="state.isActiveCampaignChecked"
            @update:checked="changeisActiveCampaignChecked"
          />
        </shad-form-control>
      </shad-form-item>
    </shad-form-field>
    <shad-form-field v-slot="{ componentField }" name="showEmails">
      <shad-form-item
        class="flex flex-row items-center justify-between rounded-lg border p-4"
      >
        <div class="space-y-0.5">
          <shad-form-label class="text-base">Show Emails</shad-form-label>
          <shad-form-description> Show contacts emails. </shad-form-description>
        </div>
        <shad-form-control>
          <shad-switch
            :checked="state.showEmails"
            :disabled="state.email == '' || state.noEmail || state.isStaffEmail"
            @update:checked="handleShowEmailsChange"
          />
        </shad-form-control>
      </shad-form-item>
      <shad-form-item class="w-full mr-3" v-if="!state.showEmails">
        <shad-form-label :is-required="true"
          >Reason for Hiding Emails</shad-form-label
        >
        <shad-form-control>
          <inline-text-area
            v-model="state.hideEmailReason"
            placeholder="Enter reason"
            rules="required"
            :disabled="state.isStaffEmail"
          />
        </shad-form-control>
      </shad-form-item>
    </shad-form-field>
  </shad-modal-form>
  <hide-email-reason-dialog
    v-if="state.showHideEmailReasonDialog"
    @close="state.showHideEmailReasonDialog = false"
    @save="saveHideEmailReason"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useFocus, useDebounceFn } from "@vueuse/core";
import { PlusIcon, Trash2Icon } from "lucide-vue-next";
import type { CountryCode } from "libphonenumber-js";
import { ContactStore } from "@/store/modules/contacts";

// Components
import ContactSelectorNoCreate from "@/components/inputs/selectors/ContactSelectorNoCreate.vue";
import OccupationSelector from "@/components/inputs/selectors/OccupationSelector.vue";
import HideEmailReasonDialog from "@/components/modals/contacts/HideEmailReasonDialog.vue";
import InlineTextArea from "@/components/inputs/InlineTextArea.vue";

import ContactPhoneInput from "@/components/common/ContactPhoneInput.vue";

// Composables
import { useEnum } from "@/composable/enum";
import { useNotify } from "@/composable/notify";

// API
import { PhoneNumberServiceProxy } from "@/network/phone-number-service-proxies";

// DTOs and Types
import {
  EstimatedNetWorthType,
  GenderType,
  SalutationType
} from "@/network/dtos/enumTypes";
import { OccupationDto } from "@/network/dtos/base-entity";
import { ContactDto } from "@/network/dtos/contact-dto";
import { PhoneLabel } from "@/network/dtos/phone-number-dto";

interface PhoneNumberData {
  label: PhoneLabel;
  countryCode: CountryCode;
  isValid: boolean;
  isDuplicate: boolean;
  isPossible: boolean;
  countryCallingCode: string;
  nationalNumber: string;
  formatInternational: string;
  formatNational: string;
  e164: string;
  rfc3966: string;
  countrySelectorOpen: boolean;
  uri: string;
  errorMessage: string;
}

// Refs
const phoneInput = ref(null);
const { focused } = useFocus(phoneInput);
const value = ref(1);

// Props and Emits
const emit = defineEmits(["created", "close"]);
const props = defineProps<{
  modalOpen: number;
}>();

// Store
const store = useStore();

// State
const state = reactive({
  salutation: "",
  genders: "",
  email: "",
  email_rules: "required|email",
  referrer: null as ContactDto | null,
  genderOption: true,
  isActiveCampaignChecked: false,
  closeModel: false,
  openModal: 1,
  isLoading: false,
  occupation: undefined as OccupationDto | undefined,
  noEmail: false,
  noContactNumber: false,
  selectedCountry: "AU" as CountryCode,
  countrySelectorOpen: false,
  phoneInputFocused: false,
  showEmails: true,
  hideEmailReason: "",
  showHideEmailReasonDialog: false,
  isStaffEmail: false,
  phoneNumbers: [] as Array<PhoneNumberData>
});

// Form Schema
const contactFormSchema = toTypedSchema(
  z.object({
    salutation: z.string({ required_error: "Salutation is required" }),
    firstName: z
      .string({ required_error: "First Name is required" })
      .nonempty({ message: "First Name is required" })
      .refine((val) => !/["*:<>?/\\|]/.test(val), {
        message: 'Name cannot contain special characters ( " * : < > ? / \\ | )'
      }),
    middleName: z
      .string()
      .optional()
      .refine((val) => !val || !/["*:<>?/\\|]/.test(val), {
        message: 'Name cannot contain special characters ( " * : < > ? / \\ | )'
      }),
    lastName: z
      .string({ required_error: "Last Name is required" })
      .nonempty({ message: "Last Name is required" })
      .refine((val) => !/["*:<>?/\\|]/.test(val), {
        message: 'Name cannot contain special characters ( " * : < > ? / \\ | )'
      }),
    email: z
      .string()
      .transform((val) => val || "") // Convert undefined/null to empty string
      .refine(
        (val) => {
          if (state.noEmail) return true;
          return val.length > 0;
        },
        { message: "Email is required" }
      )
      .refine(
        (val) => {
          if (state.noEmail) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        },
        { message: "Please enter a valid email address" }
      ),
    phoneNumbers: z
      .array(
        z.object({
          number: z.string(),
          countryCode: z.string(),
          label: z.nativeEnum(PhoneLabel),
          rawNumber: z.any().optional()
        })
      )
      .optional(),
    gender: z.string({ required_error: "Gender is required" }),
    estimatedNetWorth: z.number({
      required_error: "Estimated Net Worth is required"
    }),
    refererContact: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ]),
    occupationId: z.number().optional(),
    isActiveCampaignChecked: z.boolean().optional(),
    referrerId: z.number().optional(),
    showEmails: z.boolean().optional(),
    hideEmailReason: z.string().optional()
  })
);

// Form
const handleSubmit = useForm({
  validationSchema: contactFormSchema,
  initialValues: {}
});

// Enum Options
const { toDropdownOptions: toSalutationOptions } = useEnum(SalutationType);
const salutations = toSalutationOptions();

const { toDropdownOptions: toGenderOptions } = useEnum(GenderType);
const genders = toGenderOptions();

const { toDropdownOptions: toPhoneLabelOptions } = useEnum(PhoneLabel);
const phoneLabels = toPhoneLabelOptions();

const { fireErrorToast } = useNotify();
const phoneNumberService = new PhoneNumberServiceProxy();

const debouncedCheckPhoneNumber = useDebounceFn(async (e164: string) => {
  if (!e164) {
    return;
  }

  try {
    const isDuplicate = await phoneNumberService.isContactPhoneNumberDuplicate({
      phoneNumber: e164
    });

    const phone = state.phoneNumbers.find((p) => p.e164 === e164);
    if (phone) {
      phone.isDuplicate = isDuplicate;
      if (isDuplicate) {
        phone.errorMessage = "Phone number already exists in the database.";
      } else {
        phone.errorMessage = "";
      }
    }
  } catch (e) {
    console.error("Failed to check phone number:", e);
    fireErrorToast("Failed to verify phone number. Please try again.");
    const phone = state.phoneNumbers.find((p) => p.e164 === e164);
    if (phone) {
      phone.errorMessage = "Failed to verify phone number.";
    }
  }
}, 500);

// Functions
function updatePhoneNumber(
  index: number,
  event: Partial<PhoneNumberData> | string
) {
  const phoneData: Partial<PhoneNumberData> =
    typeof event === "string" ? JSON.parse(event) : event;
  state.phoneNumbers[index] = { ...state.phoneNumbers[index], ...phoneData };

  const phone = state.phoneNumbers[index];

  // Reset validation state on change
  if (phone) {
    phone.isDuplicate = false;
    phone.errorMessage = "";
  }

  // Only check for duplicates if the number is valid and has an E.164 representation.
  if (phoneData.isValid && phoneData.e164) {
    debouncedCheckPhoneNumber(phoneData.e164);
  }
}

function changeisActiveCampaignChecked() {
  state.isActiveCampaignChecked = !state.isActiveCampaignChecked;
}

function handleShowEmailsChange(value: boolean) {
  if (!value) {
    state.showHideEmailReasonDialog = true;
  } else {
    state.showEmails = true;
    state.hideEmailReason = "";
  }
}

function saveHideEmailReason(reason: string) {
  state.showEmails = false;
  state.hideEmailReason = reason;
  state.showHideEmailReasonDialog = false;
}

function onChange(event: any) {
  if (event !== undefined) {
    state.salutation = SalutationType[event];
    if (
      state.salutation === "Mrs" ||
      state.salutation === "Ms" ||
      state.salutation === "Miss"
    ) {
      state.genders = "Female";
      state.genderOption = false;
      handleSubmit.setFieldValue("gender", "");
    } else if (state.salutation === "Mr") {
      state.genders = "Male";
      state.genderOption = false;
      handleSubmit.setFieldValue("gender", "");
    } else if (state.salutation === "Mx") {
      state.genders = "Neutral";
      state.genderOption = false;
      handleSubmit.setFieldValue("gender", "");
    } else {
      state.genderOption = true;
      state.genders = "";
      handleSubmit.resetField("gender");
    }
  }
}

function generateRandomEmail(firstName: string, lastName: string): string {
  const randomNum = Math.floor(Math.random() * 100000);
  return `${firstName?.toLowerCase()}_${lastName?.toLowerCase()}_${randomNum}@example.com`;
}

function handleNoEmailChange(checked: boolean) {
  state.noEmail = checked;
  const randomEmail = checked
    ? generateRandomEmail(
        handleSubmit.values.firstName || "",
        handleSubmit.values.lastName || ""
      )
    : "";

  // Update both state and form values
  state.email = randomEmail;
  handleSubmit.setFieldValue("email", randomEmail);

  if (checked) {
    state.isActiveCampaignChecked = false;
  }
}

function addPhoneNumber() {
  state.phoneNumbers.push({
    countryCode: "AU",
    label: 1 as PhoneLabel,
    isValid: false,
    isDuplicate: false,
    isPossible: false,
    countryCallingCode: "",
    nationalNumber: "",
    formatInternational: "",
    formatNational: "",
    e164: "",
    rfc3966: "",
    uri: "",
    countrySelectorOpen: false,
    errorMessage: ""
  });
}

function removePhoneNumber(index: number) {
  state.phoneNumbers.splice(index, 1);
}

// Create Contact Function
const createContact = handleSubmit.handleSubmit((values) => {
  state.isLoading = true;
  values.isActiveCampaignChecked = state.isActiveCampaignChecked;
  if (values.gender == "") values.gender = state.genders;
  values.referrerId = values.refererContact?.id;
  values.occupationId = state.occupation?.id;
  values.showEmails = state.showEmails;
  values.hideEmailReason = state.hideEmailReason;

  values.phoneNumbers = state.phoneNumbers
    .filter((phone) => phone.nationalNumber)
    .map((phone) => ({
      number: phone.nationalNumber,
      countryCode: phone.countryCode,
      label: phone.label,
      isValid: phone.isValid,
      isPossible: phone.isPossible,
      countryCallingCode: phone.countryCallingCode,
      nationalNumber: phone.nationalNumber,
      formatInternational: phone.formatInternational,
      formatNational: phone.formatNational,
      e164: phone.e164,
      uri: phone.uri,
      rfc3966: phone.rfc3966
    }));

  console.log(values);

  store
    .dispatch(ContactStore.actions.CREATE_CONTACT, values)
    .then((contact) => {
      emit("created", contact);
      state.closeModel = true;
      state.isLoading = false;
    });
});

const initialState = reactive({ ...state });

function closeDialog(value: any) {
  state.closeModel = false;
  state.phoneNumbers = [];
  Object.assign(state, initialState);
}

function handleChangeCheckbox(event: boolean) {
  state.isActiveCampaignChecked = !state.isActiveCampaignChecked;
  state.isActiveCampaignChecked = event;
}

// Watchers
watch(
  () => state.email,
  (newEmail) => {
    // Only enable marketing emails if there's an email and noEmail is false
    if (newEmail != "" && !state.noEmail) {
      state.isActiveCampaignChecked = true;
    } else {
      state.isActiveCampaignChecked = false;
    }

    const staffEmailDomains = [
      "@adlvlaw.com.au",
      "@syntaq.com",
      "@andreyev.com.au",
      "@jfmlaw.com.au"
    ];
    const isStaff = staffEmailDomains.some((domain) =>
      newEmail.toLowerCase().endsWith(domain)
    );

    if (isStaff) {
      state.showEmails = false;
      state.hideEmailReason = "Staff Email";
      state.isStaffEmail = true;
    } else {
      // Only reset if it was previously a staff email
      if (state.isStaffEmail) {
        state.showEmails = true;
        state.hideEmailReason = "";
      }
      state.isStaffEmail = false;
    }
  }
);

watch(
  [() => handleSubmit.values.firstName, () => handleSubmit.values.lastName],
  ([newFirstName, newLastName]) => {
    if (state.noEmail && newFirstName && newLastName) {
      const randomEmail = generateRandomEmail(newFirstName, newLastName);
      state.email = randomEmail;
      handleSubmit.setFieldValue("email", randomEmail);
    }
  }
);

// Initialize with one phone number
onMounted(() => {
  if (state.phoneNumbers.length === 0) {
    addPhoneNumber();
  }
});
</script>
