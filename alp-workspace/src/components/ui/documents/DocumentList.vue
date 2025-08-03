<template>
  <div class="document-list flex flex-col">
    <transition name="fade">
      <alp-can permission="ResourceDocument.View">
        <resource-selector
          v-if="state.showResourceSelector"
          @create="$emit('create-from-resource', $event)"
          @close="state.showResourceSelector = false"
        />
      </alp-can>
    </transition>

    <span
      class="flex justify-between mx-2 mb-3 flex-wrap md:flex-nowrap gap-2 md:gap-0"
    >
      <span class="flex-1 flex">
        <alp-focus-input
          class="flex-1 text-sm rounded-md h-10"
          placeholder="Search ..."
          v-model="state.search"
        />
        <span
          class="flex items-center bg-gray-200 px-3 h-10 text-sm ml-1 cursor-pointer hover:bg-gray-300 rounded-md"
          @click="state.showDocumentFilters = true"
        >
          <font-awesome-icon
            icon="fa-solid fa-filter"
            class="h-5 w-5"
            size="22"
          />
        </span>
      </span>

      <span v-if="canUseUpload" class="flex items-center md:ml-3">
        <span
          class="flex items-center bg-blue-600 rounded px-2 py-2 text-sm text-white cursor-pointer hover:bg-blue-700"
          @click="selectDocuments"
        >
          <font-awesome-icon icon="fa-cloud-arrow-up" class="md:mr-2" />
          <input
            type="file"
            multiple
            ref="upload"
            class="hidden"
            @change="uploadDocuments"
          />
          <span class="hidden md:block">Upload</span>
        </span>
        <alp-can permission="ResourceDocument.View">
          <span
            v-if="canUseResource"
            class="create-resource-button flex items-center bg-blue-600 rounded px-2 py-2 text-sm text-white ml-1 cursor-pointer hover:bg-blue-700"
            @click="state.showResourceSelector = true"
          >
            <font-awesome-icon icon="fa-file-circle-plus" class="md:mr-2" />

            <span class="hidden md:block">Resource</span>
          </span>
        </alp-can>

        <span
          v-if="documentsCount && state.isMultiSelection && state.isSelectValue"
          class="create-resource-button flex items-center bg-blue-600 rounded px-2 py-2 text-sm text-white ml-1 cursor-pointer hover:bg-blue-700"
          @click="deleteSelectDocuments()"
        >
          <font-awesome-icon icon="fa-trash" class="md:mr-2" />
          <input class="hidden" />
          <span class="hidden md:block">Delete</span>
        </span>
        <span
          v-if="documentsCount && state.isMultiSelection && state.isSelectValue"
          class="create-resource-button flex items-center bg-blue-600 rounded px-2 py-2 text-sm text-white ml-1 cursor-pointer hover:bg-blue-700"
          @click="downloadSelectDocuments()"
        >
          <font-awesome-icon icon="fa-download" class="md:mr-2" />
          <input class="hidden" />
          <span class="hidden md:block">Download</span>
        </span>
      </span>
    </span>

    <div
      id="target"
      class="relative flex-1 flex flex-col mx-3 sm:mx-2 overflow-x-auto"
      @dragover.prevent="state.dragging = true"
      @dragleave.prevent="state.dragging = false"
    >
      <alp-table
        class="flex-1"
        :headers="
          showDocumentType
            ? ['Name', 'Context', 'Last Updated']
            : ['Name', 'Last Updated']
        "
        :fields="
          showDocumentType
            ? ['name', 'context', 'lastUpdated']
            : ['name', 'lastUpdated']
        "
        :loading="loading"
        :values="documents"
        @selected="selectDocument($event)"
        :isMultiSelection="true"
        :deSelectCheckBoxCount="state.deSelectCheckBoxCount"
        :issorting="false"
        :is-resizable-columns="false"
        pageName="resourceDocuments"
      >
        <template v-slot:icon="{ value }">
          <span class="flex items-center">
            <document-icon class="w-6 h-6" :extension="value.fileExtension" />
          </span>
        </template>
        <template v-slot:name="{ value }">
          <td>{{ value.fileName }}{{ value.fileExtension }}</td>
        </template>
        <template v-slot:context="{ value }">
          <td
            class="hover:underline"
            @click.stop="navigateToDocumentContext(value)"
          >
            {{ DocumentTypes[value.documentType] }} #{{ value.documentTypeId }}
          </td>
        </template>
        <template v-slot:lastUpdated="{ value }">
          <td>{{ fmtTimeDistance(value.updatedAt) }}</td>
        </template>
        <template v-slot:action="{ value }">
          <document-actions
            :document="value"
            :can-edit="canEdit"
            :can-delete="canDelete"
            @updated="fetchDocuments"
            @deleted="fetchDocuments"
            :canShowPreview="true"
          />
        </template>
      </alp-table>

      <transition name="fade">
        <div
          v-if="canCreate && (state.dragging || state.uploading)"
          class="flex flex-col items-center justify-center bg-black bg-opacity-25 absolute inset-0 rounded border-2 border-dashed"
          @drop.prevent="handleFileDrop"
        >
          <span v-if="state.uploading" class="text-lg">Uploading</span>
          <span v-else class="text-lg">Drop here to upload</span>
        </div>
      </transition>
    </div>

    <alp-paginator
      class="text-sm"
      v-model:limit="state.limit"
      v-model:offset="state.offset"
      :item-count="documents.length"
      :total="documentsCount"
      :CurrentPageNumber="state.currentPageNumber"
    />

    <transition name="slide-over" mode="out-in">
      <slide-over
        heading="Document List"
        v-if="state.showDocumentFilters"
        @close="state.showDocumentFilters = false"
      >
        <div class="flex flex-col">
          <div class="md:h-full flex flex-col">
            <div class="flex flex-col py-3 px-6">
              <span class="flex justify-between">
                <span class="font-medium mb-3">Document Filters </span>
              </span>

              <label class="flex items-center text-xs px-6">
                <input type="checkbox" v-model="state.matchAny" />
                <span class="form-label">Match Any</span>
              </label>

              <span class="mt-3 flex flex-col">
                <template
                  v-for="parameter in state.parameters.filter(
                    (p) =>
                      p.parameterType == DynamicParameterType.SingleSelect ||
                      p.parameterType == DynamicParameterType.MultiSelect
                  )"
                  :key="parameter.id"
                >
                  <span>
                    {{ parameter.parameterName }}
                  </span>

                  <label
                    v-for="value in parameter.parameterValues"
                    :key="parameter.id + '-' + value.id"
                    class="flex items-center text-xs px-6"
                  >
                    <input
                      type="checkbox"
                      v-model="state.filterParameters[parameter.id]"
                      :value="value.value"
                    />
                    <span class="form-label mr-2">{{ value.value }}</span>
                  </label>
                </template>
              </span>
            </div>
          </div>
        </div>
      </slide-over>
    </transition>

    <transition name="slide-over" mode="out-in">
      <document
        v-if="state.selectedDocumentId"
        :key="state.selectedDocumentId"
        :id="state.selectedDocumentId"
        :can-edit="canEdit"
        :can-delete="canDelete"
        @updated="fetchDocuments"
        @close="
          () => {
            state.selectedDocumentId = null;
            $emit('closed');
          }
        "
      />
    </transition>
  </div>
