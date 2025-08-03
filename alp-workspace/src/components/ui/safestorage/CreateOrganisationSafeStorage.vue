<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Add Safe Storage For Organisation'"
  >
    <modal-form
      @cancel="$emit('close')"
      @submit="createOrganisationSafeStorage"
      v-slot="{ values }"
      :initialValues="{
        dueDate: new Date().toISOString().substr(0, 10),
        safeStorageStatus: '1',
        andrewExecutor: true
      }"
    >
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Office" :isRequired="true">
          <office-selector-field
            name="office"
            rules="required"
            @selected="() => (values.safeStorageSection = null)"
          />
          <error-message class="error-message" name="Office" />
        </field-label>

        <field-label
          v-if="values.office"
          class="w-1/2"
          name="Storage Code"
          :isRequired="true"
        >
          <safe-storage-section-selector-field
            name="safeStorageSection"
            :officeId="values.office?.id"
            rules="required"
          />
        </field-label>

        <field-label
          class="w-full sm:w-1/2"
          name="Date of Documents"
          :isRequired="true"
        >
          <date-field
            placeholder="Date of Documents"
            name="dateOfDocuments"
            rules="required"
          />
          <error-message class="error-message" name="receivedDate" />
        </field-label>

        <field-label class="w-1/2" name="Document Status" :isRequired="true">
          <v-field as="select" name="safeStorageStatus" rules="required">
            <option value="1">Original Held By ADLV LAW</option>
            <option value="6">Never Held</option>
          </v-field>
          <error-message class="error-message" name="entrytype" />
        </field-label>

        <field-label name="Document Type" class="w-1/2" :isRequired="true">
          <safe-storage-document-type-selector-field
            name="safeStorageDocumentType"
            rules="required"
            @selected="() => {}"
          />
          <error-message class="error-message" name="Document type" />
        </field-label>

        <!-- If Document type is 'Will', Executor Applied -->

        <field-label
          v-if="values.safeStorageDocumentType?.name === 'Will'"
          class="w-full sm:w-full"
          name="Executor (Will Only)"
        >
          <div class="flex items-center space-x-2 mb-2">
            <v-field type="checkbox" name="andrewExecutor" v-slot="{ field }">
              <Switch
                id="andrewExecutor"
                :checked="field.value"
                @update:checked="field.onChange"
                :defaultChecked="true"
              />
            </v-field>
            <Label for="andrewExecutor" :isRequired="false"> Executor</Label>
          </div>
        </field-label>

        <field-label
          v-if="values.safeStorageDocumentType?.name === 'Will'"
          class="w-full sm:w-full"
          name="Charging Clause (Will Only)"
        >
          <v-field name="chargingClause" v-slot="{ field, handleChange }">
            <shad-select
              :model-value="field.value"
              @update:model-value="handleChange"
            >
              <shad-select-trigger class="w-full">
                <shad-select-value placeholder="Charging Clause" />
              </shad-select-trigger>
              <shad-select-content>
                <shad-select-group>
                  <shad-select-label>Charging Clause</shad-select-label>
                  <shad-select-item
                    v-for="option in chargingClauseOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    <div>{{ option.label }}</div>
                  </shad-select-item>
                </shad-select-group>
              </shad-select-content>
            </shad-select>
          </v-field>
        </field-label>

        <field-label class="w-full sm:w-full" name="Notes" :isRequired="true">
          <v-field
            as="textarea"
            placeholder="Notes"
            name="notes"
            rules="required"
          />
          <error-message class="error-message" name="Notes" />
        </field-label>

        <field-label class="w-1/2" name="Nominated Type" :isRequired="true">
          <v-field as="select" name="nominatedType" rules="required">
            <option value="" disabled>Select a Nominated Type</option>
            <option
              v-for="option in Nominates"
              :key="option.value"
              :value="option.value"
            >
              {{ option.key }}
            </option>
          </v-field>
          <error-message class="error-message" name="NominatedType" />
        </field-label>

        <field-label class="w-1/2" name="Nominated Names">
          <v-field
            type="text"
            placeholder="Nominated Names"
            name="nominatedNames"
          />
        </field-label>

        <field-label class="w-full" name="External Link">
          <v-field
            type="text"
            placeholder="External Link"
            name="externalLink"
          />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { useEnum } from "@/composable/enum";
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import SafeStorageDocumentTypeSelectorField from "@/components/forms/selectors/SafeStorageDocumentTypeSelectorField.vue";
import SafeStorageSectionSelectorField from "@/components/forms/selectors/SafeStorageSectionSelectorField.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import {
  OfficeServiceProxy,
  SafeStorageDocumentTypesProxy,
  SafeStorageSectionsProxy
} from "@/network/common-service-proxies";

