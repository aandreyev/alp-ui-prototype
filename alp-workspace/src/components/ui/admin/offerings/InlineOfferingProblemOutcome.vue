<template>
  <div class="flex items-start p-3 bg-white rounded">
    <div class="flex-1 flex flex-wrap">
      <field-label class="w-full md:w-1/2" name="Problem">
        <inline-text-area placeholder="Problem" v-model="state.problem" />
      </field-label>
      <field-label class="w-full md:w-1/2" name="Outcome">
        <inline-text-area placeholder="Outcome" v-model="state.outcome" />
      </field-label>
    </div>
    <alp-options class="self-start">
      <span
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click="removeProblemOutcome"
      >
        Delete
      </span>
    </alp-options>
  </div>
</template>

<script lang="ts">
import FieldLabel from "@/components/forms/FieldLabel.vue";

import { usePatchable } from "@/composable/patchable";
import {
  OfferingOutcomeDto,
  OfferingProblemOutcomeDto
} from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    problemOutcome: {
      type: Object as PropType<OfferingProblemOutcomeDto>,
      required: true
    }
  },
  components: {
    FieldLabel
  },
  setup(props) {
    const { state } = usePatchable<OfferingOutcomeDto>({
      original: computed(() => props.problemOutcome),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_PROBLEM_OUTCOME,
      patchQueryParams: () => ({ offeringId: props.id })
    });

    const store = useStore();

    function removeProblemOutcome() {
      store.dispatch(OfferingStore.actions.DELETE_OFFERING_PROBLEM_OUTCOME, {
        offeringId: props.id,
        id: props.problemOutcome.id
      });
    }

    return { state, removeProblemOutcome };
  }
});
</script>
