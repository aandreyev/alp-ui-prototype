<template>
  <div
    class="flex items-center border-2 border-gray-300 rounded-lg text-xs w-full pr-3 py-2 mt-2"
  >
    <div class="pl-3">
      <up-down-switch @up="moveUp" @down="moveDown" />
    </div>

    <div class="flex-1 flex flex-col px-2">
      <div class="flex justify-between">
        <div class="flex">
          <router-link
            class="text-sm font-semibold border-l-4 border-indigo-400 px-4 m-2"
            :to="{
              name: 'Offering Component',
              params: { id: state.componentId }
            }"
            target="_blank"
          >
            <alp-default-badge :text="state.id" />
            <span class="hover:text-blue-600 hover:underline cursor-pointer">
              {{ state.title }}
            </span>
          </router-link>
        </div>
        <div class="flex gap-2">
          <alp-button-with-text
            context="Remove"
            :color="'red'"
            icon-name="fa-solid fa-trash"
            @click.stop="removeComponent"
          />
          <alp-button-with-text
            context="Move"
            :color="'blue'"
            icon-name="fa-solid fa-arrow-right-arrow-left"
            @click.stop="transferComponent"
          />
          <alp-button-with-text
            context="Merge"
            :color="'purple'"
            icon-name="fa-solid fa-code-merge"
            @click.stop="mergeComponent"
          />
        </div>
      </div>

      <field-label class="w-full mb-px" name="Title" :isRequired="true">
        <inline-input
          class="mb-1 w-full"
          placeholder="Title"
          v-model="state.title"
          rules="required"
        />
      </field-label>
      <field-label class="w-full" name="Description">
        <inline-text-area
          class="mb-1 w-full"
          placeholder="Description"
          v-model="state.description"
          :type="textarea"
        />
      </field-label>
      <div class="flex items-center w-full">
        <field-label class="w-full" name="Estimated Units">
          <inline-input
            placeholder="Estimated Units"
            v-model="state.estimatedUnits"
          />
        </field-label>
        <field-label class="w-full" name="Budget">
          <inline-input placeholder="Budget" v-model="state.budget" />
        </field-label>
      </div>
      <div class="flex items-center w-full">
        <div class="flex items-center w-full sm:w-1/2">
          <field-display
            class="w-full"
            label="Law Area"
            :content="state.lawArea?.name"
          />
        </div>
        <field-label
          class="w-full sm:w-1/2"
          name="Law Sub Area"
          v-if="lawSubAreas"
          :isRequired="true"
        >
          <shad-select v-model="state.lawSubAreaId">
            <shad-select-trigger class="w-full">
              <shad-select-value placeholder="Law Sub Area" />
            </shad-select-trigger>
            <shad-select-content>
              <shad-select-group>
                <shad-select-label>Law Sub Area</shad-select-label>
                <shad-select-item
                  v-for="option in lawSubAreas"
                  :key="option.id"
                  :value="option.id"
                >
                  <div>{{ option.name }}</div>
                </shad-select-item>
              </shad-select-group>
            </shad-select-content>
          </shad-select>

          <error-message class="error-message" name="lawAreaId" />
        </field-label>
      </div>
    </div>
  </div>

  <transfer-offering-outcome-component
    v-if="flag.showTransferOfferingOutcomeComponent"
    @close="flag.showTransferOfferingOutcomeComponent = false"
    :component="flag.component"
  />

  <merge-offering-outcome-component
    v-if="flag.showMergeOfferingOutcomeComponent"
    @close="flag.showMergeOfferingOutcomeComponent = false"
    :component="flag.component"
  />
</template>

<script lang="ts">
import FieldDisplay from "@/components/common/FieldDisplay.vue";
import UpDownSwitch from "@/components/common/UpDownSwitch.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import InlineInput from "@/components/inputs/InlineInput.vue";

import { usePatchable } from "@/composable/patchable";
import { LawSubAreaDto } from "@/network/dtos/base-entity";
import { OfferingOutcomeComponentDto } from "@/network/dtos/offering-dto";
import { CommonStore } from "@/store/modules/common";
import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, onMounted, PropType, reactive } from "vue";
import { useStore } from "vuex";
import ActionButton from "@/components/common/ActionButton.vue";
import TransferOfferingOutcomeComponent from "./TransferOfferingOutcomeComponent.vue";
import MergeOfferingOutcomeComponent from "./MergeOfferingOutcomeComponent.vue";

export default defineComponent({
  name: "OfferingOutcome",
  emits: ["close", "add-component"],
  props: {
    offeringId: {
      type: [String, Number],
      required: true
    },
    outcomeId: {
      type: [String, Number],
      required: true
    },
    component: {
      type: Object as PropType<OfferingOutcomeComponentDto>,
      required: true
    }
  },
  components: {
    UpDownSwitch,
    FieldLabel,
    InlineInput,

    FieldDisplay,
    ActionButton,
    TransferOfferingOutcomeComponent,
    MergeOfferingOutcomeComponent
  },
  setup(props) {
    const flag = reactive({
      showTransferOfferingOutcomeComponent: false,
      showMergeOfferingOutcomeComponent: false,
      component: props.component
    });

    const { state } = usePatchable<OfferingOutcomeComponentDto>({
      original: computed(() => props.component),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_OUTCOME_COMPONENT,
      patchQueryParams: () => ({
        id: props.component.id
      }),
      callback: () =>
        store.dispatch(OfferingStore.actions.GET_OFFERING_OUTCOME_COMPONENTS, {
          offeringId: props.outcomeId,
          outcomeId: props.outcomeId
        })
    });

    const store = useStore();

    function removeComponent() {
      store.dispatch(OfferingStore.actions.REMOVE_OFFERING_OUTCOME_COMPONENT, {
        offeringId: props.offeringId,
        outcomeId: props.outcomeId,
        componentId: props.component.id
      });
    }

    function transferComponent() {
      flag.component = props.component;
      flag.showTransferOfferingOutcomeComponent = true;
    }

    function mergeComponent() {
      flag.component = props.component;
      flag.showMergeOfferingOutcomeComponent = true;
    }

    function moveUp() {
      store.dispatch(OfferingStore.actions.MOVE_OFFERING_OUTCOME_COMPONENT_UP, {
        offeringId: props.offeringId,
        outcomeId: props.outcomeId,
        componentId: props.component.id
      });
    }

    function moveDown() {
      store.dispatch(
        OfferingStore.actions.MOVE_OFFERING_OUTCOME_COMPONENT_DOWN,
        {
          offeringId: props.offeringId,
          outcomeId: props.outcomeId,
          componentId: props.component.id
        }
      );
    }

    const lawSubAreas = computed(() =>
      ApiStore.toData<LawSubAreaDto>(
        store.getters[CommonStore.getters.GET_ALL_LAW_SUB_AREAS]
      )
    );

    onMounted(() => store.dispatch(CommonStore.actions.GET_ALL_LAW_SUB_AREAS));

    return {
      state,
      lawSubAreas,
      removeComponent,
      transferComponent,
      mergeComponent,
      moveUp,
      moveDown,
      flag
    };
  }
});
</script>
