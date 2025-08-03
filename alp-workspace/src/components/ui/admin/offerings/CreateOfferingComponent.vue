<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Offering Component'">
    <modal-form
      @cancel="$emit('close')"
      @submit="createOfferingComponent"
      v-slot="{}"
    >
      <alp-form-container>
        <field-label class="w-full" name="Title" :isRequired="true">
          <v-field
            type="text"
            placeholder="Title"
            name="title"
            rules="required"
          />
          <error-message class="error-message" name="title" />
        </field-label>

        <field-label class="w-full" name="Description">
          <v-field as="textarea" placeholder="Description" name="description" />
          <error-message class="error-message" name="description" />
        </field-label>

        <field-label class="w-full" name="Estimated Units">
          <v-field
            placeholder="Estimated Units"
            name="estimatedUnits"
            type="number"
          />
          <error-message class="error-message" name="estimatedUnits" />
        </field-label>

        <field-label class="w-full" name="Budget">
          <v-field type="text" placeholder="Budget" name="budget" />
          <error-message class="error-message" name="budget" />
        </field-label>

        <field-label class="w-full" name="Law Sub Area" v-if="lawSubAreas">
          <v-field as="select" name="lawSubAreaId">
            <option value="" disabled>Law Sub Area</option>
            <option
              v-for="option in lawSubAreas"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </v-field>

          <error-message class="error-message" name="lawAreaId" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { LawSubAreaDto } from "@/network/dtos/base-entity";
import { OfferingComponentInput } from "@/network/dtos/offering-dto";
import { CommonStore } from "@/store/modules/common";
import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "CreateOfferingComponent",
  emits: ["close"],
  props: {
    offeringId: {
      type: [String, Number]
    },
    outcomeId: {
      type: [String, Number]
    }
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    const lawSubAreas = computed(() =>
      ApiStore.toData<LawSubAreaDto>(
        store.getters[CommonStore.getters.GET_ALL_LAW_SUB_AREAS]
      )
    );

    onMounted(() => store.dispatch(CommonStore.actions.GET_ALL_LAW_SUB_AREAS));

    function createOfferingComponent(values: OfferingComponentInput) {
      if (props.offeringId && props.outcomeId) {
        store
          .dispatch(OfferingStore.actions.CREATE_OFFERING_OUTCOME_COMPONENT, {
            offeringId: props.offeringId,
            outcomeId: props.outcomeId,
            component: values
          })
          .then(() => emit("close"));
      } else {
        store
          .dispatch(OfferingStore.actions.CREATE_OFFERING_COMPONENT, {
            values
          })
          .then(() => emit("close"));
      }
    }

    return { lawSubAreas, createOfferingComponent };
  }
});
</script>

<style scoped></style>
