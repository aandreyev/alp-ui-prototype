<template>
  <modal @close="$emit('close')" :headingTitle="'Update Contact Relationships'">
    <modal-form @cancel="$emit('close')" confirmText="-1" cancelText="Close">
      <alp-form-divider name="Family Relationships" />
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Father">
          <contact-selector
            name="father"
            v-model="state.father"
            :can-clear="true"
          />
        </field-label>
        <field-label class="w-full sm:w-1/2" name="Mother">
          <contact-selector
            name="mother"
            v-model="state.mother"
            :can-clear="true"
          />
        </field-label>
        <field-label class="w-full sm:w-1/2" name="Spouse">
          <contact-selector
            name="spouse"
            v-model="state.spouse"
            :can-clear="true"
          />
        </field-label>
      </alp-form-container>
      <alp-form-divider name="Referrer Relationships" />
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Referer Contact">
          <contact-selector
            name="referrer"
            v-model="state.referrer"
            :can-clear="true"
          />
        </field-label>
      </alp-form-container>
      <alp-form-divider name="Professional Relationships" />
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Accountant">
          <contact-selector
            name="accountant"
            v-model="state.accountant"
            :can-clear="true"
          />
        </field-label>
        <field-label class="w-full sm:w-1/2" name="Financial Planner">
          <contact-selector
            name="financialplanner"
            v-model="state.financial"
            :can-clear="true"
          />
        </field-label>
        <field-label class="w-full sm:w-1/2" name="Lawyer">
          <contact-selector
            name="lawyer"
            v-model="state.lawyer"
            :can-clear="true"
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
import ContactSelector from "@/components/inputs/selectors/ContactSelector.vue";
import { ContactStore } from "@/store/modules/contacts";
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { usePatchable } from "@/composable/patchable";
import { ContactRelationshipsDto } from "@/network/dtos/contact-dto";

export default defineComponent({
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    ContactSelector
  },
  setup(props, { emit }) {
    const store = useStore();
    const { state } = usePatchable<ContactRelationshipsDto>({
      identifier: props.id,
      getter: ContactStore.getters.GET_CONTACT_RELATIONSHIPS,
      query: ContactStore.actions.GET_CONTACT_RELATIONSHIPS,
      queryParams: () => ({
        id: props.id
      }),
      patchQuery: ContactStore.actions.PATCH_CONTACT_RELATIONSHIPS,
      patchQueryParams: () => ({
        id: props.id
      })
    });

    return {
      state
    };
  }
});
</script>
