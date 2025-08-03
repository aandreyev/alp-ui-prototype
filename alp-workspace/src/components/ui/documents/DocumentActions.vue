<template>
  <span class="flex items-center justify-end text-2xs">
    <alp-loader
      v-if="state.loading"
      class="transition-all duration-300 animate-spin text-gray-900 mr-2"
      :size="18"
    />
    <template v-else-if="canEdit && document.editable">
      <template v-if="document.lockedByUserId">
        <template v-if="document.lockedByUserId == currentUserId">
          <span class="flex items-center">
            <action-button
              description="Online"
              icon-name="fa-solid fa-globe fa-2xl"
              icon-class="text-blue-800 w-4 h-4"
              @click.stop="editOnline()"
            />
            <action-button
              description="App"
              icon-name="fa-solid fa-display fa-2xl"
              icon-class="text-blue-800 w-4 h-4"
              @click.stop="editWithApp()"
            />
            <action-button
              description="Finish Editing"
              icon-name="fa-solid fa-check fa-2xl"
              icon-class="text-green-400 w-4 h-4"
              @click.stop="finishEditing()"
            />
          </span>
        </template>
        <template v-else>
          <action-button
            description="Locked for editing"
            icon-name="fa-solid fa-lock fa-2xl"
            icon-class="w-4 h-4"
          />
        </template>
      </template>
      <action-button
        v-else
        description="Edit"
        icon-name="fa-solid fa-pencil fa-2xl"
        icon-class="w-3 h-3"
        @click.stop="lockForEditing()"
      />
    </template>

    <alp-options>
      <span
        v-if="
          (canShowPreview && document?.fileExtension == '.pdf') ||
          document?.fileExtension == '.png' ||
          document?.fileExtension == '.jpg' ||
          document?.fileExtension == '.pptx'
        "
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="state.showPreview = true"
      >
        Preview
      </span>
      <span
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="download()"
      >
        Download
      </span>
      <span
        v-if="canAddReminder"
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="addReminder()"
      >
        Add Reminder
      </span>
      <span
        v-if="canRequestReview"
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="requestReview()"
      >
        Request Review
      </span>
      <span
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="attachToEmail()"
      >
        Attach to Email
      </span>
      <span
        v-if="canDelete"
        class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
        @click.stop="deleteDocument()"
      >
        Delete
      </span>
    </alp-options>

    <teleport to="body">
      <file-preview
        v-if="state.showPreview"
        :extension="document?.fileExtension"
        :document="document"
        :get-url="getDocumentUrl"
        :get-file="getDocumentFile"
        @close="state.showPreview = false"
      />
    </teleport>
  </span>
</template>

<script lang="ts">
import ActionButton from "@/components/common/ActionButton.vue";
import FilePreview from "@/components/common/FilePreview.vue";
import { useCan } from "@/composable/can";
import { usePreview } from "@/composable/preview";
import { DocumentDto } from "@/network/dtos/document-dto";
import { DocumentStore } from "@/store/modules/documents";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { SendEmailStore } from "@/store/modules/send-email";
import { UserStore } from "@/store/modules/users";
import FileSaver from "file-saver";
import { computed, defineComponent, PropType, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["updated", "deleted"],
  props: {
    document: {
      type: Object as PropType<DocumentDto>
    },
    canEdit: {
      type: Boolean,
      required: true
    },
    canDelete: {
      type: Boolean,
      required: true
    },
    canAddReminder: {
      type: Boolean,
      default: true
    },
    canRequestReview: {
      type: Boolean,
      default: true
    },
    canShowPreview: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const { can } = useCan();

    const store = useStore();

    const currentUserId = computed(
      () => store.getters[UserStore.getters.GET_ME]?.id
    );

    const state = reactive({
      loading: false,
      showPreview: false
    });

    const { canPreview } = usePreview();

    function getDocumentUrl() {
      return store.dispatch(DocumentStore.actions.GET_LINK, {
        id: props.document?.id
      });
    }

    function getDocumentFile() {
      if (props.document?.fileExtension == ".pptx") {
        return store.dispatch(DocumentStore.actions.GET_PPT, {
          id: props.document?.id
        });
      } else {
        return store.dispatch(DocumentStore.actions.DOWNLOAD, {
          id: props.document?.id
        });
      }
    }

    function download() {
      store
        .dispatch(DocumentStore.actions.GET_LINK, { id: props.document?.id })
        .then((response) => {
          FileSaver.saveAs(response);
        });
    }

    function lockForEditing() {
      state.loading = true;
      store
        .dispatch(DocumentStore.actions.LOCK_FOR_EDITING, {
          id: props.document?.id
        })
        .then(() => {
          emit("updated");
          state.loading = false;
        })
        .catch(() => {
          state.loading = true;
        });
    }

    function editOnline() {
      store.dispatch(DocumentStore.actions.EDIT_ONLINE, {
        id: props.document?.id
      });
    }

    function editWithApp() {
      store.dispatch(DocumentStore.actions.EDIT_WITH_APP, {
        id: props.document?.id
      });
    }

    function finishEditing() {
      state.loading = true;
      store
        .dispatch(DocumentStore.actions.FINISH_EDITING, {
          id: props.document?.id
        })
        .then(() => {
          emit("updated");
          state.loading = false;
        })
        .catch(() => {
          state.loading = true;
        });
    }

    function addReminder() {
      store.dispatch(ModalStore.actions.SHOW_MODAL, {
        modal: ModalType.CreateReminder,
        props: {
          reminderType: "document",
          id: props.document?.id,
          document: props.document
        }
      });
    }

    function requestReview() {
      // do nothing
      store.dispatch(ModalStore.actions.SHOW_MODAL, {
        modal: ModalType.CreateDocumentReviewRequest,
        props: {
          id: props.document?.id
        }
      });
    }

    function deleteDocument() {
      store
        .dispatch(DocumentStore.actions.DELETE_DOCUMENT, {
          id: props.document?.id
        })
        .then(() => emit("deleted"));
    }

    function attachToEmail() {
      store.commit(
        SendEmailStore.mutations.ADD_DOCUMENT_ATTACHMENT,
        props.document
      );
    }

    return {
      can,
      state,
      currentUserId,
      download,
      lockForEditing,
      editOnline,
      editWithApp,
      finishEditing,
      addReminder,
      requestReview,
      deleteDocument,
      canPreview,
      getDocumentUrl,
      getDocumentFile,
      attachToEmail
    };
  },
  components: {
    ActionButton,
    FilePreview
  }
});
</script>
