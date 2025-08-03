<template>
  <modal @close="$emit('close')" :headingTitle="'Create Remuneration'">
    <modal-form @cancel="$emit('close')" @submit="createRemuneration">
      <alp-form-container>
        <field-label class="w-1/2" name="Staff" :isRequired="true">
          <user-selector-field name="staff" rules="required" />
        </field-label>

        <field-label class="w-1/2" name="FTE Load" :isRequired="true">
          <v-field
            type="number"
            placeholder="Ftd Load"
            name="fteLoad"
            rules="required"
            min="0"
          />
          <error-message class="error-message" name="fteLoad" />
        </field-label>

        <field-label
          class="w-1/2"
          name="Remuneration inc. Super "
          :isRequired="true"
        >
          <v-field
            type="number"
            placeholder="Remuneration inc. Super"
            name="remunerationIncSuper"
            rules="required"
          />
          <error-message class="error-message" name="remunerationIncSuper" />
        </field-label>

        <field-label class="w-1/2" name="Billing Rate" :isRequired="true">
          <v-field
            type="number"
            placeholder="Billing Rate"
            name="billingRate"
            rules="required"
          />
          <error-message class="error-message" name="billingRate" />
        </field-label>

        <field-label
          class="w-1/2"
          name="Billable percentage"
          :isRequired="true"
        >
          <v-field
            type="number"
            placeholder="Billable percentage"
            name="billablePercentage"
            rules="required"
          />
          <error-message class="error-message" name="billablePercentage" />
        </field-label>

        <field-label class="w-1/2" name="Remuneration date" :isRequired="true">
          <date-field
            placeholder="Remuneration date"
            name="remunerationDate"
            rules="required"
          />
        </field-label>

        <field-label class="w-1/2" name="Commencement date" :isRequired="true">
          <date-field
            placeholder="Commencement date"
            name="commencementDate"
            rules="required"
          />
        </field-label>

        <field-label class="w-1/2" name="Termination Date">
          <date-field placeholder="Termination Date" name="terminationDate" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import UserSelectorField from "@/components/forms/selectors/UserSelectorField.vue";
import { UserStore } from "@/store/modules/users";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { toDateTime } from "@/composable/date";
import { UserDto, RemunerationInput } from "@/network/dtos/user-dto";

interface RemunerationValues {
  fteLoad?: number | undefined;
  remunerationIncSuper?: number | undefined;
  billingRate?: number | undefined;
  billablePercentage?: number | undefined;
  remunerationDate?: DateTime | undefined;
  commencementDate?: DateTime | undefined;
  terminationDate?: DateTime | undefined;
  staff?: UserDto | undefined;
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
    UserSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createRemuneration(values: RemunerationValues) {
      const input = new RemunerationInput({
        fteLoad: values.fteLoad,
        remunerationIncSuper: values.remunerationIncSuper,
        billingRate: values.billingRate,
        billablePercentage: values.billablePercentage,
        remunerationDate: toDateTime(values.remunerationDate)?.toUTC(),
        commencementDate: toDateTime(values.commencementDate)?.toUTC(),
        terminationDate: toDateTime(values.terminationDate)?.toUTC(),
        staffId: values.staff?.id
      });
      store.dispatch(UserStore.actions.CREATE_REMUNERATION, input).then(() => {
        emit("close");
      });
    }

    return {
      createRemuneration
    };
  }
});
</script>
