<template>
  <div class="h-full flex flex-col bg-white rounded p-2">
    <div class="flex items-center justify-between">
      <span class="flex-1 flex items-center mr-3 text-sm">
        <span class="flex space-x-2">
          <shad-badge variant="outline" class="text-green-600"
            >Outcome</shad-badge
          >
          <span class="font-semibold">{{ state.description }} </span>
        </span>
      </span>

      <div class="flex items-center">
        <div
          class="flex border bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900"
        >
          <span class="mr-1 font-semibold">${{ state.totalBudget }}</span>
          <span class="font-semibold"
            >({{ state.totalEstimatedUnits }} units)</span
          >
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
      <div class="relative" v-for="component in components" :key="component.id">
        <inline-offering-component
          :class="{
            'border-green-300 bg-opacity-25 bg-green-300 hover:bg-red-100 hover:border-red-300':
              isSelected(component)
          }"
          :offering-id="id"
          :outcome-id="outcome.id"
          :component="component"
          :outcomeActivity="iconActivity"
        />
        <alp-button
          class="ml-auto offeringBtn"
          small
          @click="selectOutcome(component)"
        >
          <font-awesome-icon
            :icon="
              isSelected(component) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'
            "
          />
        </alp-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import InlineOfferingComponent from "@/components/ui/offerings/InlineOfferingComponent.vue";
import { usePatchable } from "@/composable/patchable";
import {
  OfferingOutcomeDto,
  OfferingOutcomeComponentDto
} from "@/network/dtos/offering-dto";