import { CommonStore } from "@/store/modules/common";
import { toDateTime } from "@/composable/date";
import { Switch } from "@/lib/registry/new-york/ui/switch";
import { Label } from "@/lib/registry/new-york/ui/label";
import {
  SafeStorageStatusTypes,
  NominatedTypes,
  ChargingClauseTypes
} from "@/network/dtos/enumTypes";
import { OfficeDto } from "@/network/dtos/office-dto";
import {
  SafeStorageSectionsDto,
  SafeStorageDocumentTypesDto
} from "@/network/dtos/safe-storage-dto";

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  documentType: {
    type: [String, Number]
  },
  organisation_id: {
    type: [String, Number]
  }
});

// emit
const emit = defineEmits(["created", "close"]);

const store = useStore();
const { toDropdownOptions: toStatusOptions } = useEnum(SafeStorageStatusTypes);
const StatusTypes = toStatusOptions();

const { toDropdownOptions: toNominatedOptions } = useEnum(NominatedTypes);
const Nominates = toNominatedOptions();

const { toDropdownOptions: toChargingClauseTypesOptions } =
  useEnum(ChargingClauseTypes);
const ChargingClauseTypesTypes = toChargingClauseTypesOptions();
const chargingClauseOptions = [
  { value: ChargingClauseTypes.YesSigned, label: "Yes Signed" },
  { value: ChargingClauseTypes.NotApplicable, label: "Not Applicable" },
  { value: ChargingClauseTypes.NotReturned, label: "Not Returned" }
];

const state = reactive({
  office: [] as OfficeDto[],
  safeStorageSections: [] as SafeStorageSectionsDto[],
  safeStorageDocumentTypes: [] as SafeStorageDocumentTypesDto[],
  SenderTypeStatus: -1
});

function fetchOffice() {
  new OfficeServiceProxy().getOfficeFullList().then((result) => {
    state.office = result;
  });
}

function fetchSafeStorageSection() {
  new SafeStorageSectionsProxy()
    .getSafeStorageSectionsFullList()
    .then((result) => {
      state.safeStorageSections = result;
    });
}

function fetchSafeStorageDocumnetType() {
  new SafeStorageDocumentTypesProxy()
    .getSafeStorageDocumentTypesFullList()
    .then((result) => {
      state.safeStorageDocumentTypes = result;
    });
}

onMounted(() => {
  fetchOffice();
  fetchSafeStorageSection();
  fetchSafeStorageDocumnetType();
});

function createOrganisationSafeStorage(values: any) {
  (values.dateOfDocuments = toDateTime(values.dateOfDocuments)?.toUTC()),
    store
      .dispatch(CommonStore.actions.CREATE_ORGANISATION_SAFE_STORAGE_DOCUMENT, {
        ...values,
        status: values.safeStorageStatus,
        safeStorageDocumentTypeId: values.safeStorageDocumentType.id
          ? values.safeStorageDocumentType?.id
          : -1,
        safeStorageSectionId: values.safeStorageSection.id
          ? values.safeStorageSection?.id
          : -1,
        andrewExecutor: values.andrewExecutor,
        chargingClause: values.chargingClause,
        organisationId: props.organisation_id
      })
      .then(() => {
        emit("close");
      });
}
</script>
