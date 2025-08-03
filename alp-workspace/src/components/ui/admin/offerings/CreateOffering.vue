<template>
  <modal @close="$emit('close')" :headingTitle="'Create Offering'">
    <modal-form
      :initial-values="{ offeringCategory: '' }"
      @cancel="$emit('close')"
      @submit="createOffering"
      v-slot="{}"
    >
      <alp-form-container>
        <field-label class="w-full sm:w-1/2" name="Name" :isRequired="true">
          <v-field
            type="text"
            placeholder="Name"
            name="name"
            rules="required"
          />
          <error-message class="error-message" name="name" />
        </field-label>

        <!-- <field-label class="w-full sm:w-1/2" name="Offering Category" :isRequired="true">
          <v-field
            as="select"
            name="offeringCategoryId"
            rules="required"
          >
            <option value="" disabled>Offering Category</option>
            <option
              v-for="option in offeringCategories"
              :key="option.id"
              :value="option.id"
            >
            {{ option.name }}
            </option>
          </v-field>
          <error-message class="error-message" name="offeringCategory" />
        </field-label> -->

        <field-label
          class="w-full sm:w-1/2"
          name="Offering Category"
          :isRequired="true"
        >
          <offering-category-selector
            class="flex-1"
            v-model="state.offeringCategory"
          />
        </field-label>

        <label class="form-checkbox-field w-1/2">
          <input
            class="checkbox"
            type="checkbox"
            v-model="state.isSharePointChecked"
          />
          <span class="form-label mr-2">Provision SharePoint Folder</span>
        </label>
      </alp-form-container>
    </modal-form>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import FieldLabel from "@/components/forms/FieldLabel.vue";
import {
  OfferingCategoryDto,
  OfferingInput
} from "@/network/dtos/offering-dto";
import { OfferingStore } from "@/store/modules/offerings";
import { ErrorMessage, Field as VField } from "vee-validate";
import { defineComponent, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import OfferingCategorySelector from "@/components/inputs/selectors/OfferingCategorySelector.vue";
import { useNotify } from "@/composable/notify";

export default defineComponent({
  name: "CreateOffering",
  emits: ["close"],
  components: {
    Modal,
    ModalForm,
    FieldLabel,
    VField,
    ErrorMessage,
    OfferingCategorySelector
  },
  setup(props, { emit }) {
    const store = useStore();

    // const offeringCategories = computed(() =>
    //   ApiStore.toData<OfferingCategoryDto>(
    //     store.getters[OfferingStore.getters.GET_ALL_OFFERING_CATEGORIES]
    //   )
    // );

    const { fireErrorToast } = useNotify();
    const state = reactive({
      isSharePointChecked: false,
      offeringCategory: null as OfferingCategoryDto | null
    });

    onMounted(() =>
      store.dispatch(OfferingStore.actions.GET_ALL_OFFERING_CATEGORIES)
    );

    function createOffering(values: OfferingInput) {
      if (state.offeringCategory?.id != null) {
        values.isSharePointChecked = state.isSharePointChecked;
        values.offeringCategoryId = state.offeringCategory?.id;
        store
          .dispatch(OfferingStore.actions.CREATE_OFFERING, values)
          .then(() => {
            emit("close");
          });
      } else {
        fireErrorToast("Offering Category Input Invalidate!");
      }
    }

    return { state, createOffering };
  }
});
</script>

<style scoped></style>
