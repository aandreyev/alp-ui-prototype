<template>
  <table-layout-container>
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ props.pageHeading }}
        </h2>
        <div class="flex items-center justify-between space-y-2">
          <p class="text-muted-foreground text-xs">
            {{ documentsCount }} {{ props.pageHeading.toLowerCase() }} in search
            result
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <span v-if="state.canUseUpload" class="flex items-center md:ml-3">
          <shad-button @click="selectDocuments" class="mr-1" size="sm">
            <input
              type="file"
              id="uploadDocument"
              multiple
              ref="upload"
              class="hidden"
              @change="uploadDocuments"
            />
            <iconify-icon icon="lucide:upload" class="mr-2" />
            Upload
          </shad-button>
          <alp-can permission="ResourceDocument.View">
            <shad-button
              size="sm"
              v-if="canUseResource"
              @click="state.showResourceSelector = true"
              class="mr-1"
            >
              <iconify-icon icon="lucide:file-plus" class="mr-2" />
              Resource
            </shad-button>
          </alp-can>
          
          <shad-button
            size="sm"
            class="mr-1"
            v-if="
              documentsCount && state.isMultiSelection && state.isSelectValue
            "
            @click="downloadSelectDocuments"
          >
            <iconify-icon icon="lucide:download" class="mr-2" />
            Download
          </shad-button>

          <shad-button
            size="sm"
            class="mr-1"
            variant="destructive"
            v-if="
              documentsCount && state.isMultiSelection && state.isSelectValue
            "
            @click="deleteSelectDocuments"
          >
            <iconify-icon icon="lucide:trash" class="mr-2" />
            Delete
          </shad-button>
        </span>
      </div>
    </div>
    <shad-data-table
      className="document-table"
      :columns="columns"
      :data="documents"
      :count="documentsCount"
      :searchValue="state.search"
      searchPlaceholder="Search documents..."
      :columnFilter="columnFilterValues"
      @load-more="loadMore"
      @selected-row-page="selectedRowPage"
      @selected-status="fetchStatus"
      @search="searchData"
      @selected="rowClick"
      :selectedColumn="state.selectedColumn"
    >
      <template v-slot:datatablefilter>
        <DocumentTypeFilter
          v-model="state.filterParameters"
          v-model:matchAny="state.matchAny"
          :resetFilter="state.resetFilter"
          :canClear="true"
          @selected="selectFilter"
        />
      </template>
      <template v-if="showDocumentType == true" v-slot:context="{ row }">
        <td
          v-if="
            (row ?? 0) != 0 &&
            (row.documentType ?? 0) != 0 &&
            (row.documentTypeId ?? 0) != 0
          "
          class="hover:underline"
          @click.stop="navigateToDocumentContext(row)"
        >
          {{ DocumentTypes[row.documentType] }} #{{ row.documentTypeId }}
        </td>
      </template>
      <template v-slot:icon="{ row }">
        <shad-checkbox
          v-if="row == 0"
          :checked="headerCheck"
          @click.stop="fetchSelectedValues"
        >
        </shad-checkbox>
        <shad-checkbox
          v-else
          :id="'check_' + (row.id ?? 0)"
          :checked="row.isChecked"
          @click.stop="fetchSelectedRow(row.id)"
        >
        </shad-checkbox>
      </template>
      <template v-slot:fileExtension="{ row }">
        <td>
          <DocumentIconVue :extension="row.fileExtension" />
        </td>
      </template>
      <template v-slot:fileName="{ row }">
        <td>{{ row.fileName }}{{ row.fileExtension }}</td>
      </template>
      <template v-slot:updatedAt="{ row }">
        <td>{{ fmtTimeDistance(row.updatedAt) }}</td>
      </template>
      <template v-slot:documentType="{ row }">
        <td v-if="row.className != 'hidden'">{{ row.documentType }}</td>
      </template>
      <template v-slot:documentTypeId="{ row }">
        <td class="hidden">{{ row.documentTypeId }}</td>
      </template>
      <template v-slot:action="{ row }">
        <shad-document-actions
          :document="row"
          :can-edit="props.canEdit"
          :can-delete="props.canDelete"
          :can-show-preview="true"
          @deleted="fetchDocuments"
          @updated="fetchDocuments"
        ></shad-document-actions>
      </template>
    </shad-data-table>
  </table-layout-container>
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
  <transition name="fade">
    <alp-can permission="ResourceDocument.View">
      <resource-selector
        v-if="state.showResourceSelector"
        @create="$emit('create-from-resource', $event)"
        @close="state.showResourceSelector = false"
      />
    </alp-can>
  </transition>
