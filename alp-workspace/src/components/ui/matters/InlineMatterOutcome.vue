<template>
  <span
    class="block bg-white border border-gray-150 rounded-md m-3 p-3"
    style="min-width: 750px"
  >
    <div class="flex justify-between font-semibold pb-2">
      {{ outcome.description }}

      <span class="mx-1">
        <span class="flex items-center justify-end">
          <action-button
            v-if="components == ''"
            description="Delete Outcome"
            icon-name="fa-solid fa-trash"
            icon-class="text-red-500"
            @click.stop="deleteOutcome"
          />
        </span>
      </span>
    </div>
    <transition-group name="list-complete" tag="">
      <inline-matter-component
        v-for="component in components"
        :key="component.id"
        class="mb-1 transition duration-200"
        :matter-id="matterId"
        :outcome-id="outcome.id"
        :component="component"
        @updated="$emit('updated')"
      />
    </transition-group>
  </span>
</template>

<script lang="ts">
import InlineMatterComponent from "@/components/ui/matters/InlineMatterComponent.vue";
import { MatterStore } from "@/store/modules/matters";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, onMounted, PropType } from "vue";
import { useStore } from "vuex";
import ActionButton from "@/components/common/ActionButton.vue";
import { MatterOutcomeDto } from "@/network/dtos/matter-dto";

export default defineComponent({
  props: {
    matterId: {
      type: [String, Number],
      required: true
    },
    outcome: {
      type: Object as PropType<MatterOutcomeDto>,
      required: true
    }
  },
  components: {
    InlineMatterComponent,
    ActionButton
  },
  setup(props) {
    const store = useStore();

    const components = computed(() =>
      ApiStore.toData(
        store.getters[MatterStore.getters.GET_MATTER_COMPONENTS](
          props.outcome.id
        )
      )
    );

    function deleteOutcome() {
      store.dispatch(MatterStore.actions.DELETE_MATTER_OUTCOME, {
        id: props.matterId,
        outcomeId: props.outcome.id
      });
    }

    onMounted(() =>
      store.dispatch(MatterStore.actions.GET_MATTER_COMPONENTS, {
        matterId: props.matterId,
        outcomeId: props.outcome.id
      })
    );

    return { components, deleteOutcome };
  }
});
</script>
