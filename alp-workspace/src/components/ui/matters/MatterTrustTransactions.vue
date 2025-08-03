<template>
  <table-layout-container>
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Matter Trust Transactions
        </h2>
      </div>
    </div>
    <shad-data-table
      :columns="columns"
      :data="items"
      :count="listCount"
      :columnFilter="columnFilterValues"
      @load-more="loadMore"
      @selected-row-page="rowListBySize"
    >
      <template v-slot:bankTransactionDate="{ row }">
        <td>
          {{ fmtToLocalShortDate(row.bankTransactionDate) }}
        </td>
      </template>
      <template v-slot:amount="{ row }">
        <td>
          {{ fmtCurrency(row.amount) }}
        </td>
      </template>
      <template v-slot:reconciled="{ row }">
        <td>
          <font-awesome-icon
            class="text-green-400"
            v-if="row.reconciled"
            icon="fa-check"
          />
        </td>
      </template>
    </shad-data-table>
  </table-layout-container>
</template>

<script setup lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { fmtToLocalShortDate } from "@/composable/date";
import { useEnum } from "@/composable/enum";
import { useInfiniteListable } from "@/composable/infinite-list";
import { DataTableFilterState } from "@/store/dataTableState";
import { DataTableStore } from "@/store/modules/datatable";
import { TrustStore } from "@/store/modules/trust";
import { ApiStore } from "@/store/utils";
import { ColumnDef } from "@tanstack/vue-table";
import { computed, h, watch } from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { TrustTransactionDtoPaginatedDto } from "@/network/dtos/trust-dto";

const props = defineProps<{
  id: number;
}>();

const { items, loading, fetch, reset } = useInfiniteListable({
  items: TrustStore.getters.GET_MATTER_TRUST_TRANSACTIONS,
  query: TrustStore.actions.GET_MATTER_TRUST_TRANSACTIONS,
  queryParams: () => ({
    id: props.id
  })
});
const store = useStore();
let datatableState = new DataTableFilterState();
store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "matterTrustTransactionsDataTable"
);

enum ColumnFilter {
  Id = 0,
  Date = 1,
  Description = 2,
  Amount = 3,
  Reconciled = 4
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));

function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(TrustStore.actions.GET_MATTER_TRUST_TRANSACTIONS, {
    id: props.id,
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

const listCount = computed(
  () =>
    ApiStore.toData<TrustTransactionDtoPaginatedDto>(
      store.getters[TrustStore.actions.GET_MATTER_TRUST_TRANSACTIONS]
    )?.count || 0
);
function sortingList(sort: any, header: any) {
  store.dispatch(TrustStore.actions.GET_MATTER_TRUST_TRANSACTIONS, {
    id: props.id,
    //search: state.search,
    limit: store.getters[DataTableStore.getters.GET_LIMIT],
    offset: store.getters[DataTableStore.getters.GET_OFFSET],
    sort: sort,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
let selectedvalue: any, selectedheader: any;
watch(
  [
    () =>
      (selectedheader =
        store.getters[DataTableStore.getters.GET_SORTING_HEADER]),
    () =>
      (selectedvalue = store.getters[DataTableStore.getters.GET_SORTING_VALUE])
  ],
  () => {
    if (
      selectedvalue != "" &&
      selectedvalue != undefined &&
      selectedheader != "" &&
      selectedheader != undefined
    )
      sortingList(selectedvalue, selectedheader);
  },
  { immediate: true, deep: true }
);
const columns: ColumnDef<TrustTransactionDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "bankTransactionDate",
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: "Columns Transaction Date (Bank)"
      }),
    cell: ({ row }) => {
      return h("div", { class: "flex space-x-2" }, [
        h(
          "span",
          { class: "max-w-[500px] truncate font-medium" },
          row.getValue("bankTransactionDate")
        )
      ]);
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" })
  },
  {
    accessorKey: "amount",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Amount" })
  },
  {
    accessorKey: "reconciled",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Reconciled" })
  }
];
</script>
