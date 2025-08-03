<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Add Offering Outcome'"
    :modelValue="true"
  >
    <div
      class="flex flex-col rounded-lg bg-white min-h-0 modelContent_sec overflow-auto"
    >
      <div
        v-for="(available, idx) in availableOutcomes"
        :key="idx"
        class="flex flex-col my-3"
      >
        <span class="ml-5 pb-3 font-semibold">
          {{ available.offering.name }}
        </span>
        <template v-if="available.outcomes.length > 0">
          <div
            v-for="outcome in available.outcomes"
            :key="outcome.id"
            class="mx-5 my-1 p-2 rounded-md border border-gray-400 cursor-pointer outer-box"
            @click="addMatterOutcome(outcome)"
          >
            <span class="text-xs font-semibold">{{ outcome.description }}</span>
            <div class="outer_sub">
              <template v-if="outcome.offeringOutcomeComponents.length > 0">
                <div
                  v-for="component in outcome.offeringOutcomeComponents"
                  :key="component.id"
                  class="mx-4 border-gray-400 cursor-pointer"
                  @click.stop="addMatterOutcomeComponent(component, outcome.id)"
                >
                  <!-- <span class="text-xs">{{ component.description }}</span> -->
                  <div
                    class="mb-3 text-sm white rounded-lg dark:bg-gray-800 dark:text-blue-400 w-full"
                    role="alert"
                  >
                    <span
                      class="block rounded-md p-2 border border-gray-400 mt-2 hover:bg-blue-100"
                    >
                      <div class="flex flex-col mb-1">
                        <div class="flex text-sm font-medium text-black">
                          <alp-default-badge
                            :text="component.id"
                            :color="'blue'"
                          >
                          </alp-default-badge>
                          <span>
                            {{ component.title }}
                          </span>
                        </div>
                        <span class="text-xs text-black">
                          <span class="flex pr-2 pt-2">
                            {{ component.description }}
                          </span>
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
              </template>
            </div>
            <span class="bg_hover"></span>
          </div>
        </template>
        <template v-else>
          <span class="mx-5 text-xs italic">None available</span>
        </template>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";

import { MatterStore } from "@/store/modules/matters";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import InlineMatterComponent from "@/components/ui/matters/InlineMatterComponent.vue";
import {
  OfferingOutcomeDto,
  OfferingComponentDto
} from "@/network/dtos/offering-dto";

export default defineComponent({
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  components: {
    Modal,
    InlineMatterComponent
  },
  setup(props) {
    const store = useStore();

    const availableOutcomes = computed(() =>
      ApiStore.toData(
        store.getters[MatterStore.getters.GET_AVAILABLE_MATTER_OUTCOMES]
      )
    );

    onMounted(() =>
      store.dispatch(MatterStore.actions.GET_AVAILABLE_MATTER_OUTCOMES, {
        id: props.id
      })
    );

    function addMatterOutcome(outcome: OfferingOutcomeDto) {
      store.dispatch(MatterStore.actions.ADD_MATTER_OUTCOME, {
        id: props.id,
        outcomeId: outcome.id
      });
    }
    function addMatterOutcomeComponent(
      component: OfferingComponentDto,
      outcomeId: number
    ) {
      store.dispatch(MatterStore.actions.ADD_MATTER_OUTCOME_COMPONENT, {
        id: props.id,
        outcomeId: outcomeId,
        componentId: component.id
      });
    }

    return { availableOutcomes, addMatterOutcome, addMatterOutcomeComponent };
  }
});
</script>
<style scoped>
.setscrollheight {
  max-height: 400px;
}
.modelContent_sec {
  max-height: 70vh;
}
</style>
