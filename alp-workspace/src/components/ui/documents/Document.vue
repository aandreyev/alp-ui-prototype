<template>
  <slide-over heading="Document" @close="$emit('close')">
    <div class="md:h-full flex flex-col">
      <div class="py-3 px-6">
        <span class="flex">
          <edit-inline-input
            class="font-medium w-11/12 md:w-full break-all"
            :model-value="state.document?.fileName"
            @update:modelValue="updateDocument"
          />
          <document-actions
            v-if="state.document"
            :document="state.document"
            :can-edit="canEdit"
            :can-delete="canDelete"
            @updated="fetchDocument"
            @deleted="$emit('close')"
          />
        </span>
      </div>
      <div class="py-3 px-3">
        <template v-for="parameter in state.parameters" :key="parameter.id">
          <dynamic-input
            :parameter="parameter"
            :entityId="id"
            :update-value="updateDynamicValue"
            :add-value="addDynamicValue"
            :remove-value="removeDynamicValue"
          />
        </template>
        <span class="flex relative float-right">
          <span
            v-if="canEdit"
            class="flex items-center bg-gray-200 rounded px-2 h-7 text-sm cursor-pointer hover:bg-gray-300"
            @click="selectDocument"
          >
            <font-awesome-icon icon="fa-solid fa-upload" class="mr-2" />
            <input
              type="file"
              multiple
              ref="uploadVersion"
              class="hidden"
              @change="uploadDocumentVersion"
            />
            <span>Upload</span>
          </span>
        </span>
      </div>
      <div
        id="target"
        class="relative flex-1 flex flex-col overflow-x-auto"
        @dragover.prevent="state.dragging = true"
        @dragleave.prevent="state.dragging = false"
      >
        <table class="table-auto md:mx-3">
          <thead class="table-header">
            <tr>
              <th class="">Version</th>
              <th class="">Date</th>
              <th class="">User</th>
              <th class=""></th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="version in state.versions" :key="version.id">
              <td>{{ version.versionNumber }}</td>
              <td>{{ fmtToLocalDatetime(version.insertedAt) }}</td>
              <td>
                {{ version.insertedBy.firstName }}
                {{ version.insertedBy.lastName }}
              </td>
              <td>
                <span class="flex items-center justify-end">
                  <action-button
                    v-if="canEdit"
                    class=""
                    icon-name="fa-solid fa-rotate fa-lg"
                    description="Restore"
                    @click="restoreVersion(version.id)"
                  />
                  <action-button
                    class=""
                    icon-name="fa-solid fa-download fa-lg"
                    description="Download"
                    @click="download(version.id)"
                  />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <transition name="fade">
          <div
            v-if="state.dragging || state.uploading"
            class="flex flex-col items-center justify-center bg-black bg-opacity-25 absolute inset-0 rounded border-2 border-dashed"
            @drop.prevent="handleFileDrop"
          >
            <span v-if="state.uploading" class="text-lg">Uploading</span>
            <span v-else class="text-lg">Drop here to upload</span>
          </div>
        </transition>
      </div>
    </div>
  </slide-over>
</template>

<script lang="ts">
import ActionButton from "@/components/common/ActionButton.vue";
import DynamicInput from "@/components/inputs/DynamicInput.vue";
import EditInlineInput from "@/components/inputs/EditInlineInput.vue";
import DocumentActions from "@/components/ui/documents/DocumentActions.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { fmtToLocalDatetime } from "@/composable/date";
import { DocumentServiceProxy } from "@/network/documents-service-proxies";
import {
  DocumentDto,
  DocumentVersionDto,
  DocumentInput
} from "@/network/dtos/document-dto";
import {
  EntityDynamicParameterDto,
  EntityDynamicParameterValueInput
} from "@/network/dtos/dynamic-parameter-dto";

import FileSaver from "file-saver";
import { defineComponent, onMounted, reactive, ref } from "vue";

