<template>
  <modal @close="$emit('close')" :headingTitle="'Move Offering Component'">
    <modal-form
      :initial-values="{}"
      @cancel="$emit('close')"
      @submit="transferOfferingComponent"
      v-slot="{}"
    >
      <alp-form-container>
        <div
          class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-gray-800 dark:text-red-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium"
            >High-risk operation, confirm your operation before submitting.
          </span>
        </div>

        <div
          class="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium"
            >You would like to move the following Offering Component into new a
            Offering Outcome:
          </span>
          <span
            class="block bg-white rounded-md p-2 border border-gray-400 mt-2"
          >
            <div class="flex flex-col mb-1">
              <div class="flex justify-between text-sm font-medium text-black">
                <router-link
                  :to="{
                    name: 'Offering Component',
                    params: { id: component.componentId }
                  }"
                  class="hover:text-blue-500"
                  target="_blank"
                >
                  <alp-default-badge :text="component.id" :color="'blue'">
                  </alp-default-badge>
                  {{ component.title }}
                </router-link>
              </div>
              <span class="text-xs text-black">
                <span class="flex pr-2 pt-2">
                  {{ component.description }}
                </span>
              </span>
            </div>
          </span>
        </div>

        <offering-outcome-selector-field
          class="flex-1"
          name="offeringOutcome"
          v-model="state.offeringOutcomes"
          :column="true"
        />
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import OfferingSelector from "@/components/inputs/selectors/OfferingSelector.vue";
import OfferingOutcomeSelectorField from "@/components/forms/selectors/OfferingOutcomeSelectorField.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import {
  OfferingOutcomeComponentDto,
  OfferingOutcomeDto
} from "@/network/dtos/offering-dto";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";

import { useNotify } from "@/composable/notify";
import { OfferingStore } from "@/store/modules/offerings";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close", "emitSelectedOfferingOutcome"],
  props: {
    component: {
      type: Object as PropType<OfferingOutcomeComponentDto>,
      required: true
    }
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage,
    OfferingSelector,
    OfferingOutcomeSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fireErrorToast } = useNotify();

    const state = reactive({
      offeringOutcomes: null as OfferingOutcomeDto | null
    });

    function transferOfferingComponent(values: any) {
      state.offeringOutcomes = values.offeringOutcome;
      if (state.offeringOutcomes?.id == null) {
        fireErrorToast("Invalid Input !");
      } else {
        store
          .dispatch(OfferingStore.actions.MOVE_OFFERING_NEW_OUTCOME_COMPONENT, {
            offeringId: 0,
            outcomeId: state.offeringOutcomes.id,
            componentId: props.component.id,
            destinationOutcomeId: state.offeringOutcomes.id
          })
          .then(() => {
            store.dispatch(
              OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS,
              {
                offeringId: 0,
                outcomeId: state.offeringOutcomes?.id
              }
            );
          })
          .then(() => {
            store.dispatch(
              OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS,
              {
                offeringId: 0,
                outcomeId: props.component.outcomeId
              }
            );
            emit("close");
          });

        // new OfferingComponentServiceProxy()
        // .moveOfferingComponentIntoNewOutcome(0, 0, props.component.id, state.offeringOutcomes?.id)
        // .then(
        //     () => {
        //       store.dispatch[OfferingStore.getters.GET_OFFERING_OUTCOMES],
        //       store.getters[OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS](
        //         props.component.outcomeId
        //       )
        //       emit("close")
        //     }
        // );
      }
    }

    return {
      state,
      transferOfferingComponent,
      fireErrorToast
    };
  }
});
</script>

<style scoped></style>
