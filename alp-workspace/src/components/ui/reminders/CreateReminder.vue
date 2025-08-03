<template>
  <modal @close="$emit('close')" :headingTitle="'Create Reminder'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createReminder"
      :initialValues="{ dueDate: new Date() }"
    >
      <field-label name="Message" :isRequired="true">
        <editor-field name="message" rules="required" />
      </field-label>

      <field-label name="Due Date" :isRequired="true">
        <date-field name="dueDate" rules="required" />
        <error-message name="dueDate" />
      </field-label>

      <field-label name="Document Info" v-if="document">
        <span class="flex-1 text-xs font-medium bg-gray-200 py-1 px-3">
          {{ document?.fileName }}{{ document?.fileExtension }}
        </span>
      </field-label>
      <field-label class="w-1/2 sm:w-1/2" name="Resources" v-if="!document">
        <v-field as="select" name="documents">
          <option value="" disabled>Select a resource</option>
          <option
            v-for="option in state.documents"
            :key="option?.id"
            :value="option?.id"
          >
            {{ option?.fileName }}{{ option?.fileExtension }}
          </option>
        </v-field>
        <error-message class="error-message" name="documents" />
      </field-label>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";

import EditorField from "@/components/forms/EditorField.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { toDateTime } from "@/composable/date";
import { ReminderStore } from "@/store/modules/reminders";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { DocumentDto } from "@/network/dtos/document-dto";
import { ResourceStore } from "@/store/modules/resources";
import { DateTime } from "luxon";
import { ReminderInput } from "@/network/dtos/reminder-dto";

interface CreateReminderValues {
  message: string;
  dueDate: DateTime;
  documents: number | string;
}

export default defineComponent({
  props: {
    reminderType: {
      type: String as PropType<"todo" | "document">,
      required: true
    },
    id: {
      type: Number
    },
    document: {
      type: Object as PropType<DocumentDto>
    }
  },
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    ErrorMessage,
    EditorField,
    FieldLabel,
    VField
  },
  setup(props, { emit }) {
    const state = reactive({
      documents: []
    });
    const store = useStore();

    function createReminder(values: CreateReminderValues) {
      const input = new ReminderInput({
        ...values,
        dueDate: toDateTime(values.dueDate)?.toUTC(),
        reminderTypeId: values.documents
      });

      store
        .dispatch(ReminderStore.actions.CREATE_REMINDER, {
          reminderType: values.documents ? "document" : props.reminderType,
          id: props.id ? props.id : values.documents,
          input
        })

        .then(() => {
          store.commit(ReminderStore.mutations.CREATE_COUNT);
          emit("close");
        });
    }
    store
      .dispatch(ResourceStore.actions.GET_RESOURCE_DOCUMENTS, {
        limit: 20
      })
      .then((response) => {
        state.documents = response.items;
      });

    return { createReminder, state };
  }
});
</script>