</template>

<script setup lang="ts">
import { h, reactive, ref, watch } from "vue";
// import store from "@/store";
import { DocumentStore } from "@/store/modules/documents";
import { useNotify } from "@/composable/notify";
import FileSaver from "file-saver";
import { useEnum } from "@/composable/enum";
import { ColumnDef } from "@tanstack/vue-table";
import DocumentIconVue from "@/components/common/DocumentIcon.vue";
import { fmtTimeDistance } from "@/composable/date";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { useDebounceFn } from "@vueuse/shared";
import ShadDocumentActions from "./ShadDocumentActions.vue";
import { DataTableStore } from "@/store/modules/datatable";
import DocumentTypeFilter from "@/components/inputs/filters/DocumentTypeFilter.vue";
import { useRouter } from "vue-router";
import Document from "@/components/ui/documents/Document.vue";
import ResourceSelector from "@/components/ui/documents/ResourceSelector.vue";
import { DataTableFilterState } from "@/store/dataTableState";
import { useStore } from "vuex";
import {
  DocumentDto,
  DocumentDtoPaginatedDto
} from "@/network/dtos/document-dto";
import { EntityDynamicParameterValueOptionsDto } from "@/network/dtos/dynamic-parameter-dto";
import { DocumentTypes } from "@/network/dtos/enumTypes";

const props = defineProps<{
  pageHeading: string;
  uploading: boolean;
  documents: DocumentDto[];
  documentsCount: number;
  canCreate: boolean;
  canEdit: boolean;
  canAddReminder?: boolean;
  canDelete: boolean;
  canUseResource: boolean;
  filterSetting: Object;
  documentId: number;
  dataId: number;
  pageName: string;
  loading: boolean;
  canUseUpload: boolean;
  showDocumentType: boolean;
  selectedData: Array<number>;
  resetFilter: false;
  filterParameters: Record<number, string[]>;
  matchAny: boolean;
}>();

const emits = defineEmits([
  "load-more",
  "selected-row-page",
  "search",
  "row-click",
  "upload",
  "fetch",
  "closed",
  "create-from-resource",
  "selected-status"
]);

const store = useStore();
let limit = 20;
let filterState = {
  search: "",
  offset: 0,
  matchAny: false,
  currentPageNumber: 1
};

