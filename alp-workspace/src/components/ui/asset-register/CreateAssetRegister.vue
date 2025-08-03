<template>
  <modal @close="$emit('close')" :headingTitle="'Add Asset Register'">
    <modal-form @cancel="$emit('close')" @submit="createAsset">
      <alp-form-container>
        <field-label class="w-full sm:w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="Name"
            rules="required"
            v-model="state.Name"
          />
          <error-message class="error-message" name="Name" />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Manufacturer">
          <v-field
            type="text"
            placeholder="Manufacturer"
            name="Manufacturer"
            v-model="state.Manufacture"
          />
        </field-label>

        <field-label
          class="w-1/2 sm:w-1/2"
          name="Asset Type"
          :isRequired="true"
        >
          <asset-type-selector-field
            name="asset"
            rules="required"
            @selected="onChange($event)"
          >
          </asset-type-selector-field>
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Office" :isRequired="true">
          <office-selector-field name="office" rules="required" />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Model">
          <v-field
            type="text"
            placeholder="Model"
            name="Model"
            v-model="state.Model"
          />
        </field-label>

        <field-label
          class="w-1/2 sm:w-1/2"
          name="Description"
          :isRequired="true"
        >
          <v-field
            as="textarea"
            placeholder="Description"
            name="Description"
            rules="required"
          />
          <error-message class="error-message" name="Description" />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Notes">
          <v-field as="textarea" placeholder="Notes" name="noets" />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Color">
          <v-field
            type="text"
            placeholder="Color"
            name="Color"
            v-model="state.Color"
          />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Serial Number">
          <v-field
            type="text"
            placeholder="Serial Number"
            name="SerialNumber"
          />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Purchase Date">
          <date-field placeholder="Purchase Date" name="purchaseDate" />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Purchase Price">
          <v-field
            type="number"
            placeholder="Purchase Price"
            name="PurchasePrice"
          />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Warranty (in Years)">
          <v-field type="number" placeholder="Warranty" name="warranty" />
        </field-label>
        <field-label class="w-1/2 sm:w-1/2" name="Deprecation Date (in Years)">
          <v-field
            type="number"
            placeholder="Deprecation Date"
            name="deprecationDate"
            v-model="state.deprecationDate"
          />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Owner">
          <user-selector-field name="owner" />
        </field-label>

        <field-label class="w-1/2 sm:w-1/2" name="Security Classification">
          <v-field as="select" name="SecurityClassification">
            <option value="" disabled>Security</option>
            <option
              v-for="option in security"
              :key="option.value"
              :value="option.value"
            >
              {{ option.key }}
            </option>
          </v-field>
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { reactive, watch } from "vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import OfficeSelectorField from "@/components/forms/selectors/OfficeSelectorField.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import AssetTypeSelectorField from "@/components/forms/selectors/AssetTypeSelectorField.vue";
import { useEnum } from "@/composable/enum";

import { useStore } from "vuex";
import { AssetRegisterStore } from "@/store/modules/asset";
import { toDateTime } from "@/composable/date";
import { useNotify } from "@/composable/notify";
import { AssetTypeListDto, CreateAssetInput } from "@/network/dtos/asset-dto";
import { AssetStatus, SecurityClassification } from "@/network/dtos/enumTypes";

const emit = defineEmits(["created", "close"]);
const store = useStore();
const { toDropdownOptions: toAssetOptions } = useEnum(AssetStatus);
const assetStatus = toAssetOptions();

const { fireSuccessToast } = useNotify();

const { toDropdownOptions: toSecurityOptions } = useEnum(
  SecurityClassification
);
const security = toSecurityOptions();

const state = reactive({
  Name: "",
  PurchaseDate: "",
  DisposeDate: "",
  Warranty: "",
  deprecationDate: "",
  Color: "",
  Manufacture: "",
  Model: "",
  AssetType: null as AssetTypeListDto | null
});

function updateValue(value: any) {
  state.Name =
    state.Manufacture +
    " - " +
    state?.AssetType?.name +
    " - " +
    state.Model +
    " (" +
    state.Color +
    ") ";
}

watch(
  [
    () => state.Color,
    () => state.Manufacture,
    () => state.Model,
    () => state.AssetType
  ],

  (value) => {
    updateValue(state.Manufacture);
  }
);

function createAsset(value: CreateAssetInput) {
  if (value != undefined) {
    if (value.asset != undefined) value.assetTypeId = value.asset.id;

    if (value.office != undefined) value.officeId = value.office.id;

    if (value.owner == undefined) {
      value.status = AssetStatus.Available;
    } else {
      value.currentOwnerId = value.owner.id;
      value.status = AssetStatus.Assigned;
    }
    value.purchaseDate = toDateTime(value.purchaseDate)?.toUTC();
    store
      .dispatch(AssetRegisterStore.actions.CREATE_ASSET_REGISTER, value)
      .then(() => {
        emit("close");
        fireSuccessToast("Submitted !");
      });
  }
}
function onChange(event: any) {
  state.deprecationDate = event.defaultDeprecationYear;
  state.AssetType = event;
}
</script>
