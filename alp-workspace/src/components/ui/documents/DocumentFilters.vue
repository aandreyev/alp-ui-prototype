<template>
  <slide-over
    heading="Document Filter"
    @close="state.showDocumentFilters = false"
    :zindex="'z-50'"
  >
    <div class="flex flex-col">
      <div class="h-full flex flex-col">
        <div class="flex flex-col py-3 px-6">
          <span class="flex justify-between">
            <span class="font-semibold">Document Filters</span>
          </span>

          <label class="flex items-center text-xs mx-2">
            <input class="checkbox" type="checkbox" v-model="state.matchAny" />
            <span class="form-label">Match Any</span>
          </label>

          <span class="flex flex-col">
            <template
              v-for="parameter in state.parameters.filter(
                (p) =>
                  p.parameterType == DynamicParameterType.SingleSelect ||
                  p.parameterType == DynamicParameterType.MultiSelect
              )"
              :key="parameter.id"
            >
              <span class="w-full mt-3 font-semibold">
                {{ parameter.parameterName }}
              </span>

              <label
                v-for="value in parameter.parameterValues"
                :key="parameter.id + '-' + value.id"
                class="flex items-center text-xs mx-2"
              >
                <input
                  class="checkbox"
                  type="checkbox"
                  v-model="state.filterParameters[parameter.id]"
                  :value="value.value"
                />
                <span class="form-label mr-2">{{ value.value }}</span>
              </label>
            </template>
          </span>
        </div>
      </div>
    </div>
  </slide-over>
</template>

<script lang="ts">
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { DynamicParameterType } from "@/network/dtos/enumTypes";
import { DocumentServiceProxy } from "@/network/documents-service-proxies";
import { defineComponent, onMounted, PropType, reactive, watch } from "vue";
import { EntityDynamicParameterValueOptionsDto } from "@/network/dtos/dynamic-parameter-dto";

export default defineComponent({
  props: {
    filterParameters: {
      type: Object as PropType<Record<number, string[]>>,
      default: {}
    },
    matchAny: Boolean
  },
  components: {
    SlideOver
  },
  setup(props, { emit }) {
    const state = reactive({
      parameters: [] as EntityDynamicParameterValueOptionsDto[],
      matchAny: props.matchAny,
      filterParameters: props.filterParameters as Record<number, string[]>
    });

    function fetchParameters() {
      new DocumentServiceProxy()
        .getDocumentMetadataParameters()
        .then((result) => {
          state.parameters = result;
          for (const p of result) {
            if (p.id) {
              state.filterParameters[p.id] = state.filterParameters[p.id] || [];
            }
          }
        });
    }

    onMounted(() => {
      fetchParameters();
    });

    function toggleFilterParameter(
      parameter: EntityDynamicParameterValueOptionsDto,
      value: any
    ) {
      if (parameter && value) {
        let index = state.filterParameters[parameter.id!].findIndex(
          (p) => p === value.value
        );
        if (index >= 0) {
          state.filterParameters[parameter.id!].splice(index, 1);
        } else {
          state.filterParameters[parameter.id!].push(value.value);
        }
      }
    }

    watch(
      () => state.filterParameters,
      () => {
        emit("update:filterParameters", state.filterParameters);
      },
      { deep: true }
    );

    watch(
      () => state.matchAny,
      () => {
        emit("update:matchAny", state.matchAny);
      },
      { deep: true }
    );

    return { DynamicParameterType, state, toggleFilterParameter };
  }
});
</script>
