<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Sub Segment'">
    <modal-form @cancel="$emit('close')" @submit="createSubSegment">
      <alp-form-container>
        <field-label class="w-full" name="Segment" :isRequired="true">
          <segment-selector-field name="segment" rules="required" />
          <error-message class="error-message" name="name" />
        </field-label>

        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import SegmentSelectorField from "@/components/forms/selectors/SegmentSelectorField.vue";
import { SubSegmentInput } from "@/network/dtos/base-entity";
import { CommonStore } from "@/store/modules/common";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel,
    SegmentSelectorField
  },
  setup(props, { emit }) {
    const store = useStore();

    function createSubSegment(values: any) {
      store
        .dispatch(
          CommonStore.actions.CREATE_SUB_SEGMENT,
          new SubSegmentInput({
            name: values.name,
            segmentId: values.segment?.id
          })
        )
        .then(() => {
          emit("close");
        });
    }

    return { createSubSegment };
  }
});
</script>
