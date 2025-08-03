<template>
  <modal @close="$emit('close')" :headingTitle="'Create Trust Account'">
    <modal-form @cancel="$emit('close')" @submit="createTrustAccount">
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Business Entity" :isRequired="true">
          <business-entity-selector-field
            name="businessEntity"
            rules="required"
          />
        </field-label>

        <field-label class="w-full" name="BSB">
          <v-field type="text" placeholder="BSB" name="bsb" />
          <error-message class="error-message" name="bsb" />
        </field-label>

        <field-label
          class="w-full"
          name="Bank Account Number"
          :isRequired="true"
        >
          <v-field
            type="text"
            placeholder="Account Number"
            name="accountNumber"
            rules="required"
          />
          <error-message class="error-message" name="accountNumber" />
        </field-label>

        <field-label
          class="w-full"
          name="Trust Account Type"
          :isRequired="true"
        >
          <span class="flex flex-col text-xs">
            <v-field
              as="select"
              name="trustAccountType"
              rules="required"
              v-model="state.trustAccountType"
            >
              <option value="" disabled>Choose Trust Account Type</option>
              <option :value="TrustAccountType.BusinessEntityTrustAccount">
                AL Trust Account
              </option>
              <option :value="TrustAccountType.LegalStatutoryTrustAccount">
                Legal Statutory Trust Account
              </option>
              <option :value="TrustAccountType.ControlledMoneyTrustAccount">
                Controlled Money Trust Account
              </option>
            </v-field>
          </span>
        </field-label>

        <field-label class="w-full" name="Reference">
          <v-field type="text" placeholder="Reference" name="reference" />
          <error-message class="error-message" name="reference" />
        </field-label>

        <field-label
          name="Matter"
          class="w-full"
          v-if="
            state.trustAccountType ===
            TrustAccountType.ControlledMoneyTrustAccount
          "
          :isRequired="true"
        >
          <matter-selector-field
            name="matterControlledMoney"
            rules="required"
          />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import BusinessEntitySelectorField from "@/components/forms/selectors/BusinessEntitySelectorField.vue";
import MatterSelectorField from "@/components/forms/selectors/MatterSelectorField.vue";
import { TrustStore } from "@/store/modules/trust";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { BusinessEntityDto } from "@/network/dtos/office-dto";
import { TrustAccountType } from "@/network/dtos/enumTypes";
import { MatterDto } from "@/network/dtos/matter-dto";
import { TrustAccountInput } from "@/network/dtos/trust-dto";

interface TrustAccountValues {
  name: string;
  bsb: string;
  accountNumber: string;
  trustAccountType: TrustAccountType;
  reference: string;
  matterControlledMoney?: MatterDto;
  businessEntity?: BusinessEntityDto;
}

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    MatterSelectorField,
    BusinessEntitySelectorField
  },

  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      values: {
        trustAccountType: TrustAccountType.BusinessEntityTrustAccount
      }
    });

    function createTrustAccount(values: TrustAccountValues) {
      store
        .dispatch(
          TrustStore.actions.CREATE_TRUST_ACCOUNT,
          new TrustAccountInput({
            name: values.name,
            bsb: values.bsb,
            accountNumber: values.accountNumber,
            trustAccountType: values.trustAccountType,
            reference: values.reference,
            matterControlledMoneyId: values.matterControlledMoney?.id,
            businessEntityId: values.businessEntity?.id
          })
        )
        .then(() => {
          emit("close");
        });
    }

    return {
      createTrustAccount,
      TrustAccountType,
      state
    };
  }
});
</script>
