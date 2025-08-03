<template>
  <v-form class="modal-form max-w-4xl rounded-lg bg-white" @submit="onSubmit">
    <div as="template">
      <div as="div" class="relative z-10">
        <div
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          ></div>
        </div>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <div
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                class="setmodalwidth relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <font-awesome-icon
                      icon="fa-solid fa-triangle-exclamation"
                      style="font-size: 28px"
                    />
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <div
                        as="h3"
                        class="text-base font-semibold leading-6 text-gray-900"
                      >
                        {{ title }}
                      </div>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">{{ text }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
                >
                  <alp-button variant="danger" type="submit">
                    Delete
                  </alp-button>
                  <alp-button
                    variant="default"
                    type="button"
                    class="setalertcancelbtn"
                    @click="$emit('cancel')"
                  >
                    Cancel
                  </alp-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-form>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Form as VForm } from "vee-validate";
export default defineComponent({
  emits: ["cancel", "submit"],
  props: {
    title: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    }
  },
  components: {
    VForm
  },
  setup(props, { emit }) {
    const onSubmit = (...rest: any[]) => {
      emit("submit", ...rest);
    };

    return { onSubmit };
  }
});
</script>
