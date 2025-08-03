<template>
  <slide-over heading="Dynamic Parameter" @close="$emit('close')">
    <div class="h-full flex flex-col">
      <div class="flex flex-col py-3 px-6">
        <span class="flex justify-between">
          <inline-input
            class="font-medium"
            rules="required"
            placeholder="Dynamic Parameter"
            :modelValue="parameter?.parameterName"
            @create="
              updateDynamicParameter(id, parameter.parameterType, $event)
            "
          />
          <!-- <span class="font-medium">
            {{ parameter?.parameterName }}
          </span> -->
        </span>

        <div v-if="shouldShowValues" class="flex-1 flex flex-col">
          <span class="text-xs uppercase text-gray-400 mb-3">
            Available Values
          </span>

          <div class="flex min-w-full overflow-auto sm:rounded-sm">
            <table class="flex-1" v-if="parameterValues">
              <thead class="table-header">
                <tr>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody class="table-body bg-white divide-y divide-gray-200">
                <tr v-for="value in parameterValues" :key="value.id">
                  <td>
                    <inline-input
                      class="text-xs"
                      rules="required"
                      :modelValue="value.value"
                      @create="updateDynamicParameterValue(value.id, $event)"
                    />
                  </td>
                  <td>
                    <div class="flex justify-end">
                      <alp-button-with-text
                        context="Delete"
                        :color="'red'"
                        icon-name="fa-solid fa-trash fa-2xl"
                        @click.stop="deleteDynamicParameterValue(value.id)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <inline-input
            class="py-1 text-xs"
            placeholder="Add a new value"
            @create="addDynamicParameterValue($event)"
          />
        </div>
      </div>
    </div>
  </slide-over>
</template>

<script lang="ts">
import InlineInput from "@/components/inputs/InlineInput.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { DynamicParameterDto } from "@/network/dtos/dynamic-parameter-dto";
import { DynamicParameterType } from "@/network/dtos/enumTypes";
import { DynamicParameterValueDto } from "@/network/dtos/dynamic-parameter-dto";
import { DynamicParameterStore } from "@/store/modules/dynamic-parameters";
import { ApiStore } from "@/store/utils";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    SlideOver,
    InlineInput
  },
  setup(props) {
    const store = useStore();

    const state = reactive({});

    const parameter = computed(() =>
      ApiStore.toData<DynamicParameterDto>(
        store.getters[DynamicParameterStore.getters.GET_DYNAMIC_PARAMETER]
      )
    );
    const parameterValues = computed(() =>
      ApiStore.toData<DynamicParameterValueDto[]>(
        store.getters[
          DynamicParameterStore.getters.GET_DYNAMIC_PARAMETER_VALUES
        ]
      )
    );

    const shouldShowValues = computed(() => {
      if (parameter.value) {
        switch (parameter.value.parameterType) {
          case DynamicParameterType.TextInput:
            return false;
          case DynamicParameterType.SingleSelect:
            return true;
          case DynamicParameterType.MultiSelect:
            return true;
          default:
            return false;
        }
      }
      return false;
    });

    function fetchParameter() {
      return store.dispatch(
        DynamicParameterStore.actions.GET_DYNAMIC_PARAMETER,
        {
          id: props.id
        }
      );
    }

    function fetchParameterValues() {
      return store.dispatch(
        DynamicParameterStore.actions.GET_DYNAMIC_PARAMETER_VALUES,
        {
          id: props.id
        }
      );
    }

    function addDynamicParameterValue(value: number) {
      return store.dispatch(
        DynamicParameterStore.actions.ADD_DYNAMIC_PARAMETER_VALUE,
        {
          id: props.id,
          value
        }
      );
    }

    function updateDynamicParameter(id: number, type: number, value: number) {
      return store.dispatch(
        DynamicParameterStore.actions.UPDATE_DYNAMIC_PARAMETER,
        { id: props.id, value, type }
      );
    }

    function updateDynamicParameterValue(id: number, value: number) {
      return store.dispatch(
        DynamicParameterStore.actions.UPDATE_DYNAMIC_PARAMETER_VALUE,
        { id: props.id, valueId: id, value }
      );
    }

    function deleteDynamicParameterValue(id: number) {
      return store.dispatch(
        DynamicParameterStore.actions.DELETE_DYNAMIC_PARAMETER_VALUE,
        {
          id: props.id,
          valueId: id
        }
      );
    }

    onMounted(() => {
      fetchParameter();
      fetchParameterValues();
    });

    return {
      state,
      parameter,
      parameterValues,
      shouldShowValues,
      addDynamicParameterValue,
      updateDynamicParameterValue,
      deleteDynamicParameterValue,
      updateDynamicParameter
    };
  }
});
</script>
