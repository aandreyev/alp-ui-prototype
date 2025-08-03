<template>
  <modal
    @close="$emit('close')"
    :headingTitle="'Import Contacts From CSV File'"
  >
    <button
      @click="selectFile"
      type="button"
      class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
        />
      </svg>
      <span class="mt-2 block text-sm font-semibold text-gray-900"
        >Click to upload the file
      </span>
      <input
        type="file"
        multiple
        ref="fileUpload"
        class="hidden"
        @change="importContact"
      />
    </button>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import UploadDocument from "@/components/ui/feedback/UploadDocument.vue";
import { ContactStore } from "@/store/modules/contacts";
import { defineComponent, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import { useNotify } from "@/composable/notify";

export default defineComponent({
  props: {},
  emits: ["created", "close"],
  components: {
    Modal,
    ModalForm,
    UploadDocument,
    DocumentIcon
  },
  setup(props, { emit }) {
    const store = useStore();

    const { fireSuccessToast } = useNotify();

    const fileUpload = ref<HTMLInputElement | null>(null);

    function selectFile() {
      fileUpload.value?.click();
    }
    function importContact(event: any) {
      fireSuccessToast("Please wait while we are importing file ...");
      var file = event.target.files[0] as HTMLInputElement;
      store
        .dispatch(ContactStore.actions.IMPORT_CONTACT, {
          file
        })
        .then((response) => {
          //fireSuccessToast("File imported");
          store.dispatch(ContactStore.getters.GET_CONTACTS, {
            limit: 50,
            offset: 0
          });
          emit("close");
        });
    }
    return {
      selectFile,
      fileUpload,
      importContact
    };
  }
});
</script>