let headerCheck = false;
const state = reactive({
  showResourceSelector: false,
  isMultiSelection: true,
  isSelectValue: false,
  canUseUpload: true,
  filterParameters: {} as Record<number, string[]>,
  parameters: [] as EntityDynamicParameterValueOptionsDto[],
  resetFilter: false,
  selectedDocumentId: null as number | null | undefined,
  dragging: false,
  uploading: false,
  showDocumentFilters: false,
  matchAny: filterState.matchAny,
  search: "",
  limit: limit,
  offset: filterState.offset,
  currentPageNumber: filterState.currentPageNumber,
  deSelectCheckBoxCount: 0,
  selectedColumn: 0
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

function rowClick(id: any) {
  state.selectedDocumentId = id;
  state.showDocumentFilters = false;
}
if (props.documentId) {
  state.selectedDocumentId = props.documentId;
}

watch(
  [() => props.documentId],
  () => {
    state.selectedDocumentId = props.documentId;
  },
  {
    immediate: true,
    deep: true
  }
);
function loadMore(pagenumber: any, rowlimit: any) {
  emits("load-more", pagenumber, rowlimit);
}
function selectedRowPage(pageSize: any) {
  emits("selected-row-page", pageSize);
}
function searchData(val: any) {
  state.search = val;
}

const upload = ref<HTMLElement | null>(null);
function selectDocuments() {
  upload.value!.click();
}
function uploadDocuments(event: Event) {
  const target = event.target as HTMLInputElement;
  emits("upload", Array.from(target?.files || []));
}

function deleteSelectDocuments() {
  store.dispatch(DocumentStore.actions.DELETE_SELECTED_DOCUMENT, {});
  state.selectedColumn = 0;
  hideButtonsAndCheckbox();
}
const { fireSuccessToast, fireErrorToast } = useNotify();
function downloadSelectDocuments() {
  fireSuccessToast("Your request is in process. Please wait");
  store
    .dispatch(DocumentStore.actions.GET_SELECTED_LINK, {
      id: props.dataId,
      pageName: props.pageName
    })
    .then((response) => {
      state.selectedColumn = 0;
      hideButtonsAndCheckbox();
      FileSaver.saveAs(response);
    });
}

function hideButtonsAndCheckbox() {
  headerCheck = false;
  toggleRowSelections();
  state.isSelectValue = false;
}
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

// column filter

const showDocumentType = props.showDocumentType;
const context = showDocumentType ? "block" : "hidden";

enum ColumnFilter {
  Icon = 0,
  Id = 1,
  Name = 2,
  Context = 3,
  LastUpdated = 4
}
const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
let columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

if (!showDocumentType) {
  const index = columnFilterValues.findIndex((el) => el.label == "Context");
  columnFilterValues.splice(index, 1);
}

let selectedData = Array<number>();
function fetchSelectedValues() {
  headerCheck = !headerCheck;

  toggleRowSelections();
  if (headerCheck) {
    selectedData.splice(0);
    props.documents.forEach((el) => selectedData.push(el.id ?? 0));
    state.selectedColumn = props.documents.length;
    store.commit(DocumentStore.mutations.SET_DOCUMENT_SELECTION, selectedData);
    state.isSelectValue = true;
  } else {
    selectedData.splice(0);
    state.selectedColumn = 0;
    if (selectedData.length == 0) {
      store.commit(
        DocumentStore.mutations.SET_DOCUMENT_SELECTION,
        selectedData.splice(0)
      );
    }
    state.isSelectValue = false;
  }
}
function toggleRowSelections() {
  if (headerCheck) {
    props.documents?.forEach((value, index) => {
      value.isChecked = true;
    });
  } else {
    props.documents?.forEach((value, index) => {
      value.isChecked = false;
    });
  }
}
function fetchSelectedRow(ev: any) {
  if (selectedData.indexOf(ev.id ?? 0) > -1) {
    selectedData.splice(selectedData.indexOf(ev.id ?? 0), 1);
    state.selectedColumn = state.selectedColumn - 1;
  } else {
    selectedData.push(ev.id ?? 0);
    state.selectedColumn = state.selectedColumn + 1;
  }
  if (selectedData.length == 0) {
    state.isSelectValue = false;
    store.commit(
      DocumentStore.mutations.SET_DOCUMENT_SELECTION,
      selectedData.splice(0)
    );
  } else {
    state.isSelectValue = true;
    store.commit(DocumentStore.mutations.SET_DOCUMENT_SELECTION, selectedData);
  }
}

const fetchDocuments = useDebounceFn(() => {
  emits("fetch", {
    limit: state.limit,
    offset: state.offset,
    parameters: state.filterParameters,
    search: state.search,
    matchAny: state.matchAny
  });
});

let datatableState = new DataTableFilterState();
// fetch Status
function fetchStatus(value: any, search: any) {
  state.resetFilter = false;
  // value 0 means filter is clear
  if (value === 0) {
    value = null;
    state.matchAny = false;
    state.filterParameters = {} as Record<number, string[]>;
    state.resetFilter = true;
  } else {
    value = null;
  }
  state.isSelectValue = false;
  store.commit(DataTableStore.mutations.SET_FILTER_STATUS, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_DATATABLE_STATE],
    value
  );

  if (value == 0 && search == "") {
    state.search = "";
    state.filterParameters = {};
  } else {
    state.filterParameters = value ?? 0;
    fetchDocuments();
  }
}
store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, 0);
datatableState.setItem(
  store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
  0
);

function selectFilter(value: any) {
  if (value != 0 && value != null) {
    store.commit(
      DataTableStore.mutations.SET_EXTRA_FILTER,
      typeof value == "object" ? value.length : value
    );
    datatableState.setItem(
      store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
      typeof value == "object" ? value.length : value
    );
  } else {
    if (state.matchAny == false) {
      store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, 0);
      datatableState.setItem(
        store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
        0
      );
    }
  }
}
const isEmptyObject = (obj: any) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false; // If the object has at least one property, it's not empty
    }
  }
  return true; // If the loop completes without returning false, the object is empty
};
watch(
  [() => state.filterParameters, () => state.matchAny, () => state.search],
  () => {
    if (!isEmptyObject(state.filterParameters) || !state.matchAny == false) {
      state.resetFilter = false;
    }
    fetchDocuments();
  },
  { immediate: true, deep: true }
);

const columns: ColumnDef<DocumentDtoPaginatedDto>[] = [
  {
    accessorKey: "fileExtension",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "" }),
    enableSorting: false
  },
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("td", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "fileName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Name" })
  },
  {
    accessorKey: "context",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Context", class: context }),
    cell: ({ row }) => h("td", { class: "hidden" }, row.getValue("context"))
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Last Updated" })
  },
  {
    accessorKey: "documentTypeId",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "hidden", class: "hidden" }),
    enableHiding: true
  }
];
</script>
