<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Assign Email To Chosen Matter'"
  >
    <modal-form @cancel="$emit('close')" @submit="assignEmailToMatter">
      <alp-form-container>
        <field-label name="Select a Matter" class="w-full">
          <matter-selector
            v-model:modelValue="state.matter"
            can-clear
            placeholder="Select a matter to assign"
            @update:modelValue="selectMatter"
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
import { defineComponent, onMounted, PropType, reactive } from "vue";
import { useStore } from "vuex";

import { MatterStore } from "@/store/modules/matters";
import { EmailStore } from "@/store/modules/emails";
import { MatterListDto } from "@/network/dtos/matter-dto";

export default defineComponent({
  emits: ["close", "cancelled"],
  props: {
    emailIdList: Array as PropType<Array<number>>,
    selectEmailId: [Number, String]
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
      matterId: Number
    });

    //onMounted();

    // function reassignTo() {
    //   var inputValue = new EmailReassginInput({
    //     emailIdList: props.emailIdList
    //   });
    // }

    function selectMatter(values: any) {
      state.matterId = values.id;
    }

    function assignEmailToMatter(values: MatterListDto) {
      store
        .dispatch(MatterStore.actions.ASSIGN_SELECTED_EMAIL_TO_MATTER, {
          emailId: props.emailIdList,
          matterId: state.matterId
        })
        .then(() => {
          store.commit(EmailStore.mutations.SET_UPDATE_EMAIL_VALUE, true);
          emit("close");
          store.dispatch(EmailStore.getters.GET_EMAIL, {
            id: props.selectEmailId
          });
        });
    }

    return {
      state,
      selectMatter,
      assignEmailToMatter
    };
  }
});
</script>
