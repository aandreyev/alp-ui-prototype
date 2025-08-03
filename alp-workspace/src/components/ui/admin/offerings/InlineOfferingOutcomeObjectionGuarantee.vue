<template>
  <div class="flex items-start px-3">
    <div class="flex-1 flex flex-wrap">
      <field-label class="w-full md:w-1/2" name="Objection">
        <inline-text-area placeholder="Objection" v-model="state.objection" />
      </field-label>
      <field-label class="w-full md:w-1/2" name="Guarantee">
        <inline-text-area placeholder="Guarantee" v-model="state.guarantee" />
      </field-label>
    </div>
    <alp-options class="self-start">
      <span
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click="removeObjectionGuarantee"
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
  OfferingOutcomeObjectionGuaranteeDto,
  OfferingOutcomeDto
} from "@/network/dtos/offering-dto";

import { OfferingStore } from "@/store/modules/offerings";
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";

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
    FieldLabel
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

    const store = useStore();

    function removeObjectionGuarantee() {
      store.dispatch(
        OfferingStore.actions.DELETE_OFFERING_OUTCOME_OBJECTION_GUARANTEE,
        {
          offeringId: props.offeringId,
          outcomeId: props.outcomeId,
          id: props.objectionGuarantee.id
        }
      );
    }

    return { state, removeObjectionGuarantee };
  }
});
</script>
