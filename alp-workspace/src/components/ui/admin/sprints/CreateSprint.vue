<template>
  <modal @close="$emit('close')" :headingTitle="'Create Sprint'">
    <modal-form @cancel="$emit('close')" @submit="createSprint">
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
        <field-label class="w-1/2" name="Start" :isRequired="true">
          <date-field name="startDate" rules="required" placeholder="Start" />
          <error-message class="error-message" name="startDate" />
        </field-label>
        <field-label class="w-1/2" name="End" :isRequired="true">
          <date-field name="endDate" rules="required" placeholder="End" />
          <error-message class="error-message" name="endDate" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import { CalendarIcon } from "@radix-icons/vue";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { SprintStore } from "@/store/modules/sprints";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { Calendar } from "@/lib/registry/new-york/ui/calendar";
import { toDateTime } from "@/composable/date";
import { SprintInput } from "@/network/dtos/project-dto";

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    Calendar
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      startdate: new Date(),
      enddate: new Date()
    });
    function createSprint(values: SprintInput) {
      (values.startDate = toDateTime(values.startDate)?.toUTC()),
        (values.endDate = toDateTime(values.endDate)?.toUTC());
      if (values != undefined) {
        store.dispatch(SprintStore.actions.CREATE_SPRINT, values).then(() => {
          emit("close");
        });
      }
    }

    return { createSprint, format, cn, state, CalendarIcon };
  }
});
</script>
