<template>
  <div class="flex items-start mb-3 px-3">
    <div class="flex-1 flex flex-wrap">
      <field-display
        class="w-full md:w-1/2"
        label="Problem"
        :content="state.problem"
      />
      <field-display
        class="w-full md:w-1/2"
        label="Outcome"
        :content="state.outcome"
      />
    </div>
  </div>
</template>

<script lang="ts">
import FieldDisplay from "@/components/common/FieldDisplay.vue";
import { usePatchable } from "@/composable/patchable";
import {
  OfferingProblemOutcomeDto,
  OfferingOutcomeDto
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
    FieldDisplay
  },
  setup(props) {
    const { state } = usePatchable<OfferingOutcomeDto>({
      original: computed(() => props.problemOutcome),
      patchQuery: OfferingStore.actions.PATCH_OFFERING_PROBLEM_OUTCOME,
      patchQueryParams: () => ({ offeringId: props.id })
    });

    const store = useStore();

    return { state };
  }
});
</script>
