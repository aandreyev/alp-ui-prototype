<template>
  <modal @close="$emit('close')" :headingTitle="'Merge Offering Outcome'">
    <modal-form
      :initial-values="{}"
      @cancel="$emit('close')"
      @submit="mergeOfferingComponent"
      v-slot="{}"
    >
      <alp-form-container>
        <div
          class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-gray-800 dark:text-red-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium"
            >High-risk operation, confirm your operation before submitting. The
            Old Offering Outcome will be removed from the system.
          </span>
        </div>

        <div
          class="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium"
            >You would like to merge the following Offering Outcome:
          </span>
          <span
            class="block bg-white rounded-md p-2 border border-gray-400 mt-2"
          >
            <div
              class="flex flex-col mb-1"
              :class="{
                'line-through decoration-2 decoration-red-600':
                  state.offeringOutcomes
              }"
            >
              <div class="flex justify-between text-sm font-medium text-black">
                <div class="hover:text-blue-500">
                  <alp-default-badge :text="outcome.id" :color="'blue'">
                  </alp-default-badge>
                  {{ outcome.description }}
                </div>
              </div>
              <!-- <span class="text-xs text-black">
                  <span class="flex pr-2 pt-2"> {{outcome.description}} </span>
                </span> -->
            </div>
          </span>

          <!-- Selected Offering Outcome -->
          <span
            class="block bg-white rounded-md p-2 border border-gray-400 mt-2"
            v-if="state.offeringOutcomes"
          >
            <div class="flex flex-col mb-1">
              <div class="flex justify-between text-sm font-medium text-black">
                <router-link
                  :to="{
                    name: 'Offering Component',
                    params: { id: outcome.id }
                  }"
                  class="hover:text-blue-500"
                  target="_blank"
                >
                  <alp-default-badge
                    :text="state.offeringOutcomes.id"
                    :color="'blue'"
                  >
                  </alp-default-badge>
                  {{ state.offeringOutcomes.description }}
                </router-link>
              </div>
              <!-- <span class="text-xs text-black">
                  <span class="flex pr-2 pt-2"> {{state.offeringOutcomes.description}} </span>
                </span> -->
            </div>

            <!-- <field-label class="w-full mb-px" name="Title" :isRequired="true">
              <inline-input
                class="mb-1 w-full"
                placeholder="Title"
                v-model="state.offeringOutcomes.title"
                rules="required"
              />
            </field-label> -->
            <field-label class="w-full" name="Description" :isRequired="true">
              <inline-text-area
                class="mb-1 w-full"
                placeholder="Description"
                v-model="state.offeringOutcomes.description"
                :type="textarea"
              />
            </field-label>
            <!-- <div class="flex items-center w-full">
              <field-label class="w-full" name="Estimated Units">
                <inline-input
                  placeholder="Estimated Units"
                  v-model="state.offeringOutcomesComponent.estimatedUnits"
                />
              </field-label>
              <field-label class="w-full" name="Budget">
                <inline-input placeholder="Budget" v-model="state.offeringOutcomesComponent.budget" />
              </field-label>
            </div> -->
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
import { OfferingComponentServiceProxy } from "@/network/offerings-service-proxies";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { useNotify } from "@/composable/notify";
import InlineInput from "@/components/inputs/InlineInput.vue";
import { OfferingStore } from "@/store/modules/offerings";
import { OfferingOutcomeDto } from "@/network/dtos/offering-dto";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close", "emitSelectedOfferingOutcome"],
  props: {
    outcome: {
      type: Object as PropType<OfferingOutcomeDto>,
      required: true
    }
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    InlineInput,

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

    function mergeOfferingComponent(values: any) {
      state.offeringOutcomes = values.offeringOutcome;
      if (state.offeringOutcomes?.id == props.outcome.id) {
        fireErrorToast("The same original and traget source !");
      } else {
        if (state.offeringOutcomes != null) {
          new OfferingComponentServiceProxy()
            .mergeOfferingOutcome(
              props.outcome.id,
              state.offeringOutcomes?.id,
              state.offeringOutcomes
            )
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
                  outcomeId: props.outcome.id
                }
              );
              emit("close");
            });
        }
      }
    }

    return {
      state,
      mergeOfferingComponent,
      fireErrorToast
    };
  }
});
</script>

<style scoped></style>
