<template>
  <modal @close="$emit('close')" :headingTitle="'Update Note'">
    <div class="flex flex-col rounded-lg bg-white min-h-0">
      <div class="flex flex-col pb-3 px-6">
        <editor
          editor-container-class="max-h-full"
          v-model="state.note.message"
        />
        <div class="home w-full">
          <UploadDocument @drop.prevent="drop" />
        </div>
        <span class="flex flex-wrap gap-2 mt-1">
          <span
            class="bg-gray-100 text-sm flex gap-2 items-center px-2 py-1 rounded-lg"
            v-for="(item, index) in state.note.document"
            :key="item.id"
          >
            <document-icon class="w-6 h-6" :extension="item.fileExtension" />

            {{ item.fileName }} {{ item.fileExtension }}
            <font-awesome-icon
              icon="fa-xmark"
              class="text-gray-400 mr-1 cursor-pointer transition duration-200 transform hover:rotate-90"
              size="12"
              @click="removeAttachment(item, index)"
            />
          </span>

          <span
            class="bg-gray-100 text-sm flex gap-2 items-center px-2 py-1 rounded-lg"
            v-for="(item, index) in state.fileName"
            :key="item"
          >
            <document-icon class="w-6 h-6" :extension="tofileName(item)" />

            {{ item }}
            <font-awesome-icon
              icon="fa-xmark"
              class="text-gray-400 mr-1 cursor-pointer transition duration-200 transform hover:rotate-90"
              size="12"
              @click="removeFile(item, index)"
            />
          </span>
        </span>
        <span class="flex flex-wrap gap-2 justify-end space-x-2 py-2">
          <alp-button-with-text
            context="Clear"
            :color="'gray'"
            icon-name="fa-solid fa-delete-left fa-2xl"
            @click.stop="state.note.message = ''"
          />
          <alp-button-with-text
            context="Update"
            :color="'blue'"
            icon-name="fa-solid fa-floppy-disk fa-2xl"
            @click.stop="updateNote"
          />
          <alp-button-with-text
            v-if="state.note.isPin == false"
            context="Update as Important"
            :color="'red'"
            icon-name="fa-solid fa-circle-exclamation fa-2xl"
            @click.stop="updateNoteAsImportant"
          />
          <alp-button-with-text
            v-if="state.note.isPin == true"
            context="Update as Normal"
            :color="'red'"
            icon-name="fa-solid fa-ban fa-2xl"
            @click.stop="updateNoteAsNormal"
          />
        </span>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import Editor from "@/components/inputs/Editor.vue";
import { fmtTimeDistance } from "@/composable/date";
import { NoteDto, NoteInput } from "@/network/dtos/note-dto";
import { ProjectNoteServiceProxy } from "@/network/projects-service-proxies";
import { ProjectStore } from "@/store/modules/projects";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import UploadDocument from "@/components/ui/feedback/UploadDocument.vue";
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import { useNotify } from "@/composable/notify";

export default defineComponent({
  emits: ["close"],
  props: {
    id: {
      type: [String],
      required: true
    },

    noteid: {
      type: [Number],
      required: true
    }
  },
  components: {
    Modal,
    Editor,
    UploadDocument,
    DocumentIcon
  },

  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      message: "",
      search: "",
      limit: 20,
      offset: 0,
      note: new NoteDto(),
      uploadFile: [],
      fileName: [] as string[],
      removeAttachmentId: [] as number[]
    });
    onMounted(() => {
      new ProjectNoteServiceProxy()
        .getProjectNoteById(props.id, props.noteid)
        .then((result: NoteDto) => {
          state.note = result;
        });
    });
    const { fireSuccessToast } = useNotify();
    function updateNote() {
      if (state.note.message) {
        if (state.fileName.length > 0) {
          fireSuccessToast("Please wait while we are uploading files ...");
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE_UPLOAD, {
              id: props.id,
              files: state.uploadFile,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: state.note.isPin
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        } else {
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE, {
              id: props.id,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: state.note.isPin
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        }
      }
    }

    function updateNoteAsImportant() {
      if (state.note.message) {
        if (state.fileName.length > 0) {
          fireSuccessToast("Please wait while we are uploading files ...");
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE_UPLOAD, {
              id: props.id,
              files: state.uploadFile,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: true
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        } else {
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE, {
              id: props.id,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: true
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        }
      }
    }

    function updateNoteAsNormal() {
      if (state.note.message) {
        if (state.fileName.length > 0) {
          fireSuccessToast("Please wait while we are uploading files ...");
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE_UPLOAD, {
              id: props.id,
              files: state.uploadFile,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: false
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        } else {
          store
            .dispatch(ProjectStore.actions.ADDUPDATE_PROJECT_NOTE, {
              id: props.id,
              attachments: state.removeAttachmentId,
              note: new NoteInput({
                message: state.note.message,
                isPin: false
              }),
              noteid: props.noteid
            })
            .then(() => {
              emit("close");
            });
        }
      }
    }
    let dropzoneFile = ref("");
    const drop = (e: any) => {
      dropzoneFile.value = e.dataTransfer.files;
      if (e.dataTransfer && e.dataTransfer.files) {
        const Fileslength = e.dataTransfer.files.length;
        for (var i = 0; i < Fileslength; i++) {
          state.uploadFile.push(e.dataTransfer.files[i]);
        }
        const targetFile = Array.from(e.dataTransfer?.files || []) as any;
        targetFile.forEach((value: any) => {
          state.fileName.push(value.name);
        });
      }
    };
    function tofileName(event: any) {
      const ext = event.split(".").pop();
      return ext;
    }
    function removeFile(name: any, indexvalue: any) {
      let index = state.fileName.indexOf(name);
      if (index > -1) {
        state.fileName.splice(index, 1);
        state.uploadFile.splice(index, 1);
      }
    }
    function removeAttachment(file: any, index: any) {
      let indexValue = state.note.document?.indexOf(file);
      if ((indexValue as any) > -1) {
        state.note.document?.splice(indexValue as any, 1);
        state.removeAttachmentId.push(file.id);
      }
    }
    function clearDetails() {
      state.message = "";
      state.fileName.splice(0);
      state.uploadFile.splice(0);
    }
    return {
      state,
      fmtTimeDistance,
      updateNote,
      updateNoteAsImportant,
      updateNoteAsNormal,
      removeAttachment,
      clearDetails,
      drop,
      removeFile,
      tofileName
    };
  }
});
</script>
