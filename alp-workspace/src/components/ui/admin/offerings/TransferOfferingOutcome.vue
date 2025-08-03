<template>
  <modal @close="$emit('close')" :headingTitle="'Move Offering Outcome'">
    <modal-form
      :initial-values="{}"
      @cancel="$emit('close')"
      @submit="transferOfferingOutcome"
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
            >You would like to move the following Offering Outcome (including
            all components) into a new Offering:
          </span>
          <span
            class="block bg-white rounded-md p-2 border border-gray-400 mt-2"
          >
            <div class="flex flex-col mb-1">
              <div class="flex justify-between text-sm font-medium text-black">
                <router-link
                  :to="{ name: 'Offering', params: { id: offeringOutcome.id } }"
                  class="hover:text-blue-500"
                  target="_blank"
                >
                  <alp-default-badge :text="offeringOutcome.id" :color="'blue'">
                  </alp-default-badge>
                  {{ offeringOutcome.description }}
                </router-link>
              </div>
              <span class="text-xs text-black">
                <span class="flex pr-2 pt-2">
                  {{ offeringOutcome.description }}
                </span>
              </span>
            </div>
          </span>
        </div>

        <offering-selector-field
          class="flex-1"
          name="offering"
          v-model="state.offering"
        />
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import OfferingSelectorField from "@/components/forms/selectors/OfferingSelectorField.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { OfferingDto, OfferingOutcomeDto } from "@/network/dtos/offering-dto";
import { useNotify } from "@/composable/notify";
import { OfferingStore } from "@/store/modules/offerings";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close", "emitSelectedOfferingOutcome"],
  props: {
    offeringOutcome: {
      type: OfferingOutcomeDto,
      required: true
    }
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage,
    OfferingSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fireErrorToast } = useNotify();

    const state = reactive({
      offering: null as OfferingDto | null
    });

    function transferOfferingOutcome(values: any) {
      console.log(state.offering);

      state.offering = values.offering;
      if (state.offering?.id == null) {
        fireErrorToast("Invalid Input !");
      } else {
        store
          .dispatch(OfferingStore.actions.MOVE_OFFERING_OUTCOME_INTO_OFFERING, {
            offeringId: 0,
            outcomeId: props.offeringOutcome.id,
            destinationOutcomeId: state.offering?.id
          })
          .then(() => {
            store.dispatch(
              OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS,
              {
                offeringId: 0,
                outcomeId: props.offeringOutcome.id
              }
            );
          });

        // new OfferingComponentServiceProxy()
        // .moveOfferingOutcomeIntoOffering(0, props.offeringOutcome.id, state.offering?.id)
        // .then(
        //     () => {
        //       store.getters[OfferingStore.getters.GET_OFFERING_OUTCOMES]
        //       emit("close")
        //     }
        // );
      }
    }

    return {
      state,
      transferOfferingOutcome,
      fireErrorToast
    };
  }
});
</script>

<style scoped></style>
