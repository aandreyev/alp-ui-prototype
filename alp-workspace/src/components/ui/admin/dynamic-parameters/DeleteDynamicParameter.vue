<template>
  <modal @close="$emit('close')" :headingTitle ="'Delete Dynamic Parameter'">
    <modal-form @cancel="$emit('close')" @submit="deleteDynamicParameter">
      <alp-form-container>
        <p class="form-field form-label">Are you sure?</p>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { DynamicParameterStore } from "@/store/modules/dynamic-parameters";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  emits: ["close"],
  components: {
    Modal,
    ModalForm
  },
  setup(props, { emit }) {
    const store = useStore();

    function deleteDynamicParameter() {
      store
        .dispatch(DynamicParameterStore.actions.DELETE_DYNAMIC_PARAMETER, {
          id: props.id
        })
        .then(() => {
          emit("close");
        });
    }

    return { deleteDynamicParameter };
  }
});
</script>
