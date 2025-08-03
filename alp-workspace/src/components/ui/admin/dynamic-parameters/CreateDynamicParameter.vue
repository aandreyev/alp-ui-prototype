<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Dynamic Parameter'">
    <modal-form @cancel="$emit('close')" @submit="createDynamicParameters">
      <alp-form-container>
        <label class="form-field w-1/2">
          <span class="form-label">Name</span>
          <v-field
            type="text"
            placeholder="Name"
            name="parameterName"
            rules="required"
          />
          <error-message name="parameterName" />
        </label>

        <label class="form-field w-1/2">
          <span class="form-label mr-2">Type*</span>
          <span class="flex flex-col text-xs">
            <v-field
              as="select"
              name="parameterType"
              rules="required"
            >
              <option value="" disabled>Type</option>
              <option
                v-for="option in parameterTypes"
                :key="option.value"
                :value="option.value"
              >
                {{ option.key }}
              </option>
            </v-field>
          </span>
          <error-message class="error-message" name="parameterType" />
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { DynamicParameterInput } from "@/network/dtos/dynamic-parameter-dto";
import { DynamicParameterType } from "@/network/dtos/enumTypes";
import { DynamicParameterStore } from "@/store/modules/dynamic-parameters";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

interface CreateDynamicParameterValues {
  name: string;
}

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage
  },
  setup(props, { emit }) {
    const store = useStore();

    const parameterTypes = Object.keys(DynamicParameterType)
      .filter((s) => !isNaN(parseInt(s)))
      .map((s) => ({ value: s, key: DynamicParameterType[parseInt(s)] }));

    function createDynamicParameters(values: CreateDynamicParameterValues) {
      store
        .dispatch(
          DynamicParameterStore.actions.CREATE_DYNAMIC_PARAMETERS,
          DynamicParameterInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { parameterTypes, createDynamicParameters };
  }
});
</script>
