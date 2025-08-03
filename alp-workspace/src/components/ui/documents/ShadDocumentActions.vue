<template>
  <div class="inline-flex">
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
              @click.stop="editOnline"
            />
            <action-button
              description="App"
              icon-name="fa-solid fa-display fa-2xl"
              icon-class="text-blue-800 w-4 h-4"
              @click.stop="editWithApp"
            />
            <action-button
              description="Finish Editing"
              icon-name="fa-solid fa-check fa-2xl"
              icon-class="text-green-400 w-4 h-4"
              @click.stop="finishEditing"
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

    <action-button
      v-if="
        (canShowPreview && document?.fileExtension == '.pdf') ||
        document?.fileExtension == '.png' ||
        document?.fileExtension == '.jpg'
      "
      description="Preview"
      icon-name="fa-regular fa-eye fa-2xl"
      icon-class="w-3 h-3"
      @click.stop="state.showPreview = true"
    />

    <shad-dropdown-menu>
      <shad-dropdown-menu-trigger as-child>
        <Button
          variant="ghost"
          class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          @click.stop="showMenu = !showMenu"
        >
          <DotsHorizontalIcon class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </shad-dropdown-menu-trigger>
      <shad-dropdown-menu-content
        align="end"
        class="w-[160px]"
        v-if="(showMenu = true)"
      >
        <shad-dropdown-menu-item
          v-if="
            (canShowPreview && document?.fileExtension == '.pdf') ||
            document?.fileExtension == '.png' ||
            document?.fileExtension == '.jpg' ||
            document?.fileExtension == '.pptx' ||
            document?.fileExtension == '.wav' ||
            document?.fileExtension == '.mp3' ||
            document?.fileExtension == '.m4a'
          "
          @click="state.showPreview = true"
        >
          Preview</shad-dropdown-menu-item
        >
        <shad-dropdown-menu-item @click="download"
          >Download</shad-dropdown-menu-item
        >
        <shad-dropdown-menu-item @click="addReminder"
          >Add Reminder</shad-dropdown-menu-item
        >
        <shad-dropdown-menu-item @click="requestReview"
          >Request Review</shad-dropdown-menu-item
        >
        <shad-dropdown-menu-item @click="attachToEmail"
          >Attach to Email</shad-dropdown-menu-item
        >
        <shad-dropdown-menu-item @click="deleteDocument">
          Delete
        </shad-dropdown-menu-item>
      </shad-dropdown-menu-content>
    </shad-dropdown-menu>
    <teleport to="body">
      <file-preview
        v-if="state.showPreview"
        :extension="props.document?.fileExtension || ''"
        :document="props.document"
        :get-url="getDocumentUrl"
        :get-file="getDocumentFile"
        @close="state.showPreview = false"
      />
    </teleport>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive } from "vue";
import { DotsHorizontalIcon } from "@radix-icons/vue";
import ActionButton from "@/components/common/ActionButton.vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import { DocumentDto } from "@/network/dtos/document-dto";
import store from "@/store";
import { DocumentStore } from "@/store/modules/documents";
import FileSaver from "file-saver";
import { ModalStore, ModalType } from "@/store/modules/modals";
import { SendEmailStore } from "@/store/modules/send-email";
import { UserStore } from "@/store/modules/users";
import { usePreview } from "@/composable/preview";
import FilePreview from "@/components/common/FilePreview.vue";

interface DataTableRowActionsProps {
  document: DocumentDto;
  canEdit: boolean;
  canDelete: boolean;
  canAddReminder: boolean;
  canRequestReview: boolean;
  canShowPreview: boolean;
}
let showMenu = false;
const props = defineProps<DataTableRowActionsProps>();
const emit = defineEmits(["deleted", "updated"]);

function download() {
  store
    .dispatch(DocumentStore.actions.GET_LINK, { id: props.document?.id })
    .then((response) => {
      FileSaver.saveAs(response);
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
function attachToEmail() {
  store.commit(
    SendEmailStore.mutations.ADD_DOCUMENT_ATTACHMENT,
    props.document
  );
}
function deleteDocument() {
  store
    .dispatch(DocumentStore.actions.DELETE_DOCUMENT, {
      id: props.document?.id
    })
    .then(() => emit("deleted"));
}
const state = reactive({
  loading: false,
  showPreview: false
});

const currentUserId = computed(
  () => store.getters[UserStore.getters.GET_ME]?.id
);
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
const { canPreview } = usePreview();

function getDocumentUrl() {
  return store.dispatch(DocumentStore.actions.GET_LINK, {
    id: props.document?.id
  });
}

function getDocumentFile() {

  console.log("DOCUMENT",props.document);

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
</script>
