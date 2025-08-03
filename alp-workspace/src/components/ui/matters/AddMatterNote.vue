<template>
  <modal @close="$emit('close')" :headingTitle="'Add New Note'">
    <div class="md:h-full flex flex-col bg-white min-h-0 rounded-lg">
      <!-- <alp-form-divider name=""></alp-form-divider> -->
      <div class="flex flex-col pb-3 md:pb-20 px-6">
        <editor editor-container-class="max-h-64" v-model="state.message" />
        <div class="home w-full">
            <UploadDocument @drop.prevent="drop" />
          </div>
          <span
            class="flex flex-wrap gap-2 mt-1"
            v-if="state.fileName.length > 0"
          >
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
        <span class="flex justify-end space-x-2 mt-2">
          <alp-button-with-text
            context="Clear"
            :color="'gray'"
            icon-name="fa-solid fa-delete-left fa-2xl"
            @click.prevent.stop="clearDetails"
          />
          <alp-button-with-text
            context="File"
            :color="'green'"
            icon-name="fa-solid fa-check fa-2xl"
            @click.prevent.stop="createNote"
          />
          <alp-button-with-text
            context="File as Important"
            :color="'red'"
            icon-name="fa-solid fa-circle-exclamation fa-2xl"
            @click.prevent.stop="createImportantNote"
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
import { MatterStore } from "@/store/modules/matters";
import { defineComponent, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import UploadDocument from "@/components/ui/feedback/UploadDocument.vue";
import { useNotify } from "@/composable/notify";
import { NoteInput } from "@/network/dtos/note-dto";
export default defineComponent({
  emits: ["close"],
  props: {
    id: {
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
      uploadFile: [],
      fileName: [] as string[],
    });
    // onMounted(() => {
    //   new MatterNoteServiceProxy()
    //     .getMatterNoteById(props.id, props.noteid)
    //     .then((result: NoteDto) => {
    //       state.message =
    //         result != undefined
    //           ? result.message == undefined
    //             ? ""
    //             : result.message
    //           : "";
    //     });
    // });
    const { fireSuccessToast } = useNotify();
    function createNote() {
      if (state.message) {
        if (state.uploadFile.length > 0) {
          fireSuccessToast("Please wait while we are uploading files ...");
          store
            .dispatch(MatterStore.actions.CREATE_MATTER_NOTE_UPLOAD, {
              id: props.id,
              files: state.uploadFile,
              note: new NoteInput({
                message: state.message,
                isPin: false
              })
            })
          .then(() => {
            emit("close");
          });
        }
        else{
        store
          .dispatch(MatterStore.actions.CREATE_MATTER_NOTE, {
            id: props.id,
            note: new NoteInput({
              message: state.message,
              isPin: false
            })
          })
          .then(() => {
            emit("close");
          });
        }
      }
    }

    function createImportantNote() {
      if (state.message) {
        if (state.uploadFile.length > 0) {
          fireSuccessToast("Please wait while we are uploading files ...");
          store
            .dispatch(MatterStore.actions.CREATE_MATTER_NOTE_UPLOAD, {
              id: props.id,
              files: state.uploadFile,
              note: new NoteInput({
                message: state.message,
                isPin: true
              })
            })
          .then(() => {
            emit("close");
          });
        }
        else{
        store
          .dispatch(MatterStore.actions.CREATE_MATTER_NOTE, {
            id: props.id,
            note: new NoteInput({
              message: state.message,
              isPin: true
            })
          })
          .then(() => {
            emit("close");
          });
        }
      }
    }
    watch(
      [() => props.id],
      () => {
        state.fileName.splice(0);
        state.uploadFile.splice(0);
      },
      { immediate: true, deep: true }
    );
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
    function clearDetails() {
      state.message = "";
      state.fileName.splice(0);
      state.uploadFile.splice(0);
    }
    function removeFile(name: any, indexvalue: any) {
      let index = state.fileName.indexOf(name);
      if (index > -1) {
        state.fileName.splice(index, 1);
        state.uploadFile.splice(index, 1);
      }
    }
    return {
      state,
      fmtTimeDistance,
      createNote,
      createImportantNote,
      drop,
      tofileName,
      clearDetails,
      removeFile
    };
  }
});
</script>
