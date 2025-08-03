<template>
  <modal @close="$emit('close')" :headingTitle="'Select a URL'">
    <modal-form @cancel="$emit('close')" confirmText="-1" cancelText="Close">
      <div
        class="h-full flex-1 flex-col space-y-4 p-4 md:flex relative tableMaxHeight"
      >
        <div class="flex items-center justify-between space-y-2">
          <div>
            <div class="flex items-center justify-between space-y-2">
              <p class="text-muted-foreground text-xs">
                {{ listCount }} urls in search result
              </p>
            </div>
          </div>
          <alp-can permission="CommonType.Create">
            <div class="flex items-center space-x-2">
              <shad-button size="sm" @click="state.showCreate = true">
                <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
                New
              </shad-button>
            </div>
          </alp-can>
        </div>
        <shad-data-table
          :columns="columns"
          :data="items"
          :count="listCount"
          :columnFilter="columnFilterValues"
          :searchValue="state.search"
          searchPlaceholder="Search urls..."
          @load-more="loadMore"
          @selected-row-page="rowListBySize"
          @selected-row="selectUrl"
          @search="debouncedSearch"
        >
        </shad-data-table>
      </div>
    </modal-form>
  </modal>

  <create-resource-url
    v-if="state.showCreate"
    @close="state.showCreate = false"
  />
</template>

<script setup lang="ts">
import Modal from "@/components/common/layout/Modal.vue";
import ModalForm from "@/components/common/layout/ModalForm.vue";
import { useListable } from "@/composable/listable";
import CreateResourceUrl from "@/components/ui/admin/resource-urls/CreateResourceUrl.vue";
import { ResourceStore } from "@/store/modules/resources";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  reactive,
  watch
} from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { ApiStore } from "@/store/utils";
import { DataTableStore } from "@/store/modules/datatable";
import { useEnum } from "@/composable/enum";
import { ColumnDef } from "@tanstack/vue-table";
import { debounce } from "lodash";
import { DocumentDtoPaginatedDto } from "@/network/dtos/document-dto";
import { ResourceUrlDto } from "@/network/dtos/resource-dto";

const emit = defineEmits(["selected"]);
const store = useStore();

const state = reactive({
  showCreate: false,
  search: "",
  limit: 20,
  offset: 0
});

const { items, count, loading, fetch } = useListable({
  items: ResourceStore.getters.GET_RESOURCE_URLS,
  query: ResourceStore.getters.GET_RESOURCE_URLS,
  queryParams: () => ({
    search: state.search,
    limit: state.limit,
    offset: state.offset
  })
});

watch([() => state.limit, () => state.offset, () => state.search], fetch);

function selectUrl(resource: ResourceUrlDto) {
  emit("selected", resource);
  emit("close");
}

store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "reourceUrlSelectorDataTable"
);
enum ColumnFilter {
  Id = 0,
  Description = 1,
  Date = 2,
  Units = 3
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(ResourceStore.getters.GET_RESOURCE_URLS, {
    search: state.search,
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
      store.getters[ResourceStore.getters.GET_RESOURCE_URLS]
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
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" }),
    enableSorting: false
  }
];
</script>
<style>
.tableMaxHeight {
  overflow: auto;
  max-height: calc(100vh - 400px);
}
</style>
