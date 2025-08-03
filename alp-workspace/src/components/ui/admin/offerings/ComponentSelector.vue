<template>
  <slide-over heading="Component Selector" @close="$emit('close')">
    <span class="flex justify-between mx-3 mb-3">
      <alp-focus-input
        class="flex-1 flex text-xs"
        placeholder="Search ..."
        v-model="state.search"
      />
      <alp-can permission="Offering.Create">
        <alp-button
          class="text-xs ml-1"
          @click="state.showCreateComponent = true"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2"/>
          <span>Create Component</span>
        </alp-button>
      </alp-can>
    </span>

    <div class="flex-1 flex flex-col mx-3 overflow-y-auto" ref="container">
      <span v-for="component in items" :key="component.id" class="flex mb-1">
        <span
          class="transition duration-200 flex flex-col border border-gray-200 bg-opacity-25 text-sm w-full px-3 py-2 cursor-pointer rounded-l-lg"
          :class="{
            'border-green-300 bg-green-300 hover:bg-red-100 hover:border-red-300': isSelected(
              component
            ),
            'hover:bg-green-100': !isSelected(component)
          }"
          @click="selectComponent(component)"
        >
          <div class="flex-1 flex justify-between">
            <span class="text-sm">
              <span class="font-bold">{{ component.id }} </span>.
              {{ component.title }}</span
            >
            <span class="text-xs">
              ${{ component.budget }} ({{ component.estimatedUnits }} units)
            </span>
          </div>
          <div class="flex flex-col mt-2">
            <span class="text-xs">{{ component.description }}</span>
          </div>
        </span>
        <span
          class="flex items-center justify-center rounded-r-lg px-1 border-t border-b border-r border-gray-300 cursor-pointer hover:bg-gray-200"
          @click="
            $router.push({
              name: 'Offering Component',
              params: { id: component.id }
            })
          "
        >
          <font-awesome-icon icon="fa-solid fa-pencil"/>
        </span>
      </span>

      <div ref="sentinel" />
    </div>

    <create-offering-component
      v-if="state.showCreateComponent"
      :offering-id="offeringId"
      :outcome-id="outcomeId"
      @close="state.showCreateComponent = false"
    />
  </slide-over>
</template>

<script lang="ts">
import CreateOfferingComponent from "@/components/ui/admin/offerings/CreateOfferingComponent.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";
import { OfferingComponentDto, OfferingOutcomeComponentDto } from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    offeringId: {
      type: Number,
      required: true
    },
    outcomeId: {
      type: Number,
      required: true
    }
  },
  components: {
    SlideOver,
    CreateOfferingComponent
  },
  setup(props, { emit }) {
    const state = reactive({
      showCreateComponent: false,
      search: "",
      limit: 20,
      offset: 0
    });

    const store = useStore();
    const components = computed(
      () =>
        ApiStore.toData<OfferingOutcomeComponentDto[]>(
          store.getters[OfferingStore.getters.GET_OFFERING_OUTCOME_COMPONENTS](
            props.outcomeId
          )
        ) || []
    );

    const { items, loading, fetch, reset } = useInfiniteListable({
      items: OfferingStore.getters.GET_OFFERING_COMPONENTS,
      query: OfferingStore.actions.GET_OFFERING_COMPONENTS,
      queryParams: () => ({
        search: state.search,
        limit: state.limit,
        offset: state.offset
      })
    });
    watch([() => state.search], reset);

    function loadMore() {
      if (loading.value) {
        return;
      }

      fetch();
    }

    const { container, sentinel } = useInfiniteTrigger(loadMore);

    function selectComponent(component: OfferingComponentDto) {
      if (isSelected(component)) {
        store.dispatch(
          OfferingStore.actions.REMOVE_OFFERING_OUTCOME_COMPONENT,
          {
            offeringId: props.offeringId,
            outcomeId: props.outcomeId,
            componentId: component.id
          }
        );
      } else {
        store.dispatch(OfferingStore.actions.ADD_OFFERING_OUTCOME_COMPONENT, {
          offeringId: props.offeringId,
          outcomeId: props.outcomeId,
          componentId: component.id
        });
      }
    }

    function isSelected(component: OfferingOutcomeComponentDto) {
      return components.value.find(
        (c: OfferingOutcomeComponentDto) => c.componentId === component.id
      );
    }

    return {
      container,
      sentinel,
      state,
      items,
      loading,
      isSelected,
      selectComponent
    };
  }
});
</script>
