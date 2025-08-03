<template>
  <div class="flex items-start">
    <div class="flex-1 flex flex-col">
      <field-display
        class="w-full"
        label="Objection"
        :content="state.objection"
      />
      <field-display
        class="w-full"
        label="Guarantee"
        :content="state.guarantee"
      />
    </div>
  </div>
</template>

<script lang="ts">
import FieldDisplay from "@/components/common/FieldDisplay.vue";
import { usePatchable } from "@/composable/patchable";
import {
  OfferingOutcomeObjectionGuaranteeDto,
  OfferingOutcomeDto
} from "@/network/dtos/offering-dto";

import { OfferingStore } from "@/store/modules/offerings";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    offeringId: {
      type: [String, Number],
      required: true
    },
    outcomeId: {
      type: [String, Number],
      required: true
    },
    objectionGuarantee: {
      type: Object as PropType<OfferingOutcomeObjectionGuaranteeDto>,
      required: true
    }
  },
  components: {
    FieldDisplay
  },
  setup(props) {
    const { state } = usePatchable<OfferingOutcomeDto>({
      original: computed(() => props.objectionGuarantee),
      patchQuery:
        OfferingStore.actions.PATCH_OFFERING_OUTCOME_OBJECTION_GUARANTEE,
      patchQueryParams: () => ({
        offeringId: props.offeringId,
        outcomeId: props.outcomeId,
        id: props.objectionGuarantee.id
      })
    });

    return { state };
  }
});
</script>
