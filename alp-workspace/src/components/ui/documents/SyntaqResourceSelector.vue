<template>
  <modal @close="$emit('close')" :headingTitle="'Select a Syntaq form'">
    <modal-form @cancel="$emit('close')" confirmText="-1" cancelText="Close">
      <div
        class="flex-1 flex-col space-y-4 p-4 md:flex relative tableMaxHeight"
      >
        <shad-data-table
          :columns="columns"
          :data="items"
          :count="listCount"
          :columnFilter="columnFilterValues"
          :searchValue="state.search"
          searchPlaceholder="Search syntaq..."
          @load-more="loadMore"
          @selected-row-page="rowListBySize"
          @selected-row="createDocument($event)"
          @search="debouncedSearch"
        >
        </shad-data-table>
      </div>
    </modal-form>
  </modal>
  <transition name="slide-over" mode="out-in">
    <document-filters
      v-if="state.showDocumentFilters"
      class="z-50"
      v-model:matchAny="state.matchAny"
      v-model:filterParameters="state.filterParameters"
      @close="state.showDocumentFilters = false"
    />
  </transition>
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import DocumentFilters from "@/components/ui/documents/DocumentFilters.vue";
import { useEnum } from "@/composable/enum";
import { useInfiniteListable } from "@/composable/infinite-list";

import { DataTableStore } from "@/store/modules/datatable";
import { SyntaqStore } from "@/store/modules/syntaq";
import { ColumnDef } from "@tanstack/vue-table";
import {
  computed,
  getCurrentInstance,
  h,
  reactive,
  watch
} from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { debounce } from "lodash";
import { ApiStore } from "@/store/utils";
import {
  DocumentDto,
  DocumentDtoPaginatedDto
} from "@/network/dtos/document-dto";
import { EntityDynamicParameterValueOptionsDto } from "@/network/dtos/dynamic-parameter-dto";

export interface CreateFromResourceValues {
  name: string;
}
const emit = defineEmits(["create", "close"]);

const state = reactive({
  showDocumentFilters: false,
  parameters: [] as EntityDynamicParameterValueOptionsDto[],
  matchAny: false,
  filterParameters: {} as Record<number, string[]>,
  selectedResource: null as DocumentDto | null,
  search: "",
  offset: 0
});

const { items, loading, fetch, reset } = useInfiniteListable({
  items: SyntaqStore.getters.GET_SYNTAQ_FORMS,
  query: SyntaqStore.actions.GET_SYNTAQ_FORMS,
  queryParams: () => ({
    search: state.search,
    parameters: state.filterParameters,
    matchAny: state.matchAny
  }),
  limit: 20
});

watch(
  [() => state.search, () => state.matchAny, () => state.filterParameters],
  reset,
  { deep: true }
);

function createDocument(resource: DocumentDto) {
  emit("create", { resource });
  emit("close");
}
const store = useStore();
store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "syntaqReourceSelectorDataTable"
);
enum ColumnFilter {
  Id = 0,
  Name = 1
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(SyntaqStore.actions.GET_SYNTAQ_FORMS, {
    search: state.search,
    parameters: state.filterParameters,
    matchAny: state.matchAny,
    startDate: undefined,
    endDate: undefined,
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
const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
const listCount = computed(
  () =>
    ApiStore.toData<DocumentDtoPaginatedDto>(
      store.getters[SyntaqStore.actions.GET_SYNTAQ_FORMS]
    )?.count || 0
);
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
  }
];
</script>
