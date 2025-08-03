<template>
  <slide-over @close="$emit('close')">
    <table-layout-container>
      <div class="flex items-center justify-between space-y-2">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">
            Disbursement Selector
          </h2>
          <div class="flex items-center justify-between space-y-2">
            <p class="text-muted-foreground text-xs">
              {{ listCount }} disbursements in search result
            </p>
          </div>
        </div>
      </div>
      <shad-data-table
        :columns="columns"
        :data="items"
        :count="listCount"
        :searchValue="state.search"
        searchPlaceholder="Search disbursements..."
        :columnFilter="columnFilter"
        @search="debouncedSearch"
        @selected="rowClick"
        @load-more="loadMore"
        @selected-row-page="rowListBySie"
      >
        <template v-slot:date="{ row }">
          <td>
            {{ fmtToLocalShortDate(row.date) }}
          </td>
        </template>
      </shad-data-table>
    </table-layout-container>
  </slide-over>
</template>

<script setup lang="ts">
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { fmtToLocalShortDate } from "@/composable/date";
import { useEnum } from "@/composable/enum";
import { useInfiniteListable } from "@/composable/infinite-list";
import { InvoiceStore } from "@/store/modules/invoices";
import { ApiStore } from "@/store/utils";
import { ColumnDef } from "@tanstack/vue-table";
import { debounce } from "lodash";
import { computed, getCurrentInstance, h, reactive, watch } from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { DataTableStore } from "@/store/modules/datatable";
import { DataTableFilterState } from "@/store/dataTableState";
import {
  DisbursementDtoPaginatedDto,
  DisbursementDto
} from "@/network/dtos/invoice-dto";

const props = defineProps<{
  id: number;
}>();

const state = reactive({
  search: ""
});

const store = useStore();

const { items, loading, fetch, reset } = useInfiniteListable({
  items: InvoiceStore.getters.GET_AVAILABLE_INVOICE_DISBURSEMENTS,
  query: InvoiceStore.actions.GET_AVAILABLE_INVOICE_DISBURSEMENTS,
  queryParams: () => ({
    search: state.search,
    id: props.id
  })
});

const listCount = computed(
  () =>
    ApiStore.toData<DisbursementDtoPaginatedDto>(
      store.getters[InvoiceStore.actions.GET_AVAILABLE_INVOICE_DISBURSEMENTS]
    )?.count || 0
);
watch([() => state.search], reset);

function selectDisbursement(entry: DisbursementDto) {
  store.dispatch(InvoiceStore.actions.ADD_INVOICE_DISBURSEMENTS, {
    id: props.id,
    disbursementId: entry.id
  });
}

// Datatable
store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "invoiceDisbursementsSelectorDataTable"
);
// paging
let offset = 0;
let limit = 50;
let datatableState = new DataTableFilterState();
function loadMore(pagenumber: any, rowlimit: any) {
  if (pagenumber != "") {
    offset = 50 * (pagenumber - 1);
  } else offset = 0;

  if (rowlimit != undefined && rowlimit != "") {
    limit = rowlimit;
    offset = rowlimit * (pagenumber - 1);
  }
  store.commit(DataTableStore.mutations.SET_LIMIT, limit);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
  store.dispatch(InvoiceStore.actions.GET_AVAILABLE_INVOICE_DISBURSEMENTS, {
    id: props.id,
    search: state.search,
    sort: store.getters[DataTableStore.getters.GET_SORTING_VALUE],
    limit: limit,
    offset: offset,
    header: store.getters[DataTableStore.getters.GET_SORTING_HEADER]
  });
}
function rowListBySie(pageSize: any) {
  store.commit(DataTableStore.mutations.SET_LIMIT, pageSize);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
  store.dispatch(InvoiceStore.actions.GET_AVAILABLE_INVOICE_DISBURSEMENTS, {
    id: props.id,
    sort: store.getters[DataTableStore.getters.GET_SORTING_VALUE],
    limit: pageSize,
    offset: offset,
    filter: datatableState.getItem(
      store.getters[DataTableStore.getters.GET_DATATABLE_STATE]
    ),
    header: store.getters[DataTableStore.getters.GET_SORTING_HEADER]
  });
}

// Column Filter

enum ColumnFilter {
  Id = 0,
  Staff = 1,
  Description = 2,
  Date = 3,
  Units = 4
}
const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilterValues = toColumnOptions();
const columnFilter = columnFilterValues.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);
function searchFilter(searchValue: string) {
  state.search = searchValue;
}
function rowClick(id: any) {
  const disbursementsDto = items.value.find((el: any) => el.id == id);
  selectDisbursement(disbursementsDto);
}

// Columns

const columns: ColumnDef<DisbursementDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "user.fullName",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Staff", class: "w-[120px]" }),
    enableSorting: false
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" }),
    enableSorting: false
  },
  {
    accessorKey: "date",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Date", class: "w-[100px]" }),
    enableSorting: false
  },
  {
    accessorKey: "units",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Units" }),
    enableSorting: false
  }
];
</script>
