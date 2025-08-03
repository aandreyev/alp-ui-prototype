<template>
  <modal @close="$emit('close')" :headingTitle ="'Reassign chosen emails to: '">
    <modal-form @cancel="$emit('close')" @submit="reassignTo">
      <alp-form-container>
        <field-label name="Reassign" class="w-full">
          <matter-selector
            v-model:modelValue="state.newMatter[0]"
            can-clear
            placeholder="Select a matter to reassign"
            @update:modelValue="printer"
          />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import FieldLabel from "@/components/forms/FieldLabel.vue";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";

import MatterSelector from "@/components/inputs/selectors/MatterSelector.vue";
import { defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";
import { MatterStore } from "@/store/modules/matters";
import { EmailReassginInput } from "@/network/dtos/email-dto";
import { MatterDto } from "@/network/dtos/matter-dto";

export default defineComponent({
  emits: ["close"],
  props: {
    oldMatterId: Number,
    emailIdList: Array as PropType<Array<number>>
  },
  components: {
    Modal,
    ModalForm,
    MatterSelector,
    FieldLabel
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      newMatter: [] as MatterDto[]
    });

    function reassignTo() {
      let curMatterId = props.oldMatterId as number;
      var inputValue = new EmailReassginInput({
        oldMatterId: props.oldMatterId,
        newMatterId: state.newMatter[0].id,
        emailIdList: props.emailIdList
      });
      store
        .dispatch(MatterStore.actions.REASSIGN_EMAILS, {
          id: props.oldMatterId,
          body: inputValue
        })
        .then(() => {
          emit("close");
        });
    }

    return { state, reassignTo };
  }
});
</script>
