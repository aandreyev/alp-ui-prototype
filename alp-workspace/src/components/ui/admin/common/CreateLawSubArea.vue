<template>
  <modal @close="$emit('close')" :headingTitle ="'Create Law Sub Area'">
    <modal-form
      :initialValues="{ lawAreaId: '' }"
      @cancel="$emit('close')"
      @submit="createLawSubArea"
    >
      <alp-form-container>
        <field-label class="w-full" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message name="name" />
        </field-label>

        <field-label class="w-full sm:w-1/2" name="Law Area*" v-if="lawAreas" :isRequired="true">
          <v-field
            as="select"
            name="lawAreaId"
            rules="required"
          >
            <option value="" disabled>Law Area</option>
            <option
              v-for="option in lawAreas"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </v-field>

          <error-message class="error-message" name="lawAreaId" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { LawAreaDto } from "@/network/dtos/base-entity";
import { LawSubAreaInput } from "@/network/dtos/base-entity";
import { CommonStore } from "@/store/modules/common";
import { ApiStore } from "@/store/utils";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {},
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    VField,
    ErrorMessage,
    FieldLabel
  },
  setup(props, { emit }) {
    const store = useStore();

    const lawAreas = computed(() =>
      ApiStore.toData<LawAreaDto>(
        store.getters[CommonStore.getters.GET_ALL_LAW_AREAS]
      )
    );

    onMounted(() => store.dispatch(CommonStore.actions.GET_ALL_LAW_AREAS));

    function createLawSubArea(values: LawSubAreaInput) {
      store
        .dispatch(
          CommonStore.actions.CREATE_LAW_SUB_AREA,
          LawSubAreaInput.fromJS(values)
        )
        .then(() => {
          emit("close");
        });
    }

    return { lawAreas, createLawSubArea };
  }
});
</script>
