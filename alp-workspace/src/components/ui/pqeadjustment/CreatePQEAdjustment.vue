<template>
  <modal @close="$emit('close')" :headingTitle="'Create PQE Adjustment'">
    <modal-form @cancel="$emit('close')" @submit="createPQEAdjustment">
      <alp-form-container>
        <field-label class="w-1/2" name="Staff" :isRequired="true">
          <user-selector-field name="staff" rules="required" />
        </field-label>

        <field-label class="w-1/2" name="Adjustment Description *">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Details" :isRequired="true">
          <v-field
            type="text"
            placeholder="Details"
            name="details"
            rules="required"
          />
          <error-message class="error-message" name="details" />
        </field-label>

        <field-label class="w-1/2" name="Start date" :isRequired="true">
          <date-field
            placeholder="Start Date"
            name="startDate"
            rules="required"
          />
        </field-label>

        <field-label class="w-1/2" name="End date" :isRequired="true">
          <date-field placeholder="End Date" name="endDate" rules="required" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script setup lang="ts">
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
import { UserDto, PQEAdjustmentInput } from "@/network/dtos/user-dto";

interface PQEAdjustmentValues {
  name?: string;
  details?: string | undefined;
  startDate?: DateTime | undefined;
  endDate?: DateTime | undefined;
  staff?: UserDto | undefined;
}

const emit = defineEmits(["close"]);

const store = useStore();

function createPQEAdjustment(values: PQEAdjustmentValues) {
  const input = new PQEAdjustmentInput({
    name: values.name,
    details: values.details,
    startDate: toDateTime(values.startDate)?.toUTC(),
    endDate: toDateTime(values.endDate)?.toUTC(),
    staffId: values.staff?.id
  });

  store.dispatch(UserStore.actions.CREATE_PQE_ADJUSTMENT, input).then(() => {
    emit("close");
  });
}
</script>
