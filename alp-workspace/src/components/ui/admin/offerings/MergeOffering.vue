<template>
  <modal @close="$emit('close')" :headingTitle="'Merge Offering'">
    <modal-form
      :initial-values="{ offeringCategory: '' }"
      @cancel="$emit('close')"
      @submit="mergeOffering"
      v-slot="{}"
    >
      <alp-form-container>
        <div
          class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded dark:bg-gray-800 dark:text-red-400 w-full"
          role="alert"
        >
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          <span class="pl-2 font-medium">Data Loss Alert! </span> You may lose
          data when conducting an Offering Merge. During this merge, only
          Offering Outcomes will be migrated to the selected Offering.
        </div>

        <field-label
          class="w-full sm:w-1/2"
          name="Choose Old Offering"
          :isRequired="true"
        >
          <offering-selector class="flex-1" v-model="state.oldOfferings" />
        </field-label>

        <field-label
          class="w-full sm:w-1/2"
          name="Choose New Offering"
          :isRequired="true"
        >
          <offering-selector class="flex-1" v-model="state.newOfferings" />
        </field-label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import OfferingSelector from "@/components/inputs/selectors/OfferingSelector.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import { OfferingServiceProxy } from "@/network/offerings-service-proxies";
import { OfferingStore } from "@/store/modules/offerings";
import { ApiStore } from "@/store/utils";
import { ErrorMessage, Field as VField } from "vee-validate";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";

import { useNotify } from "@/composable/notify";
import {
  OfferingCategoryDto,
  OfferingListDto
} from "@/network/dtos/offering-dto";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage,
    OfferingSelector
  },
  setup(props, { emit }) {
    const store = useStore();

    const offeringCategories = computed(() =>
      ApiStore.toData<OfferingCategoryDto>(
        store.getters[OfferingStore.getters.GET_ALL_OFFERING_CATEGORIES]
      )
    );

    const { fireErrorToast } = useNotify();

    const state = reactive({
      isSharePointChecked: false,
      oldOfferings: null as OfferingListDto | null,
      newOfferings: null as OfferingListDto | null
    });

    onMounted(() =>
      store.dispatch(OfferingStore.actions.GET_ALL_OFFERING_CATEGORIES)
    );

    function mergeOffering() {
      if (
        state.oldOfferings?.id == null ||
        state.newOfferings?.id == null ||
        state.oldOfferings.id == state.newOfferings.id
      ) {
        fireErrorToast("Invalid Input !");
      } else {
        console.log(state.oldOfferings?.id);
        console.log(state.newOfferings?.id);

        new OfferingServiceProxy()
          .mergeOffering(state.oldOfferings?.id, state.newOfferings?.id)
          .then(() => {
            store.dispatch(OfferingStore.actions.GET_OFFERINGS, {
              search: "",
              sort: "",
              limit: 50,
              offset: 0
            });
            emit("close");
          });
      }
    }

    return {
      state,
      offeringCategories,
      mergeOffering,
      fireErrorToast
    };
  }
});
</script>

<style scoped></style>