</template>

<script lang="ts">
import DocumentIcon from "@/components/common/DocumentIcon.vue";
import Document from "@/components/ui/documents/Document.vue";
import DocumentActions from "@/components/ui/documents/DocumentActions.vue";
import ResourceSelector from "@/components/ui/documents/ResourceSelector.vue";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { fmtTimeDistance } from "@/composable/date";
import { useNotify } from "@/composable/notify";
import { DocumentServiceProxy } from "@/network/documents-service-proxies";
import { DocumentDto } from "@/network/dtos/document-dto";
import { EntityDynamicParameterValueOptionsDto } from "@/network/dtos/dynamic-parameter-dto";
import { DocumentTypes, DynamicParameterType } from "@/network/dtos/enumTypes";

import store from "@/store";
import { DocumentStore } from "@/store/modules/documents";
import { ReminderStore } from "@/store/modules/reminders";
import { useDebounceFn } from "@vueuse/core";
import FileSaver from "file-saver";

import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch
} from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  emits: ["fetch", "upload", "create-from-resource", "closed"],
  props: {
    documents: {
      type: Array as PropType<Array<DocumentDto>>,
      default: []
    },
    documentsCount: {
      type: Number,
      required: true
    },
    dataId: {
      type: Number,
      required: true
    },
    pageName: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    },

    canCreate: {
      type: Boolean,
      required: true
    },
    canEdit: {
      type: Boolean,
      required: true
    },
    canDelete: {
      type: Boolean,
      required: true
    },
    canUseResource: {
      type: Boolean,
      default: true
    },
    canUseUpload: {
      type: Boolean,
      default: true
    },
    showDocumentType: {
      type: Boolean,
      default: false
    },
    filterSetting: {
      type: Object
    },
    documentId: {
      type: Number
    }
  },
  components: {
    ResourceSelector,
    Document,
    SlideOver,
    DocumentIcon,
    DocumentActions
  },
  setup(props, { emit }) {
    let limit = 20;
    let filterState = {
      search: "",
      offset: 0,
      matchAny: false,
      currentPageNumber: 1
    };
    if (props.filterSetting)
      filterState = {
        search: props.filterSetting.search ?? "",
        offset: props.filterSetting.offset ?? 0,
        matchAny: props.filterSetting.matchAny ?? false,
        currentPageNumber: (props.filterSetting.offset ?? 0) / limit + 1
      };
    const state = reactive({
      selectedDocumentId: null as number | null | undefined,
      dragging: false,
      uploading: false,
      showResourceSelector: false,
      showDocumentFilters: false,
      parameters: [] as EntityDynamicParameterValueOptionsDto[],
      filterParameters: {} as Record<number, string[]>,
      matchAny: filterState.matchAny,
      search: filterState.search,
      limit: limit,
      offset: filterState.offset,
      currentPageNumber: filterState.currentPageNumber,
      deSelectCheckBoxCount: 0,
      isMultiSelection: true,
      isSelectValue: false
    });
    const reminderLinkCount = computed(
      () => store.getters[ReminderStore.getters.REMINDER_LINK_CLICK_COUNT]
    );

    if (props.documentId) {
      state.selectedDocumentId = props.documentId;
      state.showDocumentFilters = false;
    }

    watch([() => props.documentId], () => {
      () => {
        state.selectedDocumentId = props.documentId;
        state.showDocumentFilters = false;
      };
    });
    let selectedvalue: any;
    watch(
      [
        () =>
          (selectedvalue =
            store.getters[DocumentStore.getters.GET_DOCUMENT_SELECTION])
      ],
      () => {
        if (selectedvalue.length > 0) {
          state.isSelectValue = true;
        } else state.isSelectValue = false;
      }
    );

    const fetchDocuments = useDebounceFn(() => {
      emit("fetch", {
        limit: state.limit,
        offset: state.offset,
        parameters: state.filterParameters,
        search: state.search,
        matchAny: state.matchAny
      });
    });

    async function handleFileDrop(event: DragEvent) {
      state.dragging = false;

      if (!props.canCreate) {
        return;
      }

      if (event.dataTransfer && event.dataTransfer.files) {
        emit("upload", Array.from(event.dataTransfer.files));
      }
    }

    const upload = ref<HTMLInputElement | null>(null);

    function selectDocuments() {
      upload.value?.click();
    }

    watch(
      [
        () => state.limit,
        () => state.offset,
        () => state.matchAny,
        () => state.filterParameters,
        () => state.search
      ],
      fetchDocuments,
      {
        immediate: true,
        deep: true
      }
    );

    function selectDocument(document: DocumentDto) {
      state.selectedDocumentId = document.id;
      state.showDocumentFilters = false;
    }

    function uploadDocuments(event: Event) {
      const target = event.target as HTMLInputElement;
      emit("upload", Array.from(target?.files || []));
    }

    function fetchParameters() {
      new DocumentServiceProxy()
        .getDocumentMetadataParameters()
        .then((result) => {
          state.parameters = result;
          for (const p of result) {
            if (p.id) {
              state.filterParameters[p.id] = [];
            }
          }
        });
    }

    onMounted(() => {
      fetchParameters();
    });

    const router = useRouter();

    function navigateToDocumentContext(document: DocumentDto) {
      if (document.documentTypeId) {
        switch (document.documentType) {
          case DocumentTypes.Matter:
            router.push({
              name: "Matter",
              params: { id: document.documentTypeId }
            });
            break;
          case DocumentTypes.Contact:
            router.push({
              name: "Contact",
              params: { id: document.documentTypeId }
            });
            break;
          case DocumentTypes.Organisation:
            router.push({
              name: "Organisation",
              params: { id: document.documentTypeId }
            });
            break;
        }
      }
    }

    function documentLinkCliked() {
      console.log("working");
      state.selectedDocumentId =
        store.getters[ReminderStore.getters.REMINDER_RESOURCE_ID];
      state.showDocumentFilters = false;
    }
    function deleteSelectDocuments() {
      store.dispatch(DocumentStore.actions.DELETE_SELECTED_DOCUMENT, {});
    }
    const { fireSuccessToast } = useNotify();
    function downloadSelectDocuments() {
      fireSuccessToast("Your request is in process. Please wait");
      store
        .dispatch(DocumentStore.actions.GET_SELECTED_LINK, {
          id: props.dataId,
          pageName: props.pageName
        })
        .then((response) => {
          FileSaver.saveAs(response);
        });
    }
    return {
      upload,
      DynamicParameterType,
      deleteSelectDocuments,
      downloadSelectDocuments,
      state,
      fetchDocuments,
      handleFileDrop,
      selectDocument,
      fmtTimeDistance,
      selectDocuments,
      uploadDocuments,
      DocumentTypes,
      navigateToDocumentContext,
      reminderLinkCount,
      documentLinkCliked
    };
  },
  watch: {
    reminderLinkCount() {
      this.documentLinkCliked();
    }
  }
});
</script>
