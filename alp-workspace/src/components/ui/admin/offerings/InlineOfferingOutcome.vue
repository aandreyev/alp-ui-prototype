<template>
  <div class="h-full flex flex-col bg-white rounded p-1">
    <div class="flex items-center justify-between">
      <span class="flex-1 flex items-center mr-3 text-sm">
        <span class="pr-2">
          <up-down-switch @up="moveUp" @down="moveDown" />
        </span>
        <alp-default-badge :text="state.id" :color="'yellow'" />
        <edit-inline-text-area
          class="flex-1 my-2 font-semibold"
          placeholder="Description"
          v-model="state.description"
          rules="required"
        />
      </span>

      <div class="flex items-center">
        <div class="flex gap-2">
          <div
            class="text-xs flex rounded-lg bg-gray-50 border px-3 py-1 items-center"
          >
            <span class="mr-1 font-semibold">${{ state.totalBudget }}</span>
            <span class="font-semibold"
              >({{ state.totalEstimatedUnits }} units)</span
            >
          </div>

          <alp-button-with-text
            v-if="components == ''"
            context="Delete"
            :color="'red'"
            icon-name="fa-solid fa-trash"
            @click.stop="deleteOutcome"
          />
          <alp-button-with-text
            context="Move"
            :color="'blue'"
            icon-name="fa-solid fa-arrow-right-arrow-left"
            @click.stop="transferOutcome"
          />
          <alp-button-with-text
            context="Merge"
            :color="'purple'"
            icon-name="fa-solid fa-code-merge"
            @click.stop="mergeOutcome"
          />
        </div>

        <alp-button
          class="m-1"
          small
          @click="outcomeState.expanded = !outcomeState.expanded"
        >
          <font-awesome-icon
            :icon="
              outcomeState.expanded
                ? 'fa-solid fa-chevron-up'
                : 'fa-solid fa-chevron-down'
            "
          />
        </alp-button>
      </div>
    </div>

    <template v-if="outcomeState.expanded">
      <inline-offering-component
        v-for="component in components"
        :key="component.id"
        :offering-id="id"
        :outcome-id="outcome.id"
        :component="component"
      />

      <alp-can permission="Offering.Create">
        <alp-button
          class="text-sm mx-1 mt-2"
          @click="$emit('add-component', outcome.id)"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          <span>Add Component</span>
        </alp-button>
      </alp-can>
    </template>
  </div>

  <transfer-offering-outcome
    v-if="flag.showTransferOfferingOutcome"
    @close="flag.showTransferOfferingOutcome = false"
    :offeringOutcome="state"
  />

  <merge-offering-outcome
    v-if="flag.showMergeOfferingOutcome"
    @close="flag.showMergeOfferingOutcome = false"
    :outcome="flag.outcome"
  />
</template>

<script lang="ts">
import UpDownSwitch from "@/components/common/UpDownSwitch.vue";
import EditInlineTextArea from "@/components/inputs/EditInlineTextArea.vue";
import InlineOfferingComponent from "@/components/ui/admin/offerings/InlineOfferingComponent.vue";
import { usePatchable } from "@/composable/patchable";
import { OfferingOutcomeDto } from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, onMounted, PropType, reactive } from "vue";
import { useStore } from "vuex";
import ActionButton from "@/components/common/ActionButton.vue";
import TransferOfferingOutcome from "./TransferOfferingOutcome.vue";
import MergeOfferingOutcome from "./MergeOfferingOutcome.vue";

export default defineComponent({
  name: "OfferingOutcome",
  emits: ["close", "add-component"],
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    outcome: {
      type: Object as PropType<OfferingOutcomeDto>,
      required: true
    }
  },
  components: {
    InlineOfferingComponent,
    EditInlineTextArea,
    UpDownSwitch,
    ActionButton,
    TransferOfferingOutcome,
    MergeOfferingOutcome
  },
  setup(props) {
    const flag = reactive({
      showTransferOfferingOutcome: false,
      offeringId: props.id,
      showMergeOfferingOutcome: false,
      outcome: props.outcome
    });
    const { state } = usePatchable<OfferingOutcomeDto>({
      original: computed(() => props.outcome),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_OUTCOME,
      patchQueryParams: () => ({ offeringId: props.id })
    });

    const outcomeState = reactive({
      expanded: false,
      detailsExpanded: false
    });

    const store = useStore();
    const components = computed(
      () =>
        ApiStore.toData(
          store.getters[OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS](
            props.outcome.id
          )
        ) || []
    );

    onMounted(() =>
      store.dispatch(OfferingStore.actions.GET_OFFERING_OUTCOME_COMPONENTS, {
        offeringId: props.id,
        outcomeId: props.outcome.id
      })
    );

    function deleteOutcome() {
      store.dispatch(OfferingStore.actions.DELETE_OFFERING_OUTCOME, {
        offeringId: props.id,
        outcomeId: props.outcome.id
      });
    }

    function transferOutcome() {
      flag.showTransferOfferingOutcome = true;
    }

    function moveUp() {
      store.dispatch(OfferingStore.actions.MOVE_OFFERING_OUTCOME_UP, {
        offeringId: props.id,
        outcomeId: props.outcome.id
      });
    }

    function moveDown() {
      store.dispatch(OfferingStore.actions.MOVE_OFFERING_OUTCOME_DOWN, {
        offeringId: props.id,
        outcomeId: props.outcome.id
      });
    }

    function mergeOutcome() {
      flag.outcome = props.outcome;
      flag.showMergeOfferingOutcome = true;
    }

    const objectionGuaranteeState = reactive({
      objection: "",
      guarantee: ""
    });
    const objectionGuarantees = computed(() =>
      ApiStore.toData(
        store.getters[
          OfferingStore.getters.GET_OFFERING_OUTCOME_OBJECTION_GUARANTEES
        ](props.outcome.id)
      )
    );

    onMounted(() =>
      store.dispatch(
        OfferingStore.actions.GET_OFFERING_OUTCOME_OBJECTION_GUARANTEES,
        {
          offeringId: props.id,
          outcomeId: props.outcome.id
        }
      )
    );

    function addObjectionGuarantee() {
      store
        .dispatch(
          OfferingStore.actions.CREATE_OFFERING_OUTCOME_OBJECTION_GUARANTEE,
          {
            offeringId: props.id,
            outcomeId: props.outcome.id,
            values: {
              objection: objectionGuaranteeState.objection,
              guarantee: objectionGuaranteeState.guarantee
            }
          }
        )
        .then(() => {
          objectionGuaranteeState.objection = "";
          objectionGuaranteeState.guarantee = "";
        });
    }

    return {
      state,
      outcomeState,
      components,
      deleteOutcome,
      moveUp,
      moveDown,
      objectionGuaranteeState,
      objectionGuarantees,
      addObjectionGuarantee,
      flag,
      transferOutcome,
      mergeOutcome
    };
  }
});
</script>

<style scoped></style>
