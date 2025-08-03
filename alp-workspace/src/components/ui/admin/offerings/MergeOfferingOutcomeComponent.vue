<template>
  <modal @close="$emit('close')" :headingTitle="'Merge Offering Component'">
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
            >High-risk operation, confirm your operation before submitting. The Old
            Offering Component will be removed from the system.
          </span>
        </div>

        <div
          class="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium"
            >You would like to merge the following Offering Components:
          </span>
          <span class="block bg-white rounded-md p-2 border border-gray-400 mt-2">
            <div
              class="flex flex-col mb-1"
              :class="{
                'line-through decoration-2 decoration-red-600':
                  state.offeringOutcomesComponent,
              }"
            >
              <div class="flex justify-between text-sm font-medium text-black">
                <router-link
                  :to="{
                    name: 'Offering Component',
                    params: { id: component.componentId },
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

          <!-- Selected Offering Outcome -->
          <span
            class="block bg-white rounded-md p-2 border border-gray-400 mt-2"
            v-if="state.offeringOutcomesComponent"
          >
            <div class="flex flex-col mb-1">
              <div class="flex justify-between text-sm font-medium text-black">
                <router-link
                  :to="{
                    name: 'Offering Component',
                    params: { id: component.componentId },
                  }"
                  class="hover:text-blue-500"
                  target="_blank"
                >
                  <alp-default-badge
                    :text="state.offeringOutcomesComponent.id"
                    :color="'blue'"
                  >
                  </alp-default-badge>
                  {{ state.offeringOutcomesComponent.title }}
                </router-link>
              </div>
              <span class="text-xs text-black">
                <span class="flex pr-2 pt-2">
                  {{ state.offeringOutcomesComponent.description }}
                </span>
              </span>
            </div>

            <field-label class="w-full mb-px" name="Title" :isRequired="true">
              <inline-input
                class="mb-1 w-full"
                placeholder="Title"
                v-model="state.offeringOutcomesComponent.title"
                rules="required"
              />
            </field-label>
            <field-label class="w-full" name="Description" :isRequired="true">
              <inline-text-area
                class="mb-1 w-full"
                placeholder="Description"
                v-model="state.offeringOutcomesComponent.description"
                :type="textarea"
              />
            </field-label>
            <div class="flex items-center w-full">
              <field-label class="w-full" name="Estimated Units">
                <inline-input
                  placeholder="Estimated Units"
                  v-model="state.offeringOutcomesComponent.estimatedUnits"
                />
              </field-label>
              <field-label class="w-full" name="Budget">
                <inline-input
                  placeholder="Budget"
                  v-model="state.offeringOutcomesComponent.budget"
                />
              </field-label>
            </div>
          </span>
        </div>

        <offering-outcome-component-selector-field
          class="flex-1"
          name="offeringOutcomesComponent"
          v-model="state.offeringOutcomesComponent"
        />
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import OfferingSelector from "@/components/inputs/selectors/OfferingSelector.vue";
import OfferingOutcomeComponentSelectorField from "@/components/forms/selectors/OfferingOutcomeComponentSelectorField.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { OfferingComponentServiceProxy } from "@/network/offerings-service-proxies";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { useNotify } from "@/composable/notify";
import { OfferingStore } from "@/store/modules/offerings";
import InlineInput from "@/components/inputs/InlineInput.vue";
import { OfferingOutcomeComponentDto } from "@/network/dtos/offering-dto";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close", "emitSelectedOfferingOutcome"],
  props: {
    component: {
      type: Object as PropType<OfferingOutcomeComponentDto>,
      required: true,
    },
  },
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    InlineInput,

    VField,
    ErrorMessage,
    OfferingSelector,
    OfferingOutcomeComponentSelectorField,
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fireErrorToast } = useNotify();

    const state = reactive({
      offeringOutcomesComponent: null as OfferingOutcomeComponentDto | null,
    });

    function mergeOfferingComponent(values: any) {
      console.log("mergeOfferingComponent", props.component);

      console.log("offeringOutcomesComponent", state.offeringOutcomesComponent);
      state.offeringOutcomesComponent = values.offeringOutcomesComponent;
      if (state.offeringOutcomesComponent?.id == props.component.id) {
        fireErrorToast("The same original and traget source !");
      } else {
        if (state.offeringOutcomesComponent != null) {
          new OfferingComponentServiceProxy()
            .mergeOfferingComponent(
              props.component.id,
              state.offeringOutcomesComponent?.id,
              state.offeringOutcomesComponent
            )
            .then(() => {
              store.dispatch(OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS, {
                offeringId: 0,
                outcomeId: state.offeringOutcomesComponent?.id,
              });
            })
            .then(() => {
              store.dispatch(OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS, {
                offeringId: 0,
                outcomeId: props.component.outcomeId,
              });
              emit("close");
            });
        }
      }
    }

    return {
      state,
      mergeOfferingComponent,
      fireErrorToast,
    };
  },
});
</script>

<style scoped></style>
