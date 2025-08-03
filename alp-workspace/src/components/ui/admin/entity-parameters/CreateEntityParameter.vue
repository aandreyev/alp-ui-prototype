<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Entity Parameter'">
    <modal-form @cancel="$emit('close')" @submit="createEntityParameter">
      <alp-form-container>
        <label class="form-field w-full">
          <span class="form-label mr-2">Type*</span>
          <span class="flex flex-col text-xs">
            <v-field
              as="select"
              name="parameterId"
              rules="required"
            >
              <option value="">Type</option>
              <option
                v-for="option in parameterTypes"
                :key="option.id"
                :value="option.id"
              >
                {{ option.parameterName }}
              </option>
            </v-field>
          </span>
          <error-message class="error-message" name="parameterId" />
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { EntityDynamicParameterInput } from "@/network/dtos/dynamic-parameter-dto";
import { EntityParameterStore } from "@/store/modules/entity-parameters";
import { ApiStore } from "@/store/utils";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";

interface CreateEntityParameterValues {
  parameterId: number;
}

export default defineComponent({
  props: {
    entityType: {
      type: String,
      required: true
    }
  },
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    const parameterTypes = computed(() =>
      ApiStore.toData(
        store.getters[
          EntityParameterStore.getters.GET_AVAILABLE_DYNAMIC_PARAMETERS
        ]
      )
    );

    function createEntityParameter(values: CreateEntityParameterValues) {
      store
        .dispatch(
          EntityParameterStore.actions.CREATE_ENTITY_PARAMETERS,
          EntityDynamicParameterInput.fromJS({
            entityType: props.entityType,
            ...values
          })
        )
        .then(() => {
          emit("close");
        });
    }

    onMounted(() => {
      store.dispatch(
        EntityParameterStore.actions.GET_AVAILABLE_DYNAMIC_PARAMETERS,
        {
          entityType: props.entityType
        }
      );
    });

    return { parameterTypes, createEntityParameter };
  }
});
</script>
