<template>
  <div
    class="flex items-center border border-gray-300 rounded text-sm w-full pr-1 py-1 mt-2 hover:bg-gray-200"
  >
    <div class="flex-1 flex flex-col items-start">
      <div class="flex flex-col px-3 pb-3 text-sm w-full">
        <span class="text-sm font-semibold flex">
          <alp-default-badge :text="state.id" />
          {{ state.title }}
        </span>
        <span v-if="state.description">
          {{ state.description }}
        </span>
        <span v-else class="italic text-gray-400">Unspecified</span>
      </div>

      <div class="w-full flex justify-end text-xs">
        <div
          v-if="state.lawSubArea"
          class="text-xs flex rounded bg-gray-50 border px-3 py-1 mr-1"
        >
          <span class="mr-1">{{ state.lawArea?.name }}</span>
          /
          <span class="ml-1">{{ state.lawSubArea?.name }}</span>
        </div>
        <div class="text-xs flex rounded bg-gray-50 border px-3 py-1">
          <span class="mr-1 font-semibold">${{ state.budget }}</span>
          <span class="font-semibold">({{ state.estimatedUnits }} units)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { usePatchable } from "@/composable/patchable";
import { OfferingComponentDto } from "@/network/dtos/offering-dto";

import { OfferingStore } from "@/store/modules/offerings";
import { computed, defineComponent, PropType, reactive } from "vue";

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
      type: Object as PropType<OfferingComponentDto>,
      required: true
    },
    outcomeActivity: Boolean
  },
  setup(props) {
    const { state } = usePatchable<OfferingComponentDto>({
      original: computed(() => props.component),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_COMPONENT,
      patchQueryParams: () => ({
        id: props.component.id
      })
    });
    const stateOffering = reactive({
      offeringIcon: false,
      stateUnits: null as number | null,
      stateBudget: null as number | null
    });

    return {
      state,
      stateOffering
    };
  }
});
</script>