export default defineComponent({
  emits: ["updated", "close"],
  props: {
    id: {
      type: [Number, String],
      required: true
    },
    canEdit: {
      type: Boolean,
      required: true
    },
    canDelete: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      dragging: false,
      document: null as DocumentDto | null,
      versions: [] as DocumentVersionDto[],
      parameters: [] as EntityDynamicParameterDto[]
    });

    function fetchDocument() {
      new DocumentServiceProxy()
        .getDocumentById(parseInt(props.id.toString()))
        .then((document) => {
          state.document = document;
          new DocumentServiceProxy()
            .getDocumentVersions(
              parseInt(props.id.toString()),
              undefined,
              20,
              0
            )
            .then((version) => {
              if (version) {
                state.versions = version.items || [];
              }
            });
        });
    }

    function fetchDocumentParameters() {
      new DocumentServiceProxy()
        .getDocumentMetadataValues(parseInt(props.id.toString()))
        .then((result) => {
          state.parameters = result;
        });
    }

    onMounted(() => {
      fetchDocument();
      fetchDocumentParameters();
    });

    function download(version: number | undefined) {
      new DocumentServiceProxy()
        .getDocumentLinkById(parseInt(props.id.toString()), version)
        .then((response) => {
          if (response.link) {
            FileSaver.saveAs(response.link);
          }
        });
    }

    function restoreVersion(version: number) {
      new DocumentServiceProxy()
        .restoreDocumentVersion(parseInt(props.id.toString()), version)
        .then(() => {
          fetchDocument();
        });
    }

    function lockForEditing(id: number) {
      new DocumentServiceProxy().startDocumentEditing(id).then(() => {
        fetchDocument();
      });
    }

    function editOnline(id: number) {
      new DocumentServiceProxy()
        .getDocumentEditOnlineLink(id)
        .then((response) => {
          window.open(response.link, "_blank");
        });
    }

    function editWithApp(id: number) {
      new DocumentServiceProxy()
        .getDocumentEditWithAppLink(id)
        .then((response) => {
          window.open(response.link);
        });
    }

    function finishEditing(id: number) {
      new DocumentServiceProxy().finishDocumentEditing(id).then((response) => {
        fetchDocument();
      });
    }

    function updateDynamicValue(parameterId: number, value: string) {
      new DocumentServiceProxy()
        .setDocumentMetadataValue(
          parseInt(props.id.toString()),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function addDynamicValue(parameterId: number, value: string) {
      new DocumentServiceProxy()
        .addDocumentMetadataValue(
          parseInt(props.id.toString()),
          new EntityDynamicParameterValueInput({
            parameterId,
            value
          })
        )
        .then(fetchDocumentParameters);
    }

    function removeDynamicValue(id: number) {
      new DocumentServiceProxy()
        .removeDocumentMetadataValue(parseInt(props.id.toString()), id)
        .then(fetchDocumentParameters);
    }

    function updateDocument(filename: string) {
      new DocumentServiceProxy()
        .updateDocument(
          props.id as number,
          new DocumentInput({ fileName: filename })
        )
        .then(() => {
          fetchDocument();
          emit("updated");
        });
    }

    const uploadVersion = ref<HTMLInputElement | null>(null);

    function selectDocument() {
      uploadVersion.value?.click();
    }

    function uploadDocumentVersion(event: any) {
      var file = event.target.files[0] as HTMLInputElement;
      uploadNewDocumentVersion(file);
    }

    async function handleFileDrop(event: DragEvent) {
      state.dragging = false;
      if (event.dataTransfer && event.dataTransfer.files) {
        var file = event.dataTransfer?.files[0];
        uploadNewDocumentVersion(file);
      }
    }

    function uploadNewDocumentVersion(file: any) {
      new DocumentServiceProxy()
        .versionDocument(props.id as number, {
          fileName: file.name,
          data: file
        })
        .then(() => {
          fetchDocument();
        });
    }

    return {
      uploadVersion,
      handleFileDrop,
      state,
      download,
      lockForEditing,
      editOnline,
      editWithApp,
      finishEditing,
      restoreVersion,
      fmtToLocalDatetime,
      updateDynamicValue,
      addDynamicValue,
      selectDocument,
      uploadDocumentVersion,
      removeDynamicValue,
      updateDocument
    };
  },
  components: {
    SlideOver,
    ActionButton,
    DynamicInput,
    DocumentActions,
    EditInlineInput
  }
});
</script>
