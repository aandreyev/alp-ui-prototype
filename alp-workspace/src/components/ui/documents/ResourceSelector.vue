<template>
  <modal
    v-if="state.showDocumentFilters == false"
    @close="$emit('close')"
    :headingTitle="'Select a document'"
  >
    <modal-form @cancel="$emit('close')" confirmText="-1" cancelText="Close">
      <div
        class="h-full flex-1 flex-col space-y-4 p-4 md:flex relative tableMaxHeight"
      >
        <div class="flex items-center justify-between space-y-2">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-muted-foreground text-xs"></p>
            </div>
          </div>

          <alp-can permission="CommonType.Create">
            <shad-button @click="selectDocuments" class="mr-1" size="sm">
              <input
                type="file"
                multiple
                ref="upload"
                class="hidden"
                @change="uploadDocuments"
              />
              <font-awesome-icon icon="fa-cloud-arrow-up" class="mr-2" />
              Upload
            </shad-button>
          </alp-can>
        </div>
        <shad-data-table
          :columns="columns"
          :data="items"
          :count="listCount"
          :searchValue="state.search"
          searchPlaceholder="Search documents..."
          :columnFilter="columnFilterValues"
          @load-more="loadMore"
          @selected-row-page="rowListBySize"
          @search="debouncedSearch"
          @selected-row="createDocument($event)"
          @selected-status="fetchStatus"
        >
          <template v-slot:name="{ row }">
            <td>{{ row.fileName }}{{ row.fileExtension }}</td>
          </template>
          <template v-slot:datatablefilter>
            <DocumentTypeFilter
              v-model="state.filterParameters"
              v-model:matchAny="state.matchAny"
              :resetFilter="state.resetFilter"
              :canClear="true"
              @selected="selectFilter"
            />
          </template>
        </shad-data-table>
      </div>
    </modal-form>
  </modal>
  <transition name="slide-over" mode="out-in">
    <document-filters
      v-if="state.showDocumentFilters"
      v-model:matchAny="state.matchAny"
      v-model:filterParameters="state.filterParameters"
      @close="state.showDocumentFilters = false"
    />
  </transition>
</template>

<script setup lang="ts">
import DocumentTypeFilter from "@/components/inputs/filters/DocumentTypeFilter.vue";
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import DocumentFilters from "@/components/ui/documents/DocumentFilters.vue";
import { useInfiniteListable } from "@/composable/infinite-list";

import { ResourceStore } from "@/store/modules/resources";
import { computed, getCurrentInstance, h, reactive, ref, watch } from "vue";
import store from "@/store";
import { ColumnDef } from "@tanstack/vue-table";
import { ApiStore } from "@/store/utils";
import { DataTableStore } from "@/store/modules/datatable";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { useEnum } from "@/composable/enum";
import { debounce } from "lodash";
import { DataTableFilterState } from "@/store/dataTableState";
import {
  DocumentDto,
  DocumentDtoPaginatedDto
} from "@/network/dtos/document-dto";
import { EntityDynamicParameterValueOptionsDto } from "@/network/dtos/dynamic-parameter-dto";
export interface CreateFromResourceValues {
  name: string;
}
const emit = defineEmits(["create", "close", "upload"]);

const state = reactive({
  showDocumentFilters: false,
  parameters: [] as EntityDynamicParameterValueOptionsDto[],
  matchAny: false,
  filterParameters: {} as Record<number, string[]>,
  selectedResource: null as DocumentDto | null,
  search: "",
  limit: 20,
  offset: 0,
  resetFilter: false
});

const { items, loading, fetch, reset } = useInfiniteListable({
  items: ResourceStore.getters.GET_RESOURCE_DOCUMENTS,
  query: ResourceStore.actions.GET_RESOURCE_DOCUMENTS,
  queryParams: () => ({
    search: state.search,
    parameters: state.filterParameters,
    matchAny: state.matchAny
  }),
  limit: 20
});

const isEmptyObject = (obj: any) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};
watch(
  [() => state.search, () => state.matchAny, () => state.filterParameters],
  () => {
    if (!isEmptyObject(state.filterParameters) || !state.matchAny == false) {
      state.resetFilter = false;
    }
    reset();
  },
  { deep: true, immediate: true }
);

function createDocument(resource: DocumentDto) {
  emit("create", { resource });
  emit("close");
}

function uploadDocuments(event: Event) {
  const target = event.target as HTMLInputElement;
  uploadResourceDocuments(Array.from(target?.files || []));
  emit("upload", Array.from(target?.files || []));
}
function uploadResourceDocuments(files: Array<File>) {
  store.dispatch(ResourceStore.actions.UPLOAD_RESOURCE_DOCUMENTS, {
    files
  });
}
const upload = ref<HTMLInputElement | null>(null);

function selectDocuments() {
  upload.value?.click();
}

function showFilter() {
  state.showDocumentFilters = true;
}
store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "adminResourceSelectorDataTable"
);
store.commit(
  DataTableStore.mutations.SET_FILTER_DATATABLE_STATE,
  "adminResourceSelectorDataTable"
);
const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
enum ColumnFilter {
  Id = 0,
  Name = 1,
  FileType = 2
}
const listCount = computed(
  () =>
    ApiStore.toData<DocumentDtoPaginatedDto>(
      store.getters[ResourceStore.actions.GET_RESOURCE_DOCUMENTS]
    )?.count || 0
);
const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(ResourceStore.actions.GET_RESOURCE_DOCUMENTS, {
    search: state.search,
    parameters: state.filterParameters,
    matchAny: state.matchAny,
    limit: limit,
    offset: offset,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
function limitOffsetUpdate(limit: number, offset: number) {
  store.commit(DataTableStore.mutations.SET_LIMIT, limit);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
}
function rowListBySize(pageSize: any) {
  limitOffsetUpdate(pageSize, offset);
  storeUpdate(pageSize, "", "");
}
let offset = 0;
let limit = 50;

function loadMore(pagenumber: any, rowlimit: any) {
  if (pagenumber != "") {
    offset = 50 * (pagenumber - 1);
  } else offset = 0;

  if (rowlimit != undefined && rowlimit != "") {
    limit = rowlimit;
    offset = rowlimit * (pagenumber - 1);
  }
  limitOffsetUpdate(limit, offset);
  storeUpdate(limit, "", "");
}

const columns: ColumnDef<DocumentDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "name",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Name" }),
    enableSorting: false
  },

  {
    accessorKey: "fileExtension",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "File Type" }),
    enableSorting: false
  }
];

function setStoreValue(value: any) {
  store.commit(
    DataTableStore.mutations.SET_EXTRA_FILTER,
    typeof value == "object" ? value.length : value
  );
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    typeof value == "object" ? value.length : value
  );
}

let datatableState = new DataTableFilterState();
setStoreValue(0);

function selectFilter(value: any) {
  if (value) {
    setStoreValue(value);
  } else {
    if (state.matchAny == false) {
      setStoreValue(0);
    }
  }
}

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

  store.commit(DataTableStore.mutations.SET_FILTER_STATUS, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_DATATABLE_STATE],
    value
  );

  if (value == 0 && search == "") {
    state.search = "";
    state.filterParameters = {};
  }
}
</script>

<style>
.tableMaxHeight {
  overflow: auto;
  max-height: calc(100vh - 400px);
}
</style>