import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  watch
} from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "OfferingOutcome",
  emits: ["close"],
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    outcome: {
      type: Object as PropType<OfferingOutcomeDto>,
      required: true
    },
    iconActivity: {
      type: String
    },
    outcomeSelectedID: Number,
    multiIcon: {
      type: String
    }
  },
  components: {
    InlineOfferingComponent
    //FieldDisplay,
    //InlineOfferingOutcomeObjectionGuarantee
  },
  setup(props) {
    const { state } = usePatchable<OfferingOutcomeDto>({
      original: computed(() => props.outcome),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_OUTCOME,
      patchQueryParams: () => ({ offeringId: props.id })
    });

    const outcomeState = reactive({
      expanded: false,
      detailsExpanded: false,
      outcomes: {} as Record<number, OfferingOutcomeComponentDto>,
      data: new OfferingOutcomeComponentDto(),
      activity: ""
    });

    const store = useStore();
    let components = computed(
      () =>
        ApiStore.toData(
          store.getters[OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS](
            props.outcome.id
          )
        ) || []
    );
    //console.log("icon",props.iconActivity)
    onMounted(() =>
      store.dispatch(OfferingStore.actions.GET_OFFERING_OUTCOME_COMPONENTS, {
        offeringId: props.id,
        outcomeId: props.outcome.id
      })
    );

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
    let outcomeIconActivity: any;
    watch([() => (outcomeIconActivity = props.iconActivity)], () => {
      let ids = props.outcomeSelectedID;
      let tempItems = components.value as OfferingOutcomeComponentDto[];
      tempItems = tempItems.filter((x) => x.outcomeId == ids);
      tempItems.forEach((value: any, index) => {
        outcomeState.data = value;
        multiSelectOutcome(outcomeState.data);
      });
    });

    function selectOutcome(outcome: OfferingOutcomeComponentDto) {
      if (isSelected(outcome)) {
        delete outcomeState.outcomes[outcome.id!];
        let localValue = window.localStorage.getItem(outcome.outcomeId as any);
        let totalLocalValue = (localValue as any) - 1;
        window.localStorage.setItem(
          outcome.outcomeId as any,
          totalLocalValue as any
        );
        store.commit(OfferingStore.mutations.SET_OUTCOME_ACTIVITY, "deleted");
        var totalUnits = outcome.estimatedUnits as 0;
        // let selectedUnits = store.getters[OfferingStore.getters.GET_OUTCOME_UNITS]
        // var toUnits = selectedUnits - totalUnits;
        store.commit(OfferingStore.mutations.SET_OUTCOME_UNITS, totalUnits);
        var Budget = outcome.budget as 0;
        // let selectedBudget = store.getters[OfferingStore.getters.GET_OUTCOME_BUDGET];
        // var totalBudget = selectedBudget - Budget;
        store.commit(OfferingStore.mutations.SET_OUTCOME_BUDGET, Budget);
        let selectedCount =
          store.getters[OfferingStore.getters.GET_OUTCOME_COUNT];
        var totalBudgetCountDeleted = selectedCount - 1;
        store.commit(
          OfferingStore.mutations.SET_OUTCOME_COUNT,
          totalBudgetCountDeleted
        );
      } else {
        outcomeState.outcomes[outcome.id!] = outcome;
        let totalLocalValue: any;
        let localValue = window.localStorage.getItem(outcome.outcomeId as any);
        if (localValue != null) {
          let currentValue = Number.parseInt(localValue as any);
          totalLocalValue = currentValue + 1;
        } else {
          totalLocalValue = "1";
        }
        window.localStorage.setItem(outcome.outcomeId as any, totalLocalValue);
        store.commit(OfferingStore.mutations.SET_OUTCOME_ACTIVITY, "added");
        var Units = outcome.estimatedUnits;
        // let selectedUnits = store.getters[OfferingStore.getters.GET_OUTCOME_UNITS];
        // var tUnits = selectedUnits + Units;
        store.commit(OfferingStore.mutations.SET_OUTCOME_UNITS, Units);
        var TotalBudget = outcome.budget;
        // let selectedBudget = store.getters[OfferingStore.getters.GET_OUTCOME_BUDGET];
        // var totalBudgetAdded = selectedBudget + TotalBudget;
        store.commit(OfferingStore.mutations.SET_OUTCOME_BUDGET, TotalBudget);
        let selectedCount: any;
        selectedCount = store.getters[OfferingStore.getters.GET_OUTCOME_COUNT];
        let outcomeID = store.getters[OfferingStore.getters.GET_OUTCOME_ID];
        let ID = outcome.outcomeId;
        if (ID != outcomeID) {
          selectedCount = 0;
        }
        var totalBudgetCount = selectedCount + 1;
        store.commit(
          OfferingStore.mutations.SET_OUTCOME_COUNT,
          totalBudgetCount
        );
      }
      store.commit(OfferingStore.mutations.SET_OUTCOME_ID, outcome.outcomeId);
      store.commit(OfferingStore.mutations.SET_SELECT_COMPONET, outcome.id);
    }
    function isSelected(outcome: OfferingOutcomeComponentDto) {
      return outcome.id! in outcomeState.outcomes;
    }
    function multiSelectOutcome(outcome: OfferingOutcomeComponentDto) {
      if (multiIsSelected(outcome)) {
        if (props.multiIcon == "deleted")
          delete outcomeState.outcomes[outcome.id!];

        let localValue = window.localStorage.getItem(outcome.outcomeId as any);
        let totalLocalValue = (localValue as any) - 1;
        window.localStorage.setItem(
          outcome.outcomeId as any,
          totalLocalValue as any
        );
      } else {
        if (props.multiIcon == "added")
          outcomeState.outcomes[outcome.id!] = outcome;

        let totalLocalValue: any;
        let localValue = window.localStorage.getItem(outcome.outcomeId as any);
        if (localValue != null) {
          let currentValue = Number.parseInt(localValue as any);
          totalLocalValue = currentValue + 1;
        } else {
          totalLocalValue = "1";
        }
        window.localStorage.setItem(outcome.outcomeId as any, totalLocalValue);
      }
    }
    function multiIsSelected(outcome: OfferingOutcomeComponentDto) {
      return outcome.id! in outcomeState.outcomes;
    }
    return {
      isSelected,
      selectOutcome,
      state,
      outcomeState,
      components,
      objectionGuaranteeState,
      objectionGuarantees,
      multiSelectOutcome,
      multiIsSelected
    };
  }
});
</script>

<style scoped></style>
